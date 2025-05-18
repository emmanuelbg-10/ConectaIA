<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Hashtag extends Model
{
    use HasFactory;

    protected $fillable = ['hashtag_text'];

    /**
     * Publicaciones que usan este hashtag.
     */
    public function publications(): BelongsToMany
    {
         // Tabla pivote 'hashtag_publications'
        return $this->belongsToMany(Publication::class, 'hashtag_publications');
    }
    
    public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
}