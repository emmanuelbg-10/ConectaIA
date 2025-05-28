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
        Schema::create('interactions', function (Blueprint $table) {
    $table->id(); // PK id(INT AUTO_INCREMENT)
    // FK user_id(INT) - Usuario que interactúa
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    // FK publication_id(INT)
    $table->foreignId('publication_id')->constrained()->onDelete('cascade');
    // interactionType(enum)
    $table->enum('interactionType', ['MeGusta', 'Retweet', 'Comentario']);
    $table->text('comment_content')->nullable(); // comment_content(TEXT) - Solo para comentarios
    $table->timestamps(); // created_at(TIMESTAMP) - y updated_at
    // Evitar interacciones duplicadas (ej. un usuario da "Me Gusta" dos veces)
    $table->unique(['user_id', 'publication_id', 'interactionType']);
    // Índice para búsquedas comunes
    $table->index(['publication_id', 'interactionType']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interactions');
    }
};
