// backend/api/products/getProduct.php
<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');
$id = (int)($_GET['id'] ?? 0);
if (!$id) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Parámetro id inválido']);
  exit;
}
try {
  $sql = "
    SELECT p.*, a.name AS provider_name,
      ud.*, sd.*, bd.*, ad.*
    FROM products p
    JOIN accounts a            ON p.provider_id = a.id
    LEFT JOIN ups_details ud    ON p.id = ud.product_id
    LEFT JOIN suppressor_details sd ON p.id = sd.product_id
    LEFT JOIN battery_details bd    ON p.id = bd.product_id
    LEFT JOIN accessory_details ad  ON p.id = ad.product_id
    WHERE p.id = :id
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':id'=>$id]);
  $product = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$product) {
    http_response_code(404);
    echo json_encode(['success'=>false,'message'=>'Producto no encontrado']);
    exit;
  }
  echo json_encode(['success'=>true,'product'=>$product]);
} catch(Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}