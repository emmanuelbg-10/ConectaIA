<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * The following model.
 * 
 * This model defines the table in which two user IDs are stored,
 * the follower and the followed, alongside the specific relationship
 * with the User model.
 */
class Following extends Model
{
    public $incrementing = false;
    
    /**
     * @var array<string>
     */
    protected $primaryKey = ['follower_id', 'followed_id'];
    protected $fillable = ['follower_id', 'followed_id'];
    protected $table = 'followings';

    /**
     * The user that's following another one. One-to-many relationship
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     * Returns a one-to-many relationship instance.
     */
    public function follower() { return $this->belongsTo(User::class, 'follower_id'); }
}