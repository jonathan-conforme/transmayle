<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mototaxi extends Model
{
  protected $fillable = [
        'propietario_id',
        'placa',
        'modelo',
        'numero_unidad',
        'anio',
        'estado',
        'observaciones'
    ];

    /**
     * Obtener el propietario de la mototaxi.
     */
    public function propietario(): BelongsTo
    {
        return $this->belongsTo(Propietario::class, 'propietario_id');
    }
    public function deudas(): HasMany
    {
        return $this->hasMany(Deuda::class, 'mototaxi_id');
    }
}
