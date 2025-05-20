<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Publication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'textContent',
        'imageURL',
        'parent_publication_id',
    ];

    /**
     * El usuario que creó la publicación.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Hashtags asociados a la publicación.
     */
    public function hashtags(): BelongsToMany
    {
        // Tabla pivote 'hashtag_publications'
        return $this->belongsToMany(Hashtag::class, 'hashtag_publications');
    }

    /**
     * Menciones en la publicación.
     */
    public function mentions(): HasMany
    {
        return $this->hasMany(Mention::class);
    }

    /**
     * Interacciones recibidas por la publicación.
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    /**
     * La publicación padre (si es una respuesta).
     */
    public function parentPublication(): BelongsTo
    {
        return $this->belongsTo(Publication::class, 'parent_publication_id');
    }

    /**
     * Las respuestas a esta publicación.
     */
      public function responses()
    {
        return $this->hasMany(\App\Models\Response::class)->whereNull('parent_id');
    }

    public function likes() {
    return $this->hasMany(Like::class);
}

 
}