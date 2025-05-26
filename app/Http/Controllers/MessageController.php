<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\MessageSent;
use App\Models\Message;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;


/**
 * Class MessageController
 *
 * Handles the management of messages between users, including retrieving conversations
 * and sending new messages.
 */
class MessageController extends Controller
{
     /**
     * Retrieves all messages exchanged between the authenticated user and a specific friend.
     *
     * The conversation includes messages sent by either user to the other,
     * ordered chronologically from oldest to newest.
     *
     * @param int $friendId 
     * The unique identifier of the friend user to fetch messages with.
     * 
     * @return \Illuminate\Http\JsonResponse 
     * A JSON response containing an array of message objects.
     * Each message object includes details like sender, receiver, content, and timestamp.
     */
    public function conversation($friendId)
    {
        $userId = auth()->id();

        $messages = \App\Models\Message::where(function($q) use ($userId, $friendId) {
                $q->where('user_sender_id', $userId)
                  ->where('user_receiver_id', $friendId);
            })
            ->orWhere(function($q) use ($userId, $friendId) {
                $q->where('user_sender_id', $friendId)
                  ->where('user_receiver_id', $userId);
            })
            ->orderBy('sent_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Sends a new message from the authenticated user to a specified receiver.
     *
     * The incoming request data is validated to ensure the receiver exists
     * and the message content is valid. Upon successful creation, a
     * `MessageSent` event is dispatched, which can be used for real-time
     * broadcasting (e.g., via WebSockets).
     *
     * @param \Illuminate\Http\Request $request 
     * The HTTP request containing message data.
     * Expected fields:
     * - 'receiver_id' (required, int): The ID of the user who will receive the message. Must exist in the 'users' table.
     * - 'content' (required, string): The text content of the message. Maximum 1000 characters.
     * 
     * @return \Illuminate\Http\JsonResponse 
     * A JSON response containing the details of the newly created message.
     */
    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
        ]);
    
        $imageUrl = null;

        // Subir imagen si existe
        if ($request->hasFile('image')) {
            $uploadedFile = $request->file('image');
            $base64Image = 'data:' . $uploadedFile->getMimeType() . ';base64,' . base64_encode($uploadedFile->getContent());
        
            $uploaded = Cloudinary::uploadApi()->upload($base64Image, [
                'folder' => 'messages',
                'resource_type' => 'image',
            ]);
        
            $imageUrl = $uploaded['secure_url'];
        }
        
        // Validar que al menos uno exista
        if (empty($request->content) && empty($imageUrl)) {
            return response()->json(['error' => 'No se puede enviar un mensaje vacío.'], 422);
        }
        
    
        $message = Message::create([
            'user_sender_id' => auth()->id(),
            'user_receiver_id' => $request->receiver_id,
            'content' => $request->input('content', null),
            'imageURL' => $imageUrl,
            'sent_at' => now(),
        ]);
    
        broadcast(new MessageSent($message))->toOthers();
    
        return response()->json($message);
    }
}
