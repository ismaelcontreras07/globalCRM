<?php
// backend/api/leads/getLeads.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Método no permitido']); exit;
}

if (empty($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'message' => 'No autenticado']); exit;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
  echo json_encode(['success' => false, 'message' => 'ID inválido']); exit;
}

try {
  $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ? LIMIT 1");
  $stmt->execute([$id]);
  $lead = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$lead) {
    echo json_encode(['success' => false, 'message' => 'Lead no encontrado']); exit;
  }
  echo json_encode(['success' => true, 'data' => $lead]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error al obtener lead', 'error' => $e->getMessage()]);
}
