<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');
try {
  $sql = "SELECT id, name FROM accounts WHERE role='provider' AND status='activo' ORDER BY name";
  $providers = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(['success'=>true,'providers'=>$providers]);
} catch(Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
