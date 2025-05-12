<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('notifications', function (Blueprint $table) {
    $table->id(); // PK id(INT AUTO_INCREMENT)
    // FK user_id(INT) - El usuario que recibe la notificación
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    // notificationType(enum)
    $table->enum('notificationType', ['NuevoMensaje', 'Mencion', 'MeGusta', 'Retweet', 'NuevoSeguidor']); // Añadido 'NuevoSeguidor' como posible tipo
    // reference_id(INT) - ID de la entidad relacionada (mensaje, publicación, usuario...)
    $table->unsignedBigInteger('reference_id')->nullable(); // Puede ser nulo si no aplica
    // FK actor_id(INT) - El usuario que origina la acción
    $table->foreignId('actor_id')->constrained('users')->onDelete('cascade');
    $table->string('notificationContent')->nullable(); // notificationContent(VARCHAR(255)) - Podría generarse dinámicamente
    $table->boolean('read')->default(false); // read(BOOLEAN)
    $table->timestamps(); // created_at(TIMESTAMP) - updated_at también
    // Índices para mejorar rendimiento
    $table->index(['user_id', 'read']);
    $table->index(['reference_id', 'notificationType']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
