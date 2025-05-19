<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AlertController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Peticiones de amistad recibidas
        $friendRequests = \App\Models\Friendship::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->with('sender:id,name')
            ->get();

        // Mensajes recientes recibidos
        $recentMessages = \App\Models\Message::where('user_receiver_id', $user->id)
            ->latest()
            ->take(10)
            ->with('sender:id,name')
            ->get();

        // Últimos seguidores (ajusta según tu modelo)
        $recentFollowers = \App\Models\Following::where('followed_id', $user->id)
            ->latest()
            ->take(10)
            ->with('follower:id,name')
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
