<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$role          = $_GET['role']          ?? '';
$account_id    = (int)($_GET['account_id'] ?? 0);
$status        = $_GET['status']        ?? '';
$business_name = $_GET['business_name'] ?? '';

// Validación: sólo exigimos business_name cuando role='client'
if (
   !in_array($role, ['provider','client']) ||
   !$account_id ||
   !in_array($status, ['pendiente','vencido','pagado']) ||
   ($role === 'client' && $business_name === '')
) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Parámetros inválidos']);
  exit;
}

try {
  if ($role === 'provider') {
    // Ignoramos business_name: devolvemos TODAS las facturas de este proveedor
    $sql = "
      SELECT invoice_number, issue_date, due_date, total
      FROM provider_invoices
      WHERE account_id = :acc
        AND status     = :st
      ORDER BY issue_date DESC
    ";
    $params = [':acc'=>$account_id, ':st'=>$status];

  } else {
    // Sólo a clientes filtramos por business_name
    $sql = "
      SELECT invoice_number, issue_date, due_date, total
      FROM customer_invoices
      WHERE account_id    = :acc
        AND status        = :st
        AND business_name = :bn
      ORDER BY issue_date DESC
    ";
    $params = [':acc'=>$account_id, ':st'=>$status, ':bn'=>$business_name];
  }

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(['success'=>true,'invoices'=>$invoices]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
