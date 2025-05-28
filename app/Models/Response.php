<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * The Response model.
 * 
 * This model defines the neccessary fields to respond to a publication and the
 * relationships that are needed to do so.
 */
class Response extends Model
{
    protected $fillable = [
        /**
         * The publication's ID
         * @var int
         */
        'publication_id',
        /**
         * The user's ID that made the response.
         * @var int
         */ 
        'user_id',
        /**
         * The parent response's ID if there is one.
         * @var int
         */
        'parent_id',
        /**
         * The text content of the response.
         * @var string
         */
        'text'
    ];

    /**
     * The publication that's receiving a response. One-to-one.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns a one-to-one relationship instance.
     */
    public function publication()
    {
        return $this->belongsTo(Publication::class);
    }

    /**
     * The user that made the response. One-to-one.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns a one-to-one relationship instance.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The parent response if said reply is part of a thread. One-to-one.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns a one-to-one relationship instance.
     */
    public function parent()
    {
        return $this->belongsTo(Response::class, 'parent_id');
    }

    /**
     * The replies to the specified response if it's part of a thread. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function children()
    {
        return $this->hasMany(Response::class, 'parent_id');
    }
}
