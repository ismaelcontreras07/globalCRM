<?php
// backend/api/sales/monthlySummary.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

try {
  // 1) Clientes: total ventas y suma de net_profit
  $sqlC = "
    SELECT
      DATE_FORMAT(issue_date, '%Y-%m') AS month,
      SUM(total) AS total_clients,
      SUM(net_profit) AS total_net_profit
    FROM customer_invoices
    GROUP BY month
    ORDER BY month
  ";
  $rowsC = $pdo->query($sqlC)->fetchAll(PDO::FETCH_ASSOC);
  $clients       = [];
  $netProfits    = [];
  foreach ($rowsC as $r) {
    $clients[$r['month']]    = round($r['total_clients'], 2);
    $netProfits[$r['month']] = round($r['total_net_profit'], 2);
  }

  // 2) Proveedores por mes
  $sqlP = "
    SELECT DATE_FORMAT(issue_date, '%Y-%m') AS month,
           SUM(total) AS total_providers
    FROM provider_invoices
    GROUP BY month
    ORDER BY month
  ";
  $providers = $pdo->query($sqlP)->fetchAll(PDO::FETCH_KEY_PAIR);

  // 3) Comisiones por mes (según fecha de emisión de la factura de cliente)
  $sqlComm = "
    SELECT DATE_FORMAT(ci.issue_date, '%Y-%m') AS month,
           SUM(c.amount) AS total_commissions
    FROM commissions c
    JOIN customer_invoices ci
      ON c.invoice_id = ci.id
    GROUP BY month
    ORDER BY month
  ";
  $commissions = $pdo->query($sqlComm)->fetchAll(PDO::FETCH_KEY_PAIR);

  // 4) Unión de todos los meses
  $months = array_unique(array_merge(
    array_keys($clients),
    array_keys($providers),
    array_keys($commissions)
  ));
  sort($months);

  // 5) Armado del array final con cálculo de "profit_after_comm"
  $data = [];
  foreach ($months as $m) {
    $totCli  = $clients[$m]     ?? 0;
    $totProv = $providers[$m]   ?? 0;
    $totComm = $commissions[$m] ?? 0;
    $totNet  = $netProfits[$m]  ?? 0;
    $data[] = [
      'month'              => $m,
      'clients'            => $totCli,
      'providers'          => $totProv,
      'commissions'        => $totComm,
      'net_profit'         => $totNet,
      'profit_after_comm'  => round($totNet - $totComm, 2),
    ];
  }

  echo json_encode(['success' => true, 'data' => $data]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
