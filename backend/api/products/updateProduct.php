// backend/api/products/updateProduct.php
<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');
$body = json_decode(file_get_contents('php://input'), true) ?? [];
$id = (int)($body['id'] ?? 0);
if (!$id) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'id inválido']); exit; }
try {
  // Actualizar genérico
  $sql = "UPDATE products SET
    provider_id=:prov, category=:cat, model=:mod,
    description=:desc, provider_cost=:cost, datasheet_url=:url
    WHERE id=:id";
$pdo->prepare($sql)->execute([
    ':prov'=>$body['provider_id'],':cat'=>$body['category'],':mod'=>$body['model'],
    ':desc'=>$body['description'],':cost'=>$body['provider_cost'],':url'=>$body['datasheet_url'],':id'=>$id
  ]);
  // Actualizar detalles (asumiendo registro previo)
  switch($body['category']) {
    case 'ups':
      $sql2 = "UPDATE ups_details SET
        type=:type,power_factor=:pf,family=:fam,watts=:w,va=:va,
        vac=:vac,batteries=:bat,mounting=:m
        WHERE product_id=:id";
      $params = [ /* mismos que create */ ];
      $pdo->prepare($sql2)->execute($params);
      break;
    // otros casos...
  }
  echo json_encode(['success'=>true]);
} catch(Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
