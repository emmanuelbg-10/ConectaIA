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
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        /**
         * The username.
         * @var string
         */
        'name',
        /**
         * The user's email.
         * @var string
         */
        'email',
        /**
         * The user's password
         * @var string
         */
        'password',
        /**
         * The URL where the avatar of the user is stored.
         * @var string
         */
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

    // --- RELATIONSHIPS ---

    /**
     * Publications created by the user. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function publications(): HasMany
    {
        return $this->hasMany(Publication::class);
    }

    /**
     * Messages sent by the user. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'user_sender_id');
    }

    /**
     * Messages received by the user. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'user_receiver_id');
    }

    /**
     * The notifications sent to the user. One-to-many
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id'); // El usuario notificado
    }

    /**
     * Notifications caused by the user. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function triggeredNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'actor_id'); // El usuario actor
    }

    /**
     * Interactions done by the user. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    /**
     * Mentions done to a user. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function mentions(): HasMany
    {
        return $this->hasMany(Mention::class, 'user_id'); // El usuario mencionado
    }

    /**
     * Followed users by this account. Many-to-many
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     * Returns a many-to-many relationship instance with the pivot
     * table 'followings'.
     */
    public function following(): BelongsToMany
    {
        // Tabla pivote 'followings', FK de este modelo 'follower_id', FK del modelo relacionado 'followed_id'
        return $this->belongsToMany(User::class, 'followings', 'follower_id', 'followed_id')->withTimestamps();
    }

    /**
     * The users that are following this account. Many-to-many
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     * Returns a many-to-many relationship instance with the pivot
     * table 'followings'.
     */
    public function followers(): BelongsToMany
    {
        // Tabla pivote 'followings', FK del modelo relacionado 'follower_id', FK de este modelo 'followed_id'
        return $this->belongsToMany(User::class, 'followings', 'followed_id', 'follower_id')->withTimestamps();
    }

    /**
     * The likes this user has given. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    /**
     * The responses this user has done. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function responses()
    {
        return $this->hasMany(\App\Models\Response::class);
    }
}
