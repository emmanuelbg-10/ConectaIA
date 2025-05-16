<?php

namespace App\Http\Controllers;

use App\Models\Response;
use App\Models\Publication;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ResponseController extends Controller
{
    use AuthorizesRequests;
    // Crear una respuesta (a publicación o a otra respuesta)
    public function store(Request $request, Publication $publication)
    
    {
        
        // Convierte 0 a null ANTES de validar
        $data = $request->all();
        if (isset($data['parent_id']) && ($data['parent_id'] == 0 || $data['parent_id'] === '0')) {
            $data['parent_id'] = null;
        }

        $request->replace($data);

        $request->validate([
            'text' => 'required|string|max:1000',
            
        ]);

        Log::info('Datos recibidos en respuesta:', $request->all());

        $parentId = $request->input('parent_id');

        $publication->responses()->create([
            'user_id' => $request->user()->id,
            'parent_id' => $parentId, // <-- esto es correcto
            'text' => $request->text,
        ]);

        // Recarga la publicación y sus respuestas anidadas
        $publication->load('user');
        $responses = \App\Models\Response::where('publication_id', $publication->id)
            ->with('user')
            ->get();
        $grouped = $responses->groupBy('parent_id');
        $buildTree = function($parentId) use (&$buildTree, $grouped) {
            return ($grouped[$parentId] ?? collect())->map(function($response) use (&$buildTree) {
                $response->children = $buildTree($response->id);
                return $response;
            })->values();
        };
        $publication->responses = $buildTree(null);

        return Inertia::location(route('publications.show', $publication->id));
    }

    // Editar una respuesta
    public function update(Request $request, Response $response)
    {
        $this->authorize('update', $response);

        $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        $response->update([
            'text' => $request->text,
        ]);

        // Obtén el id de la publicación asociada a la respuesta
        $publicationId = $response->publication_id;

        return Inertia::location(route('publications.show', $publicationId));
    }

    // Borrar una respuesta
    public function destroy(Response $response)
    {
        $this->authorize('delete', $response);

        $publicationId = $response->publication_id;

        $response->delete();

        return Inertia::location(route('publications.show', $publicationId));
    }
}
