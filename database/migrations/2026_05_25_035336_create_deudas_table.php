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
        Schema::create('deudas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mototaxi_id')->constrained()->onDelete('cascade');
            $table->decimal('monto', 10, 2);
            $table->date('fecha_vencimiento');
            // Fecha real de pago
            $table->date('fecha_pago')->nullable();
            $table->string('descripcion')->nullable();

            $table->string('mes');
            $table->year('anio');
            // Estado
            $table->enum('estado', [
                'pendiente',
                'pagado',
                'vencido',
            ])->default('pendiente');
            // Observaciones
            $table->text('observacion')->nullable();
            $table->timestamps();

            // Índices
            $table->index('estado');
            $table->index('fecha_vencimiento');
            $table->index('mes');
            $table->index('anio');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deudas');
    }
};
