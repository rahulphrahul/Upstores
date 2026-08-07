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
    $stmt = $pdo->query("
        SELECT
            id,
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
        FROM company_bank_details
        WHERE LOWER(status) = 'active'
        ORDER BY updated_at DESC, id DESC
        LIMIT 1
    ");

    $bank = $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : false;

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
