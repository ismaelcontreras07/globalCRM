<?php
// backend/api/leads/deleteLeads.php
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Método no permitido']); exit;
}

// Auth básica por sesión
if (empty($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'message' => 'No autenticado']); exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : 0;

if ($id <= 0) {
  echo json_encode(['success' => false, 'message' => 'ID inválido']); exit;
}

try {
  $stmt = $pdo->prepare("DELETE FROM leads WHERE id = ? LIMIT 1");
  $stmt->execute([$id]);
  $deleted = $stmt->rowCount();
  if ($deleted === 0) {
    echo json_encode(['success' => false, 'message' => 'Lead no encontrado']); exit;
  }
  echo json_encode(['success' => true, 'message' => 'Lead eliminado']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al eliminar', 'error' => $e->getMessage()]);
}
