<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\Hashtag;
use App\Models\Mention;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
     * Mostrar una publicación específica.
     */
    public function show(Publication $publication)
    {
        $publication->load(['user', 'hashtags', 'mentions.user']);

        return Inertia::render('Publications/Show', [
            'publication' => $publication,
        ]);
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
     * Eliminar una publicación.
     */
    public function destroy(Publication $publication)
    {
        $publication->delete();

        return redirect()->route('publications.index')->with('success', 'Publicación eliminada con éxito.');
    }
}
