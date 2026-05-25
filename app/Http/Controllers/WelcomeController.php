<?php
namespace App\Http\Controllers;

use App\Models\Mototaxi;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Deuda;
use App\Models\Propietario;
 
class WelcomeController extends Controller
{

public function consultarDeudaPublica(Request $request)
{
    $search = $request->query('search');

    if (!$search) {
        return response()->json(['error' => 'Por favor, ingresa un dato.'], 400);
    }

    // Buscamos la mototaxi por placa o por la cédula del propietario
    $resultado = Mototaxi::with([
        'propietario:id,name,apellido,cedula',
        'deudas' => function($query) {
            $query->whereIn('estado', ['pendiente', 'vencido'])->orderBy('anio', 'asc')->orderBy('mes', 'asc');
        }
    ])
    ->where('placa', 'like', "%{$search}%")
    ->orWhereHas('propietario', function($query) use ($search) {
        $query->where('cedula', $search);
    })
    ->first();

    if (!$resultado) {
        return response()->json(['status' => 'not_found', 'message' => 'No se encontró ninguna unidad registrada con esos datos.']);
    }

    // Estructuramos la respuesta limpia
    return response()->json([
        'status' => 'success',
        'unidad' => $resultado->numero_unidad,
        'placa' => $resultado->placa,
        'propietario' => $resultado->propietario ? $resultado->propietario->apellido . ' ' . $resultado->propietario->name : 'No asignado',
        'cantidad_meses' => $resultado->deudas->count(),
        'total_deuda' => number_format($resultado->deudas->sum('monto'), 2, '.', ''),
        'meses' => $resultado->deudas->map(fn($d) => "{$d->mes} {$d->anio} ($" . number_format($d->monto, 2) . ")")
    ]);
}
}