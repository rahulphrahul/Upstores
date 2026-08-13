<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// ===== CORS =====
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once "../config/db.php";

$id = $_POST['id'] ?? null; // check if update

// ===== VALIDATION =====
$required = ['title', 'gradient_start', 'gradient_end', 'position'];

foreach ($required as $field) {
    if (!isset($_POST[$field]) || $_POST[$field] === '') {
        echo json_encode([
            "status" => "error",
            "message" => "$field is required"
        ]);
        exit;
    }
}

// Optional merchant fields
$shopId = $_POST['shop_id'] ?? null;
$latitude = $_POST['latitude'] ?? null;
$longitude = $_POST['longitude'] ?? null;

$shopId = ($shopId === '' || $shopId === null) ? null : $shopId;
$latitude = ($latitude === '' || $latitude === null) ? null : $latitude;
$longitude = ($longitude === '' || $longitude === null) ? null : $longitude;

$imagePath = null;

/* ======================================================
   IMAGE UPLOAD (only if image is provided)
====================================================== */

if (!empty($_FILES['image']['name'])) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    $uploadDir = __DIR__ . "/../../images/banners/";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $image = $_FILES['image'];

    if (!in_array($image['type'], $allowedTypes)) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid image type"
        ]);
        exit;
    }

    $ext = strtolower(pathinfo($image['name'], PATHINFO_EXTENSION));
    $filename = "banner_" . time() . "_" . rand(1000, 9999) . "." . $ext;
    $targetPath = $uploadDir . $filename;

    if (!move_uploaded_file($image['tmp_name'], $targetPath)) {
        echo json_encode([
            "status" => "error",
            "message" => "Image upload failed"
        ]);
        exit;
    }

    $imagePath = "api/images/banners/" . $filename;
}

try {
    if ($id) {
        /* ======================================================
           UPDATE EXISTING BANNER
        ====================================================== */

        if ($imagePath) {
            $stmt = $pdo->prepare("
                UPDATE banners SET
                    title = ?,
                    text = ?,
                    button_text = ?,
                    image = ?,
                    gradient_start = ?,
                    gradient_end = ?,
                    position = ?,
                    shop_id = ?,
                    latitude = ?,
                    longitude = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $_POST['title'],
                $_POST['text'] ?? null,
                $_POST['button_text'] ?? null,
                $imagePath,
                $_POST['gradient_start'],
                $_POST['gradient_end'],
                $_POST['position'],
                $shopId,
                $latitude,
                $longitude,
                $id
            ]);
        } else {
            // No new image -> keep old image
            $stmt = $pdo->prepare("
                UPDATE banners SET
                    title = ?,
                    text = ?,
                    button_text = ?,
                    gradient_start = ?,
                    gradient_end = ?,
                    position = ?,
                    shop_id = ?,
                    latitude = ?,
                    longitude = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $_POST['title'],
                $_POST['text'] ?? null,
                $_POST['button_text'] ?? null,
                $_POST['gradient_start'],
                $_POST['gradient_end'],
                $_POST['position'],
                $shopId,
                $latitude,
                $longitude,
                $id
            ]);
        }

        echo json_encode([
            "status" => "success",
            "message" => "Banner updated successfully"
        ]);
    } else {
        /* ======================================================
           CREATE NEW BANNER
        ====================================================== */

        if (!$imagePath) {
            echo json_encode([
                "status" => "error",
                "message" => "Image is required"
            ]);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO banners
            (title, text, button_text, image, gradient_start, gradient_end, position, shop_id, latitude, longitude, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");

        $stmt->execute([
            $_POST['title'],
            $_POST['text'] ?? null,
            $_POST['button_text'] ?? null,
            $imagePath,
            $_POST['gradient_start'],
            $_POST['gradient_end'],
            $_POST['position'],
            $shopId,
            $latitude,
            $longitude
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Banner created successfully"
        ]);
    }
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
