<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');
$id = (int)($_GET['id'] ?? 0);
if (!$id) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'id inválido']); exit; }
try {
  $stmt = $pdo->prepare("DELETE FROM products WHERE id=:id");
  $stmt->execute([':id'=>$id]);
  echo json_encode(['success'=>true]);
} catch(Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
