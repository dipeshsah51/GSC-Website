<?php
/**
 * Genting Services & Contracting W.L.L. (Doha, Qatar)
 * Production Server & Database Configuration for gscqa.loveslife.biz
 *
 * Hosting Account: if0_43086816 (InfinityFree)
 * Home Directory: /home/vol15_1/infinityfree.com/if0_43086816
 */

// MySQL Hostname (Live InfinityFree Server)
define('DB_HOST', getenv('DB_HOST') ?: 'sql113.infinityfree.com');

// MySQL Database Name (Created and active)
define('DB_NAME', getenv('DB_NAME') ?: 'if0_43086816_gsc');

// MySQL Username (Your InfinityFree account username)
define('DB_USER', getenv('DB_USER') ?: 'if0_43086816');

// MySQL Password (Your InfinityFree account password)
define('DB_PASS', getenv('DB_PASS') ?: 'Saah8080');

// MySQL Port
define('DB_PORT', getenv('DB_PORT') ?: '3306');

// Secret Key for Admin Authentication JWT
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'gsc_qatar_jwt_super_secret_key_2026');

// Default Admin Credentials
define('DEFAULT_ADMIN_EMAIL', 'admin@gsc-qatar.com');
define('DEFAULT_ADMIN_PASS', 'admin123456');

// Timezone (Qatar Time GMT+3)
date_default_timezone_set('Asia/Qatar');
