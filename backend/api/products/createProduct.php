// backend/api/products/createProduct.php
<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');
$body = json_decode(file_get_contents('php://input'), true) ?? [];
// Campos genéricos
$provider_id   = (int)($body['provider_id'] ?? 0);
$category      = $body['category'] ?? '';
$model         = $body['model'] ?? '';$description   = $body['description'] ?? '';
$provider_cost= $body['provider_cost'] ?? 0;
$datasheet_url= $body['datasheet_url'] ?? '';
if (!$provider_id||!$model||!$category) {
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>'Faltan campos obligatorios']);
  exit;
}
try {
  // Insert genérico
    $sql = "INSERT INTO products
    (provider_id, category, model, description, provider_cost, datasheet_url)
    VALUES (:prov,:cat,:mod,:desc,:cost,:url)";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':prov'=>$provider_id,
    ':cat'=>$category,
    ':mod'=>$model,
    ':desc'=>$description,
    ':cost'=>$provider_cost,
    ':url'=>$datasheet_url
  ]);
    $id = $pdo->lastInsertId();
  // Insert detalles según categoría
  switch($category) {
    case 'ups':
      $dt = $body;
      $sql2 = "INSERT INTO ups_details
        (product_id,type,power_factor,family,watts,va,vac,batteries,mounting)
        VALUES (:id,:type,:pf,:fam,:w,:va,:vac,:bat,:m)
      ";
    $pdo->prepare($sql2)->execute([
        ':id'=>$id,':type'=>$dt['type'],':pf'=>$dt['power_factor'],
        ':fam'=>$dt['family'],':w'=>$dt['watts'],':va'=>$dt['va'],
        ':vac'=>$dt['vac'],':bat'=>$dt['batteries'],':m'=>$dt['mounting']
      ]);
      break;
    // casos 'suppressor','battery','accessory' análogos...
  }
  echo json_encode(['success'=>true,'product'=>['id'=>$id]]);
} catch(Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}