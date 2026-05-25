<?php

namespace App\Http\Controllers;

use App\Models\Mototaxi;
use App\Models\Propietario;
use App\Services\MototaxiService;
use Illuminate\Http\Request;

class MototaxiController extends Controller
{
    protected $mototaxiService;

    public function __construct(MototaxiService $mototaxiService)
    {
        $this->mototaxiService = $mototaxiService;
    }

    public function index()
    {
        // Traemos mototaxis con la relación de su propietario cargada de golpe (Eager Loading)
        $mototaxis = Mototaxi::with('propietario:id,name,apellido')->paginate(50);
        
        // Traemos los propietarios para mapearlos en el select del modal
        $propietarios = Propietario::select('id', 'name', 'apellido', 'cedula')->get();
        

        return inertia('Admin/Mototaxis', [
            'mototaxis'    => $mototaxis,
            'propietarios' => $propietarios
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'propietario_id' => 'required|exists:propietarios,id',
            'placa'          => 'required|string|unique:mototaxis,placa|max:10',
            'modelo'         => 'required|string|max:255',
            'numero_unidad'  => 'required|string|unique:mototaxis,numero_unidad|max:20',
            'anio'           => 'nullable|integer|min:1990|max:'.(date('Y') + 1),
            'estado'         => 'required|in:activo,inactivo',
            'observaciones'  => 'nullable|string|max:1000',
        ]);

        $this->mototaxiService->crear($request->all());

        return redirect()
            ->route('mototaxis.index')
            ->with('success', 'Mototaxi registrada correctamente.');
    }
    public function update(Request $request, Mototaxi $mototaxi)
{
    $validated = $request->validate([
        'propietario_id' => 'required|exists:propietarios,id',
        'placa'          => 'required|string|unique:mototaxis,placa,'.$mototaxi->id,
        'modelo'         => 'required|string',
        'numero_unidad'  => 'required|string',
        'anio'           => 'required|string',
        'estado'         => 'required|in:activo,inactivo',
        'observaciones'  => 'nullable|string',
    ]);



    $this->mototaxiService->actualizar($mototaxi, $validated);

    return back()->with('info', 'Mototaxi actualizada correctamente');

    return back(); // Inertia interceptará esto y refrescará los datos sin recargar la página.
}
}