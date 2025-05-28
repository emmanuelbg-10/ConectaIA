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
       Schema::create('followings', function (Blueprint $table) {
    // PK,FK1 follower_id(INT) - El que sigue
    $table->foreignId('follower_id')->constrained('users')->onDelete('cascade');
    // PK,FK2 followed_id(INT) - El que es seguido
    $table->foreignId('followed_id')->constrained('users')->onDelete('cascade');
    // Clave primaria compuesta
    $table->primary(['follower_id', 'followed_id']);
    $table->timestamps(); // created_at(TIMESTAMP) - y updated_at
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('followings');
    }
};
