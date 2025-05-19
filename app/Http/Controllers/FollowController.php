<?php
namespace App\Http\Controllers;

use App\Models\Following;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
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
