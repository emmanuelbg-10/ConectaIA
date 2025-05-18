<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\MessageSent;

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
            'content' => 'required|string|max:1000',
        ]);

        $message = \App\Models\Message::create([
            'user_sender_id' => auth()->id(),
            'user_receiver_id' => $request->receiver_id,
            'content' => $request->content,
            'sent_at' => now(),
        ]);

        event(new MessageSent($message));

        return response()->json($message);
    }
}
