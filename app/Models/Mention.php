<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mention extends Model
{
    use HasFactory;

    protected $fillable = [
        'publication_id',
        'user_id',
    ];

    /**
     * La publicación donde se hizo la mención.
     */
    public function publication(): BelongsTo
    {
        return $this->belongsTo(Publication::class);
    }

    /**
     * El usuario que fue mencionado.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}