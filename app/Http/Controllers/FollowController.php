<?php
namespace App\Http\Controllers;

use App\Models\Following;
use Illuminate\Support\Facades\Auth;

/**
 * Allows a user to follow another one.
 * 
 * This controller allows users to follow other users in the application.
 */
class FollowController extends Controller
{
    /**
     * Toggle between following and unfollowing a user.
     * 
     * This method fetches the current user's ID to, at first, avoid the user
     * following himself, and then allow to either unfollow or follow another user, and then
     * finally returning a JSON indicating whether they're following or not the other user.
     * 
     * @param int $userId
     * The current user's ID.
     * 
     * @return \Illuminate\Http\JsonResponse
     * Returns a JSON response indicationg if the user is following or unfollowing another one.
     */
    public function toggle($userId)
    {
        $followerId = Auth::id();

        if ($followerId == $userId) {
            return response()->json(['message' => 'No puedes seguirte a ti mismo.'], 400);
        }

        $deleted = Following::where('follower_id', $followerId)
            ->where('followed_id', $userId)
            ->delete();

        if ($deleted) {
            return response()->json(['following' => false]);
        } else {
            Following::create([
                'follower_id' => $followerId,
                'followed_id' => $userId,
            ]);
            return response()->json(['following' => true]);
        }
    }
}
