<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;
use App\Models\User; // Asegúrate de importar tu modelo User

class RouteServiceProvider extends ServiceProvider
{
    // ... otras propiedades y métodos

    public function boot(): void
    {
        parent::boot(); // Llama al boot del padre primero

        // Esto le dice a Laravel cómo resolver explícitamente el parámetro 'user'
        // en las rutas, incluyendo aquellos que están soft-deleted.
        Route::bind('user', function ($value) {
            return User::withTrashed()->where('id', $value)->firstOrFail();
        });

        // Alternativamente, si solo quieres que afecte a un parámetro específico
        // y no a todos los {user} (por si en otros sitios no quieres incluir los trashed):
        // Route::model('user_with_trashed', User::class, function ($value) {
        //    return User::withTrashed()->where('id', $value)->firstOrFail();
        // });
        // Y en tu ruta tendrías que usar {user_with_trashed} en lugar de {user} para el restore.
        // La opción con Route::bind('user', ...) es más directa si quieres que {user} siempre considere los trashed.
    }
}