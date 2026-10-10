<?php
/**
 * Genting Services & Contracting W.L.L. (Doha, Qatar)
 * Production Server & Database Configuration for gscqa.loveslife.biz
 *
 * For InfinityFree / cPanel:
 * Fill in your MySQL details from your hosting Control Panel -> MySQL Databases
 */

// Database Host (e.g. sql100.infinityfree.com or localhost)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');

// Database Name (e.g. if0_XXXXXXXX_gsc)
define('DB_NAME', getenv('DB_NAME') ?: 'gsc_website_db');

// Database Username (e.g. if0_XXXXXXXX)
define('DB_USER', getenv('DB_USER') ?: 'root');

// Database Password (your hosting vPanel / MySQL password)
define('DB_PASS', getenv('DB_PASS') ?: '');

// Database Port
define('DB_PORT', getenv('DB_PORT') ?: '3306');

// Secret Key for Admin Authentication JWT
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'gsc_qatar_jwt_super_secret_key_2026');

// Default Admin Credentials
define('DEFAULT_ADMIN_EMAIL', 'admin@gsc-qatar.com');
define('DEFAULT_ADMIN_PASS', 'admin123456');

// Timezone
date_default_timezone_set('Asia/Qatar');
