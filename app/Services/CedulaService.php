<?php

namespace App\Services;

class CedulaService
{
    /**
     * Valida documentos de identidad de Ecuador (Cédulas y RUCs base de 10 dígitos)
     * Soporta Personas Naturales, Sociedades Privadas y Empresas Públicas.
     */
    public static function validarCedula(string $cedula): bool
    {
        // 1. Debe tener exactamente 10 dígitos numéricos
        if (!preg_match('/^\d{10}$/', $cedula)) {
            return false;
        }

        // 2. Validar código de provincia (primeros dos dígitos)
        $provincia = intval(substr($cedula, 0, 2));
        if (($provincia < 1 || $provincia > 24) && $provincia !== 30) {
            return false;
        }

        // 3. Obtener el tercer dígito para saber la naturaleza del documento
        $tercerDigito = intval($cedula[2]);

        // =====================================================================
        // CASO A: PERSONA JURÍDICA / EMPRESA PRIVADA (Tercer dígito = 9)
        // =====================================================================
        if ($tercerDigito === 9) {
            $coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
            $digitoVerificador = intval($cedula[9]);
            $suma = 0;

            for ($i = 0; $i < 9; $i++) {
                $suma += intval($cedula[$i]) * $coeficientes[$i];
            }

            $residuo = $suma % 11;
            $resultado = ($residuo === 0) ? 0 : (11 - $residuo);

            return $resultado === $digitoVerificador;
        }

        // =====================================================================
        // CASO B: EMPRESA PÚBLICA / ESTATAL (Tercer dígito = 6)
        // =====================================================================
        if ($tercerDigito === 6) {
            $coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
            $digitoVerificador = intval($cedula[8]); // El verificador está en la posición 9
            $suma = 0;

            for ($i = 0; $i < 8; $i++) {
                $suma += intval($cedula[$i]) * $coeficientes[$i];
            }

            $residuo = $suma % 11;
            $resultado = ($residuo === 0) ? 0 : (11 - $residuo);

            return $resultado === $digitoVerificador;
        }

        // =====================================================================
        // CASO C: PERSONA NATURAL (Tercer dígito menor a 6: 0, 1, 2, 3, 4, 5)
        // =====================================================================
        if ($tercerDigito < 6) {
            $coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
            $digitoVerificador = intval($cedula[9]);
            $suma = 0;

            for ($i = 0; $i < 9; $i++) {
                $valor = intval($cedula[$i]) * $coeficientes[$i];
                if ($valor >= 10) {
                    $valor -= 9;
                }
                $suma += $valor;
            }

            $total = (($suma - ($suma % 10)) + 10);
            if ($suma % 10 === 0) {
                $total = $suma;
            }

            $resultado = $total - $suma;

            return $resultado === $digitoVerificador;
        }

        // Si llega acá y no es ninguna de las anteriores opciones
        return false;
    }
}