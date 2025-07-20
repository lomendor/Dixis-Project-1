<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProducerQuestion extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'producer_id', 'user_id', 'question', 'answer', 'is_public', 'answered_at'
    ];
    
    protected $casts = [
        'is_public' => 'boolean',
        'answered_at' => 'datetime',
    ];
    
    public function producer()
    {
        return $this->belongsTo(Producer::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }
    
    public function scopeAnswered($query)
    {
        return $query->whereNotNull('answer');
    }
    
    public function scopeUnanswered($query)
    {
        return $query->whereNull('answer');
    }
}
