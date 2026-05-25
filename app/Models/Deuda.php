<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Deuda extends Model
{
    protected $fillable = [
        'mototaxi_id',
        'monto',
        'fecha_vencimiento',
        'fecha_pago',
        'descripcion',
        'mes',
        'anio',
        'estado',
        'observacion',
    ];

    public function mototaxi(): BelongsTo
    {
        return $this->belongsTo(Mototaxi::class);
    }
    
    
}
