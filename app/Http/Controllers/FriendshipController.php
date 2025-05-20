<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Handles all the actions related to friends and its requests.
 * 
 * This controller deals with the friends system and its requests, allowing
 * sending said requests and the actions associated with it.
 */
class FriendshipController extends Controller
{
    /**
     * Send a friend request to another user.
     * 
     * This method fetches both IDs of the receiver and the sender,
     * associating them in the database and then returning a JSON response.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request.
     * @param int $receiver_id
     * The ID of the user that receives the friend request.
     * 
     * @return \Illuminate\Http\JsonResponse
     * Returns a JSON response indicating either that the user cannot friend
     * request itself or with a success message.
     */
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

    /**
     * Accepting the friend request.
     * 
     * This method makes sure the request actually exists and allows
     * to accept it. It returns either an unauthorized code or a success message.
     * 
     * @param int $id
     * The ID of the user that received the request.
     * 
     * @return \Illuminate\Http\JsonResponse
     * Returns a JSON with either an error or success message.
     */
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

    /**
     * Rejecting the friend request.
     * 
     * This method makes sure the request actually exists and allows
     * to reject it. It returns either an unauthorized code or a success message.
     * 
     * @param int $id
     * The ID of the user that received the request.
     * 
     * @return \Illuminate\Http\JsonResponse
     * Returns a JSON with either an error or success message.
     */
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

    /**
     * Lists all the received friend requests with the 'pending' status.
     * 
     * @return \Illuminate\Http\JsonResponse
     * Returns a JSON response with all the pending requests.
     */
    public function receivedRequests()
    {
        $requests = Friendship::where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->with('sender')
            ->get();

        return response()->json($requests);
    }

    /**
     * Lists all the sent friend requests with the 'pending' status.
     * 
     * @return \Illuminate\Http\JsonResponse
     * Returns a JSON response with all the pending requests.
     */
    public function sentRequests()
    {
        $requests = Friendship::where('sender_id', Auth::id())
            ->where('status', 'pending')
            ->with('receiver')
            ->get();

        return response()->json($requests);
    }

    /**
     * Remove a friend from the friend's list.
     * 
     * This method allows a user to unfriend another one, and
     * updates the frontend accordingly.
     * 
     * @param int $userId
     * The ID of the user that either sends or receives the
     * unfriend request.
     * 
     * @return \Illuminate\Http\JsonResponse
     * Returns a JSON response with either a success or error message.
     */
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
