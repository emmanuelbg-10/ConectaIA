<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ModerationController extends Controller
{
    public function moderate(Request $request)
    {
        Log::info('ModerationController called', $request->all());
        $data = $request->all();
        $apiKey = env('GEMINI_API_KEY');

        $text = $data['text'] ?? '';

        // Prompt personalizado para moderación
        $prompt = "
Eres un moderador de contenido para una red social. Analiza el siguiente texto y responde solo con 'PERMITIDO' si el contenido es apropiado, o 'BLOQUEADO' si contiene lenguaje ofensivo, discriminatorio, violento o inapropiado para una comunidad general. No expliques, solo responde con una de esas dos palabras.

---
Texto a analizar:
\"$text\"
---";

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
        ]);

        Log::info('Gemini Moderation API Response:', $response->json());

        if ($response->successful()) {
            $responseData = $response->json();
            $geminiResult = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';

            $allowed = stripos($geminiResult, 'PERMITIDO') !== false;
            $message = $allowed
                ? 'Contenido permitido.'
                : 'Tu publicación contiene contenido ofensivo o inapropiado.';

            return response()->json([
                'allowed' => $allowed,
                'message' => $message,
                'gemini_result' => $geminiResult,
            ]);
        } else {
            return response()->json([
                'allowed' => false,
                'message' => 'Error al validar el contenidMMMo.',
            ], 500);
        }
    }
}
