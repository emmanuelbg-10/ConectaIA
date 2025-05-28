<?php

namespace App\Http\Controllers;

use App\Models\Response;
use App\Models\Publication;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Manages responses to other publications.
 * 
 * This controller handles the storage, updating and deletion of
 * responses to publications, which only supports text.
 */
class ResponseController extends Controller
{
    use AuthorizesRequests;
    
    /**
     * Create a response to another user's publication.
     * 
     * This method receives and then validates the data being sent as
     * a response to a user's post, which needs the parent's post ID, which requires to simplify the database query
     * by making a 'buildTree'. It then redirects with this buildTree by
     * using Inertia.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request.
     * @param \App\Models\Publication $publication
     * The ID of the parent publication.
     * 
     * @return \Symfony\Component\HttpFoundation\Response
     * Redirect by triggering a full page load to 'publications.show' through Inertia
     */
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

    /**
     * Update an existing response.
     * 
     * This method fetches the response's ID and allows the user to
     * edit it's content, then it reassociates it to the original
     * publication it's nested inside of.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request.
     * @param \App\Models\Response $response
     * The response ID.
     * 
     * @return \Symfony\Component\HttpFoundation\Response
     * Triggers a full page load to the 'publications.show' view and
     * specifically to the publication in which the response was modified
     * in.
     */
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

    /**
     * Delete an existing response.
     * 
     * This method fetches the response's ID and allows the user to
     * delete it, then it reassociates it to the original
     * publication it's nested inside of.
     * 
     * @param \App\Models\Response $response
     * The response ID about to be deleted
     * 
     * @return \Symfony\Component\HttpFoundation\Response
     * Triggers a full page load to the 'publications.show' view and
     * specifically to the publication in which the response was deleted from.
     */
    public function destroy(Response $response)
    {
        $this->authorize('delete', $response);

        $publicationId = $response->publication_id;

        $response->delete();

        return Inertia::location(route('publications.show', $publicationId));
    }
}
