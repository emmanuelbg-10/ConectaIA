<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The interaction model.
 * 
 * This model defines the relationships with the users and
 * publications, defining also the type of interaction and if
 * said action has text related to it
 */
class Interaction extends Model
{
    use HasFactory;

    protected $fillable = [
        /**
         * The user's ID
         * @var int
         */
        'user_id',
        /**
         * The publication's ID
         * @var int
         */
        'publication_id',
        /**
         * The type of interaction
         * @var string
         */
        'interactionType',
        /**
         * The content of the comment of the interaction
         * (if there's any)
         * @var string
         */
        'comment_content',
    ];

    /**
     * The user that did the interaction, this is a one-to-one relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * The one-to-one relationship with the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The publication that got interacted with, this one is a one-to-one relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * The one-to-one relationship with the publication.
     */
    public function publication(): BelongsTo
    {
        return $this->belongsTo(Publication::class);
    }
}