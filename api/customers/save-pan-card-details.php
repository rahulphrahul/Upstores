<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data["user_id"] ?? null;
$pan     = strtoupper(trim($data["pan_card_number"] ?? ""));

if (!$user_id || !$pan) {
  http_response_code(400);
  echo json_encode([
    "success" => false,
    "message" => "Missing required fields"
  ]);
  exit;
}

if (!preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/', $pan)) {
  http_response_code(400);
  echo json_encode([
    "success" => false,
    "message" => "Invalid PAN card number"
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

  $check = $pdo->prepare("SELECT id FROM customer_pan_details WHERE user_id = ? LIMIT 1");
  $check->execute([$user_id]);
  $exists = $check->fetchColumn();

  if ($exists) {
    $stmt = $pdo->prepare("
      UPDATE customer_pan_details
      SET pan_card_number = ?
      WHERE user_id = ?
    ");
    $stmt->execute([$pan, $user_id]);
  } else {
    $stmt = $pdo->prepare("
      INSERT INTO customer_pan_details (user_id, pan_card_number)
      VALUES (?, ?)
    ");
    $stmt->execute([$user_id, $pan]);
  }

  echo json_encode([
    "success" => true,
    "message" => "PAN card saved successfully"
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}
