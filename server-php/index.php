<?php
/**
 * Genting Services & Contracting W.L.L. - Core REST API Router (PHP)
 * Provides 100% endpoint compatibility with Node.js backend
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/db.php';

// Resolve Route
$route = '';
if (isset($_GET['route']) && !empty($_GET['route'])) {
    $route = trim($_GET['route'], '/');
} else {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $script_dir = dirname($_SERVER['SCRIPT_NAME']);
    if ($script_dir !== '/' && strpos($uri, $script_dir) === 0) {
        $uri = substr($uri, strlen($script_dir));
    }
    $route = trim($uri, '/');
    if (strpos($route, 'api/') === 0) {
        $route = substr($route, 4);
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$raw_input = file_get_contents('php://input');
$input = json_decode($raw_input, true) ?: $_POST;

// Split route segments
$segments = explode('/', $route);
$resource = $segments[0] ?? '';
$param1 = $segments[1] ?? '';
$param2 = $segments[2] ?? '';

// Auth helper
function require_auth() {
    $token = get_bearer_token();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not authorized: No token provided in authorization header']);
        exit;
    }
    $user = verify_jwt($token);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not authorized: Invalid or expired access token']);
        exit;
    }
    return $user;
}

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

// 1. HEALTH CHECK: GET /api/health or GET /api
if ($resource === 'health' || $resource === '') {
    echo json_encode([
        'status' => 'ok',
        'name' => 'Genting Services & Contracting W.L.L. - REST API',
        'version' => '1.0.0',
        'location' => 'Doha, Qatar',
        'database' => [
            'status' => $GLOBALS['db_connected'] ? 'Connected' : 'Local Resilient Storage (Active)',
            'engine' => $GLOBALS['db_connected'] ? 'MySQL / MariaDB' : 'Resilient File Storage',
            'host' => DB_HOST,
            'database' => DB_NAME
        ],
        'endpoint' => '/api',
        'system' => 'GSC Production PHP/MySQL Engine',
        'uptime' => 'Active',
        'docs' => [
            'health' => '/api/health',
            'quotes' => '/api/quotes',
            'contacts' => '/api/contacts',
            'projects' => '/api/projects',
            'auth' => '/api/auth'
        ]
    ]);
    exit;
}

// 2. AUTH ROUTES: /api/auth/*
if ($resource === 'auth') {
    if ($param1 === 'login' && $method === 'POST') {
        $email = trim(strtolower($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please enter your email and password']);
            exit;
        }

        // Check MySQL Database
        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM `gsc_users` WHERE `email` = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                $payload = [
                    'id' => (string)$user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'] ?? 'admin'
                ];
                $token = generate_jwt($payload);
                echo json_encode([
                    'success' => true,
                    'message' => 'Authentication successful',
                    'token' => $token,
                    'user' => $payload
                ]);
                exit;
            }
        }

        // Fallback default admin credentials
        if ($email === DEFAULT_ADMIN_EMAIL && $password === DEFAULT_ADMIN_PASS) {
            $payload = [
                'id' => 'admin_1',
                'name' => 'GSC System Administrator',
                'email' => DEFAULT_ADMIN_EMAIL,
                'role' => 'admin'
            ];
            $token = generate_jwt($payload);
            echo json_encode([
                'success' => true,
                'message' => 'Authentication successful (Admin Portal)',
                'token' => $token,
                'user' => $payload
            ]);
            exit;
        }

        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password credentials']);
        exit;
    }

    if ($param1 === 'register' && $method === 'POST') {
        $name = trim($input['name'] ?? '');
        $email = trim(strtolower($input['email'] ?? ''));
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'admin';

        if (empty($name) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name, email, and password are required']);
            exit;
        }

        if ($GLOBALS['db_connected']) {
            $check = $GLOBALS['pdo']->prepare("SELECT id FROM `gsc_users` WHERE `email` = ?");
            $check->execute([$email]);
            if ($check->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'An account with this email already exists']);
                exit;
            }

            $hash = password_hash($password, PASSWORD_BCRYPT);
            $ins = $GLOBALS['pdo']->prepare("INSERT INTO `gsc_users` (`name`, `email`, `password`, `role`) VALUES (?, ?, ?, ?)");
            $ins->execute([$name, $email, $hash, $role]);
            $newId = (string)$GLOBALS['pdo']->lastInsertId();

            $payload = ['id' => $newId, 'name' => $name, 'email' => $email, 'role' => $role];
            echo json_encode([
                'success' => true,
                'message' => 'Administrator registered successfully',
                'token' => generate_jwt($payload),
                'user' => $payload
            ]);
            exit;
        }

        http_response_code(201);
        $payload = ['id' => 'usr_' . time(), 'name' => $name, 'email' => $email, 'role' => $role];
        echo json_encode([
            'success' => true,
            'message' => 'Administrator registered (Local)',
            'token' => generate_jwt($payload),
            'user' => $payload
        ]);
        exit;
    }

    if ($param1 === 'me' && $method === 'GET') {
        $user = require_auth();
        echo json_encode(['success' => true, 'user' => $user]);
        exit;
    }
}

// 3. QUOTES ROUTES: /api/quotes/*
if ($resource === 'quotes') {
    // TRACK QUOTE: GET /api/quotes/track/{referenceId}
    if ($param1 === 'track' && !empty($param2) && $method === 'GET') {
        $ref = strtoupper($param2);

        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM `gsc_quotes` WHERE UPPER(`referenceId`) = ?");
            $stmt->execute([$ref]);
            $quote = $stmt->fetch();
            if ($quote) {
                $quote['_id'] = (string)$quote['id'];
                $quote['createdAt'] = $quote['created_at'];
                echo json_encode(['success' => true, 'quote' => $quote]);
                exit;
            }
        } else {
            $stored = read_json_store('quotes.json');
            foreach ($stored as $q) {
                if (strtoupper($q['referenceId'] ?? '') === $ref) {
                    echo json_encode(['success' => true, 'quote' => $q]);
                    exit;
                }
            }
        }

        http_response_code(404);
        echo json_encode(['success' => false, 'message' => "Quote with reference $ref not found"]);
        exit;
    }

    // CREATE QUOTE: POST /api/quotes
    if (empty($param1) && $method === 'POST') {
        $name = trim($input['name'] ?? '');
        $company = trim($input['company'] ?? '');
        $email = trim(strtolower($input['email'] ?? ''));
        $phone = trim($input['phone'] ?? '');
        $service = $input['service'] ?? '';
        $location = $input['location'] ?? '';
        $contractType = $input['contractType'] ?? 'One-Time Project';
        $timeline = $input['timeline'] ?? 'Immediately (Within 48 hours)';
        $notes = trim($input['notes'] ?? '');

        if (empty($name) || empty($email) || empty($phone) || empty($service) || empty($location) || empty($notes)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Please fill in all required fields (Name, Email, Phone, Service, Location, Notes).'
            ]);
            exit;
        }

        $referenceId = 'GSC-' . rand(100000, 999999);
        $now = date('Y-m-d H:i:s');

        $quoteRecord = [
            'referenceId' => $referenceId,
            'name' => $name,
            'company' => $company,
            'email' => $email,
            'phone' => $phone,
            'service' => $service,
            'location' => $location,
            'contractType' => $contractType,
            'timeline' => $timeline,
            'notes' => $notes,
            'status' => 'Pending',
            'adminNotes' => '',
            'estimatedBudget' => '',
            'created_at' => $now,
            'updated_at' => $now,
            'createdAt' => $now
        ];

        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("INSERT INTO `gsc_quotes` 
                (`referenceId`, `name`, `company`, `email`, `phone`, `service`, `location`, `contractType`, `timeline`, `notes`, `status`, `adminNotes`, `estimatedBudget`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', '', '')");
            $stmt->execute([
                $referenceId, $name, $company, $email, $phone, $service, $location, $contractType, $timeline, $notes
            ]);
            $quoteRecord['id'] = (int)$GLOBALS['pdo']->lastInsertId();
            $quoteRecord['_id'] = (string)$quoteRecord['id'];
        } else {
            $quoteRecord['_id'] = 'qt_' . time();
            $stored = read_json_store('quotes.json');
            array_unshift($stored, $quoteRecord);
            write_json_store('quotes.json', $stored);
        }

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Quote request submitted successfully to Genting Services & Contracting W.L.L.',
            'referenceId' => $referenceId,
            'quote' => $quoteRecord
        ]);
        exit;
    }

    // GET ALL QUOTES (ADMIN): GET /api/quotes
    if (empty($param1) && $method === 'GET') {
        require_auth();
        $status = $_GET['status'] ?? 'All';
        $search = trim($_GET['search'] ?? '');
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $offset = ($page - 1) * $limit;

        if ($GLOBALS['db_connected']) {
            $where = [];
            $params = [];

            if ($status !== 'All') {
                $where[] = "`status` = ?";
                $params[] = $status;
            }
            if (!empty($search)) {
                $where[] = "(`referenceId` LIKE ? OR `name` LIKE ? OR `email` LIKE ? OR `company` LIKE ? OR `service` LIKE ?)";
                $like = "%$search%";
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
            }

            $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
            
            $countStmt = $GLOBALS['pdo']->prepare("SELECT COUNT(*) FROM `gsc_quotes` $whereSql");
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            $sql = "SELECT * FROM `gsc_quotes` $whereSql ORDER BY `id` DESC LIMIT $limit OFFSET $offset";
            $dataStmt = $GLOBALS['pdo']->prepare($sql);
            $dataStmt->execute($params);
            $quotes = $dataStmt->fetchAll();

            foreach ($quotes as &$q) {
                $q['_id'] = (string)$q['id'];
                $q['createdAt'] = $q['created_at'];
            }

            echo json_encode([
                'success' => true,
                'count' => count($quotes),
                'total' => $total,
                'page' => $page,
                'pages' => ceil($total / $limit) ?: 1,
                'quotes' => $quotes
            ]);
            exit;
        } else {
            $stored = read_json_store('quotes.json');
            $filtered = [];
            foreach ($stored as $q) {
                if ($status !== 'All' && ($q['status'] ?? '') !== $status) continue;
                if (!empty($search)) {
                    $s = strtolower($search);
                    $matched = (
                        strpos(strtolower($q['referenceId'] ?? ''), $s) !== false ||
                        strpos(strtolower($q['name'] ?? ''), $s) !== false ||
                        strpos(strtolower($q['email'] ?? ''), $s) !== false ||
                        strpos(strtolower($q['service'] ?? ''), $s) !== false
                    );
                    if (!$matched) continue;
                }
                $filtered[] = $q;
            }
            $total = count($filtered);
            $paged = array_slice($filtered, $offset, $limit);
            echo json_encode([
                'success' => true,
                'count' => count($paged),
                'total' => $total,
                'page' => $page,
                'pages' => ceil($total / $limit) ?: 1,
                'quotes' => $paged
            ]);
            exit;
        }
    }

    // UPDATE QUOTE STATUS: PATCH /api/quotes/{id}
    if (!empty($param1) && ($method === 'PATCH' || $method === 'PUT')) {
        require_auth();
        $id = $param1;
        $status = $input['status'] ?? null;
        $adminNotes = $input['adminNotes'] ?? null;
        $estimatedBudget = $input['estimatedBudget'] ?? null;

        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM `gsc_quotes` WHERE `id` = ? OR `referenceId` = ?");
            $stmt->execute([$id, $id]);
            $quote = $stmt->fetch();
            if (!$quote) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Quote not found']);
                exit;
            }

            $fields = [];
            $vals = [];
            if ($status !== null) { $fields[] = "`status` = ?"; $vals[] = $status; }
            if ($adminNotes !== null) { $fields[] = "`adminNotes` = ?"; $vals[] = $adminNotes; }
            if ($estimatedBudget !== null) { $fields[] = "`estimatedBudget` = ?"; $vals[] = $estimatedBudget; }

            if (!empty($fields)) {
                $vals[] = $quote['id'];
                $updateStmt = $GLOBALS['pdo']->prepare("UPDATE `gsc_quotes` SET " . implode(", ", $fields) . " WHERE `id` = ?");
                $updateStmt->execute($vals);
            }

            $refresh = $GLOBALS['pdo']->prepare("SELECT * FROM `gsc_quotes` WHERE `id` = ?");
            $refresh->execute([$quote['id']]);
            $updatedQuote = $refresh->fetch();
            $updatedQuote['_id'] = (string)$updatedQuote['id'];
            $updatedQuote['createdAt'] = $updatedQuote['created_at'];

            echo json_encode([
                'success' => true,
                'message' => 'Quote status updated successfully',
                'quote' => $updatedQuote
            ]);
            exit;
        } else {
            $stored = read_json_store('quotes.json');
            $found = null;
            foreach ($stored as &$q) {
                if (($q['_id'] ?? '') === $id || ($q['referenceId'] ?? '') === $id) {
                    if ($status !== null) $q['status'] = $status;
                    if ($adminNotes !== null) $q['adminNotes'] = $adminNotes;
                    if ($estimatedBudget !== null) $q['estimatedBudget'] = $estimatedBudget;
                    $q['updatedAt'] = date('Y-m-d H:i:s');
                    $found = $q;
                    break;
                }
            }
            if ($found) {
                write_json_store('quotes.json', $stored);
                echo json_encode(['success' => true, 'message' => 'Quote updated', 'quote' => $found]);
                exit;
            }
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Quote not found']);
            exit;
        }
    }

    // DELETE QUOTE: DELETE /api/quotes/{id}
    if (!empty($param1) && $method === 'DELETE') {
        require_auth();
        $id = $param1;

        if ($GLOBALS['db_connected']) {
            $del = $GLOBALS['pdo']->prepare("DELETE FROM `gsc_quotes` WHERE `id` = ? OR `referenceId` = ?");
            $del->execute([$id, $id]);
            echo json_encode(['success' => true, 'message' => 'Quote deleted successfully']);
            exit;
        } else {
            $stored = read_json_store('quotes.json');
            $newStored = array_filter($stored, function($q) use ($id) {
                return ($q['_id'] ?? '') !== $id && ($q['referenceId'] ?? '') !== $id;
            });
            write_json_store('quotes.json', array_values($newStored));
            echo json_encode(['success' => true, 'message' => 'Quote deleted successfully']);
            exit;
        }
    }
}

// 4. CONTACTS ROUTES: /api/contacts/*
if ($resource === 'contacts') {
    // CREATE CONTACT: POST /api/contacts
    if (empty($param1) && $method === 'POST') {
        $name = trim($input['name'] ?? '');
        $email = trim(strtolower($input['email'] ?? ''));
        $phone = trim($input['phone'] ?? '');
        $subject = trim($input['subject'] ?? 'General Service Inquiry');
        $message = trim($input['message'] ?? '');

        if (empty($name) || empty($email) || empty($phone) || empty($message)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Please fill in Name, Email, Phone, and Message.'
            ]);
            exit;
        }

        $now = date('Y-m-d H:i:s');
        $contactRecord = [
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'subject' => $subject,
            'message' => $message,
            'status' => 'New',
            'created_at' => $now,
            'createdAt' => $now
        ];

        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("INSERT INTO `gsc_contacts` 
                (`name`, `email`, `phone`, `subject`, `message`, `status`) 
                VALUES (?, ?, ?, ?, ?, 'New')");
            $stmt->execute([$name, $email, $phone, $subject, $message]);
            $contactRecord['id'] = (int)$GLOBALS['pdo']->lastInsertId();
            $contactRecord['_id'] = (string)$contactRecord['id'];
        } else {
            $contactRecord['_id'] = 'cnt_' . time();
            $stored = read_json_store('contacts.json');
            array_unshift($stored, $contactRecord);
            write_json_store('contacts.json', $stored);
        }

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for reaching out! Our Doha office has received your message.',
            'contact' => $contactRecord
        ]);
        exit;
    }

    // GET ALL CONTACTS (ADMIN): GET /api/contacts
    if (empty($param1) && $method === 'GET') {
        require_auth();
        $status = $_GET['status'] ?? 'All';

        if ($GLOBALS['db_connected']) {
            if ($status !== 'All') {
                $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM `gsc_contacts` WHERE `status` = ? ORDER BY `id` DESC");
                $stmt->execute([$status]);
            } else {
                $stmt = $GLOBALS['pdo']->query("SELECT * FROM `gsc_contacts` ORDER BY `id` DESC");
            }
            $contacts = $stmt->fetchAll();
            foreach ($contacts as &$c) {
                $c['_id'] = (string)$c['id'];
                $c['createdAt'] = $c['created_at'];
            }
            echo json_encode([
                'success' => true,
                'count' => count($contacts),
                'contacts' => $contacts
            ]);
            exit;
        } else {
            $stored = read_json_store('contacts.json');
            if ($status !== 'All') {
                $stored = array_values(array_filter($stored, fn($c) => ($c['status'] ?? '') === $status));
            }
            echo json_encode([
                'success' => true,
                'count' => count($stored),
                'contacts' => $stored
            ]);
            exit;
        }
    }

    // UPDATE CONTACT STATUS: PATCH /api/contacts/{id}
    if (!empty($param1) && ($method === 'PATCH' || $method === 'PUT')) {
        require_auth();
        $id = $param1;
        $status = $input['status'] ?? 'In Progress';

        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("UPDATE `gsc_contacts` SET `status` = ? WHERE `id` = ?");
            $stmt->execute([$status, $id]);

            $fetch = $GLOBALS['pdo']->prepare("SELECT * FROM `gsc_contacts` WHERE `id` = ?");
            $fetch->execute([$id]);
            $updated = $fetch->fetch();
            if ($updated) {
                $updated['_id'] = (string)$updated['id'];
                $updated['createdAt'] = $updated['created_at'];
            }
            echo json_encode(['success' => true, 'contact' => $updated]);
            exit;
        } else {
            $stored = read_json_store('contacts.json');
            $found = null;
            foreach ($stored as &$c) {
                if (($c['_id'] ?? '') === $id || ($c['id'] ?? '') == $id) {
                    $c['status'] = $status;
                    $found = $c;
                    break;
                }
            }
            write_json_store('contacts.json', $stored);
            echo json_encode(['success' => true, 'contact' => $found]);
            exit;
        }
    }

    // DELETE CONTACT: DELETE /api/contacts/{id}
    if (!empty($param1) && $method === 'DELETE') {
        require_auth();
        $id = $param1;

        if ($GLOBALS['db_connected']) {
            $del = $GLOBALS['pdo']->prepare("DELETE FROM `gsc_contacts` WHERE `id` = ?");
            $del->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Contact deleted successfully']);
            exit;
        } else {
            $stored = read_json_store('contacts.json');
            $newStored = array_filter($stored, fn($c) => ($c['_id'] ?? '') !== $id && ($c['id'] ?? '') != $id);
            write_json_store('contacts.json', array_values($newStored));
            echo json_encode(['success' => true, 'message' => 'Contact deleted successfully']);
            exit;
        }
    }
}

// 5. PROJECTS ROUTES: /api/projects
if ($resource === 'projects') {
    if ($GLOBALS['db_connected']) {
        $stmt = $GLOBALS['pdo']->query("SELECT * FROM `gsc_projects` ORDER BY `id` ASC");
        $projects = $stmt->fetchAll();
        foreach ($projects as &$p) {
            $p['_id'] = $p['project_id'] ?? (string)$p['id'];
            if (!empty($p['scope']) && is_string($p['scope'])) {
                $decoded = json_decode($p['scope'], true);
                if (is_array($decoded)) $p['scope'] = $decoded;
            }
        }
        echo json_encode(['success' => true, 'projects' => $projects]);
        exit;
    } else {
        // Fallback projects
        $projects = [
            [
                '_id' => 'proj_1',
                'title' => 'Lusail Marina Commercial Tower',
                'category' => 'Commercial Facility',
                'service' => 'Cleaning & Hospitality',
                'location' => 'Lusail Marina, Doha',
                'client' => 'Lusail Real Estate',
                'year' => '2024',
                'imageUrl' => '/assets/cleaning-hospitality-CkHw0R7y.jpg',
                'description' => 'Full-scale corporate cleaning, deep sanitization, and hospitality staffing for a 32-story landmark tower.',
                'scope' => ['Daily Janitorial Services', 'High-Rise Façade Cleaning', 'Executive Hospitality Staff', 'Marble Polishing'],
                'stats' => '32 Floors • 100% SLA Met',
                'featured' => true
            ],
            [
                '_id' => 'proj_2',
                'title' => 'Doha Metro Infrastructure Maintenance',
                'category' => 'Infrastructure',
                'service' => 'Trading & Contracting',
                'location' => 'Doha Metro Stations, Qatar',
                'client' => 'Rail Contracting Consortium',
                'year' => '2024',
                'imageUrl' => '/assets/trading-contracting-Cqwkph8n.jpg',
                'description' => 'Specialized building materials supply, maintenance workforce deployment, and MEP contracting support.',
                'scope' => ['Procurement of Technical Supplies', 'Certified MEP Technicians', 'Emergency Repair Dispatch', 'Safety Audit Compliance'],
                'stats' => '5 Stations Maintained',
                'featured' => true
            ],
            [
                '_id' => 'proj_3',
                'title' => 'The Pearl-Qatar Luxury Residences',
                'category' => 'Residential & Luxury',
                'service' => 'Maintenance & Fit-Out',
                'location' => 'Porto Arabia, The Pearl',
                'client' => 'Private Residential Association',
                'year' => '2024',
                'imageUrl' => '/assets/maintenance-BBbh81po.jpg',
                'description' => 'Round-the-clock MEP maintenance, preventive HVAC overhauls, plumbing, and luxury interior fit-outs.',
                'scope' => ['24/7 Rapid Response Team', 'Chilled Water AC Maintenance', 'Electrical Load Distribution', 'Luxury Interior Renovations'],
                'stats' => '180 Units Serviced',
                'featured' => true
            ]
        ];
        echo json_encode(['success' => true, 'projects' => $projects]);
        exit;
    }
}

// 404 Route Not Found
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => "API route not found: $method /api/$route"
]);
