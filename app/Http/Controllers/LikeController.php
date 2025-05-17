<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;

/**
 * Handles the likes of a publication.
 * 
 * This controller's in charge of dealing with liking a publication by
 * only allowing users to like once to avoid spam.
 */
class LikeController extends Controller
{
    /**
     * Deals with liking and unliking publications.
     * 
     * This method toggles the like button on the frontend, making sure
     * it can only be pressed once by user. If the user attempts it again,
     * their like will be removed.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request.
     * @param \App\Models\Publication $publication
     * The ID of the publication about to be liked.
     * 
     * @return \Illuminate\Http\JsonResponse
     * Returns a JSON response indicating that the publication was liked
     * and updating the like counter.
     */
    public function toggle(Request $request, Publication $publication)
    {
        $user = $request->user();

        // Busca si ya existe el like
        $like = $publication->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            $publication->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'count' => $publication->likes()->count(),
        ]);
    }
}
