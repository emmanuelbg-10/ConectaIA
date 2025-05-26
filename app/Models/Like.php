<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * The Like model.
 * 
 * This model handles the likes done by one user to one
 * publication.
 */
class Like extends Model
{
    protected $fillable = ['user_id'];

    /**
     * The publication relationship. One-to-one.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns the relationship between likes and publications.
     */
    public function publication()
    {
        return $this->belongsTo(\App\Models\Publication::class);
    }

    /**
     * The user relationship. One-to-one.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns the relationship between likes and users.
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
