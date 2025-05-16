<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\Hashtag;
use App\Models\Mention;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

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

    // Mapea cada publicación para agregar likesCount y likedByMe
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

    return Inertia::render('Publications/Index', [
        'authUser' => auth()->user(),
        'publications' => $publications,
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
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'textContent' => 'required|string|max:500',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Procesar imagen
    $imageURL = null;
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('publications', 'public');
        $imageURL = Storage::url($path);
    }

    $publication = Publication::create([
        'user_id' => auth()->id(),
        'textContent' => $validated['textContent'],
        'imageURL' => $imageURL,
    ])->load('user', 'hashtags');

    // Respuesta para Inertia
    return back()->with([
        'success' => 'Publicación creada con éxito',
        'newPublication' => $publication
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
    public function show(Publication $publication): Response
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

        return Inertia::render('Publications/Show', [
            'publication' => $publication,
             'authUser' => auth()->user(),
        ]);
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

        // Actualizar hashtags
        $publication->hashtags()->detach();
        if ($request->hashtags) {
            $hashtags = explode(',', $request->hashtags);
            foreach ($hashtags as $tag) {
                $hashtag = Hashtag::firstOrCreate(['hashtag_text' => trim($tag)]);
                $publication->hashtags()->attach($hashtag->id);
            }
        }

        // Actualizar menciones
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
    public function destroy(Publication $publication): RedirectResponse
    {
        $publication->delete();

        return redirect()->route('publications.index')->with('success', 'Publicación eliminada con éxito.');
    }
}
