<?php
session_start();

// Parámetros de conexión
define('DB_HOST', 'localhost'); // el host de donde encuentra la base de datos
define('DB_NAME', 'aymacrm'); // el nombre de la base de datos
define('DB_USER', 'root'); // el usuario de la base de datos
define('DB_PASS', ''); // la contraseña de la base de datos

// intenta hacer la conexión a la base de datos
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
    die("Error de conexión a la base de datos: " . $e->getMessage()); // mensaje de error
}
