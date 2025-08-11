<?php
// backend/api/leads/createLeads.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Método no permitido']);
  exit;
}

// recoger y sanitizar
$first_name = trim($_POST['first_name'] ?? '');
$last_name  = trim($_POST['last_name']  ?? '');
$email      = trim($_POST['email']      ?? '');

if (!$first_name || !$last_name || !$email) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
  exit;
}

$company  = trim($_POST['company']  ?? null);
$position = trim($_POST['position'] ?? null);
$country  = trim($_POST['country']  ?? null);
$phone    = trim($_POST['phone']    ?? null);
$status   = in_array($_POST['status'] ?? '', ['interesado','aplazados','en_curso','completado'])
            ? $_POST['status'] : 'interesado';

try {
  $stmt = $pdo->prepare("
    INSERT INTO leads
      (first_name,last_name,company,position,country,email,phone,status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute([
    $first_name, $last_name,
    $company, $position,
    $country, $email,
    $phone, $status
  ]);
  echo json_encode([
    'success' => true,
    'id'      => $pdo->lastInsertId()
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al crear lead']);
}
