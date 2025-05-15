<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_sender_id',
        'user_receiver_id',
        'content',
        'imageURL',
        'read',
        'sent_at', // Si quieres que sea asignable masivamente
    ];

    protected $casts = [
        'read' => 'boolean',
        'sent_at' => 'datetime',
    ];

    /**
     * El usuario que envió el mensaje.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_sender_id');
    }

    /**
     * El usuario que recibió el mensaje.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_receiver_id');
    }
}