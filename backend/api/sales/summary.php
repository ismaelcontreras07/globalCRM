<?php
// backend/api/sales/summary.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

try {
  // 1) Deuda (providers)
  $sqlDeuda = "
    SELECT
      status,
      SUM(total) AS amount
    FROM provider_invoices
    GROUP BY status
  ";
  $rows = $pdo->query($sqlDeuda)->fetchAll(PDO::FETCH_ASSOC);
  $deuda = ['pendiente'=>0,'vencido'=>0,'pagado'=>0];
  foreach ($rows as $r) {
    $deuda[$r['status']] = (float)$r['amount'];
  }

  // 2) Cobranza (customers)
  $sqlCob = "
    SELECT
      status,
      SUM(total) AS amount
    FROM customer_invoices
    GROUP BY status
  ";
  $rows = $pdo->query($sqlCob)->fetchAll(PDO::FETCH_ASSOC);
  $cobranza = ['pendiente'=>0,'vencido'=>0,'pagado'=>0];
  foreach ($rows as $r) {
    $cobranza[$r['status']] = (float)$r['amount'];
  }

  // 3) Comisiones
  $sqlCom = "
    SELECT
      status,
      SUM(amount) AS amount
    FROM commissions
    GROUP BY status
  ";
  $rows = $pdo->query($sqlCom)->fetchAll(PDO::FETCH_ASSOC);
  $comisiones = ['pendiente'=>0,'vencido'=>0,'pagado'=>0];
  foreach ($rows as $r) {
    $comisiones[$r['status']] = (float)$r['amount'];
  }

  echo json_encode([
    'success'    => true,
    'deuda'      => $deuda,
    'cobranza'   => $cobranza,
    'comisiones' => $comisiones
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Error en summary: ' . $e->getMessage()
  ]);
}
