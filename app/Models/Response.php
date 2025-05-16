<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Response extends Model
{
    protected $fillable = ['publication_id', 'user_id', 'parent_id', 'text'];

    public function publication()
    {
        return $this->belongsTo(Publication::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(Response::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Response::class, 'parent_id');
    }
}
