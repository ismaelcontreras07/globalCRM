<?php
// backend/api/sales/createComplement.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');
$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['invoice_number']) || empty($data['issue_date'])) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Faltan campos obligatorios']);
  exit;
}
try {
  $sql = "INSERT INTO payment_complements (invoice_number, issue_date, description)
          VALUES (:inv,:date,:desc)";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':inv'  => $data['invoice_number'],
    ':date' => $data['issue_date'],
    ':desc' => $data['description'] ?? ''
  ]);
  echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]);
} catch(Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
