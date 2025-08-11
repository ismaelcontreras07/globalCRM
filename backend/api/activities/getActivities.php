<?php
// backend/api/activities/get.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'ID faltante']);
  exit;
}

try {
  $stmt = $pdo->prepare("
    SELECT
      a.*,
      u.name AS assigned_name
    FROM activities AS a
    JOIN users AS u
      ON u.id = a.assigned_to
    WHERE a.id = ?
    LIMIT 1
  ");
  $stmt->execute([$id]);
  $act = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$act) {
    http_response_code(404);
    echo json_encode(['success'=>false,'message'=>'Actividad no encontrada']);
  } else {
    echo json_encode(['success'=>true,'data'=>$act]);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Error al obtener actividad']);
}
