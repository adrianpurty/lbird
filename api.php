
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
        // Init tables
        $db->exec("CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT)");
        $db->exec("CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, username TEXT, password TEXT, email TEXT, balance REAL, role TEXT, status TEXT DEFAULT 'active', stripeConnected INTEGER, wishlist TEXT, bio TEXT, profileImage TEXT, phone TEXT, companyWebsite TEXT, industryFocus TEXT, preferredContact TEXT, defaultBusinessUrl TEXT, defaultTargetUrl TEXT, last_active_at TEXT, current_page TEXT, ipAddress TEXT, deviceInfo TEXT, location TEXT, totalSpend REAL DEFAULT 0)");
        $db->exec("CREATE TABLE leads (id TEXT PRIMARY KEY, title TEXT, category TEXT, description TEXT, businessUrl TEXT, targetLeadUrl TEXT, basePrice REAL, currentBid REAL, bidCount INTEGER, timeLeft TEXT, qualityScore INTEGER, sellerRating REAL, status TEXT, countryCode TEXT, region TEXT, ownerId TEXT)");
        $db->exec("CREATE TABLE bids (id TEXT PRIMARY KEY, leadId TEXT, userId TEXT, bidAmount REAL, leadsPerDay INTEGER, totalDailyCost REAL, timestamp TEXT, status TEXT, buyerBusinessUrl TEXT, buyerTargetLeadUrl TEXT, leadTitle TEXT)");
        $db->exec("CREATE TABLE invoices (id TEXT PRIMARY KEY, purchaseRequestId TEXT, userId TEXT, userName TEXT, leadTitle TEXT, category TEXT, unitPrice REAL, dailyVolume INTEGER, totalSettlement REAL, timestamp TEXT, status TEXT)");
        $db->exec("CREATE TABLE notifications (id TEXT PRIMARY KEY, userId TEXT, message TEXT, type TEXT, timestamp TEXT, read INTEGER DEFAULT 0)");
        $db->exec("CREATE TABLE categories (id TEXT PRIMARY KEY, name TEXT, group_name TEXT)");
        $db->exec("CREATE TABLE api_nodes (id TEXT PRIMARY KEY, type TEXT, provider TEXT, name TEXT, publicKey TEXT, secretKey TEXT, fee TEXT, status TEXT)");
        $db->exec("CREATE TABLE wallet_activities (id TEXT PRIMARY KEY, userId TEXT, type TEXT, amount REAL, provider TEXT, timestamp TEXT, status TEXT)");

        // Initial Seed
        $db->prepare("INSERT INTO users (id, name, username, password, email, balance, role, status, stripeConnected, wishlist, last_active_at, current_page) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
           ->execute(['admin_1', 'System Administrator', 'admin', '1234', 'admin@leadbid.pro', 1000000, 'admin', 'active', 1, '[]', date('c'), 'Control Room']);
        
        $auth_defaults = json_encode(['googleEnabled' => false, 'googleClientId' => '', 'googleClientSecret' => '', 'facebookEnabled' => false, 'facebookAppId' => '', 'facebookAppSecret' => '']);
        $db->prepare("INSERT INTO config (key, value) VALUES (?, ?)")->execute(['auth_config', $auth_defaults]);
    } else {
        // Migration check
        $cols = $db->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_COLUMN, 1);
        if (!in_array('last_active_at', $cols)) $db->exec("ALTER TABLE users ADD COLUMN last_active_at TEXT");
        if (!in_array('current_page', $cols)) $db->exec("ALTER TABLE users ADD COLUMN current_page TEXT");
        if (!in_array('status', $cols)) $db->exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'");
        if (!in_array('totalSpend', $cols)) $db->exec("ALTER TABLE users ADD COLUMN totalSpend REAL DEFAULT 0");

        $cols_bids = $db->query("PRAGMA table_info(bids)")->fetchAll(PDO::FETCH_COLUMN, 1);
        if (!in_array('leadTitle', $cols_bids)) $db->exec("ALTER TABLE bids ADD COLUMN leadTitle TEXT");

        // Activity migration
        $res = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='wallet_activities'")->fetch();
        if (!$res) {
            $db->exec("CREATE TABLE wallet_activities (id TEXT PRIMARY KEY, userId TEXT, type TEXT, amount REAL, provider TEXT, timestamp TEXT, status TEXT)");
        }
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
            'purchaseRequests' => $db->query("SELECT * FROM bids ORDER BY timestamp DESC")->fetchAll(),
            'invoices' => $db->query("SELECT * FROM invoices")->fetchAll(),
            'walletActivities' => $db->query("SELECT * FROM wallet_activities ORDER BY timestamp DESC")->fetchAll(),
            'notifications' => $db->query("SELECT * FROM notifications ORDER BY timestamp DESC")->fetchAll(),
            'gateways' => $db->query("SELECT * FROM api_nodes WHERE type='payment'")->fetchAll(),
            'authConfig' => json_decode($db->query("SELECT value FROM config WHERE key='auth_config'")->fetchColumn(), true)
        ]);
        break;

    case 'heartbeat':
        if (isset($input['userId'])) {
            $sets = ["last_active_at = ?", "current_page = ?"];
            $params = [date('c'), $input['page']];
            
            if (isset($input['location'])) { $sets[] = "location = ?"; $params[] = $input['location']; }
            if (isset($input['ipAddress'])) { $sets[] = "ipAddress = ?"; $params[] = $input['ipAddress']; }
            if (isset($input['deviceInfo'])) { $sets[] = "deviceInfo = ?"; $params[] = $input['deviceInfo']; }
            
            $params[] = $input['userId'];
            $stmt = $db->prepare("UPDATE users SET " . implode(", ", $sets) . " WHERE id = ?");
            $stmt->execute($params);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'social_sync':
        $email = $input['email'];
        $user_stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $user_stmt->execute([$email]);
        $user = $user_stmt->fetch();

        if ($user) {
            echo json_encode(['status' => 'success', 'user' => $user]);
        } else {
            $id = 'u_' . bin2hex(random_bytes(4));
            $username = explode('@', $email)[0] . rand(100, 999);
            $stmt = $db->prepare("INSERT INTO users (id, name, email, username, profileImage, balance, role, status, stripeConnected, wishlist, last_active_at, current_page) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
            $stmt->execute([$id, $input['name'], $email, $username, $input['profileImage'], 1000.0, 'user', 'active', 0, '[]', date('c'), 'Marketplace']);
            
            $user_stmt->execute([$email]);
            $new_user = $user_stmt->fetch();
            echo json_encode(['status' => 'success', 'user' => $new_user]);
        }
        break;

    case 'update_auth_config':
        $stmt = $db->prepare("UPDATE config SET value = ? WHERE key = 'auth_config'");
        $stmt->execute([json_encode($input)]);
        echo json_encode(['status' => 'success']);
        break;

    case 'place_bid':
        $id = 'bid_' . bin2hex(random_bytes(4));
        $stmt = $db->prepare("INSERT INTO bids (id, leadId, userId, bidAmount, leadsPerDay, totalDailyCost, timestamp, status, buyerBusinessUrl, buyerTargetLeadUrl, leadTitle) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$id, $input['leadId'], $input['userId'], $input['bidAmount'], $input['leadsPerDay'], $input['totalDailyCost'], date('Y-m-d H:i:s'), 'pending', $input['buyerBusinessUrl'], $input['buyerTargetLeadUrl'], $input['leadTitle']]);
        
        // Update lead metrics
        $db->prepare("UPDATE leads SET currentBid = ?, bidCount = bidCount + 1 WHERE id = ?")->execute([$input['bidAmount'], $input['leadId']]);
        
        // Deduct from balance
        $db->prepare("UPDATE users SET balance = balance - ?, totalSpend = totalSpend + ? WHERE id = ?")->execute([$input['totalDailyCost'], $input['totalDailyCost'], $input['userId']]);
        
        // Log withdrawal
        $tx_id = 'tx_' . bin2hex(random_bytes(4));
        $db->prepare("INSERT INTO wallet_activities (id, userId, type, amount, provider, timestamp, status) VALUES (?,?,?,?,?,?,?)")
           ->execute([$tx_id, $input['userId'], 'withdrawal', $input['totalDailyCost'], 'MARKET_ACQUISITION', date('Y-m-d H:i:s'), 'completed']);
        
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

    case 'delete_lead':
        $db->prepare("DELETE FROM leads WHERE id = ?")->execute([$input['id']]);
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

    case 'create_lead':
        $id = 'lead_' . bin2hex(random_bytes(4));
        $stmt = $db->prepare("INSERT INTO leads (id, title, category, description, businessUrl, targetLeadUrl, basePrice, currentBid, bidCount, timeLeft, qualityScore, sellerRating, status, countryCode, region, ownerId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$id, $input['title'], $input['category'], $input['description'], $input['businessUrl'], $input['targetLeadUrl'], $input['basePrice'], $input['basePrice'], 0, '24h 0m', $input['qualityScore'], 5.0, 'approved', $input['countryCode'], $input['region'], $input['ownerId']]);
        echo json_encode(['status' => 'success']);
        break;

    case 'authenticate_user':
        $user = $db->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?");
        $user->execute([$input['username'], $input['username'], $input['token']]);
        $found = $user->fetch();
        if ($found) {
            $db->prepare("UPDATE users SET last_active_at = ?, current_page = 'Authentication' WHERE id = ?")->execute([date('c'), $found['id']]);
        }
        echo json_encode(['status' => 'success', 'user' => $found ?: null]);
        break;

    case 'register_user':
        $id = 'u_' . bin2hex(random_bytes(4));
        $stmt = $db->prepare("INSERT INTO users (id, name, email, username, password, phone, ipAddress, deviceInfo, balance, role, status, stripeConnected, wishlist, last_active_at, current_page) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$id, $input['name'], $email, $input['username'], $input['password'], $input['phone'], $input['ipAddress'], $input['deviceInfo'], 1000.0, 'user', 'active', 0, '[]', date('c'), 'Registration']);
        $user_stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $user_stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'user' => $user_stmt->fetch()]);
        break;

    case 'deposit':
        $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$input['amount'], $input['userId']]);
        
        $id = 'tx_' . bin2hex(random_bytes(4));
        $type = $input['amount'] >= 0 ? 'deposit' : 'withdrawal';
        $abs_amount = abs($input['amount']);
        $provider = $input['provider'] ?? 'SYSTEM_SYNC';
        
        $stmt = $db->prepare("INSERT INTO wallet_activities (id, userId, type, amount, provider, timestamp, status) VALUES (?,?,?,?,?,?,?)");
        $stmt->execute([$id, $input['userId'], $type, $abs_amount, $provider, date('Y-m-d H:i:s'), 'completed']);
        
        echo json_encode(['status' => 'success']);
        break;

    case 'clear_notifications':
        $db->exec("DELETE FROM notifications");
        echo json_encode(['status' => 'success']);
        break;

    case 'update_gateways':
        $db->prepare("DELETE FROM api_nodes WHERE type='payment'")->execute();
        foreach($input['gateways'] as $gw) {
            $stmt = $db->prepare("INSERT INTO api_nodes (id, type, provider, name, publicKey, secretKey, fee, status) VALUES (?,?,?,?,?,?,?,?)");
            $stmt->execute([$gw['id'], 'payment', $gw['provider'], $gw['name'], $gw['publicKey'], $gw['secretKey'], $gw['fee'], $gw['status']]);
        }
        echo json_encode(['status' => 'success']);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'ACTION_NOT_FOUND']);
        break;
}
?>
