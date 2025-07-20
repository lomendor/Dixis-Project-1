<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProducerEnvironmentalStat extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'producer_id', 'distance', 'co2_saved', 'water_saved', 'packaging_saved'
    ];
    
    protected $casts = [
        'distance' => 'float',
        'co2_saved' => 'float',
        'water_saved' => 'float',
        'packaging_saved' => 'float'
    ];
    
    public function producer()
    {
        return $this->belongsTo(Producer::class);
    }
}
