<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once "../config/db.php";

function respond(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

try {
    $userId = isset($_GET["user_id"]) ? (int) $_GET["user_id"] : 0;

    if ($userId <= 0) {
        respond(400, [
            "success" => false,
            "message" => "user_id is required",
            "data" => null,
        ]);
    }

    $stmt = $pdo->prepare("
        SELECT
            id,
            user_id,
            account_holder_name,
            account_number,
            ifsc,
            pan_card_number,
            bank_name,
            branch_name,
            upi_id,
            status,
            created_at,
            updated_at
        FROM customer_bank_details
        WHERE user_id = ?
        ORDER BY updated_at DESC, id DESC
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $bank = $stmt->fetch(PDO::FETCH_ASSOC);

    respond(200, [
        "success" => true,
        "data" => $bank ?: null,
    ]);
} catch (Throwable $e) {
    respond(500, [
        "success" => false,
        "message" => $e->getMessage(),
        "data" => null,
    ]);
}
