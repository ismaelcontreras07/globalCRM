<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['id']) || empty($data['status'])) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Faltan parámetros']);
  exit;
}

try {
  $sql = "UPDATE commissions SET status = :st WHERE id = :id";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':st'=>$data['status'], ':id'=>$data['id']]);
  echo json_encode(['success'=>true]);
} catch(Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
