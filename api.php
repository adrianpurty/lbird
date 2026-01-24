<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$db_file = 'database.json';

function init_db($file) {
    $default_data = [
        'metadata' => [
            'version' => '2.1.1',
            'last_updated' => date('Y-m-d H:i:s')
        ],
        'leads' => [],
        'users' => [
            [
                'id' => 'admin_1',
                'name' => 'System Administrator',
                'username' => 'admin',
                'password' => '1234',
                'email' => 'admin@leadbid.pro',
                'balance' => 1000000,
                'stripeConnected' => true,
                'role' => 'admin',
                'wishlist' => []
            ]
        ],
        'purchaseRequests' => [],
        'invoices' => [],
        'notifications' => [],
        'analytics' => [
           'totalVolume' => 2450000,
           'activeTraders' => 1850,
           'avgCPA' => 145,
           'successRate' => 98,
           'revenueHistory' => []
        ],
        'authConfig' => [ 
            'googleEnabled' => false, 'googleClientId' => '', 'googleClientSecret' => '', 
            'facebookEnabled' => false, 'facebookAppId' => '', 'facebookAppSecret' => '' 
        ],
        'gateways' => [
            [
                'id' => 'gw_stripe_primary',
                'name' => 'Stripe Master Node',
                'provider' => 'stripe',
                'publicKey' => 'pk_test_sample',
                'secretKey' => 'sk_test_sample',
                'fee' => '2.5',
                'status' => 'active'
            ]
        ]
    ];

    if (!file_exists($file)) {
        file_put_contents($file, json_encode($default_data, JSON_PRETTY_PRINT));
        return $default_data;
    }

    $raw = file_get_contents($file);
    $data = json_decode($raw, true);
    return $data ?: $default_data;
}

function get_db() {
    global $db_file;
    return init_db($db_file);
}

function save_db($data) {
    global $db_file;
    $data['metadata']['last_updated'] = date('Y-m-d H:i:s');
    file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT));
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';
$db = get_db();

switch ($action) {
    case 'get_data':
        echo json_encode($db);
        break;

    case 'register_user':
        if ($input) {
            $username = $input['username'] ?? '';
            $email = $input['email'] ?? '';
            foreach ($db['users'] as $u) {
                if ($u['username'] === $username || $u['email'] === $email) {
                    echo json_encode(['status' => 'error', 'message' => 'Identity collision']);
                    exit;
                }
            }
            $newUser = array_merge([
                'id' => bin2hex(random_bytes(4)),
                'balance' => 100,
                'stripeConnected' => false,
                'role' => 'user',
                'wishlist' => []
            ], $input);
            $db['users'][] = $newUser;
            save_db($db);
            echo json_encode(['status' => 'success', 'user' => $newUser]);
        }
        break;

    case 'authenticate_user':
        if ($input) {
            $username = $input['username'] ?? '';
            $token = $input['token'] ?? '';
            if ($username === 'admin' && $token === '1234') {
                echo json_encode(['status' => 'success', 'user' => [
                    'id' => 'admin_1', 'name' => 'System Administrator', 'username' => 'admin',
                    'password' => '1234', 'email' => 'admin@leadbid.pro', 'balance' => 1000000,
                    'stripeConnected' => true, 'role' => 'admin', 'wishlist' => []
                ]]);
                exit;
            }
            $found = null;
            foreach ($db['users'] as $u) {
                if (($u['username'] === $username || $u['email'] === $username) && $u['password'] === $token) {
                    $found = $u; break;
                }
            }
            echo json_encode(['status' => $found ? 'success' : 'error', 'user' => $found]);
        }
        break;

    case 'update_auth_config':
        if ($input) {
            $db['authConfig'] = [
                'googleEnabled' => (bool)($input['googleEnabled'] ?? false),
                'googleClientId' => (string)($input['googleClientId'] ?? ''),
                'googleClientSecret' => (string)($input['googleClientSecret'] ?? ''),
                'facebookEnabled' => (bool)($input['facebookEnabled'] ?? false),
                'facebookAppId' => (string)($input['facebookAppId'] ?? ''),
                'facebookAppSecret' => (string)($input['facebookAppSecret'] ?? '')
            ];
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'update_user':
        if ($input && isset($input['id'])) {
            foreach ($db['users'] as &$u) {
                if ($u['id'] === $input['id']) {
                    if ($u['username'] === 'admin') {
                        unset($input['password']); unset($input['role']); unset($input['username']);
                    }
                    $u = array_merge($u, $input);
                    break;
                }
            }
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'update_gateways':
        if ($input && isset($input['gateways'])) {
            $db['gateways'] = $input['gateways'];
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'place_bid':
        if ($input && isset($input['userId']) && isset($input['leadId'])) {
            $userIndex = -1;
            foreach ($db['users'] as $i => $u) { if ($u['id'] === $input['userId']) { $userIndex = $i; break; } }
            $leadIndex = -1;
            foreach ($db['leads'] as $i => $l) { if ($l['id'] === $input['leadId']) { $leadIndex = $i; break; } }
            if ($userIndex === -1 || $leadIndex === -1) { echo json_encode(['status' => 'error']); break; }
            $totalCost = (float)$input['totalDailyCost'];
            if ($db['users'][$userIndex]['balance'] < $totalCost) { echo json_encode(['status' => 'error']); break; }

            $db['users'][$userIndex]['balance'] -= $totalCost;
            $db['leads'][$leadIndex]['currentBid'] = (float)$input['bidAmount'];
            $db['leads'][$leadIndex]['bidCount']++;
            $requestId = 'req_' . bin2hex(random_bytes(4));
            $timestamp = date('Y-m-d H:i:s');
            $db['purchaseRequests'][] = [
                'id' => $requestId, 'userId' => $input['userId'], 'leadId' => $input['leadId'],
                'bidAmount' => $input['bidAmount'], 'leadsPerDay' => $input['leadsPerDay'],
                'totalDailyCost' => $totalCost, 'timestamp' => $timestamp, 'status' => 'approved',
                'buyerBusinessUrl' => $input['buyerBusinessUrl'], 'buyerTargetLeadUrl' => $input['buyerTargetLeadUrl']
            ];
            $db['invoices'][] = [
                'id' => 'INV-' . strtoupper(bin2hex(random_bytes(3))), 'purchaseRequestId' => $requestId,
                'userId' => $input['userId'], 'userName' => $db['users'][$userIndex]['name'],
                'leadTitle' => $db['leads'][$leadIndex]['title'], 'category' => $db['leads'][$leadIndex]['category'],
                'unitPrice' => $input['bidAmount'], 'dailyVolume' => $input['leadsPerDay'],
                'totalSettlement' => $totalCost, 'timestamp' => $timestamp, 'status' => 'paid'
            ];
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'create_lead':
        if ($input) {
            $input['id'] = 'lead_' . bin2hex(random_bytes(4));
            $input['status'] = 'approved';
            $input['bidCount'] = 0;
            $input['currentBid'] = (float)($input['basePrice'] ?? 50);
            $input['timeLeft'] = '24h 0m';
            $input['sellerRating'] = 5.0;
            $db['leads'][] = $input;
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'update_lead':
        if ($input && isset($input['id'])) {
            foreach ($db['leads'] as &$l) {
                if ($l['id'] === $input['id']) { $l = array_merge($l, $input); break; }
            }
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'delete_lead':
        if ($input && isset($input['id'])) {
            $id = $input['id'];
            $db['leads'] = array_values(array_filter($db['leads'], function($l) use ($id) { return $l['id'] !== $id; }));
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'deposit':
        if ($input && isset($input['userId'])) {
            foreach ($db['users'] as &$u) {
                if ($u['id'] === $input['userId']) { $u['balance'] += (float)$input['amount']; break; }
            }
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'toggle_wishlist':
        if ($input && isset($input['userId'])) {
            foreach ($db['users'] as &$u) {
                if ($u['id'] === $input['userId']) {
                    $u['wishlist'] = $u['wishlist'] ?? [];
                    $idx = array_search($input['leadId'], $u['wishlist']);
                    if ($idx !== false) array_splice($u['wishlist'], $idx, 1);
                    else $u['wishlist'][] = $input['leadId'];
                    break;
                }
            }
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'clear_notifications':
        foreach ($db['notifications'] as &$n) $n['read'] = true;
        save_db($db);
        echo json_encode(['status' => 'success']);
        break;

    default:
        echo json_encode(['error' => 'Action unrecognized.']);
        break;
}
?>