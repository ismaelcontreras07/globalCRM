<?php
// backend/api/leads/describeLeads.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');
try {
  $cols = [];
  $stmt = $pdo->query("SHOW COLUMNS FROM `leads`");
  foreach ($stmt as $r) $cols[] = $r['Field'];
  echo json_encode(['success'=>true, 'columns'=>$cols]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false, 'message'=>'No se pudo describir la tabla']);
}
