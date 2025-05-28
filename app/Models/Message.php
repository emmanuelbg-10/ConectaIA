<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The message model.
 * 
 * This model defines how private messages are sent, and it needs a
 * relationship with two users: the sender and receiver.
 */
class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        /**
         * The user that sent the message.
         * @var int
         */
        'user_sender_id',
        /**
         * The user that received the message.
         * @var int
         */
        'user_receiver_id',
        /**
         * The content of the message.
         * @var string
         */
        'content',
        /**
         * The url of the image (if there is one)
         * @var string
         */
        'imageURL',
        /**
         * Used to indicate if the user has read the message.
         * @var boolean
         */
        'read',
        /**
         * The date in which the message got sent
         * @var datetime
         */
        'sent_at', // Si quieres que sea asignable masivamente
    ];

    protected $casts = [
        'read' => 'boolean',
        'sent_at' => 'datetime',
    ];

    /**
     * The user that sent the message. One-to-One relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * The one-to-one relationship with the user.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_sender_id');
    }

    /**
     * The user that received the message. One-to-one relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * The one-to-one relationship with the user.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_receiver_id');
    }
}