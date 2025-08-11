<?php
// backend/api/razones_sociales/listRazonSociales.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$account_id = isset($_GET['account_id']) ? (int)$_GET['account_id'] : 0;
if (!$account_id) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Falta account_id']);
  exit;
}

try {
  $stmt = $pdo->prepare("
    SELECT * 
    FROM razones_sociales 
    WHERE account_id = ? 
    ORDER BY created_at DESC
  ");
  $stmt->execute([$account_id]);
  $rs = $stmt->fetchAll();
  echo json_encode(['success'=>true,'razones'=>$rs]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error al listar razones sociales']);
}
