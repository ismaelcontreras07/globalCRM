<?php
// backend/api/contacts/updateContacts.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

// 1) Sólo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success'=>false,'message'=>'Método no permitido']);
  exit;
}

// 2) ID obligatorio
$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if (!$id) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'ID faltante']);
  exit;
}

// 3) Campos permitidos para actualización
$allowed = [
  'account_id','first_name','last_name','title','department',
  'email','phone','mobile','lead_source','status','created_at'
];

$updates = [];
$params  = [];

// 4) Recoger sólo los campos válidos enviados
foreach ($_POST as $key => $val) {
  if ($key === 'id' || !in_array($key, $allowed, true)) {
    continue;
  }
  $clean = trim($val);

  switch ($key) {
    case 'account_id':
      $clean = (int)$clean;
      if ($clean <= 0) {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Cuenta inválida']);
        exit;
      }
      break;

    case 'first_name':
    case 'last_name':
      if ($clean === '') {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>"{$key} no puede ir vacío"]);
        exit;
      }
      break;

    case 'email':
      if ($clean !== '' && !filter_var($clean, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Email inválido']);
        exit;
      }
      break;

    case 'status':
      $valid = ['activo','inactivo'];
      if (!in_array($clean, $valid, true)) {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Estado inválido']);
        exit;
      }
      break;

    case 'created_at':
      $dt = DateTime::createFromFormat('Y-m-d', $clean);
      if (! $dt) {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Fecha inválida']);
        exit;
      }
      // guardamos con hora 00:00:00 para timestamp
      $clean = $dt->format('Y-m-d H:i:s');
      break;

    // title, department, phone, mobile, lead_source no requieren validación extra
  }

  $updates[] = "`$key` = ?";
  $params[]  = $clean;
}

// 5) Si no hay nada que actualizar
if (empty($updates)) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'No hay datos que actualizar']);
  exit;
}

// 6) Construir y ejecutar el UPDATE
$sql = "UPDATE `contacts` SET " . implode(', ', $updates) . " WHERE `id` = ?";
$params[] = $id;

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  echo json_encode([
    'success'      => true,
    'updated_rows' => $stmt->rowCount()
  ]);
} catch (Exception $e) {
  error_log("updateContacts error: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error al actualizar contacto']);
}
