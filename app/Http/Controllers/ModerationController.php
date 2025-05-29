<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Hashtag;

/**
 * Moderation through a large language model.
 * 
 * This controller manages every social interaction (posts, responses, messages, etc.)
 * by ensuring content is appropriate according to guidelines, using the Gemini API.
 */
class ModerationController extends Controller
{
    /**
     * Moderates text content using the Gemini API.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function moderate(Request $request)
    {
        Log::info('ModerationController called', $request->all());

        $apiKey = env('GEMINI_API_KEY');
        if (empty($apiKey)) {
            return response()->json([
                'allowed' => false,
                'message' => 'API key is missing.',
            ], 500);
        }

        $text = $request->input('text', '');

        // Prompt personalizado para moderación
        $prompt = <<<EOT
Eres un moderador de contenido para una red social. Analiza el siguiente texto y responde solo con:

- 'PERMITIDO' si el contenido es apropiado.
- 'BLOQUEADO: [motivo breve]' si el contenido contiene lenguaje ofensivo, discriminatorio, violento o inapropiado para una comunidad general. El motivo debe ser una frase muy corta y clara (máximo 10 palabras).

No expliques nada más, responde exactamente en ese formato.

---
Texto a analizar:
"$text"
---
EOT;

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

            if (stripos($geminiResult, 'PERMITIDO') === 0) {
                $allowed = true;
                $message = 'Contenido permitido.';
            } else {
                $allowed = false;
                // Extrae el motivo después de "BLOQUEADO:"
                $motivo = trim(preg_replace('/^BLOQUEADO\s*:/i', '', $geminiResult));
                $message = $motivo ?: 'Tu publicación contiene contenido ofensivo o inapropiado.';
            }

            return response()->json([
                'allowed' => $allowed,
                'message' => $message,
                'gemini_result' => $geminiResult,
            ]);
        }

        return response()->json([
            'allowed' => false,
            'message' => 'Error al validar el contenido.',
        ], 500);
    }

    /**
     * Suggests up to 5 relevant hashtags for a given text using the Gemini API.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function suggestHashtags(Request $request)
    {
        $apiKey = env('GEMINI_API_KEY');
        if (empty($apiKey)) {
            return response()->json([
                'hashtags' => [],
                'message' => 'API key is missing.',
            ], 500);
        }

        $text = $request->input('text', '');

        // Obtener todos los hashtags actuales desde la base de datos
        $existingHashtags = Hashtag::pluck('hashtag_text')->toArray();
        $existingList = implode(', ', $existingHashtags);

        // Prompt para sugerir hashtags considerando los existentes
        $prompt = <<<EOT
        Eres un asistente que sugiere hasta 5 hashtags relevantes para un texto dado.
        Texto: "$text"
        Hashtags actuales disponibles: $existingList

        Sugiere hasta 5 hashtags relevantes y adecuados para el texto, preferentemente reutilizando los existentes.
        Responde sólo con los hashtags separados por comas, sin el símbolo #.
    EOT;

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=$apiKey", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
        ]);

        if ($response->successful()) {
            $responseData = $response->json();
            $hashtagsText = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $hashtags = array_filter(array_map('trim', explode(',', $hashtagsText)));
            return response()->json(['hashtags' => $hashtags]);
        }

        return response()->json([
            'hashtags' => [],
            'message' => 'Error al sugerir hashtags.',
        ], 500);
    }
}
