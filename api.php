
<?php
/**
 * LeadBid Pro - Enterprise AI Data Node (SQLite3)
 * Full Persistence Layer for Leads, Users, Bids, and API Gateways.
 */
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$db_file = 'leadbid.sqlite';
$db_path = __DIR__ . '/' . $db_file;
$is_new = !file_exists($db_path);

try {
    $db = new PDO("sqlite:$db_path");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    if ($is_new) {
        $db->exec("CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT)");
        $db->exec("CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, username TEXT, password TEXT, email TEXT, balance REAL, role TEXT, status TEXT DEFAULT 'active', stripeConnected INTEGER, wishlist TEXT, bio TEXT, profileImage TEXT, phone TEXT, companyWebsite TEXT, industryFocus TEXT, preferredContact TEXT, defaultBusinessUrl TEXT, defaultTargetUrl TEXT, last_active_at TEXT, current_page TEXT, ipAddress TEXT, deviceInfo TEXT, location TEXT, totalSpend REAL DEFAULT 0)");
        $db->exec("CREATE TABLE leads (id TEXT PRIMARY KEY, title TEXT, category TEXT, description TEXT, businessUrl TEXT, targetLeadUrl TEXT, basePrice REAL, buyNowPrice REAL, currentBid REAL, bidCount INTEGER, timeLeft TEXT, qualityScore INTEGER, sellerRating REAL, status TEXT, countryCode TEXT, region TEXT, ownerId TEXT)");
        $db->exec("CREATE TABLE bids (id TEXT PRIMARY KEY, leadId TEXT, userId TEXT, bidAmount REAL, leadsPerDay INTEGER, totalDailyCost REAL, timestamp TEXT, status TEXT, buyerBusinessUrl TEXT, buyerTargetLeadUrl TEXT, purchaseMode TEXT)");
        $db->exec("CREATE TABLE invoices (id TEXT PRIMARY KEY, purchaseRequestId TEXT, userId TEXT, userName TEXT, leadTitle TEXT, category TEXT, unitPrice REAL, dailyVolume INTEGER, totalSettlement REAL, timestamp TEXT, status TEXT)");
        $db->exec("CREATE TABLE notifications (id TEXT PRIMARY KEY, userId TEXT, message TEXT, type TEXT, timestamp TEXT, read INTEGER DEFAULT 0)");
        $db->exec("CREATE TABLE categories (id TEXT PRIMARY KEY, name TEXT, group_name TEXT)");
        $db->exec("CREATE TABLE api_nodes (id TEXT PRIMARY KEY, type TEXT, provider TEXT, name TEXT, publicKey TEXT, secretKey TEXT, fee TEXT, status TEXT)");

        $db->prepare("INSERT INTO users (id, name, username, password, email, balance, role, status, stripeConnected, wishlist, last_active_at, current_page) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
           ->execute(['admin_1', 'System Administrator', 'admin', '1234', 'admin@leadbid.pro', 1000000, 'admin', 'active', 1, '[]', date('c'), 'Control Room']);
        
        $auth_defaults = json_encode(['googleEnabled' => false, 'googleClientId' => '', 'googleClientSecret' => '', 'facebookEnabled' => false, 'facebookAppId' => '', 'facebookAppSecret' => '']);
        $db->prepare("INSERT INTO config (key, value) VALUES (?, ?)")->execute(['auth_config', $auth_defaults]);
    } else {
        $cols = $db->query("PRAGMA table_info(leads)")->fetchAll(PDO::FETCH_COLUMN, 1);
        if (!in_array('buyNowPrice', $cols)) $db->exec("ALTER TABLE leads ADD COLUMN buyNowPrice REAL");
        
        $bid_cols = $db->query("PRAGMA table_info(bids)")->fetchAll(PDO::FETCH_COLUMN, 1);
        if (!in_array('purchaseMode', $bid_cols)) $db->exec("ALTER TABLE bids ADD COLUMN purchaseMode TEXT");
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'DATABASE_NODE_OFFLINE', 'message' => $e->getMessage()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_data':
        echo json_encode([
            'metadata' => ['version' => '4.1.3-PRO', 'last_updated' => date('Y-m-d H:i:s'), 'db_size' => filesize($db_path), 'status' => 'OPERATIONAL'],
            'leads' => $db->query("SELECT * FROM leads")->fetchAll(),
            'users' => $db->query("SELECT * FROM users")->fetchAll(),
            'purchaseRequests' => $db->query("SELECT * FROM bids")->fetchAll(),
            'invoices' => $db->query("SELECT * FROM invoices")->fetchAll(),
            'notifications' => $db->query("SELECT * FROM notifications ORDER BY timestamp DESC")->fetchAll(),
            'gateways' => $db->query("SELECT * FROM api_nodes WHERE type='payment'")->fetchAll(),
            'authConfig' => json_decode($db->query("SELECT value FROM config WHERE key='auth_config'")->fetchColumn(), true)
        ]);
        break;

    case 'place_bid':
        $id = 'bid_' . bin2hex(random_bytes(4));
        $stmt = $db->prepare("INSERT INTO bids (id, leadId, userId, bidAmount, leadsPerDay, totalDailyCost, timestamp, status, buyerBusinessUrl, buyerTargetLeadUrl, purchaseMode) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$id, $input['leadId'], $input['userId'], $input['bidAmount'], $input['leadsPerDay'], $input['totalDailyCost'], date('Y-m-d H:i:s'), 'approved', $input['buyerBusinessUrl'], $input['buyerTargetLeadUrl'], $input['purchaseMode']]);
        
        if ($input['purchaseMode'] === 'bid') {
            $db->prepare("UPDATE leads SET currentBid = ?, bidCount = bidCount + 1 WHERE id = ?")->execute([$input['bidAmount'], $input['leadId']]);
        } else {
            // buy_now might mark lead as fully provisioned or closed in some models, but here we just record the instant trade
            $db->prepare("UPDATE leads SET bidCount = bidCount + 1 WHERE id = ?")->execute([$input['leadId']]);
        }
        
        $db->prepare("UPDATE users SET totalSpend = totalSpend + ? WHERE id = ?")->execute([$input['totalDailyCost'], $input['userId']]);
        echo json_encode(['status' => 'success']);
        break;

    case 'update_lead':
        $id = $input['id'];
        unset($input['id']);
        $sets = [];
        $vals = [];
        foreach($input as $k => $v) { $sets[] = "$k = ?"; $vals[] = $v; }
        $vals[] = $id;
        $db->prepare("UPDATE leads SET " . implode(', ', $sets) . " WHERE id = ?")->execute($vals);
        echo json_encode(['status' => 'success']);
        break;

    case 'create_lead':
        $id = 'lead_' . bin2hex(random_bytes(4));
        $stmt = $db->prepare("INSERT INTO leads (id, title, category, description, businessUrl, targetLeadUrl, basePrice, buyNowPrice, currentBid, bidCount, timeLeft, qualityScore, sellerRating, status, countryCode, region, ownerId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$id, $input['title'], $input['category'], $input['description'], $input['businessUrl'], $input['targetLeadUrl'], $input['basePrice'], $input['buyNowPrice'], $input['basePrice'], 0, '24h 0m', $input['qualityScore'], 5.0, 'approved', $input['countryCode'], $input['region'], $input['ownerId']]);
        echo json_encode(['status' => 'success']);
        break;

    case 'update_user':
        $id = $input['id'];
        unset($input['id']);
        $sets = [];
        $vals = [];
        foreach($input as $k => $v) { $sets[] = "$k = ?"; $vals[] = $v; }
        $vals[] = $id;
        $db->prepare("UPDATE users SET " . implode(', ', $sets) . " WHERE id = ?")->execute($vals);
        echo json_encode(['status' => 'success']);
        break;

    case 'deposit':
        $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$input['amount'], $input['userId']]);
        echo json_encode(['status' => 'success']);
        break;

    case 'clear_notifications':
        $db->exec("DELETE FROM notifications");
        echo json_encode(['status' => 'success']);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'ACTION_NOT_FOUND']);
        break;
}
?>
