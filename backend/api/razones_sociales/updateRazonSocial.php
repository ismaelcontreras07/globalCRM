<?php
// backend/api/razones_sociales/updateRazonSocial.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

// 1) Sólo POST
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

// 3) Campos permitidos para actualización
$allowed = ['nombre', 'tipo'];
$updates = [];
$params  = [];

// 4) Recoger únicamente los campos enviados y válidos
foreach ($_POST as $key => $val) {
  if ($key === 'id') continue;
  if (!in_array($key, $allowed, true)) continue;

  $clean = trim($val);

  if ($key === 'nombre') {
    if ($clean === '') {
      http_response_code(400);
      echo json_encode(['success' => false, 'message' => 'El nombre no puede ir vacío']);
      exit;
    }
    $updates[] = "`nombre` = ?";
    $params[]  = $clean;

  } elseif ($key === 'tipo') {
    $validTipos = ['principal', 'secundaria'];
    if (!in_array($clean, $validTipos, true)) {
      http_response_code(400);
      echo json_encode(['success' => false, 'message' => 'Tipo inválido']);
      exit;
    }
    $updates[] = "`tipo` = ?";
    $params[]  = $clean;
  }
}

// 5) Si no hay nada que actualizar
if (empty($updates)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'No hay cambios que actualizar']);
  exit;
}

// 6) Construir y ejecutar el UPDATE dinámico
$sql = "UPDATE `razones_sociales` SET " . implode(', ', $updates) . " WHERE `id` = ?";
$params[] = $id;

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  echo json_encode([
    'success'      => true,
    'updated_rows' => $stmt->rowCount()
  ]);
} catch (Exception $e) {
  error_log("updateRazonSocial error: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al actualizar razón social']);
}
