<?php
require_once __DIR__.'/../../config.php';
header('Content-Type: application/json; charset=utf-8');
$in = json_decode(file_get_contents('php://input'), true);
if (!isset($in['id'], $in['status'])) {
  http_response_code(400);
  exit(json_encode(['success'=>false,'message'=>'Faltan parámetros']));
}
$stmt = $pdo->prepare("
  UPDATE customer_invoices
     SET status = :st
   WHERE id = :id
");
$ok = $stmt->execute([':st'=>$in['status'], ':id'=>$in['id']]);
echo json_encode(['success'=>$ok]);
