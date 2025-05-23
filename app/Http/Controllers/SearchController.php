<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Publication;

class SearchController extends Controller
{
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
