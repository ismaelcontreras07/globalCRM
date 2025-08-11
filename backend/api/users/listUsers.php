<?php
// backend/api/users/listUsers.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

try {
  $stmt  = $pdo->query("SELECT id, name FROM users ORDER BY name ASC");
  $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(['success' => true, 'data' => $users]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al listar usuarios']);
}
