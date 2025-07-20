<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProducerMedia extends Model
{
    use HasFactory;
    
    protected $table = 'producer_media';
    
    protected $fillable = [
        'producer_id', 'type', 'file_path', 'title', 'description', 'order'
    ];
    
    protected $casts = [
        'order' => 'integer',
    ];
    
    public function producer()
    {
        return $this->belongsTo(Producer::class);
    }
}
