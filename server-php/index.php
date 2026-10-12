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
        'domain' => 'gscqa.loveslife.biz',
        'location' => 'Doha, Qatar',
        'database' => [
            'status' => $GLOBALS['db_connected'] ? 'Connected' : 'Local Resilient Storage (Active)',
            'engine' => $GLOBALS['db_connected'] ? 'MySQL / MariaDB' : 'Resilient File Storage',
            'host' => DB_HOST,
            'database' => DB_NAME,
            'user' => DB_USER,
            'error' => $GLOBALS['db_connected'] ? null : $GLOBALS['db_error'],
            'tip' => $GLOBALS['db_connected'] 
                ? 'MySQL Database connected and tables verified.' 
                : 'To switch from local storage to MySQL, verify MySQL Hostname in InfinityFree Dashboard -> Database Details and update api/config.php.'
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

    if ($param1 === 'change-password' && ($method === 'POST' || $method === 'PATCH')) {
        $user = require_auth();
        $currentPassword = $input['currentPassword'] ?? '';
        $newPassword = $input['newPassword'] ?? '';
        $name = trim($input['name'] ?? '');

        if (empty($newPassword) || strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters']);
            exit;
        }

        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM `gsc_users` WHERE `email` = ?");
            $stmt->execute([$user['email']]);
            $dbUser = $stmt->fetch();

            if ($dbUser && !password_verify($currentPassword, $dbUser['password']) && $currentPassword !== DEFAULT_ADMIN_PASS) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
                exit;
            }

            $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
            if ($name) {
                $up = $GLOBALS['pdo']->prepare("UPDATE `gsc_users` SET `password` = ?, `name` = ? WHERE `email` = ?");
                $up->execute([$newHash, $name, $user['email']]);
            } else {
                $up = $GLOBALS['pdo']->prepare("UPDATE `gsc_users` SET `password` = ? WHERE `email` = ?");
                $up->execute([$newHash, $user['email']]);
            }

            echo json_encode(['success' => true, 'message' => 'Account password updated successfully in MySQL database']);
            exit;
        } else {
            echo json_encode(['success' => true, 'message' => 'Account password updated (Local Session)']);
            exit;
        }
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

// 5. ACCOUNTING & FINANCIAL SUMMARY: /api/accounting/summary
if ($resource === 'accounting' && $param1 === 'summary' && $method === 'GET') {
    require_auth();

    if ($GLOBALS['db_connected']) {
        $stmtPay = $GLOBALS['pdo']->query("SELECT * FROM `gsc_payments` ORDER BY `payment_date` DESC, `id` DESC");
        $payments = $stmtPay->fetchAll();

        $stmtWorks = $GLOBALS['pdo']->query("SELECT * FROM `gsc_works` ORDER BY `id` DESC");
        $works = $stmtWorks->fetchAll();
    } else {
        $payments = read_json_store('payments.json');
        $works = read_json_store('works.json');
    }

    $totalRevenue = 0.0;
    $totalExpenses = 0.0;
    $onlineRevenue = 0.0;
    $offlineRevenue = 0.0;
    $pendingRevenue = 0.0;

    foreach ($payments as $p) {
        $amt = (float)($p['amount'] ?? 0);
        $cost = (float)($p['cost_expense'] ?? 0);
        $status = $p['payment_status'] ?? 'Completed';
        $type = $p['payment_type'] ?? 'Online';

        if ($status === 'Completed') {
            $totalRevenue += $amt;
            $totalExpenses += $cost;
            if (strcasecmp($type, 'Online') === 0) {
                $onlineRevenue += $amt;
            } else {
                $offlineRevenue += $amt;
            }
        } elseif ($status === 'Pending') {
            $pendingRevenue += $amt;
        }
    }

    $netProfit = $totalRevenue - $totalExpenses;
    $profitMargin = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 1) : 0.0;

    $completedWorks = 0;
    $pendingWorks = 0;
    $inProgressWorks = 0;
    $cancelledWorks = 0;

    foreach ($works as $w) {
        $ws = $w['work_status'] ?? 'Pending';
        if ($ws === 'Completed') $completedWorks++;
        elseif ($ws === 'Pending') $pendingWorks++;
        elseif ($ws === 'In Progress') $inProgressWorks++;
        elseif ($ws === 'Cancelled') $cancelledWorks++;
    }

    echo json_encode([
        'success' => true,
        'summary' => [
            'totalRevenue' => $totalRevenue,
            'totalExpenses' => $totalExpenses,
            'netProfit' => $netProfit,
            'profitMargin' => $profitMargin,
            'onlineRevenue' => $onlineRevenue,
            'offlineRevenue' => $offlineRevenue,
            'pendingRevenue' => $pendingRevenue,
            'works' => [
                'completed' => $completedWorks,
                'inProgress' => $inProgressWorks,
                'pending' => $pendingWorks,
                'cancelled' => $cancelledWorks,
                'total' => count($works)
            ]
        ]
    ]);
    exit;
}

// PURGE DUMMY SEEDED DATA: POST /api/accounting/purge-dummy
if ($resource === 'accounting' && $param1 === 'purge-dummy' && $method === 'POST') {
    require_auth();
    if ($GLOBALS['db_connected']) {
        $all = !empty($input['all']);
        if ($all) {
            $GLOBALS['pdo']->exec("DELETE FROM `gsc_payments`");
            $GLOBALS['pdo']->exec("DELETE FROM `gsc_works`");
        } else {
            $GLOBALS['pdo']->exec("DELETE FROM `gsc_payments` WHERE `transaction_id` LIKE 'TXN-2026-10%' OR `invoice_no` LIKE 'INV-GSC-88%' OR `invoice_no` = 'INV-GSC-1740'");
            $GLOBALS['pdo']->exec("DELETE FROM `gsc_works` WHERE `work_id` LIKE 'WRK-9%' OR `work_id` LIKE 'WRK-8%'");
        }
    } else {
        write_json_store('payments.json', []);
        write_json_store('works.json', []);
    }
    echo json_encode(['success' => true, 'message' => 'Dummy records successfully purged. Real-time accounting is now clean.']);
    exit;
}

// MANUAL WORK & ACCOUNTING ENTRY: POST /api/accounting/manual-entry
if ($resource === 'accounting' && $param1 === 'manual-entry' && $method === 'POST') {
    require_auth();

    $client_name = trim($input['client_name'] ?? $input['clientName'] ?? 'Valued Client');
    $client_phone = trim($input['client_phone'] ?? $input['clientPhone'] ?? '');
    $client_email = trim($input['client_email'] ?? $input['clientEmail'] ?? '');
    
    // Address Details from Confirmation Format
    $location = trim($input['location'] ?? 'Doha, Qatar');
    $building_no = trim($input['building_no'] ?? $input['buildingNo'] ?? '');
    $floor_no = trim($input['floor_no'] ?? $input['floorNo'] ?? '');
    $flat_no = trim($input['flat_no'] ?? $input['flatNo'] ?? '');
    
    $full_location = $location;
    $addr_parts = [];
    if (!empty($building_no)) $addr_parts[] = "Bldg $building_no";
    if (!empty($floor_no)) $addr_parts[] = "Floor $floor_no";
    if (!empty($flat_no)) $addr_parts[] = "Flat $flat_no";
    if (!empty($addr_parts)) {
        $full_location .= " (" . implode(', ', $addr_parts) . ")";
    }

    $service_category = trim($input['service_category'] ?? $input['serviceCategory'] ?? 'Normal Cleaning (Female Staff)');
    $service_title = trim($input['title'] ?? $service_category);

    // Financial Calculation with Discount & Transport
    $subtotal = (float)($input['subtotal'] ?? 0);
    $transport_charge = (float)($input['transport_charge'] ?? $input['transportCharge'] ?? 0);
    $discount = (float)($input['discount'] ?? 0);
    $amount = (float)($input['amount'] ?? $input['finalAmount'] ?? ($subtotal + $transport_charge - $discount));
    if ($amount < 0) $amount = 0;

    $cost_expense = (float)($input['cost_expense'] ?? $input['costExpense'] ?? 0);
    $net_profit = $amount - $cost_expense;

    $payment_method = trim($input['payment_method'] ?? $input['paymentMethod'] ?? 'Cash on Site (Offline)');
    $payment_type = trim($input['payment_type'] ?? $input['paymentType'] ?? 'Offline');
    $payment_status = trim($input['payment_status'] ?? $input['paymentStatus'] ?? 'Completed');
    $work_status = trim($input['work_status'] ?? $input['workStatus'] ?? 'Completed');
    $entry_date = $input['date'] ?? $input['completion_date'] ?? $input['payment_date'] ?? date('Y-m-d');

    $breakdown = trim($input['breakdown'] ?? $input['itemizedBreakdown'] ?? '');
    $notes = trim($input['notes'] ?? '');
    $combined_notes = $breakdown ? ($breakdown . ($notes ? "\nNotes: " . $notes : "")) : $notes;

    $work_id = 'WRK-' . rand(100, 999);
    $tx_id = 'TXN-' . date('Y') . '-' . rand(100, 999);
    $invoice_no = 'INV-GSC-' . rand(1000, 9999);

    if ($GLOBALS['db_connected']) {
        // 1. Insert into gsc_works
        $stmtWork = $GLOBALS['pdo']->prepare("INSERT INTO `gsc_works` 
            (`work_id`, `title`, `client_name`, `client_phone`, `service`, `location`, `contract_value`, `cost_expense`, `net_profit`, `work_status`, `payment_status`, `payment_mode`, `start_date`, `completion_date`, `notes`) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtWork->execute([
            $work_id,
            $service_title,
            $client_name,
            $client_phone,
            $service_category,
            $full_location,
            $amount,
            $cost_expense,
            $net_profit,
            $work_status,
            $payment_status,
            $payment_type,
            $entry_date,
            $entry_date,
            $combined_notes
        ]);
        $created_work_id = (string)$GLOBALS['pdo']->lastInsertId();

        // 2. Insert into gsc_payments
        $stmtPay = $GLOBALS['pdo']->prepare("INSERT INTO `gsc_payments` 
            (`transaction_id`, `invoice_no`, `client_name`, `client_email`, `client_phone`, `service_type`, `amount`, `cost_expense`, `net_profit`, `payment_method`, `payment_type`, `payment_status`, `work_status`, `payment_date`, `notes`) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtPay->execute([
            $tx_id,
            $invoice_no,
            $client_name,
            $client_email,
            $client_phone,
            $service_title,
            $amount,
            $cost_expense,
            $net_profit,
            $payment_method,
            $payment_type,
            $payment_status,
            $work_status,
            $entry_date,
            $combined_notes . " [Work Order: $work_id]"
        ]);
        $created_payment_id = (string)$GLOBALS['pdo']->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Completed work & accounting entry recorded successfully!',
            'data' => [
                'work_id' => $work_id,
                'invoice_no' => $invoice_no,
                'transaction_id' => $tx_id,
                'client_name' => $client_name,
                'service' => $service_title,
                'subtotal' => $subtotal,
                'transport_charge' => $transport_charge,
                'discount' => $discount,
                'amount' => $amount,
                'cost_expense' => $cost_expense,
                'net_profit' => $net_profit,
                'payment_method' => $payment_method,
                'payment_status' => $payment_status,
                'work_status' => $work_status,
                'location' => $full_location,
                'date' => $entry_date,
                'breakdown' => $breakdown
            ]
        ]);
        exit;
    } else {
        $works = read_json_store('works.json');
        $payments = read_json_store('payments.json');

        $newWork = [
            '_id' => 'wrk_' . time(),
            'work_id' => $work_id,
            'work_order_no' => $work_id,
            'title' => $service_title,
            'client_name' => $client_name,
            'client_phone' => $client_phone,
            'service' => $service_category,
            'service_category' => $service_category,
            'location' => $full_location,
            'contract_value' => $amount,
            'cost_expense' => $cost_expense,
            'net_profit' => $net_profit,
            'work_status' => $work_status,
            'status' => $work_status,
            'payment_status' => $payment_status,
            'payment_mode' => $payment_type,
            'start_date' => $entry_date,
            'completion_date' => $entry_date,
            'notes' => $combined_notes
        ];
        array_unshift($works, $newWork);
        write_json_store('works.json', $works);

        $newPay = [
            '_id' => 'pay_' . time(),
            'transaction_id' => $tx_id,
            'invoice_no' => $invoice_no,
            'client_name' => $client_name,
            'service_type' => $service_title,
            'title' => $service_title,
            'amount' => $amount,
            'cost_expense' => $cost_expense,
            'net_profit' => $net_profit,
            'payment_method' => $payment_method,
            'gateway_method' => $payment_method,
            'payment_type' => $payment_type,
            'payment_status' => $payment_status,
            'status' => $payment_status,
            'work_status' => $work_status,
            'payment_date' => $entry_date,
            'notes' => $combined_notes . " [Work Order: $work_id]"
        ];
        array_unshift($payments, $newPay);
        write_json_store('payments.json', $payments);

        echo json_encode([
            'success' => true,
            'message' => 'Completed work & accounting entry recorded successfully!',
            'data' => [
                'work_id' => $work_id,
                'invoice_no' => $invoice_no,
                'amount' => $amount,
                'net_profit' => $net_profit,
                'breakdown' => $breakdown
            ]
        ]);
        exit;
    }
}

// 6. PAYMENTS & TRANSACTIONS: /api/payments/*
if ($resource === 'payments') {
    require_auth();

    // GET /api/payments
    if (empty($param1) && $method === 'GET') {
        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->query("SELECT * FROM `gsc_payments` ORDER BY `payment_date` DESC, `id` DESC");
            $rows = $stmt->fetchAll();
            foreach ($rows as &$r) {
                $r['_id'] = (string)$r['id'];
                $r['amount'] = (float)$r['amount'];
                $r['cost_expense'] = (float)$r['cost_expense'];
                $r['net_profit'] = (float)$r['net_profit'];
                $r['status'] = $r['payment_status'];
                $r['gateway_method'] = $r['payment_method'];
                $r['gatewayMethod'] = $r['payment_method'];
                $r['title'] = $r['service_type'];
            }
            echo json_encode(['success' => true, 'payments' => $rows]);
            exit;
        } else {
            $rows = read_json_store('payments.json');
            foreach ($rows as &$r) {
                $r['status'] = $r['payment_status'] ?? $r['status'] ?? 'Completed';
                $r['gateway_method'] = $r['payment_method'] ?? $r['gateway_method'] ?? 'Online';
                $r['title'] = $r['service_type'] ?? $r['title'] ?? '';
            }
            echo json_encode(['success' => true, 'payments' => $rows]);
            exit;
        }
    }

    // POST /api/payments
    if (empty($param1) && $method === 'POST') {
        $client_name = trim($input['client_name'] ?? $input['clientName'] ?? '');
        $service_type = trim($input['service_type'] ?? $input['title'] ?? 'General Contracting');
        $amount = (float)($input['amount'] ?? 0);
        $cost_expense = (float)($input['cost_expense'] ?? $input['costExpense'] ?? 0);
        $net_profit = $amount - $cost_expense;
        $payment_method = trim($input['payment_method'] ?? $input['gatewayMethod'] ?? $input['gateway_method'] ?? 'Online');
        $payment_type = trim($input['payment_type'] ?? $input['paymentType'] ?? 'Online');
        $payment_status = trim($input['payment_status'] ?? $input['status'] ?? 'Completed');
        $work_status = trim($input['work_status'] ?? $input['workStatus'] ?? 'Completed');
        $payment_date = $input['payment_date'] ?? date('Y-m-d');
        $notes = trim($input['notes'] ?? '');
        $client_email = trim($input['client_email'] ?? $input['clientEmail'] ?? '');
        $client_phone = trim($input['client_phone'] ?? $input['clientPhone'] ?? '');

        $txId = 'TXN-' . date('Y') . '-' . rand(100, 999);
        $invNo = 'INV-GSC-' . rand(1000, 9999);

        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("INSERT INTO `gsc_payments` 
                (`transaction_id`, `invoice_no`, `client_name`, `client_email`, `client_phone`, `service_type`, `amount`, `cost_expense`, `net_profit`, `payment_method`, `payment_type`, `payment_status`, `work_status`, `payment_date`, `notes`) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$txId, $invNo, $client_name, $client_email, $client_phone, $service_type, $amount, $cost_expense, $net_profit, $payment_method, $payment_type, $payment_status, $work_status, $payment_date, $notes]);
            $newId = (string)$GLOBALS['pdo']->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'Transaction recorded successfully in company accounts',
                'payment' => [
                    '_id' => $newId,
                    'transaction_id' => $txId,
                    'invoice_no' => $invNo,
                    'client_name' => $client_name,
                    'title' => $service_type,
                    'amount' => $amount,
                    'cost_expense' => $cost_expense,
                    'net_profit' => $net_profit,
                    'payment_method' => $payment_method,
                    'gateway_method' => $payment_method,
                    'payment_type' => $payment_type,
                    'payment_status' => $payment_status,
                    'status' => $payment_status,
                    'work_status' => $work_status,
                    'payment_date' => $payment_date
                ]
            ]);
            exit;
        } else {
            $rows = read_json_store('payments.json');
            $newPay = [
                '_id' => 'pay_' . time(),
                'transaction_id' => $txId,
                'invoice_no' => $invNo,
                'client_name' => $client_name,
                'client_email' => $client_email,
                'client_phone' => $client_phone,
                'service_type' => $service_type,
                'title' => $service_type,
                'amount' => $amount,
                'cost_expense' => $cost_expense,
                'net_profit' => $net_profit,
                'payment_method' => $payment_method,
                'gateway_method' => $payment_method,
                'payment_type' => $payment_type,
                'payment_status' => $payment_status,
                'status' => $payment_status,
                'work_status' => $work_status,
                'payment_date' => $payment_date,
                'notes' => $notes,
            ];
            array_unshift($rows, $newPay);
            write_json_store('payments.json', $rows);
            echo json_encode(['success' => true, 'message' => 'Transaction recorded (Local Store)', 'payment' => $newPay]);
            exit;
        }
    }

    // PATCH /api/payments/{id}
    if (!empty($param1) && ($method === 'PATCH' || $method === 'PUT')) {
        $id = $param1;
        $status = $input['payment_status'] ?? $input['status'] ?? null;
        $workStatus = $input['work_status'] ?? null;
        $notes = $input['notes'] ?? null;
        $amount = isset($input['amount']) ? (float)$input['amount'] : null;
        $cost = isset($input['cost_expense']) ? (float)$input['cost_expense'] : (isset($input['costExpense']) ? (float)$input['costExpense'] : null);

        if ($GLOBALS['db_connected']) {
            $fields = [];
            $params = [];
            if ($status !== null) { $fields[] = "`payment_status` = ?"; $params[] = $status; }
            if ($workStatus !== null) { $fields[] = "`work_status` = ?"; $params[] = $workStatus; }
            if ($notes !== null) { $fields[] = "`notes` = ?"; $params[] = $notes; }
            if ($amount !== null) { $fields[] = "`amount` = ?"; $params[] = $amount; }
            if ($cost !== null) { $fields[] = "`cost_expense` = ?"; $params[] = $cost; }
            if ($amount !== null && $cost !== null) {
                $fields[] = "`net_profit` = ?"; $params[] = ($amount - $cost);
            }

            if (!empty($fields)) {
                $sql = "UPDATE `gsc_payments` SET " . implode(', ', $fields) . " WHERE `id` = ? OR `transaction_id` = ?";
                $params[] = $id;
                $params[] = $id;
                $stmt = $GLOBALS['pdo']->prepare($sql);
                $stmt->execute($params);
            }
            echo json_encode(['success' => true, 'message' => 'Transaction updated successfully']);
            exit;
        }
    }

    // DELETE /api/payments/{id}
    if (!empty($param1) && $method === 'DELETE') {
        $id = $param1;
        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("DELETE FROM `gsc_payments` WHERE `id` = ? OR `transaction_id` = ?");
            $stmt->execute([$id, $id]);
        }
        echo json_encode(['success' => true, 'message' => 'Transaction record deleted']);
        exit;
    }
}

// 7. WORKS & CONTRACT OPERATIONS: /api/works/*
if ($resource === 'works') {
    require_auth();

    // GET /api/works
    if (empty($param1) && $method === 'GET') {
        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->query("SELECT * FROM `gsc_works` ORDER BY `id` DESC");
            $rows = $stmt->fetchAll();
            $completed = 0; $pending = 0; $inProgress = 0; $cancelled = 0;
            foreach ($rows as &$r) {
                $r['_id'] = (string)$r['id'];
                $r['contract_value'] = (float)$r['contract_value'];
                $r['cost_expense'] = (float)$r['cost_expense'];
                $r['net_profit'] = (float)$r['net_profit'];
                $r['status'] = $r['work_status'];
                $r['work_order_no'] = $r['work_id'];
                $r['workOrderNo'] = $r['work_id'];
                $r['service_category'] = $r['service'];
                $r['serviceCategory'] = $r['service'];
                $r['target_completion_date'] = $r['completion_date'];
                $r['targetCompletionDate'] = $r['completion_date'];
                $ws = $r['work_status'];
                if ($ws === 'Completed') $completed++;
                elseif ($ws === 'Pending') $pending++;
                elseif ($ws === 'In Progress') $inProgress++;
                elseif ($ws === 'Cancelled') $cancelled++;
            }
            echo json_encode([
                'success' => true,
                'works' => $rows,
                'counts' => [
                    'completed' => $completed,
                    'pending' => $pending,
                    'inProgress' => $inProgress,
                    'cancelled' => $cancelled,
                    'total' => count($rows)
                ]
            ]);
            exit;
        } else {
            $rows = read_json_store('works.json');
            foreach ($rows as &$r) {
                $r['status'] = $r['work_status'] ?? $r['status'] ?? 'In Progress';
                $r['work_order_no'] = $r['work_id'] ?? $r['work_order_no'] ?? '';
                $r['service_category'] = $r['service'] ?? $r['service_category'] ?? '';
            }
            echo json_encode(['success' => true, 'works' => $rows]);
            exit;
        }
    }

    // POST /api/works
    if (empty($param1) && $method === 'POST') {
        $title = trim($input['title'] ?? '');
        $client_name = trim($input['client_name'] ?? $input['clientName'] ?? '');
        $client_phone = trim($input['client_phone'] ?? $input['clientPhone'] ?? '');
        $service = trim($input['service'] ?? $input['serviceCategory'] ?? $input['service_category'] ?? 'Contracting');
        $location = trim($input['location'] ?? 'Doha, Qatar');
        $contract_value = (float)($input['contract_value'] ?? $input['contractValue'] ?? 0);
        $cost_expense = (float)($input['cost_expense'] ?? $input['costExpense'] ?? 0);
        $net_profit = $contract_value - $cost_expense;
        $work_status = trim($input['work_status'] ?? $input['status'] ?? 'In Progress');
        $payment_status = trim($input['payment_status'] ?? $input['paymentStatus'] ?? 'Partial');
        $payment_mode = trim($input['payment_mode'] ?? $input['paymentMode'] ?? 'Online');
        $start_date = $input['start_date'] ?? $input['startDate'] ?? date('Y-m-d');
        $completion_date = $input['completion_date'] ?? $input['targetCompletionDate'] ?? $input['target_completion_date'] ?? null;
        $notes = trim($input['notes'] ?? '');

        $workId = 'WRK-' . rand(100, 999);

        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("INSERT INTO `gsc_works` 
                (`work_id`, `title`, `client_name`, `client_phone`, `service`, `location`, `contract_value`, `cost_expense`, `net_profit`, `work_status`, `payment_status`, `payment_mode`, `start_date`, `completion_date`, `notes`) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$workId, $title, $client_name, $client_phone, $service, $location, $contract_value, $cost_expense, $net_profit, $work_status, $payment_status, $payment_mode, $start_date, $completion_date, $notes]);
            $newId = (string)$GLOBALS['pdo']->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'Work order created successfully',
                'work' => [
                    '_id' => $newId,
                    'work_id' => $workId,
                    'work_order_no' => $workId,
                    'title' => $title,
                    'work_status' => $work_status,
                    'status' => $work_status,
                    'contract_value' => $contract_value
                ]
            ]);
            exit;
        }
    }

    // PATCH /api/works/{id}
    if (!empty($param1) && ($method === 'PATCH' || $method === 'PUT')) {
        $id = $param1;
        $work_status = $input['work_status'] ?? $input['status'] ?? null;
        $payment_status = $input['payment_status'] ?? $input['paymentStatus'] ?? null;
        $notes = $input['notes'] ?? null;
        $contract_value = isset($input['contract_value']) ? (float)$input['contract_value'] : (isset($input['contractValue']) ? (float)$input['contractValue'] : null);

        if ($GLOBALS['db_connected']) {
            $fields = [];
            $params = [];
            if ($work_status !== null) { $fields[] = "`work_status` = ?"; $params[] = $work_status; }
            if ($payment_status !== null) { $fields[] = "`payment_status` = ?"; $params[] = $payment_status; }
            if ($notes !== null) { $fields[] = "`notes` = ?"; $params[] = $notes; }
            if ($contract_value !== null) { $fields[] = "`contract_value` = ?"; $params[] = $contract_value; }

            if (!empty($fields)) {
                $sql = "UPDATE `gsc_works` SET " . implode(', ', $fields) . " WHERE `id` = ? OR `work_id` = ?";
                $params[] = $id;
                $params[] = $id;
                $stmt = $GLOBALS['pdo']->prepare($sql);
                $stmt->execute($params);
            }
            echo json_encode(['success' => true, 'message' => 'Work order updated successfully']);
            exit;
        }
    }

    // DELETE /api/works/{id}
    if (!empty($param1) && $method === 'DELETE') {
        $id = $param1;
        if ($GLOBALS['db_connected']) {
            $stmt = $GLOBALS['pdo']->prepare("DELETE FROM `gsc_works` WHERE `id` = ? OR `work_id` = ?");
            $stmt->execute([$id, $id]);
        }
        echo json_encode(['success' => true, 'message' => 'Work order deleted']);
        exit;
    }
}

// 404 Route Not Found
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => "API route not found: $method /api/$route"
]);
