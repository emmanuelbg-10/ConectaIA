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
        Schema::create('hashtag_publications', function (Blueprint $table) {
    // PK,FK1 publication_id(INT)
    $table->foreignId('publication_id')->constrained()->onDelete('cascade');
    // PK,FK2 hashtag_id(INT)
    $table->foreignId('hashtag_id')->constrained()->onDelete('cascade');
    // Definimos la clave primaria compuesta
    $table->primary(['publication_id', 'hashtag_id']);
    // No se especifican timestamps en el diagrama para esta tabla pivote
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hashtag_publications');
    }
};
