<?php
// backend/api/contacts/getContact.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'ID faltante']);
  exit;
}

try {
  $stmt = $pdo->prepare("
    SELECT * FROM contacts
    WHERE id = ? LIMIT 1
  ");
  $stmt->execute([$id]);
  $c = $stmt->fetch();
  if ($c) {
    echo json_encode(['success' => true, 'contact' => $c]);
  } else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Contacto no encontrado']);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error en la consulta']);
}
