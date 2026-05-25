<?php

namespace App\Services;

use App\Models\Deuda;

class DeudaService
{
    /**
     * Registrar una nueva deuda en el sistema.
     */
    public function crear(array $data): Deuda
    {
        return Deuda::create([
            'mototaxi_id'       => $data['mototaxi_id'],
            'monto'             => (float) $data['monto'],
            'fecha_vencimiento' => $data['fecha_vencimiento'],
            'fecha_pago'        => $data['fecha_pago'] ?? null,
            'descripcion'       => $data['descripcion'] ?? null,
            'mes'               => ucfirst(strtolower($data['mes'])), // Ej: "Enero"
            'anio'              => (int) $data['anio'],
            'estado'            => $data['estado'] ?? 'pendiente',
            'observacion'       => $data['observacion'] ?? null,
        ]);
    }
}