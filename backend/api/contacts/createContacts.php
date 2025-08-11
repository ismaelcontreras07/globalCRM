<?php
// backend/api/contacts/createContacts.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Método no permitido']);
  exit;
}

// Validar campos obligatorios
$account_id = isset($_POST['account_id']) ? (int)$_POST['account_id'] : 0;
$first_name = trim($_POST['first_name'] ?? '');
$last_name  = trim($_POST['last_name']  ?? '');

if (!$account_id || !$first_name || !$last_name) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
  exit;
}

$title       = trim($_POST['title']       ?? null);
$department  = trim($_POST['department']  ?? null);
$email       = trim($_POST['email']       ?? null);
$phone       = trim($_POST['phone']       ?? null);
$mobile      = trim($_POST['mobile']      ?? null);
$lead_source = trim($_POST['lead_source'] ?? null);
$status      = in_array($_POST['status'] ?? '', ['activo','inactivo'])
               ? $_POST['status'] : 'activo';

try {
  $stmt = $pdo->prepare("
    INSERT INTO contacts
      (account_id,first_name,last_name,title,department,email,phone,mobile,lead_source,status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute([
    $account_id, $first_name, $last_name,
    $title, $department, $email,
    $phone, $mobile, $lead_source,
    $status
  ]);
  echo json_encode([
    'success' => true,
    'id'      => $pdo->lastInsertId()
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al crear contacto']);
}
