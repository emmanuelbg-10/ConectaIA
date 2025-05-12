<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notificationType',
        'reference_id',
        'actor_id',
        'notificationContent',
        'read',
    ];

    protected $casts = [
        'read' => 'boolean',
    ];

    /**
     * El usuario que recibe la notificación.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * El usuario que causó la notificación.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    // Opcional: Si usaras polimorfismo para reference_id
    // public function notifiable()
    // {
    //     return $this->morphTo(); // Requeriría columnas notifiable_id y notifiable_type
    // }
}