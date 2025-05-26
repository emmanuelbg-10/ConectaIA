<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The Notification model.
 * 
 * This model defines the relationships with the users, both the one
 * that triggered the notification through their action and the one who
 * receives said notification.
 */
class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        /**
         * The ID of the user that receives the notification
         * @var int
         */
        'user_id',
        /**
         * The type of notification.
         * @var string
         */
        'notificationType',
        'reference_id',
        /**
         * The ID of the user that triggered the notification
         * @var int
         */
        'actor_id',
        /**
         * The content of the notification itself.
         * @var string
         */
        'notificationContent',
        /**
         * Indicate if the user has read the notification.
         * @var boolean
         */
        'read',
    ];

    protected $casts = [
        'read' => 'boolean',
    ];

    /**
     * The user that receives the notification. One-to-one relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * The relationship between notifications and the receiver.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The user that caused the notification. One-to-one relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * The relationship between the notifications and the sender.
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