<?php
// backend/api/activities/list.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

try {
  $sql = "
    SELECT
  a.*,
  u.name AS assigned_name,
  CASE
    WHEN a.activity_type='leads' THEN CONCAT(l.first_name,' ',l.last_name)
    WHEN a.activity_type='contacto' THEN CONCAT(c.first_name,' ',c.last_name)
    ELSE NULL
  END AS reference_name
FROM activities a
JOIN users u ON u.id = a.assigned_to
LEFT JOIN leads l     ON l.id = a.reference_id AND a.activity_type='leads'
LEFT JOIN contacts c  ON c.id = a.reference_id AND a.activity_type='contacto';
  ";
  $stmt       = $pdo->query($sql);
  $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    'success' => true,
    'data'    => $activities
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Error al listar actividades'
  ]);
}
