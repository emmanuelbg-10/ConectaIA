<?php

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ModerationController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ResponseController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Página de bienvenida
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Perfil de usuario (con controlador sería mejor a futuro)
Route::get('/profile', function () {
    return Inertia::render('Profile', [
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('profile');

// Ajustes de perfil
Route::middleware('auth')->group(function () {
    Route::get('/settings', [ProfileController::class, 'edit'])->name('settings.edit');
    Route::patch('/settings', [ProfileController::class, 'update'])->name('settings.update');
    Route::delete('/settings', [ProfileController::class, 'destroy'])->name('settings.destroy');
});

// Autenticación
require __DIR__.'/auth.php';

// Administración de usuarios
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');

    Route::middleware(['permission:editar usuarios'])
        ->put('/users/{user}', [AdminUserController::class, 'update'])
        ->name('users.update');

    Route::middleware(['permission:banear usuarios'])
        ->delete('/users/{user}', [AdminUserController::class, 'ban'])
        ->name('users.ban');

    Route::middleware(['permission:desbanear usuarios'])
        ->post('/users/{user}/restore', [AdminUserController::class, 'restore'])
        ->name('users.restore');
});

// Publicaciones (solo para usuarios autenticados)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('publications', PublicationController::class)->only(['index', 'store', 'show']);
    Route::post('/publications/{publication}/like', [LikeController::class, 'toggle'])->name('publications.like');
    Route::post('/publications/{publication}/responses', [ResponseController::class, 'store'])->name('responses.store');
    Route::put('/responses/{response}', [ResponseController::class, 'update'])->name('responses.update');
    Route::delete('/responses/{response}', [ResponseController::class, 'destroy'])->name('responses.destroy');
});

// Chat
Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');

// Moderación de texto
Route::post('/moderate-text', [ModerationController::class, 'moderate'])
    ->middleware('auth')->name('moderate-text');

// Página de test de moderación
Route::view('/moderate-test', 'moderate-test');

// Notificaciones
Route::get('/notifications', function () {
    return Inertia::render('Notifications/Index');
})->middleware('auth')->name('notifications.index');
