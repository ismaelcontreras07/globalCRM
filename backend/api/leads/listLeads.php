<?php
// backend/api/leads/listLeads.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

try {
  $stmt = $pdo->query("SELECT * FROM leads ORDER BY created_at DESC");
  $leads = $stmt->fetchAll();
  echo json_encode(['success' => true, 'leads' => $leads]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al listar leads']);
}
