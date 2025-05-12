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
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // PK id(INT AUTO_INCREMENT) - Estándar de Laravel
            // $table->string('name'); // Columna de Breeze, la comentamos o eliminamos si usamos username
            $table->string('username', 100)->unique(); // username (VARCHAR(100)) - Añadido y único
            $table->string('email')->unique(); // email (VARCHAR(255)) - Estándar de Breeze/Laravel
            $table->timestamp('email_verified_at')->nullable(); // Estándar de Breeze/Laravel
            $table->string('password'); // password (VARCHAR(255)) - Estándar de Breeze/Laravel
            $table->string('avatarURL')->nullable(); // avatarURL (VARCHAR(255)) - Añadido, puede ser nulo
            $table->unsignedBigInteger('roleId')->nullable(); // roleId (INT) - Añadido, podría ser nulo o tener un default. Asumiendo que es un ID simple, no una FK formal aquí.
            $table->rememberToken(); // Estándar de Breeze/Laravel
            $table->timestamps(); // created_at, updated_at (TIMESTAMP) - Estándar de Laravel
        });

        // Estas tablas son creadas por Breeze, las dejamos como están o las adaptamos si es necesario
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};