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
        Schema::create('messages', function (Blueprint $table) {
    $table->id(); // PK id(INT AUTO_INCREMENT)
    // FK user_sender_id(INT) - Referencia a la tabla users
    $table->foreignId('user_sender_id')->constrained('users')->onDelete('cascade');
    // FK user_receiver_id(INT) - Referencia a la tabla users
    $table->foreignId('user_receiver_id')->constrained('users')->onDelete('cascade');
    $table->text('content'); // content(TEXT)
    $table->string('imageURL')->nullable(); // ImageURL (VARCHAR(255))
    $table->boolean('read')->default(false); // read(BOOLEAN) - Por defecto no leído
    $table->timestamp('sent_at')->useCurrent(); // sent_at(TIMESTAMP) - Usamos el valor del diagrama
    $table->timestamps(); // created_at, updated_at - Laravel las gestiona
    // Nota: 'sent_at' y 'created_at' son redundantes. Podrías usar solo timestamps() y renombrar created_at si es necesario. Dejamos ambos para seguir el diagrama.
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
