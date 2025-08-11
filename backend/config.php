<?php
session_start();

// Parámetros de conexión
define('DB_HOST', 'localhost');
define('DB_NAME', 'iconcrm');
define('DB_USER', 'root');
define('DB_PASS', '');

// Conexión PDO
try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    // En producción: registra el error en un log en lugar de mostrarlo
    die("Error de conexión a la base de datos: " . $e->getMessage());
}
