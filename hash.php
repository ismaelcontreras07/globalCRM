<?php
// hash.php
// ---
// Coloca aquí tu contraseña en texto plano:
$password = 'icon2025';

// Genera el hash seguro con bcrypt (PASSWORD_DEFAULT)
$hash = password_hash($password, PASSWORD_DEFAULT);

// Muestra sólo el hash resultante
echo $hash;
