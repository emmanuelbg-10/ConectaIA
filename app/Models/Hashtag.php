<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * The hashtag model.
 * 
 * This model defines the fields in the database that are fillable by
 * the users and the relationship with publications.
 */
class Hashtag extends Model
{
    use HasFactory;

    protected $fillable = ['hashtag_text'];

    /**
     * Publications that use this hashtag, this is a one-to-many relationship.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     * Returns a one-to-many relationship with publications.
     */
    public function publications(): BelongsToMany
    {
         // Tabla pivote 'hashtag_publications'
        return $this->belongsToMany(Publication::class, 'hashtag_publications');
    }
}