<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

function read_input(): array
{
    $json = json_decode(file_get_contents("php://input"), true);
    if (is_array($json)) {
        return $json;
    }

    return $_POST ?: [];
}

function normalize_text(?string $value): string
{
    return trim((string) $value);
}

function normalize_pan(?string $value): string
{
    return strtoupper(preg_replace('/\s+/', '', normalize_text($value)));
}

function normalize_gst(?string $value): string
{
    return strtoupper(preg_replace('/\s+/', '', normalize_text($value)));
}

try {
    $input = read_input();

    $accountHolderName = normalize_text($input["account_holder_name"] ?? "");
    $accountNumber = preg_replace('/\D+/', '', normalize_text($input["account_number"] ?? ""));
    $ifsc = strtoupper(preg_replace('/\s+/', '', normalize_text($input["ifsc"] ?? "")));
    $panCardNumber = normalize_pan($input["pan_card_number"] ?? "");
    $gst = normalize_gst($input["gst"] ?? "");
    $bankName = normalize_text($input["bank_name"] ?? "");
    $branchName = normalize_text($input["branch_name"] ?? "");
    $upiId = normalize_text($input["upi_id"] ?? "");

    if ($accountHolderName === "") {
        respond(400, ["success" => false, "message" => "account_holder_name required"]);
    }
    if ($accountNumber === "") {
        respond(400, ["success" => false, "message" => "account_number required"]);
    }
    if (strlen($ifsc) !== 11) {
        respond(400, ["success" => false, "message" => "valid ifsc required"]);
    }
    if ($panCardNumber !== "" && !preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]$/', $panCardNumber)) {
        respond(400, ["success" => false, "message" => "valid pan_card_number required"]);
    }
    if ($gst !== "" && !preg_match('/^[0-9A-Z]{15}$/', $gst)) {
        respond(400, ["success" => false, "message" => "valid gst required"]);
    }

    $stmt = $pdo->prepare("
        SELECT id
        FROM company_bank_details
        WHERE LOWER(status) = 'active'
        ORDER BY updated_at DESC, id DESC
        LIMIT 1
    ");
    $stmt->execute();
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $update = $pdo->prepare("
            UPDATE company_bank_details
            SET
                account_holder_name = ?,
                account_number = ?,
                ifsc = ?,
                pan_card_number = ?,
                gst = ?,
                bank_name = ?,
                branch_name = ?,
                upi_id = ?,
                status = 'active',
                updated_at = NOW()
            WHERE id = ?
        ");
        $update->execute([
            $accountHolderName,
            $accountNumber,
            $ifsc,
            $panCardNumber !== "" ? $panCardNumber : null,
            $gst !== "" ? $gst : null,
            $bankName !== "" ? $bankName : null,
            $branchName !== "" ? $branchName : null,
            $upiId !== "" ? $upiId : null,
            (int) $existing["id"],
        ]);
        $bankId = (int) $existing["id"];
    } else {
        $insert = $pdo->prepare("
            INSERT INTO company_bank_details
            (
                account_holder_name,
                account_number,
                ifsc,
                pan_card_number,
                gst,
                bank_name,
                branch_name,
                upi_id,
                status,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
        ");
        $insert->execute([
            $accountHolderName,
            $accountNumber,
            $ifsc,
            $panCardNumber !== "" ? $panCardNumber : null,
            $gst !== "" ? $gst : null,
            $bankName !== "" ? $bankName : null,
            $branchName !== "" ? $branchName : null,
            $upiId !== "" ? $upiId : null,
        ]);
        $bankId = (int) $pdo->lastInsertId();
    }

    respond(200, [
        "success" => true,
        "message" => "Company bank details saved successfully",
        "bank_id" => $bankId,
    ]);
} catch (Throwable $e) {
    respond(500, [
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
