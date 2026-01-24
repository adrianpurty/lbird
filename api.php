<?php
/**
 * LeadBid Pro - Enterprise AI Data Node (SQLite3)
 * Full Persistence Layer for Leads, Users, Bids, and API Gateways.
 */
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Origin: *');
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
        // 1. System Config
        $db->exec("CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT)");
        
        // 2. User Identities
        $db->exec("CREATE TABLE users (
            id TEXT PRIMARY KEY, name TEXT, username TEXT, password TEXT, 
            email TEXT, balance REAL, role TEXT, stripeConnected INTEGER, 
            wishlist TEXT, bio TEXT, profileImage TEXT, phone TEXT,
            location TEXT, deviceInfo TEXT, companyWebsite TEXT, 
            industryFocus TEXT, preferredContact TEXT,
            defaultBusinessUrl TEXT, defaultTargetUrl TEXT
        )");

        // 3. Lead Assets
        $db->exec("CREATE TABLE leads (
            id TEXT PRIMARY KEY, title TEXT, category TEXT, description TEXT,
            businessUrl TEXT, targetLeadUrl TEXT, basePrice REAL,
            currentBid REAL, bidCount INTEGER, timeLeft TEXT,
            qualityScore INTEGER, sellerRating REAL, status TEXT,
            countryCode TEXT, region TEXT, ownerId TEXT
        )");

        // 4. Bidding & Purchase Requests
        $db->exec("CREATE TABLE bids (
            id TEXT PRIMARY KEY, leadId TEXT, userId TEXT, bidAmount REAL,
            leadsPerDay INTEGER, totalDailyCost REAL, timestamp TEXT,
            status TEXT, buyerBusinessUrl TEXT, buyerTargetLeadUrl TEXT
        )");

        // 5. Financial Ledger (Invoices)
        $db->exec("CREATE TABLE invoices (
            id TEXT PRIMARY KEY, purchaseRequestId TEXT, userId TEXT,
            userName TEXT, leadTitle TEXT, category TEXT, unitPrice REAL,
            dailyVolume INTEGER, totalSettlement REAL, timestamp TEXT, status TEXT
        )");

        // 6. Real-time Notifications
        $db->exec("CREATE TABLE notifications (
            id TEXT PRIMARY KEY, userId TEXT, message TEXT, type TEXT,
            timestamp TEXT, read INTEGER DEFAULT 0
        )");

        // 7. Dynamic Categories (Niches)
        $db->exec("CREATE TABLE categories (
            id TEXT PRIMARY KEY, name TEXT, group_name TEXT
        )");

        // 8. API Gateway / OAuth Nodes
        $db->exec("CREATE TABLE api_nodes (
            id TEXT PRIMARY KEY, type TEXT, provider TEXT, name TEXT,
            publicKey TEXT, secretKey TEXT, fee TEXT, status TEXT
        )");

        // 9. Audit Logs (System Events)
        $db->exec("CREATE TABLE audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT, action TEXT,
            details TEXT, timestamp TEXT
        )");

        // --- SEEDING INITIAL DATA ---
        $db->prepare("INSERT INTO users (id, name, username, password, email, balance, role, stripeConnected, wishlist) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
           ->execute(['admin_1', 'System Administrator', 'admin', '1234', 'admin@leadbid.pro', 1000000, 'admin', 1, '[]']);

        $auth_defaults = json_encode(['googleEnabled' => false, 'googleClientId' => '', 'googleClientSecret' => '', 'facebookEnabled' => false, 'facebookAppId' => '', 'facebookAppSecret' => '']);
        $db->prepare("INSERT INTO config (key, value) VALUES (?, ?)")->execute(['auth_config', $auth_defaults]);

        $db->prepare("INSERT INTO api_nodes (id, type, provider, name, publicKey, secretKey, fee, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
           ->execute(['gw_stripe_primary', 'payment', 'stripe', 'Stripe Master Node', 'pk_test_sample', 'sk_test_sample', '2.5', 'active']);

        $cat_seeds = [
            ['c1', 'International Flights', 'Travel'], 
            ['c2', 'Luxury Cruises', 'Travel'],
            ['c3', 'Resort Bookings', 'Travel'], 
            ['c4', 'Crypto Trading', 'Finance'],
            ['c5', 'Debt Settlement', 'Finance'], 
            ['c6', 'Cybersecurity SaaS', 'B2B'],
            ['c7', 'Medical Aesthetics', 'Health'], 
            ['c8', 'Dental Care', 'Health'],
            ['c9', 'Mortgage Leads', 'Finance'], 
            ['c10', 'HVAC Repair', 'Home Services']
        ];
        $cat_stmt = $db->prepare("INSERT INTO categories (id, name, group_name) VALUES (?,?,?)");
        foreach($cat_seeds as $c) $cat_stmt->execute($c);

        // --- SEEDING 10 TRAVEL INDUSTRY LEADS ---
        $lead_seeds = [
            ['l1', 'First Class: NYC to London', 'International Flights', 'Executive travelers looking for last-minute first class bookings between JFK and LHR. High-intent business travel segment.', 'https://sky-luxury.com', 'https://travel-ads.net/f-class', 150, 450, 15, '10h 30m', 95, 4.9, 'approved', 'US', 'New York', 'admin_1'],
            ['l2', 'Private Overwater Villa (Maldives)', 'Resort Bookings', 'Honeymooners and luxury seekers looking for 7-night stays at premium Maldivian resorts. Direct inbound inquiries.', 'https://maldives-escapes.io', 'https://resort-leads.pro/villa', 80, 210, 8, '14h 15m', 91, 4.7, 'approved', 'MV', 'Male', 'admin_1'],
            ['l3', 'Mediterranean Yacht Charter', 'Luxury Cruises', 'High net-worth group seeking private crewed yacht charters along the Amalfi Coast. Average budget $80k+.', 'https://azure-charters.com', 'https://yacht-ads.co/med', 300, 850, 5, '6h 45m', 98, 5.0, 'approved', 'IT', 'Amalfi', 'admin_1'],
            ['l4', 'Serengeti Safari Expedition', 'Resort Bookings', 'Nature enthusiasts looking for all-inclusive luxury safari camps in Tanzania. High quality Score with full intent validation.', 'https://safari-gold.tz', 'https://africa-leads.net/safari', 45, 120, 12, '18h 0m', 89, 4.5, 'approved', 'TZ', 'Serengeti', 'admin_1'],
            ['l5', 'Antarctica Expedition Cruise', 'Luxury Cruises', 'Adventure travelers seeking end-of-season expedition cruises to Antarctica on boutique research-style vessels.', 'https://polar-voyages.com', 'https://expedition-ads.io/polar', 500, 1450, 3, '4h 20m', 97, 4.9, 'approved', 'AR', 'Ushuaia', 'admin_1'],
            ['l6', 'Business Class: Dubai to Paris', 'International Flights', 'Frequent corporate travelers seeking flat-bed comfort for Dubai (DXB) to Paris (CDG) routes. Verified industry traffic.', 'https://emirates-deals.ae', 'https://sky-leads.pro/biz', 120, 380, 20, '8h 15m', 93, 4.6, 'approved', 'AE', 'Dubai', 'admin_1'],
            ['l7', 'Exclusive Aspen Ski Chalet', 'Resort Bookings', 'Group booking for winter 2024 season. Seeking ski-in/ski-out luxury accommodation with private chef services.', 'https://aspen-snow.com', 'https://chalet-ads.net/aspen', 95, 310, 10, '22h 45m', 88, 4.4, 'approved', 'US', 'Colorado', 'admin_1'],
            ['l8', 'Caribbean Island Private Buyout', 'Resort Bookings', 'Corporate retreat seekers looking for exclusive island buyouts in the BVI for high-level summits.', 'https://island-nodes.io', 'https://corp-travel.ads/buyout', 1000, 3500, 2, '2h 0m', 99, 5.0, 'approved', 'VG', 'Tortola', 'admin_1'],
            ['l9', 'Orient Express Luxury Rail', 'International Flights', 'Travelers looking for the classic Paris to Istanbul rail journey in Grand Suites. High-ticket travel niche.', 'https://rail-luxe.eu', 'https://eu-leads.pro/rail', 250, 680, 6, '12h 10m', 92, 4.8, 'approved', 'FR', 'Paris', 'admin_1'],
            ['l10', 'Galapagos Island Hopper Cruise', 'Luxury Cruises', 'Eco-travelers seeking boutique small-ship cruises through the Galapagos archipelago with expert naturalists.', 'https://ecuador-nature.com', 'https://eco-travel.ads/galapagos', 180, 420, 14, '9h 30m', 90, 4.6, 'approved', 'EC', 'Galapagos', 'admin_1']
        ];
        $lead_stmt = $db->prepare("INSERT INTO leads (id, title, category, description, businessUrl, targetLeadUrl, basePrice, currentBid, bidCount, timeLeft, qualityScore, sellerRating, status, countryCode, region, ownerId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        foreach($lead_seeds as $l) $lead_stmt->execute($l);
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
        $gateways = $db->query("SELECT * FROM api_nodes WHERE type='payment'")->fetchAll();
        $authConfig = json_decode($db->query("SELECT value FROM config WHERE key='auth_config'")->fetchColumn(), true);

        echo json_encode([
            'metadata' => [
                'version' => '4.1.0-PRO',
                'last_updated' => date('Y-m-d H:i:s'),
                'db_size' => file_exists($db_path) ? filesize($db_path) : 0,
                'status' => 'OPERATIONAL'
            ],
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
                'avgCPA' => 145,
                'revenueHistory' => [['date' => 'Mon', 'value' => 500], ['date' => 'Tue', 'value' => 800], ['date' => 'Wed', 'value' => 1200]]
            ]
        ]);
        break;

    case 'get_categories':
        $rows = $db->query("SELECT * FROM categories")->fetchAll();
        $cats = [];
        foreach($rows as $r) {
            if (!isset($cats[$r['group_name']])) $cats[$r['group_name']] = [];
            $cats[$r['group_name']][] = $r['name'];
        }
        echo json_encode($cats);
        break;

    case 'authenticate_user':
        $user = $db->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?");
        $user->execute([$input['username'], $input['username'], $input['token']]);
        $found = $user->fetch();
        if ($found) $found['wishlist'] = json_decode($found['wishlist'] ?: '[]', true);
        echo json_encode(['status' => 'success', 'user' => $found ?: null]);
        break;

    case 'register_user':
        $input['id'] = bin2hex(random_bytes(4));
        $input['balance'] = 1000;
        $input['role'] = 'user';
        $input['stripeConnected'] = 0;
        $input['wishlist'] = '[]';
        $fields = array_keys($input);
        $placeholders = array_fill(0, count($fields), '?');
        $db->prepare("INSERT INTO users (" . implode(',', $fields) . ") VALUES (" . implode(',', $placeholders) . ")")
           ->execute(array_values($input));
        $user = $db->prepare("SELECT * FROM users WHERE id = ?");
        $user->execute([$input['id']]);
        $found = $user->fetch();
        $found['wishlist'] = json_decode($found['wishlist'], true);
        echo json_encode(['status' => 'success', 'user' => $found]);
        break;

    case 'update_gateways':
        $db->exec("DELETE FROM api_nodes WHERE type='payment'");
        $stmt = $db->prepare("INSERT INTO api_nodes (id, type, provider, name, publicKey, secretKey, fee, status) VALUES (?,?,?,?,?,?,?,?)");
        foreach($input['gateways'] as $gw) {
            $stmt->execute([$gw['id'], 'payment', $gw['provider'], $gw['name'], $gw['publicKey'], $gw['secretKey'], $gw['fee'], $gw['status']]);
        }
        $db->prepare("INSERT INTO audit_logs (action, details, timestamp) VALUES (?, ?, ?)")
           ->execute(['GATEWAY_UPDATE', 'API Nodes for financial gateways were re-provisioned.', date('Y-m-d H:i:s')]);
        echo json_encode(['status' => 'success']);
        break;

    case 'update_auth_config':
        $db->prepare("UPDATE config SET value = ? WHERE key = 'auth_config'")->execute([json_encode($input)]);
        $db->prepare("INSERT INTO audit_logs (action, details, timestamp) VALUES (?, ?, ?)")
           ->execute(['AUTH_CONFIG_UPDATE', 'OAuth infrastructure credentials were updated.', date('Y-m-d H:i:s')]);
        echo json_encode(['status' => 'success']);
        break;

    case 'create_lead':
        $input['id'] = 'lead_' . bin2hex(random_bytes(4));
        $input['status'] = 'approved';
        $input['bidCount'] = 0;
        $input['currentBid'] = $input['basePrice'];
        $input['timeLeft'] = '24h 0m';
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