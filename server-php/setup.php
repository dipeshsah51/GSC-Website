<?php
/**
 * Genting Services & Contracting W.L.L. (Doha, Qatar)
 * Database Setup & Connection Verification Utility
 * Accessible at: http://gscqa.loveslife.biz/api/setup.php
 */

require_once __DIR__ . '/config.php';

$message = '';
$message_type = '';
$test_success = false;

// Handle Save / Test POST Request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $post_host = trim($_POST['db_host'] ?? '');
    $post_name = trim($_POST['db_name'] ?? '');
    $post_user = trim($_POST['db_user'] ?? '');
    $post_pass = trim($_POST['db_pass'] ?? '');

    if ($post_host && $post_user) {
        try {
            // Test connection
            $dsn = "mysql:host={$post_host};port=3306;charset=utf8mb4";
            if ($post_name) {
                $dsn .= ";dbname={$post_name}";
            }
            $test_pdo = new PDO($dsn, $post_user, $post_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 4,
            ]);

            // If connected, ensure tables
            if ($post_name) {
                require_once __DIR__ . '/db.php';
                init_database_schema($test_pdo);
            }

            // Update config.php file
            $config_content = file_get_contents(__DIR__ . '/config.php');
            $config_content = preg_replace("/define\('DB_HOST',\s*getenv\('DB_HOST'\)\s*\?:\s*'.*?'\);/", "define('DB_HOST', getenv('DB_HOST') ?: '{$post_host}');", $config_content);
            $config_content = preg_replace("/define\('DB_NAME',\s*getenv\('DB_NAME'\)\s*\?:\s*'.*?'\);/", "define('DB_NAME', getenv('DB_NAME') ?: '{$post_name}');", $config_content);
            $config_content = preg_replace("/define\('DB_USER',\s*getenv\('DB_USER'\)\s*\?:\s*'.*?'\);/", "define('DB_USER', getenv('DB_USER') ?: '{$post_user}');", $config_content);
            $config_content = preg_replace("/define\('DB_PASS',\s*getenv\('DB_PASS'\)\s*\?:\s*'.*?'\);/", "define('DB_PASS', getenv('DB_PASS') ?: '{$post_pass}');", $config_content);

            @file_put_contents(__DIR__ . '/config.php', $config_content);

            $message = "Success! Connected to MySQL host '{$post_host}' and verified database schema. Configuration saved to config.php.";
            $message_type = 'success';
            $test_success = true;
        } catch (Exception $e) {
            $message = "Connection failed: " . htmlspecialchars($e->getMessage());
            $message_type = 'error';
        }
    }
}

// Current status
require_once __DIR__ . '/db.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GSC Doha - MySQL Database Setup & Health</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 760px; margin: 40px auto; background: #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4); border: 1px solid #334155; }
        h1 { color: #f8fafc; margin-top: 0; font-size: 1.7rem; display: flex; align-items: center; gap: 10px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; }
        .badge-green { background: #065f46; color: #34d399; }
        .badge-amber { background: #78350f; color: #fbbf24; }
        .badge-red { background: #881337; color: #fda4af; }
        .alert { padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 0.95rem; }
        .alert-success { background: #064e3b; border: 1px solid #059669; color: #a7f3d0; }
        .alert-error { background: #4c0519; border: 1px solid #e11d48; color: #fecdd3; }
        .alert-info { background: #1e3a8a; border: 1px solid #3b82f6; color: #bfdbfe; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
        .card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; }
        .card label { font-size: 0.8rem; text-transform: uppercase; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 4px; }
        .card value { font-family: monospace; font-size: 1.05rem; color: #38bdf8; font-weight: bold; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-size: 0.9rem; font-weight: 600; color: #cbd5e1; }
        .form-group input { width: 100%; box-sizing: border-box; padding: 10px 14px; background: #0f172a; border: 1px solid #475569; border-radius: 6px; color: #f8fafc; font-size: 0.95rem; }
        .form-group input:focus { border-color: #38bdf8; outline: none; }
        .btn { background: #0284c7; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
        .btn:hover { background: #0369a1; }
        .btn-outline { background: transparent; border: 1px solid #64748b; color: #94a3b8; text-decoration: none; display: inline-block; padding: 10px 20px; border-radius: 6px; font-size: 0.95rem; margin-right: 10px; }
        .btn-outline:hover { color: #f8fafc; border-color: #cbd5e1; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.9rem; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #334155; }
        th { color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; }
        .step { background: #0f172a; border-left: 4px solid #38bdf8; padding: 12px 16px; margin: 12px 0; border-radius: 0 6px 6px 0; font-size: 0.9rem; }
    </style>
</head>
<body>
<div class="container">
    <h1>
        <span>🏛️ Genting Services & Contracting W.L.L.</span>
    </h1>
    <p style="color: #94a3b8; margin-top: -6px;">Production Database Setup & Diagnostics for <strong>gscqa.loveslife.biz</strong></p>

    <?php if ($message): ?>
        <div class="alert alert-<?php echo $message_type; ?>">
            <?php echo $message; ?>
        </div>
    <?php endif; ?>

    <!-- Status Overview -->
    <div class="card" style="margin-bottom: 24px; border-color: <?php echo $db_connected ? '#059669' : '#f59e0b'; ?>">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span style="color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; font-weight: 600;">Current Database Engine Status</span>
                <div style="font-size: 1.3rem; font-weight: 700; margin-top: 4px;">
                    <?php if ($db_connected): ?>
                        <span style="color: #34d399;">● MySQL Active (Connected)</span>
                    <?php else: ?>
                        <span style="color: #fbbf24;">● Local Resilient Storage Active</span>
                    <?php endif; ?>
                </div>
            </div>
            <div>
                <span class="badge <?php echo $db_connected ? 'badge-green' : 'badge-amber'; ?>">
                    <?php echo $db_connected ? 'MySQL Live' : 'Fallback File Mode'; ?>
                </span>
            </div>
        </div>

        <?php if (!$db_connected && $db_error): ?>
            <div style="margin-top: 14px; padding: 10px 14px; background: #3b111a; border-radius: 6px; font-family: monospace; font-size: 0.82rem; color: #fca5a5;">
                <strong>Diagnostic Message:</strong> <?php echo htmlspecialchars($db_error); ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- Current Credentials Display -->
    <h3 style="margin-bottom: 8px; color: #cbd5e1;">Active Configuration Details</h3>
    <div class="grid">
        <div class="card"><label>MySQL Hostname</label><value><?php echo htmlspecialchars(DB_HOST); ?></value></div>
        <div class="card"><label>MySQL Database</label><value><?php echo htmlspecialchars(DB_NAME); ?></value></div>
        <div class="card"><label>MySQL Username</label><value><?php echo htmlspecialchars(DB_USER); ?></value></div>
        <div class="card"><label>MySQL Port</label><value><?php echo htmlspecialchars(DB_PORT); ?></value></div>
    </div>

    <?php if ($db_connected): ?>
        <h3 style="margin-top: 24px; color: #cbd5e1;">Verified Database Tables</h3>
        <table>
            <thead>
                <tr>
                    <th>Table Name</th>
                    <th>Records</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $tables = ['gsc_users', 'gsc_quotes', 'gsc_contacts', 'gsc_projects'];
                foreach ($tables as $t):
                    try {
                        $cnt = $pdo->query("SELECT COUNT(*) FROM `{$t}`")->fetchColumn();
                        $t_ok = true;
                    } catch (Exception $e) {
                        $cnt = 0;
                        $t_ok = false;
                    }
                ?>
                <tr>
                    <td><code><?php echo $t; ?></code></td>
                    <td><strong><?php echo $cnt; ?></strong> entries</td>
                    <td><span class="badge <?php echo $t_ok ? 'badge-green' : 'badge-red'; ?>"><?php echo $t_ok ? 'Ready' : 'Missing'; ?></span></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <div style="margin-top: 28px;">
            <a href="/" class="btn" style="text-decoration: none; display: inline-block;">🚀 Open Live Website</a>
            <a href="/admin" class="btn-outline">🔐 Open Admin Portal</a>
            <a href="/api/health" class="btn-outline">🩺 API Health JSON</a>
        </div>
    <?php else: ?>
        <h3 style="margin-top: 28px; color: #cbd5e1;">Update / Connect MySQL Host</h3>
        <p style="font-size: 0.9rem; color: #94a3b8;">
            On InfinityFree, find your <strong>MySQL Hostname</strong> in your 
            <a href="https://dash.infinityfree.com/" target="_blank" style="color: #38bdf8;">InfinityFree Client Area</a> 
            under <strong>Database Details</strong> (e.g. <code>sql105.infinityfree.com</code>, <code>sql201.infinityfree.com</code>):
        </p>

        <form method="POST" action="">
            <div class="form-group">
                <label>MySQL Hostname (from InfinityFree Dashboard):</label>
                <input type="text" name="db_host" value="<?php echo htmlspecialchars(DB_HOST); ?>" required placeholder="e.g. sql105.infinityfree.com" />
            </div>

            <div class="form-group">
                <label>MySQL Database Name (created in cPanel -> MySQL Databases):</label>
                <input type="text" name="db_name" value="<?php echo htmlspecialchars(DB_NAME); ?>" required placeholder="e.g. if0_43086816_gsc" />
            </div>

            <div class="form-group">
                <label>MySQL Username:</label>
                <input type="text" name="db_user" value="<?php echo htmlspecialchars(DB_USER); ?>" required />
            </div>

            <div class="form-group">
                <label>MySQL Password:</label>
                <input type="password" name="db_pass" value="<?php echo htmlspecialchars(DB_PASS); ?>" required />
            </div>

            <div style="margin-top: 20px;">
                <button type="submit" class="btn">⚡ Test & Save MySQL Connection</button>
            </div>
        </form>

        <div style="margin-top: 28px;">
            <h4 style="color: #cbd5e1; margin-bottom: 8px;">Quick Setup Instructions:</h4>
            <div class="step">
                <strong>Step 1:</strong> In your <a href="https://dash.infinityfree.com/" target="_blank" style="color: #38bdf8;">InfinityFree Dashboard</a>, open <strong>cPanel -> MySQL Databases</strong>.
            </div>
            <div class="step">
                <strong>Step 2:</strong> Create a database named <code>gsc</code> (full name will be <code>if0_43086816_gsc</code>).
            </div>
            <div class="step">
                <strong>Step 3:</strong> Note your assigned <strong>MySQL Hostname</strong> (e.g. <code>sql105.infinityfree.com</code>) and enter it above, then click <strong>Test & Save</strong>!
            </div>
        </div>
    <?php endif; ?>
</div>
</body>
</html>
