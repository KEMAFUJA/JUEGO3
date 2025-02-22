<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Leer los puntajes existentes desde el archivo
$archivo = 'puntajes2.txt';
$puntajes = file_exists($archivo) ? file($archivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];

// Procesar los puntajes para extraer nombre y puntaje
$puntajesProcesados = [];
foreach ($puntajes as $linea) {
    if (preg_match('/Nombre: (.+), Puntaje: (\d+)/', $linea, $matches)) {
        $puntajesProcesados[] = [
            'nombre' => $matches[1],
            'puntaje' => $matches[2]
        ];
    }
}

// Ordenar los puntajes de mayor a menor
usort($puntajesProcesados, function($a, $b) {
    return $b['puntaje'] - $a['puntaje'];
});

// Seleccionar los 10 mejores puntajes
$top10 = array_slice($puntajesProcesados, 0, 10);

// Devolver los puntajes en formato JSON
echo json_encode($top10);
?>