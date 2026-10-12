<?php
/**
 * Genting Services & Contracting W.L.L. (Doha, Qatar)
 * Database connection & schema initialization handler
 * Supports MySQL (InfinityFree / cPanel / MariaDB) with resilient local JSON fallback
 */

require_once __DIR__ . '/config.php';

$pdo = null;
$db_connected = false;
$db_error = null;

// Initialize data storage directory for local fallback
$data_dir = __DIR__ . '/data';
if (!is_dir($data_dir)) {
    @mkdir($data_dir, 0755, true);
}

// Attempt PDO connection to MySQL
try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 3,
    ]);
    $db_connected = true;
    init_database_schema($pdo);
} catch (Exception $e) {
    // If database name was wrong, attempt connecting without dbname and discover account's databases
    try {
        $dsn_no_db = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
        $pdo_probe = new PDO($dsn_no_db, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 3,
        ]);
        
        $prefix = DB_USER . '_';
        $stmt = $pdo_probe->query("SHOW DATABASES LIKE '{$prefix}%'");
        $found_dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (!empty($found_dbs)) {
            $selected_db = $found_dbs[0];
            $pdo_probe->exec("USE `$selected_db`");
            $pdo = $pdo_probe;
            $db_connected = true;
            init_database_schema($pdo);
        } else {
            $db_connected = false;
            $db_error = "Connected to MySQL host '" . DB_HOST . "', but no database with prefix '{$prefix}' was found. Please create one in cPanel -> MySQL Databases (e.g. named 'gsc').";
        }
    } catch (Exception $e2) {
        $db_connected = false;
        $db_error = $e->getMessage();
    }
}

/**
 * Initialize MySQL tables and default seed data
 */
function init_database_schema($pdo) {
    // 1. Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `gsc_users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(150) NOT NULL,
        `email` VARCHAR(150) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `role` VARCHAR(50) DEFAULT 'admin',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 2. Quotes Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `gsc_quotes` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `referenceId` VARCHAR(50) NOT NULL UNIQUE,
        `name` VARCHAR(150) NOT NULL,
        `company` VARCHAR(150) DEFAULT '',
        `email` VARCHAR(150) NOT NULL,
        `phone` VARCHAR(50) NOT NULL,
        `service` VARCHAR(150) NOT NULL,
        `location` VARCHAR(150) NOT NULL,
        `contractType` VARCHAR(100) DEFAULT 'One-Time Project',
        `timeline` VARCHAR(100) DEFAULT 'Immediately (Within 48 hours)',
        `notes` TEXT NOT NULL,
        `estimatedBudget` VARCHAR(100) DEFAULT '',
        `status` VARCHAR(50) DEFAULT 'Pending',
        `adminNotes` TEXT DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 3. Contacts Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `gsc_contacts` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(150) NOT NULL,
        `email` VARCHAR(150) NOT NULL,
        `phone` VARCHAR(50) NOT NULL,
        `subject` VARCHAR(200) DEFAULT 'General Service Inquiry',
        `message` TEXT NOT NULL,
        `status` VARCHAR(50) DEFAULT 'New',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 4. Projects Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `gsc_projects` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `project_id` VARCHAR(50) DEFAULT NULL,
        `title` VARCHAR(200) NOT NULL,
        `category` VARCHAR(100) NOT NULL,
        `service` VARCHAR(150) NOT NULL,
        `location` VARCHAR(150) DEFAULT 'Doha, Qatar',
        `client` VARCHAR(150) DEFAULT 'Confidential Client',
        `year` VARCHAR(50) DEFAULT '2024-2025',
        `imageUrl` TEXT NOT NULL,
        `description` TEXT NOT NULL,
        `scope` TEXT DEFAULT NULL,
        `stats` VARCHAR(100) DEFAULT 'Delivered On Schedule',
        `featured` TINYINT(1) DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 5. Payments & Accounting Table (Online & Offline Payments, Profit/Loss)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `gsc_payments` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `transaction_id` VARCHAR(50) NOT NULL UNIQUE,
        `invoice_no` VARCHAR(50) NOT NULL,
        `client_name` VARCHAR(150) NOT NULL,
        `client_email` VARCHAR(150) DEFAULT '',
        `client_phone` VARCHAR(50) DEFAULT '',
        `service_type` VARCHAR(150) NOT NULL,
        `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        `cost_expense` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        `net_profit` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        `payment_method` VARCHAR(100) NOT NULL,
        `payment_type` VARCHAR(50) NOT NULL,
        `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Completed',
        `work_status` VARCHAR(50) NOT NULL DEFAULT 'Completed',
        `payment_date` DATE NOT NULL,
        `notes` TEXT DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 6. Work Orders & Project Operations Table (Completed, Pending, Cancelled)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `gsc_works` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `work_id` VARCHAR(50) NOT NULL UNIQUE,
        `title` VARCHAR(200) NOT NULL,
        `client_name` VARCHAR(150) NOT NULL,
        `client_phone` VARCHAR(50) DEFAULT '',
        `service` VARCHAR(150) NOT NULL,
        `location` VARCHAR(150) DEFAULT 'Doha, Qatar',
        `contract_value` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        `cost_expense` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        `net_profit` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        `work_status` VARCHAR(50) NOT NULL DEFAULT 'In Progress',
        `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
        `payment_mode` VARCHAR(50) DEFAULT 'Online',
        `start_date` DATE DEFAULT NULL,
        `completion_date` DATE DEFAULT NULL,
        `notes` TEXT DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Ensure Default Admin Exists
    $stmt = $pdo->prepare("SELECT id FROM `gsc_users` WHERE `email` = ?");
    $stmt->execute([DEFAULT_ADMIN_EMAIL]);
    if (!$stmt->fetch()) {
        $hash = password_hash(DEFAULT_ADMIN_PASS, PASSWORD_BCRYPT);
        $insert = $pdo->prepare("INSERT INTO `gsc_users` (`name`, `email`, `password`, `role`) VALUES (?, ?, ?, 'admin')");
        $insert->execute(['GSC System Administrator', DEFAULT_ADMIN_EMAIL, $hash]);
    }

    // Ensure Default Qatar Projects Exist
    $stmtCount = $pdo->query("SELECT COUNT(*) FROM `gsc_projects`");
    if ($stmtCount->fetchColumn() == 0) {
        seed_default_projects($pdo);
    }

}

function seed_default_projects($pdo) {
    $projects = [
        [
            'proj_1', 'Lusail Marina Commercial Tower', 'Commercial Facility', 'Cleaning & Hospitality',
            'Lusail Marina, Doha', 'Lusail Real Estate', '2024',
            '/assets/cleaning-hospitality-CkHw0R7y.jpg',
            'Full-scale corporate cleaning, deep sanitization, and hospitality staffing for a 32-story landmark tower.',
            json_encode(['Daily Janitorial Services', 'High-Rise Façade Cleaning', 'Executive Hospitality Staff', 'Marble Polishing']),
            '32 Floors • 100% SLA Met', 1
        ],
        [
            'proj_2', 'Doha Metro Infrastructure Maintenance', 'Infrastructure', 'Trading & Contracting',
            'Doha Metro Stations, Qatar', 'Rail Contracting Consortium', '2024',
            '/assets/trading-contracting-Cqwkph8n.jpg',
            'Specialized building materials supply, maintenance workforce deployment, and MEP contracting support.',
            json_encode(['Procurement of Technical Supplies', 'Certified MEP Technicians', 'Emergency Repair Dispatch', 'Safety Audit Compliance']),
            '5 Stations Maintained', 1
        ],
        [
            'proj_3', 'The Pearl-Qatar Luxury Residences', 'Residential & Luxury', 'Maintenance & Fit-Out',
            'Porto Arabia, The Pearl', 'Private Residential Association', '2024',
            '/assets/maintenance-BBbh81po.jpg',
            'Round-the-clock MEP maintenance, preventive HVAC overhauls, plumbing, and luxury interior fit-outs.',
            json_encode(['24/7 Rapid Response Team', 'Chilled Water AC Maintenance', 'Electrical Load Distribution', 'Luxury Interior Renovations']),
            '180 Units Serviced', 1
        ],
        [
            'proj_4', 'West Bay Corporate Headquarters', 'Corporate Towers', 'Manpower Supply',
            'West Bay Diplomatic Area, Doha', 'Multi-Tenant Commercial Group', '2024',
            '/assets/manpower-supply-D3PN3k_Z.jpg',
            'Deployment of 85+ vetted, multilingual facility associates, reception hosts, and certified technicians.',
            json_encode(['Bilingual Concierge Services', 'Certified MEP Technicians', 'Continuous Workforce Management', 'Full Ministry of Labour Compliance']),
            '85+ Personnel Deployed', 1
        ]
    ];

    $insert = $pdo->prepare("INSERT INTO `gsc_projects` 
        (`project_id`, `title`, `category`, `service`, `location`, `client`, `year`, `imageUrl`, `description`, `scope`, `stats`, `featured`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($projects as $p) {
        $insert->execute($p);
    }
}

// Fallback File Storage Functions
function read_json_store($filename) {
    $path = __DIR__ . '/data/' . $filename;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        return json_decode($content, true) ?: [];
    }
    return [];
}

function write_json_store($filename, $data) {
    $path = __DIR__ . '/data/' . $filename;
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));
}
