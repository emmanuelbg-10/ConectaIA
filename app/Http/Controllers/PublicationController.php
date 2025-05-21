<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\Hashtag;
use App\Models\Mention;
use App\Models\User;
use Cloudinary\Api\Exception\ApiError;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class PublicationController extends Controller
{
    /**
     * Mostrar todas las publicaciones.
     */
    public function index(Request $request)
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
        $friendship = \App\Models\Friendship::where(function($q) use ($pub, $authUserId) {
            $q->where('sender_id', $authUserId)->where('receiver_id', $pub->user_id);
        })->orWhere(function($q) use ($pub, $authUserId) {
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
        ],
        'publications' => $publications,
    ]);
}

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
    $buildTree = function($parentId) use (&$buildTree, $grouped) {
        return ($grouped[$parentId] ?? collect())->map(function($response) use (&$buildTree) {
            $response->children = $buildTree($response->id);
            return $response;
        })->values();
    };

    $responsesTree = $buildTree(null);

    // Agrega las respuestas anidadas al objeto publication
    $publication->responses = $responsesTree;

    // --- AQUI AÑADE LOS LIKES ---
    $publication->likesCount = $publication->likes()->count();
    $publication->responsesCount = $publication->responses()->count();
    $publication->likedByMe = request()->user()
        ? $publication->likes()->where('user_id', request()->user()->id)->exists()
        : false;
    // ----------------------------

    return Inertia::render('Publications/Show', [
        'publication' => $publication,
        'authUser' => auth()->user(),
    ]);
}

    /**
     * Mostrar el formulario para crear una nueva publicación.
     */
    public function create()
    {
        return Inertia::render('Publications/Create');
    }

    /**
     * Guardar una nueva publicación.
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
                $uploaded = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::uploadApi()->upload($base64Image, [
                    'resource_type' => 'image',
                ]);
                $imageURL = $uploaded['secure_url'];
            } catch (\Cloudinary\Api\Exception\ApiException $e) {
                return back()->withErrors(['image' => "Error de Cloudinary: " . $e->getMessage()]);
            }
        }
    
        $publication = Publication::create([
            'user_id' => auth()->id(),
            'textContent' => $validated['textContent'],
            'imageURL' => $imageURL,
        ]);
    
        $hashtags = $request->input('hashtags');

        // Si viene como string JSON, decodifica:
        if (is_string($hashtags)) {
            $hashtags = json_decode($hashtags, true);
        }

        // Log para depuración
        Log::info('Hashtags recibidos para guardar:', ['hashtags' => $hashtags]);

        $hashtagIds = [];
        if (!empty($hashtags) && is_array($hashtags)) {
            foreach ($hashtags as $tag) {
                if (trim($tag) === '') continue;
                $hashtag = \App\Models\Hashtag::firstOrCreate(['hashtag_text' => trim($tag)]);
                $hashtagIds[] = $hashtag->id;
            }
            $publication->hashtags()->sync($hashtagIds);
        } else {
            Log::info('No se recibieron hashtags válidos.');
        }
    
        // Opcional: cargar relaciones y campos extra para la respuesta
        $publication->load('user', 'hashtags');
        $publication->likesCount = 0;
        $publication->responsesCount = 0;
        $publication->likedByMe = false;
    
        $authUserId = $request->user() ? $request->user()->id : null;
        $friendship = \App\Models\Friendship::where(function($q) use ($publication, $authUserId) {
            $q->where('sender_id', $authUserId)->where('receiver_id', $publication->user_id);
        })->orWhere(function($q) use ($publication, $authUserId) {
            $q->where('sender_id', $publication->user_id)->where('receiver_id', $authUserId);
        })->first();
    
        $publication->friend_status = $friendship ? $friendship->status : 'none';
    
        $following = \App\Models\Following::where('follower_id', $authUserId)
            ->where('followed_id', $publication->user_id)
            ->exists();
    
        $publication->following = $following;
    
        return redirect()->back(303)->with('success', 'Publicación creada con éxito.');
    }

    /**
     * Mostrar el formulario para editar una publicación.
     */
    public function edit(Publication $publication)
    {
        return Inertia::render('Publications/Edit', [
            'publication' => $publication->load(['hashtags', 'mentions.user']),
        ]);
    }

    /**
     * Actualizar una publicación existente.
     */
    public function update(Request $request, Publication $publication)
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
            $hashtags = json_decode($request->input('hashtags', '[]'), true);
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
     * Eliminar una publicación.
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
