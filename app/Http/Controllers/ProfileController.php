<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Cloudinary\Api\Exception\ApiError;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    // ...otros campos que necesites...
                    'is_admin' => $user->hasRole('administrador'),
                    'is_moderator' => $user->hasRole('moderador'),
                ],
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('settings.edit');
    }

    /**
     * Handle the avatar upload to Cloudinary.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // Added webp and max size
        ]);

        $user = $request->user();
        $oldAvatarUrl = $user->avatarURL; // Guardamos la URL anterior si existe

        if ($request->hasFile('avatar')) {
            $uploadedFile = $request->file('avatar');

            try {
                // Eliminar el avatar anterior de Cloudinary si existe
                if ($oldAvatarUrl) {
                    try {
                        // Asegurarse de que estamos obteniendo el public_id correcto de la URL
                        $path = parse_url($oldAvatarUrl, PHP_URL_PATH);
                        $segments = explode('/', $path);
                        // El public_id con la carpeta 'avatars/' y el nombre del archivo sin extensión
                        $filenameWithExtension = end($segments);
                        $publicId = 'avatars/' . pathinfo($filenameWithExtension, PATHINFO_FILENAME);

                        // Eliminar de Cloudinary usando UploadApi
                        (new UploadApi())->destroy($publicId, ['resource_type' => 'image']);
                        Log::info("Avatar anterior eliminado de Cloudinary: " . $publicId);
                    } catch (ApiError $e) {
                        Log::warning("Error al eliminar avatar anterior de Cloudinary (puede que no exista o haya un problema): " . $e->getMessage());
                    }
                }

                // Subir el nuevo avatar a Cloudinary usando Base64
                $base64Image = 'data:' . $uploadedFile->getMimeType() . ';base64,' . base64_encode($uploadedFile->getContent());

                $uploaded = Cloudinary::uploadApi()->upload($base64Image, [
                    'folder' => 'avatars', // Mantener la carpeta para organización
                    'resource_type' => 'image',
                ]);

                $user->avatarURL = $uploaded['secure_url']; // Acceder a 'secure_url'
                $user->save();

                return Redirect::back()->with('success', 'Avatar actualizado con éxito.');

            } catch (ApiError $e) {
                Log::error("Error de Cloudinary al subir/eliminar avatar: " . $e->getMessage());
                return Redirect::back()->withErrors(['avatar' => 'Error al subir la imagen a Cloudinary. Inténtalo de nuevo.']);
            } catch (\Exception $e) {
                Log::error("Error inesperado al procesar el avatar: " . $e->getMessage());
                return Redirect::back()->withErrors(['avatar' => 'Ocurrió un error inesperado al procesar la imagen.']);
            }
        }

        return Redirect::back()->withErrors(['avatar' => 'No se encontró ninguna imagen para subir.']);
    }

    /**
     * Delete the user's avatar from Cloudinary and set avatarURL to null.
     */
    public function deleteAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatarURL) {
            try {
                $path = parse_url($user->avatarURL, PHP_URL_PATH);
                $segments = explode('/', $path);
                $filenameWithExtension = end($segments);
                // Construye el publicId incluyendo la carpeta 'avatars/'
                $publicId = 'avatars/' . pathinfo($filenameWithExtension, PATHINFO_FILENAME);

                // Eliminar de Cloudinary
                (new UploadApi())->destroy($publicId, ['resource_type' => 'image']);
                Log::info("Avatar del usuario eliminado de Cloudinary: " . $publicId);

                $user->avatarURL = null; // Establecer avatarURL a null en la base de datos
                $user->save();

                return Redirect::back()->with('success', 'Foto de perfil eliminada correctamente.');

            } catch (ApiError $e) {
                Log::error("Error al eliminar avatar de Cloudinary: " . $e->getMessage());
                return Redirect::back()->withErrors(['avatar' => 'No se pudo eliminar la foto de perfil de Cloudinary.']);
            } catch (\Exception $e) {
                Log::error("Error inesperado al eliminar el avatar: " . $e->getMessage());
                return Redirect::back()->withErrors(['avatar' => 'Ocurrió un error inesperado al eliminar la foto de perfil.']);
            }
        }

        return Redirect::back()->withErrors(['avatar' => 'El usuario no tiene una foto de perfil para eliminar.']);
    }


    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Eliminar el avatar de Cloudinary al eliminar la cuenta del usuario
        if ($user->avatarURL) {
            try {
                $path = parse_url($user->avatarURL, PHP_URL_PATH);
                $segments = explode('/', $path);
                $filenameWithExtension = end($segments);
                $publicId = 'avatars/' . pathinfo($filenameWithExtension, PATHINFO_FILENAME); // Incluir la carpeta

                (new UploadApi())->destroy($publicId, ['resource_type' => 'image']);
                Log::info("Avatar del usuario eliminado de Cloudinary al eliminar cuenta: " . $publicId);
            } catch (ApiError $e) {
                Log::error("Error al eliminar avatar de Cloudinary durante eliminación de cuenta: " . $e->getMessage());
            }
        }

        Auth::logout();
        $user->delete();
        // Soft delete de todas sus publicaciones
        $user->publications()->delete();
        // Delete de todas sus respuestas
        $user->responses()->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}