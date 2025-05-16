<?php

use App\Http\Controllers\Admin\AdminUserController as AdminUserController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\ChatController; // Asegúrate de importar tu controlador de chat
use App\Http\Controllers\ModerationController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ResponseController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::get('/users', [AdminUserController::class, 'index'])->middleware(['auth', 'verified'])
    ->name('admin.users.index');

// Rutas del Panel de Administración de Usuarios
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {

    Route::middleware(['permission:editar usuarios']) // Solo Admin
        ->put('/users/{user}', [AdminUserController::class, 'update'])
        ->name('users.update');

    Route::middleware(['permission:banear usuarios']) // Admin y Moderador
        ->delete('/users/{user}', [AdminUserController::class, 'ban'])
        ->name('users.ban');

    Route::middleware(['permission:desbanear usuarios']) // Admin y Moderador
        ->post('/users/{user}/restore', [AdminUserController::class, 'restore'])
        ->name('users.restore');
});

Route::resource('publications', PublicationController::class);

Route::get('/publications', [PublicationController::class, 'index'])->name('publications.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/publications', [PublicationController::class, 'index'])
        ->name('publications.index');

    Route::post('/publications', [PublicationController::class, 'store'])
        ->name('publications.store');
});

Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');


Route::post('/moderate-text', [ModerationController::class, 'moderate'])
    ->middleware('auth')->name('moderate-text');

Route::view('/moderate-test', 'moderate-test');

Route::post('/publications/{publication}/like', [LikeController::class, 'toggle'])->middleware('auth');
Route::get('/publications/{publication}', [PublicationController::class, 'show'])->name('publications.show');

Route::post('/publications/{publication}/responses', [ResponseController::class, 'store'])->name('responses.store')->middleware('auth');
Route::put('/responses/{response}', [ResponseController::class, 'update'])->name('responses.update')->middleware('auth');
Route::delete('/responses/{response}', [ResponseController::class, 'destroy'])->name('responses.destroy')->middleware('auth');