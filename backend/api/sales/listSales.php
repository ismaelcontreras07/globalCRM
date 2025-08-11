<?php
// backend/api/sales/listSales.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

try {
  // 1) Traer todas las ventas con su factura de cliente
  $sql = "
    SELECT
      s.id                AS sale_id,
      s.sale_date,
      s.project,
      s.description       AS sale_description,

      ci.id               AS customer_invoice_id,
      ci.invoice_number   AS customer_invoice_number,
      ci.account_id       AS customer_account_id,
      ci.business_name    AS customer_business_name,
      ci.issue_date       AS customer_issue_date,
      ci.due_date         AS customer_due_date,
      ci.subtotal         AS customer_subtotal,
      ci.total            AS customer_total,
      ci.status           AS customer_status,
      ci.net_profit       AS customer_net_profit,
      ci.profit_pct       AS customer_profit_pct

    FROM sales AS s
    JOIN customer_invoices AS ci
      ON ci.id = s.customer_invoice_id
    ORDER BY s.sale_date DESC, s.id DESC
  ";
  $stmt = $pdo->query($sql);
  $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // 2) Para cada venta, cargar sus facturas de proveedor y comisiones
  $stmtProv = $pdo->prepare("
    SELECT
      pi.id,
      pi.account_id,
      GROUP_CONCAT(rs.nombre ORDER BY rs.tipo DESC SEPARATOR ', ') AS business_name,
      pi.invoice_number,
      pi.issue_date,
      pi.due_date,
      pi.subtotal,
      pi.total,
      pi.status
    FROM provider_invoices AS pi
    LEFT JOIN razones_sociales AS rs
      ON rs.account_id = pi.account_id
    WHERE pi.sale_id = :sale_id
    GROUP BY pi.id
  ");

  $stmtComm = $pdo->prepare("
    SELECT
      c.id,
      c.user_id,
      u.name    AS user_name,
      c.pct,
      c.amount,
      c.status
    FROM commissions AS c
    JOIN users AS u
      ON u.id = c.user_id
    WHERE c.sale_id = :sale_id
  ");

  $result = [];
  foreach ($sales as $row) {
    $saleId = (int)$row['sale_id'];

    // facturas de proveedores
    $stmtProv->execute([':sale_id' => $saleId]);
    $providers = $stmtProv->fetchAll(PDO::FETCH_ASSOC);

    // comisiones
    $stmtComm->execute([':sale_id' => $saleId]);
    $commissions = $stmtComm->fetchAll(PDO::FETCH_ASSOC);

    $result[] = [
      'sale_id'     => $saleId,
      'sale_date'   => $row['sale_date'],
      'project'     => $row['project'],
      'description' => $row['sale_description'],

      'customer_invoice' => [
        'invoice_id'     => (int)$row['customer_invoice_id'],
        'invoice_number' => $row['customer_invoice_number'],
        'account_id'     => (int)$row['customer_account_id'],
        'business_name'  => $row['customer_business_name'],
        'issue_date'     => $row['customer_issue_date'],
        'due_date'       => $row['customer_due_date'],
        'subtotal'       => (float)$row['customer_subtotal'],
        'total'          => (float)$row['customer_total'],
        'status'         => $row['customer_status'],
        'net_profit'     => (float)$row['customer_net_profit'],
        'profit_pct'     => (float)$row['customer_profit_pct'],
      ],

      'provider_invoices' => array_map(function($p) {
        return [
          'id'             => (int)$p['id'],
          'account_id'     => (int)$p['account_id'],
          'business_name'  => $p['business_name'],
          'invoice_number' => $p['invoice_number'],
          'issue_date'     => $p['issue_date'],
          'due_date'       => $p['due_date'],
          'subtotal'       => (float)$p['subtotal'],
          'total'          => (float)$p['total'],
          'status'         => $p['status'],
        ];
      }, $providers),

      'commissions' => array_map(function($c) {
        return [
          'id'        => (int)$c['id'],
          'user_id'   => (int)$c['user_id'],
          'user_name' => $c['user_name'],
          'pct'       => (float)$c['pct'],
          'amount'    => (float)$c['amount'],
          'status'    => $c['status'],
        ];
      }, $commissions),
    ];
  }

  // 3) Traer los complementos de pago
  $comps = $pdo
    ->query("
      SELECT id, invoice_number, issue_date, description, created_at
      FROM payment_complements
      ORDER BY created_at DESC
    ")
    ->fetchAll(PDO::FETCH_ASSOC);

  // 4) Devolver ambos conjuntos
  echo json_encode([
    'success'     => true,
    'sales'       => $result,
    'complements' => $comps
  ]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Error al listar ventas: ' . $e->getMessage()
  ]);
}
