<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Publication;

/**
 * Class SearchController
 *
 * Handles search queries for different types of resources, such as users and publications.
 * It provides filtered results based on the search type and query string.
 */
class SearchController extends Controller
{
    /**
     * Performs a search for users or publications based on the provided query.
     *
     * This method takes 'type' (e.g., 'users' or 'publications') and a search query 'q'
     * from the request. It returns a JSON array of matching results.
     *
     * - If the query string 'q' is less than 2 characters, an empty array is returned.
     * - For 'users' search type:
     * - It searches for users whose names match the query (case-insensitive).
     * - It excludes the authenticated user from the results.
     * - For each user, it calculates their friendship status and whether the authenticated
     * user is following them.
     * - Results are limited to 10.
     * - For 'publications' search type:
     * - It searches for publications where the 'textContent' matches the query.
     * - It eagerly loads the associated user for each publication.
     * - Results are ordered by the latest publications and limited to 10.
     * - If an invalid or no 'type' is provided, an empty array is returned.
     *
     * @param \Illuminate\Http\Request $request 
     * The HTTP request containing search parameters.
     * Expected query parameters:
     * - 'type' (optional, string): The type of resource to search ('users' or 'publications'). Defaults to 'users'.
     * - 'q' (optional, string): The search query string.
     * 
     * @return \Illuminate\Http\JsonResponse 
     * A JSON response containing an array of matching search results.
     * Returns an empty array if no query is provided, query is too short, or no matches are found.
     */
    public function search(Request $request)
    {
        $type = $request->input('type', 'users');
        $q = $request->input('q', '');

        if (strlen($q) < 1) {
            return response()->json([]);
        }

        $authUserId = $request->user() ? $request->user()->id : null;

        if ($type === 'users') {
            $users = \App\Models\User::where('name', 'like', "%$q%")
                ->where('id', '!=', $authUserId)
                ->limit(10)
                ->get()
                ->map(function ($user) use ($authUserId) {
                    $friendship = \App\Models\Friendship::where(function($q) use ($user, $authUserId) {
                        $q->where('sender_id', $authUserId)->where('receiver_id', $user->id);
                    })->orWhere(function($q) use ($user, $authUserId) {
                        $q->where('sender_id', $user->id)->where('receiver_id', $authUserId);
                    })->first();

                    $friend_status = $friendship ? $friendship->status : 'none';

                    $following = \App\Models\Following::where('follower_id', $authUserId)
                        ->where('followed_id', $user->id)
                        ->exists();

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatarURL' => $user->avatarURL,
                        'friend_status' => $friend_status,
                        'following' => $following,
                    ];
                });

            return response()->json($users);
        }

        if ($type === 'publications') {
            $publications = Publication::with('user')
                ->where('textContent', 'like', "%$q%")
                ->latest()
                ->limit(10)
                ->get()
                ->map(function ($pub) {
                    return [
                        'id' => $pub->id,
                        'textContent' => $pub->textContent,
                        'user' => [
                            'id' => $pub->user->id,
                            'name' => $pub->user->name,
                            'avatarURL' => $pub->user->avatarURL,
                        ],
                    ];
                });
            return response()->json($publications);
        }

        return response()->json([]);
    }
}
