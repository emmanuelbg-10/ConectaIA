<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AlertController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Peticiones de amistad recibidas (incluye sender soft-deleted)
        $friendRequests = \App\Models\Friendship::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->with(['sender' => function($q) {
                $q->withTrashed()->select('id', 'name', 'avatarURL');
            }])
            ->get();

        // Mensajes recientes recibidos (incluye sender soft-deleted)
        $recentMessages = \App\Models\Message::where('user_receiver_id', $user->id)
            ->latest()
            ->take(10)
            ->with(['sender' => function($q) {
                $q->withTrashed()->select('id', 'name', 'avatarURL');
            }])
            ->get();

        // Últimos seguidores (incluye follower soft-deleted)
        $recentFollowers = \App\Models\Following::where('followed_id', $user->id)
            ->latest()
            ->take(10)
            ->with(['follower' => function($q) {
                $q->withTrashed()->select('id', 'name', 'avatarURL');
            }])
            ->get()
            ->map(function($f) { return $f->follower; })
            ->values();

        return response()->json([
            'friendRequests' => $friendRequests,
            'recentMessages' => $recentMessages,
            'recentFollowers' => $recentFollowers,
        ]);
    }
}
