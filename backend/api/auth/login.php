<?php
// backend/api/auth/login.php

require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json; charset=utf-8');

// 1) Solo permitimos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Método no permitido']);
  exit;
}

// 2) Recogemos credenciales
$email    = $_POST['email']    ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Faltan email o contraseña']);
  exit;
}

try {
  // 3) Buscamos el usuario
  $stmt = $pdo->prepare('SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1');
  $stmt->execute([$email]);
  $user = $stmt->fetch();

  // 4) Verificamos contraseña
  if ($user && password_verify($password, $user['password'])) {
    // 5) Creamos sesión
    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['name'];
    $_SESSION['user_email'] = $user['email'];

    echo json_encode(['success' => true]);
  } else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
  }

} catch (Exception $e) {
  http_response_code(500);
  // En producción oculta $e->getMessage()
  echo json_encode(['success' => false, 'message' => 'Error interno en el servidor']);
}
