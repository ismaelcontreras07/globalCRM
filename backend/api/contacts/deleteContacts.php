<?php
// backend/api/contacts/deleteContacts.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Método no permitido']);
  exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if (!$id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'ID faltante']);
  exit;
}

try {
  $stmt = $pdo->prepare("DELETE FROM contacts WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al eliminar contacto']);
}
