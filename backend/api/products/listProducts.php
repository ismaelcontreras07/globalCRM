<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');
try {
  $sql = "
    SELECT
      p.id,
      p.category,
      p.model,
      p.description,
      p.provider_cost,
      p.datasheet_url,
      a.name AS provider_name,
      ud.type           AS ups_type,
      ud.power_factor,
      ud.family         AS ups_family,
      ud.watts          AS ups_watts,
      ud.va,
      ud.vac,
      ud.batteries,
      ud.mounting,
      sd.family         AS suppressor_family,
      sd.watts          AS suppressor_watts,
      sd.vac            AS suppressor_vac,
      sd.outlets,
      sd.absorption,
      bd.technology,
      bd.ah,
      bd.vdc,
      ad.type           AS accessory_type,
      ad.family_compatibility
    FROM products p
    JOIN accounts a
      ON p.provider_id = a.id
    LEFT JOIN ups_details ud    ON p.id = ud.product_id
    LEFT JOIN suppressor_details sd ON p.id = sd.product_id
    LEFT JOIN battery_details bd    ON p.id = bd.product_id
    LEFT JOIN accessory_details ad  ON p.id = ad.product_id
    ORDER BY p.created_at DESC
  ";
  $stmt = $pdo->query($sql);
  $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(['success'=>true,'products'=>$products]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}