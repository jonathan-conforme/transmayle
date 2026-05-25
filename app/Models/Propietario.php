<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Propietario extends Model
{
    protected $fillable = [
    
        'name',
        'apellido',
        'email',
        'cedula',
        'telefono',
        'direccion',
    ];
}
