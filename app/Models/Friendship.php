<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * The Friendship model.
 * 
 * This model determines both the relationships with the User model,
 * as it needs to establish which user sent the friend request and
 * which one received it.
 */
class Friendship extends Model
{
    /**
     * @var array<string>
     */
    protected $fillable = ['sender_id', 'receiver_id', 'status'];

    /**
     * The user that sends the friend request.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns a one-to-one relationship instance.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * The user that receives the friend request.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns a one-to-one relationship instance.
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
