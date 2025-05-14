<?php
namespace App\Providers;

use Illuminate\Database\Eloquent\ModelNotFoundException;

use Illuminate\Support\Facades\Route; // Asegúrate que está importado
use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * This is the path to the "home" route for your application.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    protected $namespace = 'App\Http\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     */
public function boot(): void
{
    // ...
    Route::bind('user', function ($value) {
        return \App\Models\User::withTrashed()->where('id', $value)->firstOrFail();
    });
    // O específicamente para un parámetro en una ruta
    // Route::model('user_trashed', \App\Models\User::class, function ($value) {
    // return \App\Models\User::withTrashed()->where('id', $value)->firstOrFail();
    // });
    // Y en tu ruta usarías: Route::post('/users/{user_trashed}/restore', ...)

    parent::boot();
}
}