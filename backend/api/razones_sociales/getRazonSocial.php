<?php
// backend/api/razones_sociales/getRazonSocial.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Falta id']);
  exit;
}

try {
  $stmt = $pdo->prepare("SELECT * FROM razones_sociales WHERE id = ? LIMIT 1");
  $stmt->execute([$id]);
  $rs = $stmt->fetch();
  if ($rs) {
    echo json_encode(['success'=>true,'razon'=>$rs]);
  } else {
    http_response_code(404);
    echo json_encode(['success'=>false,'message'=>'No encontrada']);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error en la consulta']);
}
