<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * The Publication model.
 * 
 * This model defines the fillable fields for publications, alongside the
 * relationships with everything that has to do and can be done with a
 * publication. The relationships are one-to-one, one-to-many & many-to-many.
 */
class Publication extends Model
{
    use HasFactory;

    protected $fillable = [
        /**
         * The user's ID that made the publication.
         * @var int
         */
        'user_id',
        /**
         * The content of the publication
         * @var string
         */
        'textContent',
        /**
         * The URL of the image which is stored in
         * the server.
         * @var string
         */
        'imageURL',
        /**
         * The ID of the parent publication if said
         * post is part of a thread.
         * @var int
         */
        'parent_publication_id',
    ];

    /**
     * The user that created the publication. A one-to-one relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns a one-to-one relationship instance.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Hashtags associated with the publication. A many-to-many relationship.
     * 
     * This function uses the pivot table 'hashtag_publications' to allow for this
     * kind of relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     * Returns a many-to-many relationship instance.
     */
    public function hashtags(): BelongsToMany
    {
        // Tabla pivote 'hashtag_publications'
        return $this->belongsToMany(Hashtag::class, 'hashtag_publications');
    }

    /**
     * Mentions within the publication. A one-to-many relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function mentions(): HasMany
    {
        return $this->hasMany(Mention::class);
    }

    /**
     * The interactions made to the publication. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    /**
     * The parent publication (if it's a response). One-to-one.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns a one-to-one relationship instance.
     */
    public function parentPublication(): BelongsTo
    {
        return $this->belongsTo(Publication::class, 'parent_publication_id');
    }

    /**
     * The responses to the publication. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function responses()
    {
        return $this->hasMany(\App\Models\Response::class)->whereNull('parent_id');
    }

    /**
     * The likes of the publication. One-to-many.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     * Returns a one-to-many relationship instance.
     */
    public function likes()
    {
        return $this->hasMany(Like::class);
    }
}
