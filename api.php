<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$db_file = 'database.json';

function init_db($file) {
    $default_data = [
        'metadata' => [
            'version' => '1.9.0',
            'last_updated' => date('Y-m-d H:i:s')
        ],
        'categories' => [
            'Flight Tickets (International)', 'Flight Tickets (Domestic)', 'Luxury Cruise Packages', 
            'Hotel & Resort Bookings', 'Car Rental Inquiries', 'Vacation Rental Bookings', 
            'Timeshare Exit / Relief', 'Adventure Travel Tours', 'Destination Weddings',
            'Residential Home Sales', 'Residential Rentals', 'Commercial Real Estate Leasing', 
            'Property Management', 'Airbnb Arbitrage Opportunities', 'Real Estate Investing (Fix/Flip)',
            'New Construction Homes', 'Foreclosure Leads', 'Mortgage Refinance',
            'Business Loans (MCA)', 'SBA Loan Inquiries', 'Crypto Investment Leads', 'Stock Market Trading',
            'Gold & Silver IRA', 'Debt Settlement', 'Credit Repair', 'Tax Debt Relief', 'Student Loan Relief',
            'Personal Injury (MVA)', 'Mass Tort (Camp Lejeune)', 'Mass Tort (Talcum Powder)', 'Divorce & Family Law',
            'Immigration Legal Services', 'Worker\'s Comp Inquiries', 'Social Security Disability', 'Bankruptcy Filings',
            'Solar Energy (Residential)', 'Solar Energy (Commercial)', 'HVAC Repair/Replace', 'Roofing Services',
            'Plumbing & Drain', 'Water Damage Restoration', 'Pest Control', 'Home Security Systems',
            'Moving & Storage', 'Kitchen & Bath Remodeling', 'Landscape Design',
            'Managed IT Services (MSP)', 'Cybersecurity SaaS', 'CRM / ERP Software Inquiries', 'Cloud Infrastructure',
            'Digital Marketing / SEO', 'HR & Payroll Services', 'Logistics & Freight Shipping', 'VOIP / PBX Systems',
            'Dental Implants', 'Weight Loss (GLP-1/Ozempic)', 'Medical Tourism', 'Mental Health / Therapy',
            'Senior In-Home Care', 'Addiction Rehab / Recovery', 'Hearing Aid Leads', 'Plastic Surgery Inquiries',
            'Online Degree Programs', 'Trade School / Vocational', 'Coding Bootcamps', 'CDL Driver Training',
            'Nursing & Healthcare Training'
        ],
        'leads' => [
            [
                'id' => 'lead_it_1',
                'title' => 'Managed Cybersecurity SaaS Inbound',
                'category' => 'Cybersecurity SaaS',
                'description' => 'High-intent B2B inquiries looking for endpoint protection. Average deal size $15k ARR.',
                'businessUrl' => 'https://saas-it-leads.com',
                'targetLeadUrl' => 'https://ads.google.com/campaign/cybersecurity',
                'basePrice' => 125,
                'currentBid' => 145,
                'bidCount' => 12,
                'timeLeft' => '18h 45m',
                'qualityScore' => 94,
                'sellerRating' => 4.9,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_travel_maldives',
                'title' => 'Direct Maldives Villa Booking Leads',
                'category' => 'Hotel & Resort Bookings',
                'description' => 'High-intent honeymooners and luxury travelers looking for overwater villas in the Maldives. Average spend $12k+.',
                'businessUrl' => 'https://maldives-luxe.travel',
                'targetLeadUrl' => 'https://ads.google.com/maldives-resorts',
                'basePrice' => 65,
                'currentBid' => 78,
                'bidCount' => 15,
                'timeLeft' => '12h 10m',
                'qualityScore' => 96,
                'sellerRating' => 5.0,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ]
        ],
        'users' => [
            [
                'id' => 'admin_1',
                'name' => 'System Administrator',
                'email' => 'admin@leadbid.pro',
                'balance' => 1000000,
                'stripeConnected' => true,
                'role' => 'admin',
                'wishlist' => []
            ],
            [
                'id' => 'user_mock',
                'name' => 'Standard Trader',
                'email' => 'user@example.com',
                'balance' => 5000,
                'stripeConnected' => false,
                'role' => 'user',
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
           'revenueHistory' => [
               ['date' => 'Mon', 'value' => 12500],
               ['date' => 'Tue', 'value' => 15000],
               ['date' => 'Wed', 'value' => 11000],
               ['date' => 'Thu', 'value' => 18500],
               ['date' => 'Fri', 'value' => 22000],
               ['date' => 'Sat', 'value' => 14000],
               ['date' => 'Sun', 'value' => 9500]
           ]
        ],
        'authConfig' => [ 
            'googleEnabled' => false, 
            'googleClientId' => '', 
            'googleClientSecret' => '', 
            'facebookEnabled' => false, 
            'facebookAppId' => '', 
            'facebookAppSecret' => '' 
        ],
        'gateways' => []
    ];

    if (!file_exists($file)) {
        file_put_contents($file, json_encode($default_data, JSON_PRETTY_PRINT));
        return $default_data;
    }

    $raw = file_get_contents($file);
    $data = json_decode($raw, true);
    if (!$data) return $default_data;

    $data['categories'] = $default_data['categories'];
    if (!isset($data['leads'])) $data['leads'] = [];
    if (!isset($data['invoices'])) $data['invoices'] = [];
    
    return $data;
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

    case 'get_categories':
        $cats = $db['categories'] ?? [];
        sort($cats);
        echo json_encode($cats);
        break;

    case 'place_bid':
        if ($input && isset($input['userId']) && isset($input['leadId']) && isset($input['bidAmount'])) {
            $userId = $input['userId'];
            $leadId = $input['leadId'];
            $bidAmount = (float)$input['bidAmount'];
            $totalCost = (float)$input['totalDailyCost'];
            $leadsPerDay = (int)($input['leadsPerDay'] ?? 1);

            $userIndex = -1;
            foreach ($db['users'] as $i => $u) { if ($u['id'] === $userId) { $userIndex = $i; break; } }
            $leadIndex = -1;
            foreach ($db['leads'] as $i => $l) { if ($l['id'] === $leadId) { $leadIndex = $i; break; } }

            if ($userIndex === -1 || $leadIndex === -1) {
                echo json_encode(['status' => 'error', 'message' => 'Node not found.']);
                break;
            }
            if ($db['users'][$userIndex]['balance'] < $totalCost) {
                echo json_encode(['status' => 'error', 'message' => 'Insufficient node credits.']);
                break;
            }
            if ($bidAmount <= $db['leads'][$leadIndex]['currentBid']) {
                echo json_encode(['status' => 'error', 'message' => 'Bid must exceed floor price.']);
                break;
            }

            $requestId = 'req_' . bin2hex(random_bytes(4));
            $timestamp = date('Y-m-d H:i:s');

            $db['users'][$userIndex]['balance'] -= $totalCost;
            $db['leads'][$leadIndex]['currentBid'] = $bidAmount;
            $db['leads'][$leadIndex]['bidCount']++;
            $db['purchaseRequests'][] = [
                'id' => $requestId,
                'userId' => $userId,
                'leadId' => $leadId,
                'bidAmount' => $bidAmount,
                'leadsPerDay' => $leadsPerDay,
                'totalDailyCost' => $totalCost,
                'timestamp' => $timestamp,
                'status' => 'approved'
            ];

            // Generate Invoice automatically
            $db['invoices'][] = [
                'id' => 'INV-' . strtoupper(bin2hex(random_bytes(3))),
                'purchaseRequestId' => $requestId,
                'userId' => $userId,
                'userName' => $db['users'][$userIndex]['name'],
                'leadTitle' => $db['leads'][$leadIndex]['title'],
                'category' => $db['leads'][$leadIndex]['category'],
                'unitPrice' => $bidAmount,
                'dailyVolume' => $leadsPerDay,
                'totalSettlement' => $totalCost,
                'timestamp' => $timestamp,
                'status' => 'paid'
            ];

            $db['notifications'][] = [
                'id' => 'notif_' . bin2hex(random_bytes(4)),
                'userId' => $db['leads'][$leadIndex]['ownerId'] ?? 'admin_1',
                'message' => "Order Secured & Invoiced: \${$bidAmount}/unit bid on '{$db['leads'][$leadIndex]['title']}'",
                'type' => 'buy',
                'timestamp' => 'Just now',
                'read' => false
            ];
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'create_lead':
        if ($input) {
            $input['id'] = 'lead_' . bin2hex(random_bytes(4));
            $input['status'] = 'pending';
            $input['bidCount'] = 0;
            $input['currentBid'] = (float)($input['basePrice'] ?? 50);
            $input['timeLeft'] = '24h 0m';
            $input['sellerRating'] = 5.0;
            $input['countryCode'] = $input['countryCode'] ?? 'US';
            $db['leads'][] = $input;
            save_db($db);
            echo json_encode(['status' => 'success', 'lead' => $input]);
        }
        break;

    case 'toggle_wishlist':
        if ($input && isset($input['userId']) && isset($input['leadId'])) {
            foreach ($db['users'] as &$u) {
                if ($u['id'] === $input['userId']) {
                    $u['wishlist'] = $u['wishlist'] ?? [];
                    $index = array_search($input['leadId'], $u['wishlist']);
                    if ($index !== false) { array_splice($u['wishlist'], $index, 1); } 
                    else { $u['wishlist'][] = $input['leadId']; }
                    break;
                }
            }
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'update_lead':
        if ($input && isset($input['id'])) {
            foreach ($db['leads'] as &$lead) {
                if ($lead['id'] === $input['id']) { $lead = array_merge($lead, $input); break; }
            }
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'delete_lead':
        $id = $_GET['id'] ?? '';
        $db['leads'] = array_values(array_filter($db['leads'], function($l) use ($id) { return $l['id'] !== $id; }));
        save_db($db);
        echo json_encode(['status' => 'success']);
        break;

    case 'deposit':
        if ($input && isset($input['userId']) && isset($input['amount'])) {
            foreach ($db['users'] as &$u) {
                if ($u['id'] === $input['userId']) { $u['balance'] += (float)$input['amount']; break; }
            }
            save_db($db);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'clear_notifications':
        foreach ($db['notifications'] as &$n) { $n['read'] = true; }
        save_db($db);
        echo json_encode(['status' => 'success']);
        break;

    default:
        echo json_encode(['error' => 'Invalid action requested.']);
        break;
}
