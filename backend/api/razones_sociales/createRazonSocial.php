<?php
// backend/api/razones_sociales/createRazonSocial.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD']!=='POST') {
  http_response_code(405);
  echo json_encode(['success'=>false,'message'=>'Método no permitido']);
  exit;
}

$account_id = isset($_POST['account_id']) ? (int)$_POST['account_id'] : 0;
$nombre     = trim($_POST['nombre'] ?? '');
$tipo       = in_array($_POST['tipo'] ?? '', ['principal','secundaria'])
                ? $_POST['tipo'] : 'principal';

if (!$account_id || !$nombre) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Datos obligatorios faltantes']);
  exit;
}

try {
  $stmt = $pdo->prepare("
    INSERT INTO razones_sociales
      (account_id,nombre,tipo)
    VALUES (?, ?, ?)
  ");
  $stmt->execute([$account_id,$nombre,$tipo]);
  echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error al crear']);
}
