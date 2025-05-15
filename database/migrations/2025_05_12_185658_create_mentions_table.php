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
       Schema::create('mentions', function (Blueprint $table) {
    $table->id(); // PK id(INT AUTO_INCREMENT)
    // FK publication_id(INT)
    $table->foreignId('publication_id')->constrained()->onDelete('cascade');
    // FK user_id(INT) - El usuario mencionado
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->timestamps(); // created_at(TIMESTAMP) - y updated_at
    // Evitar menciones duplicadas en la misma publicación
    $table->unique(['publication_id', 'user_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mentions');
    }
};
