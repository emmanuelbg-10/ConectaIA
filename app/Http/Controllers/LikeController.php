<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, Publication $publication)
    {
        $user = $request->user();

        // Busca si ya existe el like
        $like = $publication->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            $publication->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'count' => $publication->likes()->count(),
        ]);
    }
}
