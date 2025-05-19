<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendshipController extends Controller
{
    // Enviar solicitud de amistad
    public function sendRequest(Request $request, $receiver_id)
    {
        $sender_id = Auth::id();

        if ($sender_id == $receiver_id) {
            return response()->json(['message' => 'No puedes enviarte una solicitud a ti mismo.'], 400);
        }

        $friendship = Friendship::firstOrCreate([
            'sender_id' => $sender_id,
            'receiver_id' => $receiver_id,
        ], [
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Solicitud enviada', 'friendship' => $friendship]);
    }

    // Aceptar solicitud
    public function acceptRequest($id)
    {
        $friendship = Friendship::findOrFail($id);

        if ($friendship->receiver_id != Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $friendship->status = 'accepted';
        $friendship->save();

        return response()->json(['message' => 'Solicitud aceptada']);
    }

    // Rechazar solicitud
    public function rejectRequest($id)
    {
        $friendship = Friendship::findOrFail($id);

        if ($friendship->receiver_id != Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $friendship->status = 'rejected';
        $friendship->save();

        return response()->json(['message' => 'Solicitud rechazada']);
    }

    // Listar solicitudes recibidas
    public function receivedRequests()
    {
        $requests = Friendship::where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->with('sender')
            ->get();

        return response()->json($requests);
    }

    // Listar solicitudes enviadas
    public function sentRequests()
    {
        $requests = Friendship::where('sender_id', Auth::id())
            ->where('status', 'pending')
            ->with('receiver')
            ->get();

        return response()->json($requests);
    }

    // Eliminar amistad
    public function removeFriend($userId)
    {
        $user = auth()->user();
        $friendship = Friendship::where(function($query) use ($userId) {
                $query->where('sender_id', Auth::id())
                      ->where('receiver_id', $userId);
            })
            ->orWhere(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->where('receiver_id', Auth::id());
            })
            ->first();

        if ($friendship) {
            $friendship->delete();
            return response()->json([
                'status' => 'none', // importante para el frontend
                'message' => 'Amistad eliminada correctamente.'
            ]);
        } else {
            return response()->json(['message' => 'No se encontró la amistad.'], 404);
        }
    }
}
