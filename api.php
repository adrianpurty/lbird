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
            'version' => '2.1.0-2026-RELEASE',
            'last_updated' => '2026-01-15 09:00:00'
        ],
        'leads' => [
            [
                'id' => 'lead_2026_1',
                'title' => 'AI Governance & Ethics Audit - Enterprise',
                'category' => 'Cybersecurity SaaS',
                'description' => 'Fortune 500 companies seeking compliance audits for their internal LLM deployments. Focus on bias mitigation and data privacy.',
                'businessUrl' => 'https://ai-governance-solutions.io',
                'targetLeadUrl' => 'https://linkedin.com/ads/ai-compliance-2026',
                'basePrice' => 350,
                'currentBid' => 410,
                'bidCount' => 8,
                'timeLeft' => '14h 20m',
                'qualityScore' => 97,
                'sellerRating' => 5.0,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_2',
                'title' => 'Quantum-Safe Encryption Migration',
                'category' => 'Managed IT Services (MSP)',
                'description' => 'Financial institutions requesting roadmaps for Post-Quantum Cryptography (PQC) transitions.',
                'businessUrl' => 'https://quantum-shield.tech',
                'targetLeadUrl' => 'https://google.com/search?q=quantum+resistant+security',
                'basePrice' => 500,
                'currentBid' => 585,
                'bidCount' => 12,
                'timeLeft' => '09h 45m',
                'qualityScore' => 94,
                'sellerRating' => 4.9,
                'status' => 'approved',
                'countryCode' => 'UK',
                'region' => 'Europe',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_3',
                'title' => 'Hydrogen Home Fuel Cell Installation',
                'category' => 'Solar Energy (Residential)',
                'description' => 'Off-grid enthusiasts in the Pacific Northwest seeking residential hydrogen storage solutions for 24/7 clean power.',
                'businessUrl' => 'https://h2-home-power.net',
                'targetLeadUrl' => 'https://youtube.com/ads/clean-energy-future',
                'basePrice' => 120,
                'currentBid' => 145,
                'bidCount' => 15,
                'timeLeft' => '1d 02h',
                'qualityScore' => 89,
                'sellerRating' => 4.7,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Washington',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_4',
                'title' => 'Space Tourism Personal Injury & Liability',
                'category' => 'Personal Injury (MVA)',
                'description' => 'First-to-market legal inquiries regarding orbital flight sub-standard G-force exposure and commercial space-port incidents.',
                'businessUrl' => 'https://orbit-legal-group.com',
                'targetLeadUrl' => 'https://instagram.com/p/space-travel-safety',
                'basePrice' => 850,
                'currentBid' => 1050,
                'bidCount' => 5,
                'timeLeft' => '22h 10m',
                'qualityScore' => 99,
                'sellerRating' => 5.0,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_5',
                'title' => 'Longevity Clinic Franchisee Inquiries',
                'category' => 'Medical Tourism',
                'description' => 'Investors looking to open "Bio-Hacking" and regenerative medicine clinics in high-density metro areas.',
                'businessUrl' => 'https://eternal-vitality-clinics.com',
                'targetLeadUrl' => 'https://facebook.com/ads/longevity-investing',
                'basePrice' => 200,
                'currentBid' => 245,
                'bidCount' => 22,
                'timeLeft' => '05h 30m',
                'qualityScore' => 91,
                'sellerRating' => 4.8,
                'status' => 'approved',
                'countryCode' => 'AE',
                'region' => 'Middle East',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_6',
                'title' => 'Vertical Farming Automation - B2B',
                'category' => 'SBA Loan Inquiries',
                'description' => 'Existing farm operators looking for loans to retrofit legacy greenhouses with robotic harvesting systems.',
                'businessUrl' => 'https://agro-bot-systems.com',
                'targetLeadUrl' => 'https://linkedin.com/ads/agtech-2026',
                'basePrice' => 75,
                'currentBid' => 92,
                'bidCount' => 19,
                'timeLeft' => '11h 15m',
                'qualityScore' => 86,
                'sellerRating' => 4.5,
                'status' => 'approved',
                'countryCode' => 'NL',
                'region' => 'Europe',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_7',
                'title' => 'Neuro-Link Interface Privacy Consultation',
                'category' => 'Divorce & Family Law',
                'description' => 'Legal inquiries regarding personal data exfiltration from brain-computer interfaces in matrimonial disputes.',
                'businessUrl' => 'https://neural-privacy-law.org',
                'targetLeadUrl' => 'https://twitter.com/ads/neuro-rights',
                'basePrice' => 300,
                'currentBid' => 325,
                'bidCount' => 7,
                'timeLeft' => '18h 40m',
                'qualityScore' => 93,
                'sellerRating' => 4.9,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_8',
                'title' => 'Holographic Telepresence Setup - Remote SMB',
                'category' => 'VOIP / PBX Systems',
                'description' => 'Mid-sized companies requesting quotes for 3D holographic meeting systems for executive remote teams.',
                'businessUrl' => 'https://holosync-comm.com',
                'targetLeadUrl' => 'https://reddit.com/r/futureofwork',
                'basePrice' => 110,
                'currentBid' => 130,
                'bidCount' => 14,
                'timeLeft' => '07h 55m',
                'qualityScore' => 88,
                'sellerRating' => 4.6,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_9',
                'title' => 'Carbon Capture Credit Portfolio Management',
                'category' => 'Crypto Investment Leads',
                'description' => 'Corporate ESG officers seeking tokenized carbon capture asset management for Net-Zero compliance.',
                'businessUrl' => 'https://carbon-block-advisors.io',
                'targetLeadUrl' => 'https://whitepaper.com/esg-carbon-market',
                'basePrice' => 190,
                'currentBid' => 220,
                'bidCount' => 11,
                'timeLeft' => '15h 05m',
                'qualityScore' => 95,
                'sellerRating' => 4.9,
                'status' => 'approved',
                'countryCode' => 'CH',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_10',
                'title' => 'Deep-Sea Rare Earth Mineral Leasing',
                'category' => 'Commercial Real Estate Leasing',
                'description' => 'Mining conglomerates seeking consultation on international seabed mineral lease acquisition.',
                'businessUrl' => 'https://abyssal-minerals-group.net',
                'targetLeadUrl' => 'https://industry-explorer.com/ocean-mining',
                'basePrice' => 600,
                'currentBid' => 750,
                'bidCount' => 4,
                'timeLeft' => '2d 10h',
                'qualityScore' => 92,
                'sellerRating' => 5.0,
                'status' => 'approved',
                'countryCode' => 'SG',
                'region' => 'Asia Pacific',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_11',
                'title' => 'Lab-Grown Wagyu Distribution - B2B',
                'category' => 'Luxury Cruise Packages',
                'description' => 'Premium cruise lines and Michelin restaurants requesting stable supply chains for cellular-agriculture Wagyu.',
                'businessUrl' => 'https://prime-cell-meats.com',
                'targetLeadUrl' => 'https://luxury-food-tech.net',
                'basePrice' => 85,
                'currentBid' => 105,
                'bidCount' => 25,
                'timeLeft' => '06h 45m',
                'qualityScore' => 90,
                'sellerRating' => 4.7,
                'status' => 'approved',
                'countryCode' => 'JP',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_12',
                'title' => 'Metaverse Commercial Property Design',
                'category' => 'Real Estate Investing (Fix/Flip)',
                'description' => 'Retail brands looking for architects to design "Virtual Flagship" stores on the Decentraland-2 protocol.',
                'businessUrl' => 'https://meta-space-design.io',
                'targetLeadUrl' => 'https://discord.com/metaverse-creators',
                'basePrice' => 45,
                'currentBid' => 65,
                'bidCount' => 31,
                'timeLeft' => '12h 30m',
                'qualityScore' => 84,
                'sellerRating' => 4.4,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Virtual',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_13',
                'title' => 'EV Drone Delivery Fleet Insurance',
                'category' => 'Personal Injury (MVA)',
                'description' => 'Logistics startups seeking liability coverage for last-mile autonomous drone delivery fleets.',
                'businessUrl' => 'https://sky-shield-insurance.com',
                'targetLeadUrl' => 'https://bing.com/search?q=drone+fleet+coverage',
                'basePrice' => 160,
                'currentBid' => 185,
                'bidCount' => 9,
                'timeLeft' => '08h 15m',
                'qualityScore' => 91,
                'sellerRating' => 4.8,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_14',
                'title' => 'Smart City Infrastructure - IoT Security',
                'category' => 'Managed IT Services (MSP)',
                'description' => 'Municipalities looking for integrated traffic and utility sensor network security audits.',
                'businessUrl' => 'https://urban-secure-city.org',
                'targetLeadUrl' => 'https://govtech-summit.com',
                'basePrice' => 250,
                'currentBid' => 310,
                'bidCount' => 6,
                'timeLeft' => '1d 08h',
                'qualityScore' => 96,
                'sellerRating' => 4.9,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_15',
                'title' => 'Sustainable Fashion Supply Chain Audit',
                'category' => 'Digital Marketing / SEO',
                'description' => 'Fashion labels seeking blockchain-verified traceability for their organic and recycled material sourcing.',
                'businessUrl' => 'https://eco-trace-fashion.com',
                'targetLeadUrl' => 'https://vogue-business.com/sustainability',
                'basePrice' => 60,
                'currentBid' => 78,
                'bidCount' => 18,
                'timeLeft' => '05h 50m',
                'qualityScore' => 87,
                'sellerRating' => 4.6,
                'status' => 'approved',
                'countryCode' => 'FR',
                'region' => 'Europe',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_16',
                'title' => 'Micro-Mobility Startup SBA Loan',
                'category' => 'SBA Loan Inquiries',
                'description' => 'Electric bike sharing operators in Tier-2 cities seeking expansion capital for 2026 rollout.',
                'businessUrl' => 'https://bolt-micro-move.com',
                'targetLeadUrl' => 'https://facebook.com/ads/smart-transport',
                'basePrice' => 50,
                'currentBid' => 62,
                'bidCount' => 12,
                'timeLeft' => '10h 40m',
                'qualityScore' => 83,
                'sellerRating' => 4.5,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'North America',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_17',
                'title' => 'Digital Estate Planning - Inheritance Token',
                'category' => 'Bankruptcy Filings',
                'description' => 'High-net-worth individuals seeking secure transfer protocols for digital assets and NFT property to heirs.',
                'businessUrl' => 'https://legacy-vault-crypto.net',
                'targetLeadUrl' => 'https://wealth-management-pro.com',
                'basePrice' => 140,
                'currentBid' => 165,
                'bidCount' => 14,
                'timeLeft' => '1d 04h',
                'qualityScore' => 94,
                'sellerRating' => 4.8,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_18',
                'title' => 'Holistic Burnout Retreats - Corporate HR',
                'category' => 'Mental Health / Therapy',
                'description' => 'HR departments of remote-first companies seeking high-end wellness retreats for employee mental health.',
                'businessUrl' => 'https://sanctuary-wellness-retreats.com',
                'targetLeadUrl' => 'https://linkedin.com/ads/hr-wellness',
                'basePrice' => 90,
                'currentBid' => 115,
                'bidCount' => 20,
                'timeLeft' => '04h 25m',
                'qualityScore' => 88,
                'sellerRating' => 4.7,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_19',
                'title' => 'Private Data Privacy Vaults - B2C',
                'category' => 'Cybersecurity SaaS',
                'description' => 'Privacy-conscious consumers seeking encrypted localized storage for their AI-companion data logs.',
                'businessUrl' => 'https://my-data-fortress.com',
                'targetLeadUrl' => 'https://tiktok.com/ads/privacy-tech',
                'basePrice' => 30,
                'currentBid' => 42,
                'bidCount' => 45,
                'timeLeft' => '16h 15m',
                'qualityScore' => 85,
                'sellerRating' => 4.6,
                'status' => 'approved',
                'countryCode' => 'US',
                'region' => 'Global',
                'ownerId' => 'admin_1'
            ],
            [
                'id' => 'lead_2026_20',
                'title' => 'Biotech Longevity Research Partnership',
                'category' => 'Medical Tourism',
                'description' => 'Pharma companies seeking partnerships with clinics for clinical trials of senescence-clearing drugs.',
                'businessUrl' => 'https://ageless-labs-research.io',
                'targetLeadUrl' => 'https://nature-biotech-journal.com',
                'basePrice' => 400,
                'currentBid' => 480,
                'bidCount' => 8,
                'timeLeft' => '3d 02h',
                'qualityScore' => 96,
                'sellerRating' => 5.0,
                'status' => 'approved',
                'countryCode' => 'DE',
                'region' => 'Europe',
                'ownerId' => 'admin_1'
            ]
        ],
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
           'revenueHistory' => [
               ['date' => 'Mon', 'value' => 12500], ['date' => 'Tue', 'value' => 15000],
               ['date' => 'Wed', 'value' => 11000], ['date' => 'Thu', 'value' => 18500],
               ['date' => 'Fri', 'value' => 22000], ['date' => 'Sat', 'value' => 14000],
               ['date' => 'Sun', 'value' => 9500]
           ]
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
    $db = init_db($db_file);
    
    // PERMANENT ADMIN ENFORCEMENT
    $admin_found = false;
    foreach ($db['users'] as &$u) {
        if ($u['username'] === 'admin') {
            $u['password'] = '1234'; // Never change
            $u['role'] = 'admin';    // Never change
            $u['id'] = 'admin_1';
            $admin_found = true;
            break;
        }
    }
    
    if (!$admin_found) {
        $db['users'][] = [
            'id' => 'admin_1',
            'name' => 'System Administrator',
            'username' => 'admin',
            'password' => '1234',
            'email' => 'admin@leadbid.pro',
            'balance' => 1000000,
            'stripeConnected' => true,
            'role' => 'admin',
            'wishlist' => []
        ];
    }
    
    return $db;
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
            
            if (strtolower($username) === 'admin') {
                echo json_encode(['status' => 'error', 'message' => 'Identity collision: Admin Node is fixed.']);
                exit;
            }

            foreach ($db['users'] as $u) {
                if ($u['username'] === $username || $u['email'] === $email) {
                    echo json_encode(['status' => 'error', 'message' => 'Identity already provisioned.']);
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
                    'id' => 'admin_1',
                    'name' => 'System Administrator',
                    'username' => 'admin',
                    'password' => '1234',
                    'email' => 'admin@leadbid.pro',
                    'balance' => 1000000,
                    'stripeConnected' => true,
                    'role' => 'admin',
                    'wishlist' => []
                ]]);
                exit;
            }

            $found = null;
            foreach ($db['users'] as $u) {
                if (($u['username'] === $username || $u['email'] === $username) && $u['password'] === $token) {
                    $found = $u;
                    break;
                }
            }
            echo json_encode(['status' => $found ? 'success' : 'error', 'user' => $found]);
        }
        break;

    case 'update_auth_config':
        if ($input) {
            // Update the authConfig block directly with the submitted data
            $db['authConfig'] = [
                'googleEnabled' => (bool)($input['googleEnabled'] ?? false),
                'googleClientId' => (string)($input['googleClientId'] ?? ''),
                'googleClientSecret' => (string)($input['googleClientSecret'] ?? ''),
                'facebookEnabled' => (bool)($input['facebookEnabled'] ?? false),
                'facebookAppId' => (string)($input['facebookAppId'] ?? ''),
                'facebookAppSecret' => (string)($input['facebookAppSecret'] ?? '')
            ];
            save_db($db);
            echo json_encode(['status' => 'success', 'message' => 'Identity Infrastructure Updated']);
        }
        break;

    case 'update_user':
        if ($input && isset($input['id'])) {
            foreach ($db['users'] as &$u) {
                if ($u['id'] === $input['id']) {
                    if ($u['username'] === 'admin') {
                        // Protect admin credentials even during bulk updates
                        unset($input['password']);
                        unset($input['role']);
                        unset($input['username']);
                    }
                    $u = array_merge($u, $input);
                    break;
                }
            }
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

            if ($userIndex === -1 || $leadIndex === -1) {
                echo json_encode(['status' => 'error', 'message' => 'Node Offline']);
                break;
            }

            $totalCost = (float)$input['totalDailyCost'];
            if ($db['users'][$userIndex]['balance'] < $totalCost) {
                echo json_encode(['status' => 'error', 'message' => 'Insufficient Credits']);
                break;
            }

            $db['users'][$userIndex]['balance'] -= $totalCost;
            $db['leads'][$leadIndex]['currentBid'] = (float)$input['bidAmount'];
            $db['leads'][$leadIndex]['bidCount']++;

            $requestId = 'req_' . bin2hex(random_bytes(4));
            $timestamp = date('Y-m-d H:i:s');

            $db['purchaseRequests'][] = [
                'id' => $requestId,
                'userId' => $input['userId'],
                'leadId' => $input['leadId'],
                'bidAmount' => $input['bidAmount'],
                'leadsPerDay' => $input['leadsPerDay'],
                'totalDailyCost' => $totalCost,
                'timestamp' => $timestamp,
                'status' => 'approved',
                'buyerBusinessUrl' => $input['buyerBusinessUrl'],
                'buyerTargetLeadUrl' => $input['buyerTargetLeadUrl'],
                'leadTitle' => $db['leads'][$leadIndex]['title'],
                'userName' => $db['users'][$userIndex]['name']
            ];

            $db['invoices'][] = [
                'id' => 'INV-' . strtoupper(bin2hex(random_bytes(3))),
                'purchaseRequestId' => $requestId,
                'userId' => $input['userId'],
                'userName' => $db['users'][$userIndex]['name'],
                'leadTitle' => $db['leads'][$leadIndex]['title'],
                'category' => $db['leads'][$leadIndex]['category'],
                'unitPrice' => $input['bidAmount'],
                'dailyVolume' => $input['leadsPerDay'],
                'totalSettlement' => $totalCost,
                'timestamp' => $timestamp,
                'status' => 'paid'
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

    case 'update_gateways':
        if ($input && isset($input['gateways'])) {
            $db['gateways'] = $input['gateways'];
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