<?php
// backend/api/activities/update.php
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

$id = isset($payload['id']) ? (int)$payload['id'] : 0;
if (!$id) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'ID faltante']);
  exit;
}

// Campos permitidos
$allowed = [
  'assigned_to','due_date','all_day','due_time',
  'activity_type','reference_id','description','status'
];

$updates = [];
$params  = [];

// Armar dinámicamente
foreach ($payload as $key => $val) {
  if ($key === 'id' || !in_array($key, $allowed, true)) continue;
  $clean = trim($val);
  switch ($key) {
    case 'assigned_to':
    case 'reference_id':
      $clean = (int)$clean;
      break;
    case 'due_date':
      $dt = DateTime::createFromFormat('Y-m-d', $clean);
      if (!$dt) {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Fecha inválida']);
        exit;
      }
      $clean = $dt->format('Y-m-d');
      break;
    case 'all_day':
      $clean = !empty($val) ? 1 : 0;
      break;
    case 'due_time':
      // allow NULL or HH:MM:SS
      break;
    // activity_type, description, status no necesitan validación extra
  }
  $updates[] = "`$key` = ?";
  $params[]  = $clean;
}

if (empty($updates)) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'No hay datos que actualizar']);
  exit;
}

$sql = "UPDATE `activities` SET " . implode(', ', $updates) . " WHERE `id` = ?";
$params[] = $id;

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  echo json_encode([
    'success'      => true,
    'updated_rows' => $stmt->rowCount()
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error al actualizar actividad']);
}
