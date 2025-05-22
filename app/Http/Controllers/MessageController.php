<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\MessageSent;
use App\Models\Message;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;


class MessageController extends Controller
{
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
