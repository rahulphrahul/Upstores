<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

require_once "../config/db.php";

$user_id = $_GET["user_id"] ?? null;

if (!$user_id) {
  http_response_code(400);
  echo json_encode([
    "success" => false,
    "message" => "Missing user_id"
  ]);
  exit;
}

try {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS customer_pan_details (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      pan_card_number VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  ");

  $stmt = $pdo->prepare("
    SELECT user_id, pan_card_number, created_at, updated_at
    FROM customer_pan_details
    WHERE user_id = ?
    LIMIT 1
  ");
  $stmt->execute([$user_id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  echo json_encode([
    "success" => true,
    "data" => $row ?: null
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}
