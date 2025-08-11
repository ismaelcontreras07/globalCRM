<?php
// backend/api/sales/createSale.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$payload = json_decode(file_get_contents('php://input'), true);

try {
  $pdo->beginTransaction();

  // 1) Crear factura de cliente
  $ci = $payload['customerInvoice'];
  $stmt1 = $pdo->prepare("
    INSERT INTO customer_invoices
      (invoice_number, account_id, business_name,
       issue_date, due_date, project, description,
       subtotal, total, status, net_profit, profit_pct)
    VALUES
      (:inv_num, :acc_id, :bus_name,
       :iss_date, :due_date, :proj, :descr,
       :subtotal, :total, :status, :net_profit, :profit_pct)
  ");
  $stmt1->execute([
    ':inv_num'    => $ci['invoice_number'],
    ':acc_id'     => $ci['account_id'],
    ':bus_name'   => $ci['business_name'],
    ':iss_date'   => $ci['issue_date'],
    ':due_date'   => $ci['due_date'],
    ':proj'       => $payload['sale']['project'],
    ':descr'      => $payload['sale']['description'] ?? null,
    ':subtotal'   => $ci['subtotal'],
    ':total'      => $ci['total'],
    ':status'     => $ci['status'],
    ':net_profit' => $ci['net_profit'],
    ':profit_pct' => $ci['profit_pct']
  ]);
  $customerInvoiceId = $pdo->lastInsertId();

  // 2) Crear venta
  $sale = $payload['sale'];
  $stmt2 = $pdo->prepare("
    INSERT INTO sales
      (customer_invoice_id, sale_date, project, description)
    VALUES
      (:cust_inv, :sale_date, :project, :description)
  ");
  $stmt2->execute([
    ':cust_inv'    => $customerInvoiceId,
    ':sale_date'   => $sale['sale_date'],
    ':project'     => $sale['project'],
    ':description' => $sale['description'] ?? ''
  ]);
  $saleId = $pdo->lastInsertId();

  // 3) Crear facturas de proveedores
  $stmt3 = $pdo->prepare("
    INSERT INTO provider_invoices
      (sale_id, account_id, business_name, invoice_number,
       issue_date, due_date, subtotal, total, status)
    VALUES
      (:sale_id, :acc_id, :bus_name, :inv_num,
       :iss_date, :due_date, :subtotal, :total, :status)
  ");
  foreach ($payload['providerInvoices'] as $inv) {
    // si vienen varias razones sociales, las juntamos con coma
    $busName = '';
    if (!empty($inv['business_name'])) {
      $busName = is_array($inv['business_name'])
        ? implode(', ', $inv['business_name'])
        : $inv['business_name'];
    }

    $stmt3->execute([
      ':sale_id'   => $saleId,
      ':acc_id'    => $inv['account_id'],
      ':bus_name'  => $busName,
      ':inv_num'   => $inv['invoice_number'],
      ':iss_date'  => $inv['issue_date'],
      ':due_date'  => $inv['due_date'],
      ':subtotal'  => $inv['subtotal'],
      ':total'     => round($inv['subtotal'] * 1.16, 2),
      ':status'    => $inv['status']
    ]);
  }

  // 4) Crear comisiones
  $stmt4 = $pdo->prepare("
    INSERT INTO commissions
      (sale_id, user_id, pct, amount, invoice_id)
    VALUES
      (:sale_id, :user_id, :pct, :amount, :invoice_id)
  ");
  foreach ($payload['commissions'] as $c) {
    $stmt4->execute([
      ':sale_id'    => $saleId,
      ':user_id'    => $c['user_id'],
      ':pct'        => $c['pct'],
      ':amount'     => $c['amount'],
      ':invoice_id' => $customerInvoiceId
    ]);
  }

  $pdo->commit();

  echo json_encode([
    'success' => true,
    'sale_id' => $saleId
  ]);

} catch (Exception $e) {
  $pdo->rollBack();
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Error al crear venta: ' . $e->getMessage()
  ]);
}
