<?php

namespace App\Http\Controllers;

use App\Models\Deuda;
use App\Models\Mototaxi;
use App\Services\DeudaService;
use Illuminate\Http\Request;

class DeudaController extends Controller
{
    protected $deudaService;

    public function __construct(DeudaService $deudaService)
    {
        $this->deudaService = $deudaService;
    }
public function index()
{
    // Buscamos las mototaxis que tengan deudas pendientes o vencidas
    $unidadesConDeuda = Mototaxi::with([
        'propietario:id,name,apellido,cedula',
        'deudas' => function($query) {
            $query->whereIn('estado', ['pendiente', 'vencido'])->orderBy('anio', 'asc')->orderBy('mes', 'asc');
        }
    ])
    ->whereHas('deudas', function($query) {
        $query->whereIn('estado', ['pendiente', 'vencido']);
    })
    ->get()
    ->map(function($moto) {
        // Calculamos los totales aquí en el servidor para que el Front vaya súper rápido
        $totalMonto = $moto->deudas->sum('monto');
        $mesesLista = $moto->deudas->map(function($d) {
            return $d->mes . ' ' . $d->anio;
        })->toArray();

        return [
            'id' => $moto->id,
            'numero_unidad' => $moto->numero_unidad,
            'placa' => $moto->placa,
            'modelo' => $moto->modelo,
            'propietario' => $moto->propietario ? [
                'nombre_completo' => $moto->propietario->apellido . ' ' . $moto->propietario->name,
                'cedula' => $moto->propietario->cedula
            ] : null,
            'cantidad_meses' => $moto->deudas->count(),
            'meses_detallados' => $mesesLista,
            'total_deuda' => number_format($totalMonto, 2, '.', '')
        ];
    });

    // Mantenemos la lista limpia de mototaxis para el formulario de asignación rápida
    $mototaxisDisponibles = Mototaxi::with('propietario:id,name,apellido,cedula')
        ->where('estado', 'activo')
        ->get()
        ->map(function($moto) {
            return [
                'id' => $moto->id,
                'numero_unidad' => $moto->numero_unidad,
                'placa' => $moto->placa,
                'propietario' => $moto->propietario ? [
                    'name' => $moto->propietario->name,
                    'apellido' => $moto->propietario->apellido,
                    'nombre_completo' => $moto->propietario->apellido . ' ' . $moto->propietario->name,
                    'cedula' => $moto->propietario->cedula
                ] : null
            ];
        });

    return inertia('Admin/Deudas', [
        'unidadesConDeuda' => $unidadesConDeuda,
        'mototaxis' => $mototaxisDisponibles, // Ahora este array va completito con dueño y cédula
    ]);
}

    public function store(Request $request)
    {
        $request->validate([
            'mototaxi_id'       => 'required|exists:mototaxis,id',
            'monto'             => 'required|numeric|min:0.01',
            'fecha_vencimiento' => 'required|date',
            'fecha_pago'        => 'nullable|date',
            'descripcion'       => 'nullable|string|max:255',
            'mes'               => 'required|string|max:20',
            'anio'              => 'required|integer|min:2020|max:'.(date('Y') + 5),
            'estado'            => 'required|in:pendiente,pagado,vencido',
            'observacion'       => 'nullable|string|max:1000',
        ]);

        $this->deudaService->crear($request->all());

        return redirect()
            ->route('deudas.index')
            ->with('success', 'Deuda/Obligación registrada correctamente.');
    }
}