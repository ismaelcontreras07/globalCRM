<?php
// backend/api/accounts/updateAccounts.php
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

// 3) Manejo de razones sociales si vienen
if (isset($_POST['razones_sociales'])) {
  $raw = $_POST['razones_sociales'];

  // 3a) Intentamos decodificar JSON
  $arr = json_decode($raw, true);
  if (json_last_error() !== JSON_ERROR_NONE || !is_array($arr)) {
    // 3b) Fallback: tratamos la cadena como lista separada por comas
    $arr = array_filter(array_map('trim', explode(',', $raw)));
  }

  try {
    $pdo->beginTransaction();

    // borrar existentes
    $del = $pdo->prepare("DELETE FROM razones_sociales WHERE account_id = ?");
    $del->execute([$id]);

    // insertar de nuevo
    $ins = $pdo->prepare("
      INSERT INTO razones_sociales (account_id, nombre, tipo)
      VALUES (?, ?, ?)
    ");
    $count = 0;
    foreach ($arr as $idx => $nombreRaw) {
      $nombre = trim($nombreRaw);
      if ($nombre === '') continue;
      $tipo = $idx === 0 ? 'principal' : 'secundaria';
      $ins->execute([$id, $nombre, $tipo]);
      $count++;
    }

    $pdo->commit();
    echo json_encode(['success'=>true,'updated_reasons'=>$count]);
    exit;
  } catch (Exception $e) {
    error_log("updateAccounts razones error: ".$e->getMessage());
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Error actualizando razones sociales']);
    exit;
  }
}

// 4) Partial update de la tabla accounts
$allowed = [
  'name','industry','website','phone','email',
  'address','city','state','country','postal_code',
  'owner_id','status','created_at','credit', 'role'
];
$updates = [];
$params  = [];

// 5) Recoger sólo campos válidos del POST
foreach ($_POST as $key => $val) {
  if ($key === 'id' || !in_array($key, $allowed, true)) continue;
  $clean = trim($val);
  switch ($key) {
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
    case 'owner_id':
      $clean = (int)$clean;
      break;
    case 'created_at':
      $dt = DateTime::createFromFormat('Y-m-d', $clean);
      if (! $dt) {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Fecha inválida']);
        exit;
      }
      $clean = $dt->format('Y-m-d H:i:s');
      break;
    case 'credit':
      $clean = is_numeric($clean) ? (int)$clean : 0;
      break;
    case 'role':
      $valid = ['cliente', 'provider'];
      if (!in_array($clean, $valid, true)) {
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Rol inválido']);
        exit;
      }
      break;
  }
  $updates[] = "`$key` = ?";
  $params[]  = $clean;
}

if (empty($updates)) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'No hay datos que actualizar']);
  exit;
}

// 6) Ejecutar UPDATE
$sql = "UPDATE `accounts` SET ".implode(', ', $updates)." WHERE `id` = ?";
$params[] = $id;

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  echo json_encode(['success'=>true,'updated_rows'=>$stmt->rowCount()]);
} catch (Exception $e) {
  error_log("updateAccounts error: ".$e->getMessage());
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error al actualizar cuenta']);
}
