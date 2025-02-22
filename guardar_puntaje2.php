<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos
    if (empty($data['nombre']) || !isset($data['puntaje'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        exit;
    }
    
    $nombre = substr(trim($data['nombre']), 0, 30); // Limitar longitud
    $puntaje = (int)$data['puntaje'];
    
    // Leer y procesar puntajes
    $archivo = 'puntajes2.txt';
    $puntajes = file_exists($archivo) ? file($archivo, FILE_IGNORE_NEW_LINES) : [];
    
    // Añadir nuevo
    $puntajes[] = "Nombre: $nombre, Puntaje: $puntaje";
    
    // Ordenar
    usort($puntajes, function($a, $b) {
        preg_match('/Puntaje: (\d+)/', $a, $matchesA);
        preg_match('/Puntaje: (\d+)/', $b, $matchesB);
        return ((int)$matchesB[1] ?? 0) - ((int)$matchesA[1] ?? 0);
    });
    
    // Limitar a 100
    $puntajes = array_slice($puntajes, 0, 100);
    
    // Guardar
    file_put_contents($archivo, implode(PHP_EOL, $puntajes));
    
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
?>