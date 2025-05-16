<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    protected $fillable = ['user_id'];

    public function publication()
    {
        return $this->belongsTo(\App\Models\Publication::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
