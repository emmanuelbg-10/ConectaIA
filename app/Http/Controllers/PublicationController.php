<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\Hashtag;
use App\Models\Mention;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Cloudinary\Api\Exception\ApiError;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Cloudinary\Api\Exception\ApiException;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

/**
 * Manages all publications.
 * 
 * This controller handles the display, creation, updating,
 * editing and deletion of publications, alongside mentions
 * and hashtags.
 */
class PublicationController extends Controller
{
    /**
     * Show all publications.
     * 
     * This method at first shows all publications through
     * Inertia, unless a new one is added, then it only returns
     * a JSON, to show it updating correctly.
     * 
     * @param \Illuminate\Http\Request $request
     * The incoming HTTP request
     * 
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse
     * Returns an Inertia response for regular page loads or a JSON response
     * for dynamic additions.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $publications = Publication::with(['user', 'hashtags'])
            ->latest()
            ->paginate(10);

        $publications->getCollection()->transform(function ($publication) use ($request) {
            $publication->likesCount = $publication->likes()->count();
            $publication->responsesCount = $publication->responses()->count();
            $publication->likedByMe = $request->user()
                ? $publication->likes()->where('user_id', $request->user()->id)->exists()
                : false;
            return $publication;
        });

        // Solo responde JSON si la petición es AJAX Y NO es una petición Inertia
        if ($request->ajax() && !$request->header('X-Inertia')) {
            return response()->json([
                'data' => $publications->items(),
                'next_page_url' => $publications->nextPageUrl()
            ]);
        }

        $authUserId = $request->user() ? $request->user()->id : null;

        // Agregar información de amistad para cada publicación
        foreach ($publications as $pub) {
            $friendship = \App\Models\Friendship::where(function ($q) use ($pub, $authUserId) {
                $q->where('sender_id', $authUserId)->where('receiver_id', $pub->user_id);
            })->orWhere(function ($q) use ($pub, $authUserId) {
                $q->where('sender_id', $pub->user_id)->where('receiver_id', $authUserId);
            })->first();

            $pub->friend_status = $friendship ? $friendship->status : 'none';

            $following = \App\Models\Following::where('follower_id', $authUserId)
                ->where('followed_id', $pub->user_id)
                ->exists();

            $pub->following = $following;
        }

        $user = auth()->user();

    // Amigos donde el usuario es sender o receiver y la amistad está aceptada
    $friends = \App\Models\User::whereIn('id', function($query) use ($user) {
        $query->select('receiver_id')
            ->from('friendships')
            ->where('sender_id', $user->id)
            ->where('status', 'accepted');
    })
    ->orWhereIn('id', function($query) use ($user) {
        $query->select('sender_id')
            ->from('friendships')
            ->where('receiver_id', $user->id)
            ->where('status', 'accepted');
    })
    ->get(['id', 'name', 'avatarURL' ]);

        Log::info('Amigos encontrados:', $friends->toArray());

    return Inertia::render('Publications/Index', [
        'authUser' => [
            'id' => auth()->id(),
            'name' => auth()->user()->name,
            'avatarURL' => auth()->user()->avatarURL,
            'is_admin' => auth()->user()->hasRole('administrador'),
            'is_moderator' => auth()->user()->hasRole('moderador'),
            // ...otros campos que necesites
        ],
        'publications' => $publications,
        'friends' => $friends,
    ]);
}

    /**
     * Show a specific publication.
     * 
     * This method eager loads the user and possible hashtags and mentions to
     * display them in detail and renders them with Inertia.
     * 
     * @param \App\Models\Publication $publication
     * The ID of the publication about to be shown.
     * 
     * @return \Inertia\Response
     * Returns an Inertia render showing the publication.
     */
    public function show(Publication $publication)
    {
        $publication->load('user');

        // Trae TODAS las respuestas de la publicación (no solo las principales)
        $responses = \App\Models\Response::where('publication_id', $publication->id)
            ->with('user')
            ->get();

        // Agrupa por parent_id
        $grouped = $responses->groupBy('parent_id');

        // Función recursiva para anidar
        $buildTree = function ($parentId) use (&$buildTree, $grouped) {
            return ($grouped[$parentId] ?? collect())->map(function ($response) use (&$buildTree) {
                $response->children = $buildTree($response->id);
                return $response;
            })->values();
        };

        $responsesTree = $buildTree(null);

        // Agrega las respuestas anidadas al objeto publication
        $publication->responses = $responsesTree;

        return Inertia::render('Publications/Show', [
            'publication' => $publication,
            'authUser' => auth()->user(),
        ]);
    }

    /**
     * Render the form for creating a publication.
     * 
     * This method returns an Inertia response rendering the
     * 'Publications/Create' view.
     * 
     * @return \Inertia\Response
     * Returns an Inertia Response with the corresponding form.
     */
    public function create(): Response
    {
        return Inertia::render('Publications/Create');
    }

    /**
     * Store a new publication.
     * 
     * This method validates the data input in the creation form,
     * and also checking if there's an image and storaging it accordingly if
     * there is. It then creates it, eager loading hashtags and the user to
     * display them alongside the publication.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request for storing a new publication
     * 
     * @return \Illuminate\Http\RedirectResponse
     * Redirects back to the index with a success message.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'textContent' => 'required|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif',
        ]);

        $imageURL = null;

        if ($request->hasFile('image')) {
            $uploadedFile = $request->file('image');

            try {
                $base64Image = 'data:' . $uploadedFile->getMimeType() . ';base64,' . base64_encode($uploadedFile->getContent());

                $uploaded = Cloudinary::uploadApi()->upload($base64Image, [
                    'resource_type' => 'image',
                ]);

                $imageURL = $uploaded['secure_url'];
            } catch (\Cloudinary\Api\Exception\ApiException $e) {
                dd("Error de Cloudinary:", $e->getMessage());
            }
        }

        $publication = Publication::create([
            'user_id' => auth()->id(),
            'textContent' => $validated['textContent'],
            'imageURL' => $imageURL,
        ])->load('user', 'hashtags');

        // Agregar campos extra igual que en index
        $publication->likesCount = 0;
        $publication->responsesCount = 0;
        $publication->likedByMe = false;

        $authUserId = $request->user() ? $request->user()->id : null;
        $friendship = \App\Models\Friendship::where(function ($q) use ($publication, $authUserId) {
            $q->where('sender_id', $authUserId)->where('receiver_id', $publication->user_id);
        })->orWhere(function ($q) use ($publication, $authUserId) {
            $q->where('sender_id', $publication->user_id)->where('receiver_id', $authUserId);
        })->first();

        $publication->friend_status = $friendship ? $friendship->status : 'none';

        $following = \App\Models\Following::where('follower_id', $authUserId)
            ->where('followed_id', $publication->user_id)
            ->exists();

        $publication->following = $following;

        return redirect()->route('publications.index')->with('success', 'Publicación creada con éxito.');
    }

    /**
     * Show the form for editing a publication.
     * 
     * This method allows a user to modify their publication, eager loading
     * any hashtags and mentions to also update them properly if they were changed.
     * 
     * @param \App\Models\Publication $publication
     * The ID of the publication about to be edited.
     * 
     * @return \Inertia\Response
     * Returns an Inertia render to load the edit form.
     */
    public function edit(Publication $publication): Response
    {
        return Inertia::render('Publications/Edit', [
            'publication' => $publication->load(['hashtags', 'mentions.user']),
        ]);
    }

    /**
     * Update an existing publication.
     * 
     * This method takes the new data from the edit function and validates it to
     * make sure they're all valid. It also has to update hashtags and mentions separately
     * from the text and images due to being in different models.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request.
     * @param \App\Models\Publication $publication
     * The ID of the publication about to be updated.
     * 
     * @return \Illuminate\Http\RedirectResponse
     * Redirects back to the 'publications.index' view.
     */
    public function update(Request $request, Publication $publication): RedirectResponse
    {
        $request->validate([
            'textContent' => 'required|string',
            'imageURL' => 'nullable|url',
            'hashtags' => 'nullable|string',
            'mentions' => 'nullable|string',
        ]);

        $publication->update($request->only('textContent', 'imageURL'));

        $publication->hashtags()->detach();
        if ($request->hashtags) {
            $hashtags = explode(',', $request->hashtags);
            foreach ($hashtags as $tag) {
                $hashtag = Hashtag::firstOrCreate(['hashtag_text' => trim($tag)]);
                $publication->hashtags()->attach($hashtag->id);
            }
        }

        Mention::where('publication_id', $publication->id)->delete();
        if ($request->mentions) {
            $mentions = explode(',', $request->mentions);
            foreach ($mentions as $mention) {
                $user = User::where('name', trim($mention))->first();
                if ($user) {
                    Mention::create([
                        'publication_id' => $publication->id,
                        'user_id' => $user->id,
                    ]);
                }
            }
        }

        return redirect()->route('publications.index')->with('success', 'Publicación actualizada con éxito.');
    }

    /**
     * Delete a publication.
     * 
     * This method allows both the user and the moderators to delete
     * a publication completely from the application.
     * 
     * @param \App\Models\Publication $publication
     * The publication ID that's about to be deleted.
     * 
     * @return \Illuminate\Http\RedirectResposne
     * Redirects back to the 'publications.index' view with a success message.
     */

     public function destroy(Publication $publication, Request $request)
     {
         if (
             $request->user()->id !== $publication->user_id &&
             !$request->user()->hasAnyRole(['administrador', 'moderador'])
         ) {
             return response()->json(['message' => 'No autorizado.'], 403);
         }
     
         if ($publication->imageURL) {
             try {
                 // Extraer ruta y obtener public_id
                 $path = parse_url($publication->imageURL, PHP_URL_PATH);
                 $segments = explode('/', $path);
                 $filenameWithExtension = end($segments);
                 $publicId = pathinfo($filenameWithExtension, PATHINFO_FILENAME);
     
                 (new UploadApi())->destroy($publicId);
             } catch (ApiError $e) {
                 Log::error("Error al eliminar imagen de Cloudinary: " . $e->getMessage());
             }
         }
     
         $publication->delete();
     
         if ($request->ajax()) {
             return response()->json(['message' => 'Publicación eliminada con éxito.']);
         }
     
         return redirect()->route('publications.index')->with('success', 'Publicación eliminada con éxito.');
     }
}
