<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Following extends Model
{
    public $incrementing = false;
    
    protected $primaryKey = ['follower_id', 'followed_id'];
    protected $fillable = ['follower_id', 'followed_id'];
    protected $table = 'followings';

    public function follower() { return $this->belongsTo(User::class, 'follower_id'); }
}