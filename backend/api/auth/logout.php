<?php
// backend/api/auth/logout.php

// 1) Arranca la sesión (vía config.php)
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json; charset=utf-8');

// 2) Limpia todas las variables de sesión
$_SESSION = [];

// 3) Destruye la sesión en el servidor
if (session_status() === PHP_SESSION_ACTIVE) {
    session_destroy();
}

// 4) Elimina la cookie de sesión en el cliente
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// 5) Respuesta JSON
echo json_encode(['success' => true]);
