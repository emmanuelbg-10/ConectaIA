<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The mention model
 * 
 * This model defines the publication and user the mention's
 * addressed to, alongside defining the relationships with the
 * other two models
 */
class Mention extends Model
{
    use HasFactory;

    protected $fillable = [
        /**
         * The ID of the publication
         * @var int
         */
        'publication_id',
        /**
         * The ID of the user
         * @var int
         */
        'user_id',
    ];

    /**
     * The publication where the mention was done. One-to-one relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * The one-to-one relationship with the publication.
     */
    public function publication(): BelongsTo
    {
        return $this->belongsTo(Publication::class);
    }

    /**
     * The user that got mentioned. One-to-one relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * The one-to-one relationship with the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}