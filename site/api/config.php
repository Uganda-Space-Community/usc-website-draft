<?php
/**
 * USC API Configuration & Security Layer
 */

// ═══ Environment ═══
define('DB_HOST', getenv('USC_DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('USC_DB_NAME') ?: 'usc_database');
define('DB_USER', getenv('USC_DB_USER') ?: 'root');
define('DB_PASS', getenv('USC_DB_PASS') ?: '');
define('APP_ORIGIN', getenv('USC_APP_ORIGIN') ?: 'https://space.org.ug');

// ═══ Session Hardening ═══
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.use_trans_sid', 0);
ini_set('session.gc_maxlifetime', 3600);

// ═══ CORS ═══
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === APP_ORIGIN) {
  header('Access-Control-Allow-Origin: ' . APP_ORIGIN);
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');

if (php_sapi_name() !== 'cli') header('Content-Type: application/json; charset=utf-8');
if (php_sapi_name() !== 'cli' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// ═══ Security Headers ═══
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-XSS-Protection: 1; mode=block');

// ═══ Database ═══
function db() {
  static $pdo = null;
  if ($pdo === null) {
    try {
      $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
      $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
      ]);
    } catch (PDOException $e) {
      error_log('DB connection failed: ' . $e->getMessage());
      http_response_code(500);
      echo json_encode(['error' => 'Database connection failed']);
      exit;
    }
  }
  return $pdo;
}

// ═══ Input Helpers ═══
function json_input() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function respond($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data);
  exit;
}

function esc_html($s) {
  return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

// ═══ Session Management ═══
function start_session() {
  if (session_status() === PHP_SESSION_NONE) {
    session_start();
  }
}

function require_auth() {
  start_session();
  if (!isset($_SESSION['user_id'])) {
    respond(['error' => 'Authentication required'], 401);
  }
  $db = db();
  $stmt = $db->prepare('SELECT id, name, email, role, status FROM users WHERE id = ?');
  $stmt->execute([$_SESSION['user_id']]);
  $user = $stmt->fetch();
  if (!$user) {
    session_regenerate_id(true);
    session_destroy();
    respond(['error' => 'User not found'], 401);
  }
  if ($user['status'] === 'suspended') {
    respond(['error' => 'Account suspended'], 403);
  }
  return $user;
}

function require_role($roles) {
  $user = require_auth();
  if (!is_array($roles)) $roles = [$roles];
  if (!in_array($user['role'], $roles)) {
    respond(['error' => 'Insufficient permissions'], 403);
  }
  return $user;
}

// ═══ CSRF Protection ═══
function csrf_token() {
  start_session();
  if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
  }
  return $_SESSION['csrf_token'];
}

function require_csrf() {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') return;
  start_session();
  $token = $_SERVER['HTTP_X_CSRF_TOKEN']
    ?? $_POST['_csrf']
    ?? '';
  if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
    respond(['error' => 'Invalid CSRF token'], 403);
  }
}

// ═══ Rate Limiting ═══
function rate_limit($key, $maxAttempts, $windowSeconds) {
  $dir = sys_get_temp_dir() . '/usc_ratelimit';
  if (!is_dir($dir)) mkdir($dir, 0700, true);
  $file = $dir . '/' . preg_replace('/[^a-z0-9_-]/i', '', $key);
  $now = time();
  $attempts = [];
  if (file_exists($file)) {
    $attempts = json_decode(file_get_contents($file), true) ?: [];
    $attempts = array_filter($attempts, function($t) use ($now, $windowSeconds) {
      return ($now - $t) < $windowSeconds;
    });
  }
  if (count($attempts) >= $maxAttempts) {
    respond(['error' => 'Too many requests. Try again later.'], 429);
  }
  $attempts[] = $now;
  file_put_contents($file, json_encode(array_values($attempts)));
}

function get_client_ip() {
  $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
  if (strpos($ip, ',') !== false) $ip = trim(explode(',', $ip)[0]);
  return $ip;
}

// ═══ Validation Helpers ═══
function validate_url($url) {
  if (empty($url)) return '';
  $url = trim($url);
  if (!preg_match('#^https?://#i', $url)) $url = 'https://' . $url;
  return filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
}

function validate_password($password) {
  $len = strlen($password);
  if ($len < 8) return 'Password must be at least 8 characters';
  if ($len > 128) return 'Password must be less than 128 characters';
  return null;
}

function escape_like($str) {
  return addcslashes($str, '%_');
}
