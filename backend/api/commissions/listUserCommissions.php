<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

session_start();
if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['success'=>false,'message'=>'No autenticado']);
  exit;
}

$userId = (int)$_SESSION['user_id'];

try {
  $sql = "
    SELECT
      c.id,
      ci.invoice_number,
      c.pct,
      c.amount,
      c.status
    FROM commissions AS c
    JOIN customer_invoices AS ci
      ON ci.id = c.invoice_id
    WHERE c.user_id = :uid
    ORDER BY c.created_at DESC
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':uid'=>$userId]);
  $coms = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(['success'=>true,'commissions'=>$coms]);
} catch(Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
    