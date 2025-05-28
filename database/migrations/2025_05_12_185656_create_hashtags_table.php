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
        Schema::create('hashtags', function (Blueprint $table) {
    $table->id(); // PK id(INT AUTO_INCREMENT)
    $table->string('hashtag_text', 100)->unique(); // hashtag_text(VARCHAR(100)) - Hacemos que sea único
    $table->timestamps(); // Añadimos timestamps por buena práctica
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hashtags');
    }
};
