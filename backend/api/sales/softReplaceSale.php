<?php
// backend/api/sales/softReplaceSale.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$id     = $input['sale_id']             ?? null;
$reason = trim($input['replace_reason'])?? '';
$inv    = trim($input['replace_invoice']) ?? '';

if (!$id || !$reason || !$inv) {
  http_response_code(400);
  exit(json_encode(['success'=>false,'message'=>'Faltan datos obligatorios']));
}

try {
  $stmt = $pdo->prepare("
    UPDATE sales
       SET status = 'reemplazada',
           replace_reason      = :reason,
           replace_invoice     = :inv
     WHERE id = :id
  ");
  $stmt->execute([
    ':reason' => $reason,
    ':inv'    => $inv,
    ':id'     => $id
  ]);

  echo json_encode(['success'=>true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error al reemplazar: '.$e->getMessage()]);
}
