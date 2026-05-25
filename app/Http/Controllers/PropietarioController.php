<?php

namespace App\Http\Controllers;

use App\Models\Propietario;
use App\Services\CedulaService;
use App\Services\PropietarioService;
use Illuminate\Http\Request;

class PropietarioController extends Controller
{
    protected $propietarioService;

    public function __construct(PropietarioService $propietarioService)
    {
        $this->propietarioService = $propietarioService;
    }

    public function index()
    {
        $propietarios = Propietario::paginate(50);

        return inertia('Admin/Propietarios', [
            'propietarios' => $propietarios,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'email' => 'required|email|unique:propietarios,email|unique:users,email',
            'cedula' => 'required|unique:propietarios,cedula',
            'telefono' => 'required|string|max:20|unique:propietarios,telefono',
            'direccion' => 'nullable|string|max:255',
        ]);

        $cedulaService = new CedulaService;

        if (! $cedulaService->validarCedula($request->cedula)) {
            return back()->withErrors([
                'cedula' => 'La cédula ecuatoriana no es válida.',
            ]);
        }

        $this->propietarioService->crear($request->all());

        return back()->with('success', 'Propietario creado correctamente');
    }

    public function update(Request $request, Propietario $propietario)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'email' => 'required|email|unique:propietarios,email,'.$propietario->id.'|unique:users,email,'.$propietario->id,
            'cedula' => 'required|unique:propietarios,cedula,'.$propietario->id,
            'telefono' => 'required|string|max:20|unique:propietarios,telefono,'.$propietario->id,
            'direccion' => 'nullable|string|max:255',
        ]);

        $cedulaService = new CedulaService;

        if (! $cedulaService->validarCedula($request->cedula)) {
            return back()->withErrors([
                'cedula' => 'La cédula ecuatoriana no es válida.',
            ]);
        }

        $this->propietarioService->actualizar($propietario, $request->all());

        return back()->with('info', 'Propietario actualizado correctamente');
    }

    // 💡 NUEVO: Por si necesitas la acción de borrar desde la tabla
    public function destroy(Propietario $propietario)
    {
        $propietario->delete();

        return back()->with('error', 'Propietario eliminado correctamente');
    }
}
