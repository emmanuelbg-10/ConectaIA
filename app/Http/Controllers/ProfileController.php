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

/**
 * Class related to the profile of a user.
 * 
 * This controller handles the editing, updating and deletion of a user's
 * account. It uses Inertia.js for the rendering in the frontend, and Spatie's
 * Laravel Permission package for role management.
 */
class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     * 
     * Retrieves a user's info and displays it using Inertia.js, 
     * so that the user is presented with a page showing only their information.
     * 
     * @param \Illuminate\Http\Request $request
     * The incoming HTTP request.
     * 
     * @return \Inertia\Response
     * Returns an Inertia response, rendering the 'Profile/Edit' view with
     * that user's specific data.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Settings/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     * 
     * Validates the incoming data, and then updates the user's information.
     * 
     * @param \App\Http\Requests\ProfileUpdateRequest $request
     * The HTTP request for validating the new user's data.
     * 
     * @return \Illuminate\Http\RedirectResponse
     * Redirects to the 'profile.edit' page to show the new data.
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
     * 
     * This method allows the user to upload several image types to use as their
     * avatar.
     * It also at the same time checks if one already exists and replaces it by the new one.
     * Finally it returns a success or error message depending on the state of the upload and
     * if the Cloudinary API is currently working or not.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request to upload an image.
     * 
     * @return \Illuminate\Http\RedirectResponse
     * Redirects back with either a success or error message.
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
     * 
     * This method deletes from the Cloudinary servers the image previously
     * uploaded by the user, and then returns either a success or error message.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request to delete an image.
     * 
     * @return \Illuminate\Http\RedirectResponse
     * Redirects back with either a success or error message.
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
     * 
     * This method allows a user to delete their account. For security reasons,
     * it requests their password and the logs them out before deleting then to
     * invalidate their token in the database, just so that it cannot be used without
     * the account.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request.
     * 
     * @return \Illuminate\Http\RedirectResponse
     * Returns the user to the root directory, which in this case is the login/register
     * page.
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
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}