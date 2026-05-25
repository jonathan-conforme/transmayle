<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PropietarioController;
use App\Http\Controllers\MototaxiController;
use App\Http\Controllers\DeudaController;
use App\Http\Controllers\WelcomeController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


// Si usas un controlador con métodos estándar de Resource:
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/propietarios', [PropietarioController::class, 'index'])->name('propietarios.index');
    Route::get('/propietarios/create', [PropietarioController::class, 'create'])->name('propietarios.create');
    Route::post('/propietarios', [PropietarioController::class, 'store'])->name('propietarios.store');
    Route::put('/propietarios/{propietario}', [PropietarioController::class, 'update'])->name('propietarios.update');
    Route::delete('/propietarios/{propietario}', [PropietarioController::class, 'destroy'])->name('propietarios.destroy');

    Route::get('/mototaxis', [MototaxiController::class, 'index'])->name('mototaxis.index');
    Route::post('/mototaxis', [MototaxiController::class, 'store'])->name('mototaxis.store');
    Route::put('/mototaxis/{mototaxi}', [MototaxiController::class, 'update'])->name('mototaxis.update');
    Route::delete('/mototaxis/{mototaxi}', [MototaxiController::class, 'destroy'])->name('mototaxis.destroy');

    Route::get('/deudas', [DeudaController::class, 'index'])->name('deudas.index');
    Route::post('/deudas', [DeudaController::class, 'store'])->name('deudas.store');
   
    Route::get('/consulta-publica', [WelcomeController::class, 'consultarDeudaPublica'])->name('consulta.publica');
    });

require __DIR__.'/auth.php';
