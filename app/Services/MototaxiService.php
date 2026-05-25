<?php

namespace App\Services;

use App\Models\Mototaxi;
use Illuminate\Support\Facades\DB;

class MototaxiService
{
    /**
     * Registrar una nueva mototaxi en el sistema.
     */
    public function crear(array $data): Mototaxi
    {
         return DB::transaction(function () use ($data) {
        return Mototaxi::create([
            'propietario_id' => $data['propietario_id'],
            'placa'          => strtoupper($data['placa']), // Placas siempre en mayúsculas
            'modelo'         => $data['modelo'],
            'numero_unidad'  => $data['numero_unidad'],
            'anio'           => $data['anio'] ?? null,
            'estado'         => $data['estado'] ?? 'activo',
            'observaciones'  => $data['observaciones'] ?? null,
        ]);
  });
  }


    public function actualizar(Mototaxi $mototaxi, array $data): bool
    {
        // Si viene la placa, nos aseguramos de que guarde en mayúsculas
        if (isset($data['placa'])) {
            $data['placa'] = strtoupper($data['placa']);
        }

        return $mototaxi->update([
            'propietario_id' => $data['propietario_id'] ?? $mototaxi->propietario_id,
            'placa'          => $data['placa']          ?? $mototaxi->placa,
            'modelo'         => $data['modelo']         ?? $mototaxi->modelo,
            'numero_unidad'  => $data['numero_unidad']  ?? $mototaxi->numero_unidad,
            'anio'           => $data['anio']           ?? $mototaxi->anio,
            'estado'         => $data['estado']         ?? $mototaxi->estado,
            'observaciones'  => $data['observaciones']  ?? $mototaxi->observaciones,
        ]);
    }

}
