<?php
// backend/api/leads/updateLeads.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

// 1) Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Método no permitido']);
  exit;
}

// 2) ID obligatorio
$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if (!$id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'ID faltante']);
  exit;
}

// 3) Definimos los campos permitidos, incluyendo created_at
$allowed = [
  'first_name','last_name','company','position',
  'country','email','phone','status','created_at'
];

$updates = [];
$params  = [];
foreach ($_POST as $key => $val) {
  if ($key === 'id') continue;
  if (in_array($key, $allowed, true)) {
    // 4) si es fecha, convertimos a DATETIME de MySQL
    if ($key === 'created_at') {
      $dt = DateTime::createFromFormat('Y-m-d', trim($val));
      if (! $dt) {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Fecha inválida']);
        exit;
      }
      $updates[] = "`$key` = ?";
      $params[]  = $dt->format('Y-m-d H:i:s');
    } elseif ($key === 'status') {
      // 5) validamos estado
      $valid = ['no_iniciado','aplazados','en_curso','completado'];
      $status = trim($val);
      if (! in_array($status, $valid, true)) {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Estado inválido']);
        exit;
      }
      $updates[] = "`$key` = ?";
      $params[]  = $status;
    } else {
      $updates[] = "`$key` = ?";
      $params[]  = trim($val);
    }
  }
}

// 6) Si no hay nada para cambiar
if (empty($updates)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'No hay cambios que actualizar']);
  exit;
}

// 7) Montamos y ejecutamos el UPDATE
$sql = "UPDATE `leads` SET " . implode(', ', $updates) . " WHERE `id` = ?";
$params[] = $id;

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  echo json_encode([
    'success' => true,
    'updated_rows' => $stmt->rowCount()
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al actualizar lead']);
}
