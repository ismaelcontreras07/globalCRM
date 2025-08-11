<?php
// backend/api/sales/listComplements.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');
try {
  $sql = "SELECT id, invoice_number, issue_date, description, created_at
          FROM payment_complements
          ORDER BY created_at DESC";
  $comps = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(['success'=>true,'complements'=>$comps]);
} catch(Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
