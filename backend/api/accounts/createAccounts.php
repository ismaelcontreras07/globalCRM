<?php
// backend/api/accounts/createAccounts.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

// 1) Sólo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Método no permitido']);
  exit;
}

// 2) Sanitizar y validar campos de account
$name        = trim($_POST['name']        ?? '');
if (!$name) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'El nombre es obligatorio']);
  exit;
}

$industry    = trim($_POST['industry']    ?? null);
$website     = trim($_POST['website']     ?? null);
$phone       = trim($_POST['phone']       ?? null);
$email       = trim($_POST['email']       ?? null);
$address     = trim($_POST['address']     ?? null);
$city        = trim($_POST['city']        ?? null);
$state       = trim($_POST['state']       ?? null);
$country     = trim($_POST['country']     ?? null);
$postal_code = trim($_POST['postal_code'] ?? null);
$status      = in_array($_POST['status'] ?? '', ['activo','inactivo'], true)
               ? $_POST['status'] : 'activo';
$owner_id    = isset($_POST['owner_id'])   ? (int)$_POST['owner_id'] : null;
$credit      = trim($_POST['credit']      ?? '0');
$role        = in_array($_POST['role'] ?? '', ['cliente', 'provider'], true)
               ? $_POST['role'] : 'cliente';

// 2a) Validar email si viene
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Email inválido']);
  exit;
}

// 3) Decodificar razones sociales (JSON array)
$razones_json = $_POST['razones_sociales'] ?? '[]';
$razones      = json_decode($razones_json, true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($razones)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Formato de razones sociales inválido']);
  exit;
}
  
try {
  // 4) Transacción para account + razones sociales
  $pdo->beginTransaction();

  // 4a) Insertar account
  $stmt = $pdo->prepare("
    INSERT INTO accounts
      (name, industry, website, phone, email, address, city, state, country, postal_code, owner_id, status, credit, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute([
    $name, $industry, $website, $phone,
    $email, $address, $city, $state,
    $country, $postal_code, $owner_id, $status,
    $credit, $role, $created_at
  ]);
  $accountId = $pdo->lastInsertId();

  // 4b) Preparar insert de razones sociales
  $stmtRs = $pdo->prepare("
    INSERT INTO razones_sociales (account_id, nombre, tipo)
    VALUES (?, ?, ?)
  ");

  // 4c) Recorrer array; primero como 'principal', el resto 'secundaria'
  $insertedCount = 0;
  foreach ($razones as $idx => $nombreRaw) {
    $nombre = trim($nombreRaw);
    if ($nombre === '') {
      continue;
    }
    $tipo = $idx === 0 ? 'principal' : 'secundaria';
    // asegurar tipo válido
    if (!in_array($tipo, ['principal','secundaria'], true)) {
      $tipo = 'secundaria';
    }
    $stmtRs->execute([$accountId, $nombre, $tipo]);
    $insertedCount++;
  }

  $pdo->commit();

  // 5) Responder con éxito
  echo json_encode([
    'success'       => true,
    'account_id'    => $accountId,
    'added_razones' => $insertedCount
  ]);
} catch (Exception $e) {
  error_log("createAccounts error: " . $e->getMessage());
  $pdo->rollBack();
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Error al crear cuenta y razones sociales'
  ]);
}
