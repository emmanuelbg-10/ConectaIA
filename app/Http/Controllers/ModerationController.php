<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Moderation through a large language model.
 * 
 * This controller's only purpose is to manage every single publication,
 * response, message, etc... any social interaction by making sure it's
 * considere appropiate according to our guidelines.
 */
class ModerationController extends Controller
{
    /**
     * A method that uses AI to moderate social interactions.
     * 
     * This method uses the Gemini API to pass any text through it and analyze
     * to determine if it's allowed to be posted or not with a custom prompt.
     * It logs the response into 'laravel.logs' for auditing purposes and then
     * returns a JSON with either a success or error message.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request to call the Gemini API
     * 
     * @return \Illuminate\Http\JsonResponse
     * It returns the "permitted/blocked" response from the Gemini API or an
     * error message if the operation failed.
     */
    public function moderate(Request $request)
    {
        Log::info('ModerationController called', $request->all());
        $data = $request->all();
        $apiKey = env('GEMINI_API_KEY');

        $text = $data['text'] ?? '';

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
        } else {
            return response()->json([
                'allowed' => false,
                'message' => 'Error al validar el contenidMMMo.',
            ], 500);
        }
    }
}
