<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once "../config/db.php";

$search = trim($_GET['search'] ?? '');
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(500, (int)($_GET['limit'] ?? 200)));
$offset = ($page - 1) * $limit;

function getLocationNameFromCoordinates($latitude, $longitude) {
    static $cache = [];

    $lat = trim((string)$latitude);
    $lng = trim((string)$longitude);

    if ($lat === '' || $lng === '') {
        return null;
    }

    $cacheKey = $lat . ',' . $lng;
    if (array_key_exists($cacheKey, $cache)) {
        return $cache[$cacheKey];
    }

    $url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='
        . rawurlencode($lat)
        . '&lon='
        . rawurlencode($lng)
        . '&zoom=18&addressdetails=1';

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: UpstoresBannerMerchantLookup/1.0\r\n",
            'timeout' => 4,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        $cache[$cacheKey] = null;
        return null;
    }

    $decoded = json_decode($response, true);
    $locationName = $decoded['display_name'] ?? null;
    $cache[$cacheKey] = $locationName;

    return $locationName;
}

$baseQuery = "
    SELECT
        merchant_type,
        merchant_id,
        user_id,
        shop_id,
        seller_id,
        service_id,
        merchant_name,
        owner_name,
        phone,
        email,
        latitude,
        longitude
    FROM (
        SELECT
            'shop' AS merchant_type,
            s.id AS merchant_id,
            u.id AS user_id,
            shop_id,
            NULL AS seller_id,
            NULL AS service_id,
            s.name AS merchant_name,
            s.owner_name AS owner_name,
            u.phone,
            u.email,
            s.latitude,
            s.longitude
        FROM shops s
        LEFT JOIN users u ON u.id = s.shop_id

        UNION ALL

        SELECT
            'seller' AS merchant_type,
            s.id AS merchant_id,
            u.id AS user_id,
            NULL AS shop_id,
            seller_id,
            NULL AS service_id,
            s.name AS merchant_name,
            s.owner_name AS owner_name,
            u.phone,
            u.email,
            s.latitude,
            s.longitude
        FROM sellers s
        LEFT JOIN users u ON u.id = s.seller_id

        UNION ALL

        SELECT
            'service' AS merchant_type,
            s.id AS merchant_id,
            u.id AS user_id,
            NULL AS shop_id,
            NULL AS seller_id,
            service_id,
            s.name AS merchant_name,
            s.owner_name AS owner_name,
            u.phone,
            u.email,
            s.latitude,
            s.longitude
        FROM services s
        LEFT JOIN users u ON u.id = s.service_id
    ) AS merchants
";

$params = [];
$where = "";

if ($search !== '') {
    $where = "
        WHERE (
            merchant_name LIKE ?
            OR owner_name LIKE ?
            OR phone LIKE ?
            OR email LIKE ?
            OR EXISTS (
                SELECT 1
                FROM users u2
                WHERE u2.id = merchants.user_id
                AND u2.name LIKE ?
            )
            OR CAST(latitude AS CHAR) LIKE ?
            OR CAST(longitude AS CHAR) LIKE ?
        )
    ";

    $like = '%' . $search . '%';
    $params = [$like, $like, $like, $like, $like, $like, $like];
}

try {
    $countStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM ({$baseQuery}) AS count_merchants {$where}");
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

    $listSql = "{$baseQuery} {$where} ORDER BY merchant_name ASC LIMIT {$limit} OFFSET {$offset}";
    $listStmt = $pdo->prepare($listSql);

    $listStmt->execute($params);

    $rows = $listStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['location_name'] = getLocationNameFromCoordinates(
            $row['latitude'] ?? null,
            $row['longitude'] ?? null
        );
    }
    unset($row);

    echo json_encode([
        "status" => "success",
        "total" => $total,
        "data" => $rows
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
