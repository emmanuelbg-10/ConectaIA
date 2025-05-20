<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * The backend counts the amount of notifications.
 * 
 * This controller gives to the user the amount of alerts they've received,
 * specifically the ones about friend requests, received messages and new
 * followers.
 */
class AlertController extends Controller
{
    /**
     * Shows the user they have pending alerts.
     * 
     * This method fetches from the Friendship, Message, and Following models to
     * the user and indicates they have one or several of those actions either pending,
     * or that they've received them.
     * 
     * @return \Illuminate\Http\JsonResponse
     * Returns a JSON response with the 3 types of alert.
     */
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
