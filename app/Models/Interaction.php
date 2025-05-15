<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'publication_id',
        'interactionType',
        'comment_content',
    ];

    /**
     * El usuario que realizó la interacción.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * La publicación con la que se interactuó.
     */
    public function publication(): BelongsTo
    {
        return $this->belongsTo(Publication::class);
    }
}