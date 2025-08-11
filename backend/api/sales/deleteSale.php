<?php
// backend/api/sales/deleteSale.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['sale_id'])) {
  http_response_code(400);
  exit(json_encode(['success'=>false,'message'=>'Falta sale_id']));
}

$saleId = (int)$data['sale_id'];

try {
  $pdo->beginTransaction();

  // 1) Recuperar el customer_invoice_id
  $stmt0 = $pdo->prepare("SELECT customer_invoice_id FROM sales WHERE id = :sid");
  $stmt0->execute([':sid'=>$saleId]);
  $ci = $stmt0->fetchColumn();
  if (!$ci) {
    throw new Exception("Venta no encontrada");
  }

  // 2) Borrar la venta (cascade elimina provider_invoices y commissions)
  $stmt1 = $pdo->prepare("DELETE FROM sales WHERE id = :sid");
  $stmt1->execute([':sid'=>$saleId]);

  // 3) Borrar la factura de cliente
  $stmt2 = $pdo->prepare("DELETE FROM customer_invoices WHERE id = :cid");
  $stmt2->execute([':cid'=>$ci]);

  $pdo->commit();
  echo json_encode(['success'=>true]);
} catch (Exception $e) {
  $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error al borrar: '.$e->getMessage()]);
}
