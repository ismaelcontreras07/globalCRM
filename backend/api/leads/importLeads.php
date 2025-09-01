<?php
// backend/api/leads/importLeads.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Método no permitido']); exit;
}

// (opcional) sesión
if (empty($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'message' => 'No autenticado']); exit;
}

// Leer JSON
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'JSON inválido']); exit;
}

$columnsMap = $input['columnsMap'] ?? null;
$rows       = $input['rows'] ?? null;
if (!is_array($columnsMap) || !is_array($rows)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Payload incompleto']); exit;
}

// Utilidades
function getExistingColumns(PDO $pdo) {
  $cols = [];
  $stmt = $pdo->query("SHOW COLUMNS FROM `leads`");
  foreach ($stmt as $r) $cols[] = $r['Field'];
  return $cols;
}
function ensureColumn(PDO $pdo, $name, $type) {
  $name = preg_replace('/[^a-zA-Z0-9_]/', '_', $name);
  $type = strtoupper(trim($type));
  $stmt = $pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leads' AND COLUMN_NAME = ?");
  $stmt->execute([$name]);
  $exists = (int)$stmt->fetchColumn() > 0;
  if (!$exists) {
    if (in_array($name, ['id'])) throw new Exception("Nombre de columna no permitido: $name");
    $sql = "ALTER TABLE `leads` ADD COLUMN `$name` $type NULL";
    $pdo->exec($sql);
  }
}

$existingColumns = getExistingColumns($pdo);

// Preparar mapping (crear columnas si aplica)
try {
  foreach ($columnsMap as &$m) {
    $dbF   = $m['dbField'] ?? '';
    $create= !empty($m['createIfMissing']);
    $ctype = $m['createType'] ?? 'VARCHAR(255)';
    $newN  = $m['newName'] ?? '';

    if ($dbF) {
      $dest = $dbF;
    } elseif ($create && $newN) {
      $dest = preg_replace('/[^a-zA-Z0-9_]/', '_', $newN);
      ensureColumn($pdo, $dest, $ctype);
      if (!in_array($dest, $existingColumns, true)) $existingColumns[] = $dest;
    } else {
      $dest = '';
    }
    $m['dest'] = $dest;
  }
  unset($m);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Error al preparar columnas', 'detail' => $e->getMessage()]); exit;
}

// Importar
$validStatus = ['interesado','aplazados','en_curso','completado'];
$inserted = 0; $updated = 0; $skipped = 0; $errors = 0; $errorRows = [];

$pdo->beginTransaction();
try {
  foreach ($rows as $idx => $row) {
    // Construir record según mapping; faltantes => ""
    $record = [];
    foreach ($columnsMap as $m) {
      if (empty($m['dest'])) continue;
      $src = $m['sourceHeader'];
      $dest= $m['dest'];
      $val = array_key_exists($src, $row) ? $row[$src] : '';
      if ($val === null) $val = '';
      $record[$dest] = $val;
    }

    // Asegurar campos comunes (excepto created_at)
    foreach (['first_name','company','position','country','email','phone','status'] as $must) {
      if (!array_key_exists($must, $record)) $record[$must] = '';
    }

    if (empty($record)) { $skipped++; continue; }

    // Normalizar status
    if (isset($record['status']) && !in_array($record['status'], $validStatus, true)) {
      $record['status'] = 'interesado';
    }

    // Normalizar created_at: si vacío/invalid -> quitar (usa DEFAULT)
    if (array_key_exists('created_at', $record)) {
      $val = trim((string)$record['created_at']);
      if ($val === '') {
        unset($record['created_at']);
      } else {
        $ts = strtotime($val);
        if ($ts === false) unset($record['created_at']);
        else $record['created_at'] = date('Y-m-d H:i:s', $ts);
      }
    }

    // active por defecto si existe
    if (in_array('active', $existingColumns, true) && !isset($record['active'])) {
      $record['active'] = '1';
    }

    // --- EMAIL vacío: generar placeholder único para cumplir UNIQUE/NOT NULL ---
    if (!isset($record['email']) || trim($record['email']) === '') {
      $record['email'] = 'no-email';
    }

    // SQL dinámico
    $cols = array_keys($record);
    $placeholders = implode(',', array_fill(0, count($cols), '?'));
    $colList = '`' . implode('`,`', $cols) . '`';

    $updates = [];
    foreach ($cols as $c) {
      if ($c === 'id') continue;
      $updates[] = "`$c` = VALUES(`$c`)";
    }

    // Si el email es placeholder, no queremos upsert por ese valor "falso".
    $emailVal = $record['email'];
    $isPlaceholder = str_starts_with($emailVal, 'no-email-');

    $sql = "INSERT INTO `leads` ($colList) VALUES ($placeholders) "
         . (!$isPlaceholder ? "ON DUPLICATE KEY UPDATE ".implode(', ', $updates) : '');

    $stmt = $pdo->prepare($sql);
    $ok = $stmt->execute(array_values($record));

    if ($ok) {
      if (!$isPlaceholder && $stmt->rowCount() === 2) $updated++;
      else $inserted++;
    } else {
      $errors++; $errorRows[] = $idx+1;
    }
  }

  $pdo->commit();
} catch (Throwable $e) {
  $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al importar', 'detail' => $e->getMessage()]); exit;
}

echo json_encode([
  'success'    => true,
  'inserted'   => $inserted,
  'updated'    => $updated,
  'skipped'    => $skipped,
  'errors'     => $errors,
  'error_rows' => $errorRows
]);
