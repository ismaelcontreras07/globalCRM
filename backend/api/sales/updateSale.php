<?php
// backend/api/sales/update.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
$id   = $data['sale']['id'] ?? null;
if (!$id) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Fal­ta sale.id']);
  exit;
}

try {
  $pdo->beginTransaction();

  // 1) Actualizar tabla sales
  $stmt = $pdo->prepare("
    UPDATE sales
    SET sale_date = :sale_date,
        project   = :project,
        description = :description
    WHERE id = :id
  ");
  $stmt->execute([
    ':sale_date'  => $data['sale']['sale_date'],
    ':project'    => $data['sale']['project'],
    ':description'=> $data['sale']['description'] ?? '',
    ':id'         => $id
  ]);

  // 2) Actualizar factura cliente (borramos y reinsertamos para simplificar)
  $pdo->prepare("DELETE FROM customer_invoices WHERE sale_id = ?")
      ->execute([$id]);
  $ci = $data['customerInvoice'];
  $pdo->prepare("
    INSERT INTO customer_invoices
      (sale_id, invoice_number, account_id, business_name,
       issue_date, due_date, subtotal, total, status,
       net_profit, profit_pct)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ")->execute([
    $id,
    $ci['invoice_number'], $ci['account_id'], $ci['business_name'],
    $ci['issue_date'], $ci['due_date'], $ci['subtotal'], $ci['total'],
    $ci['status'], $ci['net_profit'], $ci['profit_pct']
  ]);

  // 3) Proveedores: eliminar y reinsertar
  $pdo->prepare("DELETE FROM provider_invoices WHERE sale_id = ?")
      ->execute([$id]);
  $piStmt = $pdo->prepare("
    INSERT INTO provider_invoices
      (sale_id, account_id, business_name, invoice_number,
       issue_date, due_date, subtotal, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ");
  foreach ($data['providerInvoices'] as $inv) {
    $piStmt->execute([
      $id,
      $inv['account_id'], $inv['business_name'], $inv['invoice_number'],
      $inv['issue_date'], $inv['due_date'], $inv['subtotal'], $inv['status']
    ]);
  }

  // 4) Comisiones: eliminar y reinsertar
  $pdo->prepare("DELETE FROM commissions WHERE sale_id = ?")
      ->execute([$id]);
  $cStmt = $pdo->prepare("
    INSERT INTO commissions
      (sale_id, user_id, pct, amount)
    VALUES (?, ?, ?, ?)
  ");
  foreach ($data['commissions'] as $com) {
    $cStmt->execute([
      $id,
      $com['user_id'], $com['pct'], $com['amount']
    ]);
  }

  $pdo->commit();
  echo json_encode(['success'=>true]);

} catch (Exception $e) {
  $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error: '.$e->getMessage()]);
}
