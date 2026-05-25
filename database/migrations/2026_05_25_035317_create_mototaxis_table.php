<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mototaxis', function (Blueprint $table) {
            $table->id();
            $table
                ->foreignId('propietario_id')
                ->constrained()
                ->onDelete('cascade');
            $table->string('placa')->unique();
            $table->string('modelo');
            $table->string('numero_unidad')->unique();
            $table->year('anio')->nullable();
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            // Observaciones
            $table->text('observaciones')->nullable();

            $table->timestamps();
           
           
            
            $table->index('modelo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mototaxis');
    }
};
