<?php
// backend/api/contacts/listContacts.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

try {
  $stmt = $pdo->query("
    SELECT 
  c.*,
  a.name AS account_name
FROM contacts AS c
LEFT JOIN accounts AS a
  ON c.account_id = a.id
ORDER BY c.created_at DESC;

  ");
  $contacts = $stmt->fetchAll();
  echo json_encode(['success' => true, 'contacts' => $contacts]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al listar contactos']);
}
