<?php
// backend/api/activities/create.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success'=>false,'message'=>'Método no permitido']);
  exit;
}

// Leer JSON
$payload = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'JSON inválido']);
  exit;
}

// Campos obligatorios
$assigned_to   = isset($payload['assigned_to'])   ? (int)$payload['assigned_to']   : 0;
$due_date      = trim($payload['due_date']    ?? '');
$all_day       = !empty($payload['all_day'])        ? 1 : 0;
$description   = trim($payload['description'] ?? '');
$activity_type = trim($payload['activity_type'] ?? '');
$status        = trim($payload['status']        ?? '');

if (!$assigned_to || !$due_date || !$description || !$activity_type || !$status) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Faltan datos obligatorios']);
  exit;
}

// Optional
$due_time     = $all_day ? null : trim($payload['due_time'] ?? null);
$reference_id = isset($payload['reference_id']) ? (int)$payload['reference_id'] : null;

// Validar formato de fecha
$dt = DateTime::createFromFormat('Y-m-d', $due_date);
if (!$dt) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Fecha límite inválida']);
  exit;
}

// Insert
try {
  $stmt = $pdo->prepare("
    INSERT INTO activities
      (assigned_to, due_date, all_day, due_time,
       activity_type, reference_id, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute([
    $assigned_to,
    $dt->format('Y-m-d'),
    $all_day,
    $due_time,
    $activity_type,
    $reference_id,
    $description,
    $status
  ]);
  echo json_encode([
    'success' => true,
    'id'      => $pdo->lastInsertId()
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'success'=>false,
    'message'=>'Error al crear actividad'
  ]);
}
