<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail; // Si usas verificación de email
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable // implements MustVerifyEmail (si aplica)
{
    use HasFactory, Notifiable,HasRoles,SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // 'name', // Quítalo si usas username
        'username',
        'email',
        'password',
        'avatarURL',
        'roleId',
    ];
    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $dates = ['deleted_at'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // --- RELACIONES ---

    /**
     * Publicaciones creadas por el usuario.
     */
    public function publications(): HasMany
    {
        return $this->hasMany(Publication::class);
    }

    /**
     * Mensajes enviados por el usuario.
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'user_sender_id');
    }

    /**
     * Mensajes recibidos por el usuario.
     */
    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'user_receiver_id');
    }

    /**
     * Notificaciones para este usuario.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id'); // El usuario notificado
    }

    /**
     * Notificaciones causadas por este usuario.
     */
    public function triggeredNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'actor_id'); // El usuario actor
    }

    /**
     * Interacciones realizadas por el usuario.
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    /**
     * Menciones hechas a este usuario.
     */
    public function mentions(): HasMany
    {
        return $this->hasMany(Mention::class, 'user_id'); // El usuario mencionado
    }

    /**
     * Los usuarios que este usuario sigue (followed).
     */
    public function following(): BelongsToMany
    {
        // Tabla pivote 'followings', FK de este modelo 'follower_id', FK del modelo relacionado 'followed_id'
        return $this->belongsToMany(User::class, 'followings', 'follower_id', 'followed_id')->withTimestamps();
    }

    /**
     * Los usuarios que siguen a este usuario (followers).
     */
    public function followers(): BelongsToMany
    {
        // Tabla pivote 'followings', FK del modelo relacionado 'follower_id', FK de este modelo 'followed_id'
        return $this->belongsToMany(User::class, 'followings', 'followed_id', 'follower_id')->withTimestamps();
    }
}