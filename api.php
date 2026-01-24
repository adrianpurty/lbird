<?php
/**
 * LeadBid Pro - AI Data Node (SQLite3 Implementation)
 * Provides ACID-compliant persistence for high-frequency lead bidding.
 */
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$db_path = __DIR__ . '/leadbid.sqlite';
$is_new = !file_exists($db_path);

try {
    $db = new PDO("sqlite:$db_path");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    if ($is_new) {
        // Initialize AI Data Node Tables
        $db->exec("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)");
        $db->exec("CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, name TEXT, username TEXT, password TEXT, 
            email TEXT, balance REAL, role TEXT, stripeConnected INTEGER, 
            wishlist TEXT, bio TEXT, profileImage TEXT, phone TEXT,
            location TEXT, deviceInfo TEXT, companyWebsite TEXT, 
            industryFocus TEXT, preferredContact TEXT,
            defaultBusinessUrl TEXT, defaultTargetUrl TEXT
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY, title TEXT, category TEXT, description TEXT,
            businessUrl TEXT, targetLeadUrl TEXT, basePrice REAL,
            currentBid REAL, bidCount INTEGER, timeLeft TEXT,
            qualityScore INTEGER, sellerRating REAL, status TEXT,
            countryCode TEXT, region TEXT, ownerId TEXT
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS bids (
            id TEXT PRIMARY KEY, leadId TEXT, userId TEXT, bidAmount REAL,
            leadsPerDay INTEGER, totalDailyCost REAL, timestamp TEXT,
            status TEXT, buyerBusinessUrl TEXT, buyerTargetLeadUrl TEXT
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY, purchaseRequestId TEXT, userId TEXT,
            userName TEXT, leadTitle TEXT, category TEXT, unitPrice REAL,
            dailyVolume INTEGER, totalSettlement REAL, timestamp TEXT, status TEXT
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY, userId TEXT, message TEXT, type TEXT,
            timestamp TEXT, read INTEGER
        )");

        // Seed Admin Identity
        $db->prepare("INSERT INTO users (id, name, username, password, email, balance, role, stripeConnected, wishlist) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
           ->execute(['admin_1', 'System Administrator', 'admin', '1234', 'admin@leadbid.pro', 1000000, 'admin', 1, '[]']);

        // Seed Global Config
        $auth_defaults = json_encode(['googleEnabled' => false, 'googleClientId' => '', 'googleClientSecret' => '', 'facebookEnabled' => false, 'facebookAppId' => '', 'facebookAppSecret' => '']);
        $db->prepare("INSERT INTO config (key, value) VALUES (?, ?)")->execute(['auth_config', $auth_defaults]);
        
        $gateway_defaults = json_encode([['id' => 'gw_stripe_primary', 'name' => 'Stripe Master Node', 'provider' => 'stripe', 'publicKey' => 'pk_test_sample', 'secretKey' => 'sk_test_sample', 'fee' => '2.5', 'status' => 'active']]);
        $db->prepare("INSERT INTO config (key, value) VALUES (?, ?)")->execute(['gateways', $gateway_defaults]);

        // Seed Initial Lead Inventory
        $seeds = [
            ['lead_seed_1', 'SBA 7(a) Funding - Tech Sector', 'Business Loans (MCA)', 'Verified SMB owners looking for SBA funding.', 'https://capital-flow.com', 'https://google.com/search?q=sba+loans', 85, 95, 12, '14h 22m', 94, 4.9, 'approved', 'US', 'California', 'admin_1'],
            ['lead_seed_2', 'Residential Solar - SoCal', 'Solar Energy (Residential)', 'Verified San Diego homeowners.', 'https://sun-solar.net', 'https://fb.com/ads', 45, 52, 8, '8h 10m', 88, 4.7, 'approved', 'US', 'California', 'admin_1'],
            ['lead_seed_3', 'MVA Personal Injury - NY', 'Personal Injury (MVA)', 'High-intent organic accident inquiries.', 'https://ny-legal.com', 'https://legal-finder.org', 150, 210, 24, '2h 45m', 98, 5.0, 'approved', 'US', 'New York', 'admin_1']
        ];
        $stmt = $db->prepare("INSERT INTO leads (id, title, category, description, businessUrl, targetLeadUrl, basePrice, currentBid, bidCount, timeLeft, qualityScore, sellerRating, status, countryCode, region, ownerId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        foreach($seeds as $s) $stmt->execute($s);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'DATABASE_NODE_OFFLINE', 'message' => $e->getMessage()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_data':
        $leads = $db->query("SELECT * FROM leads")->fetchAll();
        $users = $db->query("SELECT * FROM users")->fetchAll();
        foreach($users as &$u) $u['wishlist'] = json_decode($u['wishlist'] ?: '[]', true);
        $bids = $db->query("SELECT * FROM bids")->fetchAll();
        $invoices = $db->query("SELECT * FROM invoices")->fetchAll();
        $notifications = $db->query("SELECT * FROM notifications")->fetchAll();
        
        $authConfig = json_decode($db->query("SELECT value FROM config WHERE key='auth_config'")->fetchColumn(), true);
        $gateways = json_decode($db->query("SELECT value FROM config WHERE key='gateways'")->fetchColumn(), true);

        echo json_encode([
            'metadata' => ['version' => '3.0.0-SQLITE', 'last_updated' => date('Y-m-d H:i:s'), 'db_size' => filesize($db_path)],
            'leads' => $leads,
            'users' => $users,
            'purchaseRequests' => $bids,
            'invoices' => $invoices,
            'notifications' => $notifications,
            'authConfig' => $authConfig,
            'gateways' => $gateways,
            'analytics' => [
                'totalVolume' => (float)$db->query("SELECT SUM(totalSettlement) FROM invoices")->fetchColumn() ?: 0,
                'activeTraders' => (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn(),
                'avgCPA' => (float)$db->query("SELECT AVG(unitPrice) FROM invoices")->fetchColumn() ?: 145,
                'successRate' => 99,
                'revenueHistory' => [['date' => 'Mon', 'value' => 500], ['date' => 'Tue', 'value' => 800], ['date' => 'Wed', 'value' => 1200]]
            ]
        ]);
        break;

    case 'authenticate_user':
        $user = $db->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?");
        $user->execute([$input['username'], $input['username'], $input['token']]);
        $found = $user->fetch();
        if ($found) $found['wishlist'] = json_decode($found['wishlist'] ?: '[]', true);
        echo json_encode(['status' => $found ? 'success' : 'error', 'user' => $found]);
        break;

    case 'update_user':
        $userId = $input['id'];
        unset($input['id']);
        $fields = [];
        $values = [];
        foreach($input as $k => $v) {
            if ($k === 'wishlist') $v = json_encode($v);
            $fields[] = "$k = ?";
            $values[] = $v;
        }
        $values[] = $userId;
        $db->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
        echo json_encode(['status' => 'success']);
        break;

    case 'place_bid':
        $db->beginTransaction();
        try {
            $user = $db->prepare("SELECT balance FROM users WHERE id = ?");
            $user->execute([$input['userId']]);
            $balance = $user->fetchColumn();

            if ($balance < $input['totalDailyCost']) throw new Exception("INSUFFICIENT_LIQUIDITY");

            // Update Balance
            $db->prepare("UPDATE users SET balance = balance - ? WHERE id = ?")->execute([$input['totalDailyCost'], $input['userId']]);
            
            // Update Lead
            $db->prepare("UPDATE leads SET currentBid = ?, bidCount = bidCount + 1 WHERE id = ?")->execute([$input['bidAmount'], $input['leadId']]);
            
            // Log Bid
            $bidId = 'bid_' . bin2hex(random_bytes(4));
            $timestamp = date('Y-m-d H:i:s');
            $db->prepare("INSERT INTO bids (id, leadId, userId, bidAmount, leadsPerDay, totalDailyCost, timestamp, status, buyerBusinessUrl, buyerTargetLeadUrl) VALUES (?,?,?,?,?,?,?,?,?,?)")
               ->execute([$bidId, $input['leadId'], $input['userId'], $input['bidAmount'], $input['leadsPerDay'], $input['totalDailyCost'], $timestamp, 'approved', $input['buyerBusinessUrl'], $input['buyerTargetLeadUrl']]);
            
            // Create Invoice
            $invId = 'INV-' . strtoupper(bin2hex(random_bytes(3)));
            $lead = $db->prepare("SELECT title, category FROM leads WHERE id = ?"); $lead->execute([$input['leadId']]); $l = $lead->fetch();
            $uName = $db->prepare("SELECT name FROM users WHERE id = ?"); $uName->execute([$input['userId']]); $un = $uName->fetchColumn();

            $db->prepare("INSERT INTO invoices (id, purchaseRequestId, userId, userName, leadTitle, category, unitPrice, dailyVolume, totalSettlement, timestamp, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
               ->execute([$invId, $bidId, $input['userId'], $un, $l['title'], $l['category'], $input['bidAmount'], $input['leadsPerDay'], $input['totalDailyCost'], $timestamp, 'paid']);

            $db->commit();
            echo json_encode(['status' => 'success']);
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'create_lead':
        $input['id'] = 'lead_' . bin2hex(random_bytes(4));
        $input['status'] = 'approved';
        $input['bidCount'] = 0;
        $input['currentBid'] = $input['basePrice'];
        $input['timeLeft'] = '24h 0m';
        $input['sellerRating'] = 5.0;
        $fields = array_keys($input);
        $placeholders = array_fill(0, count($fields), '?');
        $db->prepare("INSERT INTO leads (" . implode(',', $fields) . ") VALUES (" . implode(',', $placeholders) . ")")
           ->execute(array_values($input));
        echo json_encode(['status' => 'success']);
        break;

    case 'deposit':
        $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$input['amount'], $input['userId']]);
        echo json_encode(['status' => 'success']);
        break;

    case 'toggle_wishlist':
        $user = $db->prepare("SELECT wishlist FROM users WHERE id = ?");
        $user->execute([$input['userId']]);
        $wishlist = json_decode($user->fetchColumn() ?: '[]', true);
        $idx = array_search($input['leadId'], $wishlist);
        if ($idx !== false) array_splice($wishlist, $idx, 1);
        else $wishlist[] = $input['leadId'];
        $db->prepare("UPDATE users SET wishlist = ? WHERE id = ?")->execute([json_encode($wishlist), $input['userId']]);
        echo json_encode(['status' => 'success']);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'ACTION_NOT_FOUND']);
        break;
}
?>