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
use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;


Broadcast::routes(['middleware' => []]);

Route::post('/broadcasting/auth', function (Request $request) {
    return response()->json(['result' => 'ok']);
});

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

// Ajustes de perfil y Avatar
Route::middleware('auth')->group(function () {
    Route::get('/settings', [ProfileController::class, 'edit'])->name('settings.edit');
    Route::patch('/settings', [ProfileController::class, 'update'])->name('settings.update');
    Route::delete('/settings', [ProfileController::class, 'destroy'])->name('settings.destroy');

    // Rutas para la gestión del avatar
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.updateAvatar');
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('profile.deleteAvatar'); // NUEVA RUTA
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

Route::middleware('auth')->group(function () {
    Route::post('/friendships/send/{receiver_id}', [FriendshipController::class, 'sendRequest']);
    Route::post('/friendships/accept/{id}', [FriendshipController::class, 'acceptRequest']);
    Route::post('/friendships/reject/{id}', [FriendshipController::class, 'rejectRequest']);
    Route::get('/friendships/received', [FriendshipController::class, 'receivedRequests']);
    Route::get('/friendships/sent', [FriendshipController::class, 'sentRequests']);
    Route::post('/friendships/remove/{userId}', [FriendshipController::class, 'removeFriend']);
});

Route::middleware('auth')->post('/follow/{userId}', [FollowController::class, 'toggle']);
Route::delete('/publications/{publication}', [PublicationController::class, 'destroy'])
    ->middleware('auth');

Route::get('/alerts', [App\Http\Controllers\AlertController::class, 'index'])->middleware('auth');
Route::get('/alerts/data', [App\Http\Controllers\AlertController::class, 'index'])->middleware('auth');

Route::middleware('auth')->get('/messages/{friendId}', [MessageController::class, 'conversation']);
Route::post('/messages/send', [MessageController::class, 'send'])->middleware('auth');
Route::get('/search', [\App\Http\Controllers\SearchController::class, 'search'])->name('search');
Route::post('/hashtags/suggest', [\App\Http\Controllers\ModerationController::class, 'suggestHashtags']);
Route::get('/hashtags/search', function (Illuminate\Http\Request $request) {
    $q = $request->query('q', '');
    $hashtags = \App\Models\Hashtag::where('hashtag_text', 'like', $q . '%')
        ->limit(10)
        ->pluck('hashtag_text');
    return response()->json(['hashtags' => $hashtags]);
});