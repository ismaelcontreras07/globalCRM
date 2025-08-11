<?php
// backend/api/sales/monthlyInvoices.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$month = $_GET['month'] ?? '';
$type  = $_GET['type']  ?? ''; // 'clients'|'providers'|'commissions'

if (
  !$month ||
  !in_array($type, ['clients','providers','commissions'])
) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Parámetros inválidos']);
  exit;
}

try {
  if ($type === 'clients') {
    $sql = "
      SELECT invoice_number, issue_date, total
      FROM customer_invoices
      WHERE DATE_FORMAT(issue_date,'%Y-%m') = :m
      ORDER BY issue_date
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':m'=>$month]);
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

  } elseif ($type === 'providers') {
    $sql = "
      SELECT invoice_number, issue_date, total
      FROM provider_invoices
      WHERE DATE_FORMAT(issue_date,'%Y-%m') = :m
      ORDER BY issue_date
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':m'=>$month]);
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

  } else { // commissions
    $sql = "
      SELECT
        ci.invoice_number,
        ci.issue_date,
        c.amount AS commission
      FROM commissions c
      JOIN customer_invoices ci
        ON c.invoice_id = ci.id
      WHERE DATE_FORMAT(ci.issue_date,'%Y-%m') = :m
      ORDER BY ci.issue_date
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':m'=>$month]);
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  echo json_encode(['success'=>true,'invoices'=>$invoices]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
