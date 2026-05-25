<?php

namespace App\Services;

use App\Models\User;
use App\Models\Propietario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PropietarioService
{
    public function crear(array $data)
    {
        return DB::transaction(function () use ($data) {


            // 2. Crear el registro del propietario
            $propietario = Propietario::create([
                
                'name'      => $data['name'],
                'apellido'  => $data['apellido'],
                'email'     => $data['email'],
                'cedula'    => $data['cedula'],
                'telefono'  => $data['telefono'],
                'direccion' => $data['direccion'] ?? null,
            ]);

            return $propietario;
            
        }); // Fin de la transacción

    }
    public function actualizar(Propietario $propietario, array $data): bool
    {
        if (!Propietario::where('id', $propietario->id)->exists()) {
            throw new \Exception('Propietario no encontrado.');
        }
        return $propietario->update([
            'name'      => $data['name']      ?? $propietario->name,
            'apellido'  => $data['apellido']  ?? $propietario->apellido,
            'email'     => $data['email']     ?? $propietario->email,
            'cedula'    => $data['cedula']    ?? $propietario->cedula,
            'telefono'  => $data['telefono']  ?? $propietario->telefono,
            'direccion' => $data['direccion'] ?? $propietario->direccion,
        ]);
    }
}