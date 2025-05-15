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
       Schema::create('publications', function (Blueprint $table) {
    $table->id(); // PK id(INT AUTO_INCREMENT)
    $table->foreignId('user_id')->constrained()->onDelete('cascade'); // FK user_id(INT)
    $table->text('textContent')->nullable(); // textContent(TEXT)
    $table->string('imageURL')->nullable(); // imageURL (VARCHAR(255))
    // FK a sí misma para respuestas/hilos. Debe ser nullable.
    $table->foreignId('parent_publication_id')->nullable()->constrained('publications')->onDelete('set null'); // parent_publication_id(INT) - onDelete('set null') o 'cascade' según necesidad
    $table->timestamps(); // created_at, updated_at(TIMESTAMP)
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publications');
    }
};
