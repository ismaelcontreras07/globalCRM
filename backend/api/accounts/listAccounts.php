<?php
// backend/api/accounts/listAccounts.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

try {
  // 1) Detectamos filtro por rol: 'cliente' o 'provider'
  $role = null;
  if (isset($_GET['role']) && in_array($_GET['role'], ['cliente','provider'], true)) {
    $role = $_GET['role'];
  }

  // 2) Preparamos cláusula WHERE y parámetros
  $where  = '';
  $params = [];
  if ($role !== null) {
    $where             = 'WHERE a.role = :role';
    $params[':role']   = $role;
  }

  // 3) Consulta: todas las columnas de accounts + concatenación de razones sociales
  $sql = "
    SELECT
      a.*,
      -- Creamos un JSON array a partir de todas las razones sociales encontradas
      CONCAT(
        '[',
          GROUP_CONCAT(
            '\"', REPLACE(rs.nombre, '\"', '\\\"'), '\"'
            ORDER BY rs.tipo DESC
            SEPARATOR ','
          ),
        ']'
      ) AS razones_sociales_json
    FROM accounts AS a
    LEFT JOIN razones_sociales AS rs
      ON rs.account_id = a.id
    $where
    GROUP BY a.id
    ORDER BY a.created_at DESC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // 4) Decodificamos el JSON de razones a un array PHP
  foreach ($accounts as & $a) {
    $json = $a['razones_sociales_json'];
    $a['razones_sociales'] = $json
      ? json_decode($json, true)
      : [];
    unset($a['razones_sociales_json']);
  }

  // 5) Devolvemos el resultado
  echo json_encode([
    'success'  => true,
    'accounts' => $accounts
  ]);
}
catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Error al listar cuentas: ' . $e->getMessage()
  ]);
}
