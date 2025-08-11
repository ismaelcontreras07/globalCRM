<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

try {
    // --- Clientes: todas las razones sociales activas ---
    $sqlClients = "
      SELECT
        a.id                   AS account_id,
        rs.nombre              AS business_name,
        COALESCE(SUM(CASE WHEN ci.status='pendiente' THEN ci.total END), 0) AS pendiente,
        COALESCE(SUM(CASE WHEN ci.status='vencido'   THEN ci.total END), 0) AS vencido,
        COALESCE(SUM(CASE WHEN ci.status='pagado'    THEN ci.total END), 0) AS pagado
      FROM accounts a
      JOIN razones_sociales rs
        ON rs.account_id = a.id
       AND rs.status     = 'activo'
      LEFT JOIN customer_invoices ci
        ON ci.account_id     = a.id
       AND ci.business_name = rs.nombre
      WHERE a.role   = 'cliente'
        AND a.status = 'activo'
      GROUP BY a.id, rs.nombre
      ORDER BY rs.nombre
    ";
    $clients = $pdo->query($sqlClients)->fetchAll(PDO::FETCH_ASSOC);

    // --- Proveedores: todas las razones sociales activas ---
    $sqlProviders = "
      SELECT
        a.id                   AS account_id,
        rs.nombre              AS business_name,
        COALESCE(SUM(CASE WHEN pi.status='pendiente' THEN pi.total END), 0) AS pendiente,
        COALESCE(SUM(CASE WHEN pi.status='vencido'   THEN pi.total END), 0) AS vencido,
        COALESCE(SUM(CASE WHEN pi.status='pagado'    THEN pi.total END), 0) AS pagado
      FROM accounts a
      JOIN razones_sociales rs
        ON rs.account_id = a.id
       AND rs.status     = 'activo'
      LEFT JOIN provider_invoices pi
        ON pi.account_id     = a.id
      WHERE a.role   = 'provider'
        AND a.status = 'activo'
      GROUP BY a.id, rs.nombre
      ORDER BY rs.nombre
    ";
    $providers = $pdo->query($sqlProviders)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
      'success'   => true,
      'clients'   => $clients,
      'providers' => $providers
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
      'success' => false,
      'message' => $e->getMessage()
    ]);
}
