<?php
// Database configuration — update these with your cPanel credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'usc_database');
define('DB_USER', 'root');
define('DB_PASS', '');

// CORS — restrict to your domain in production
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if (php_sapi_name() !== 'cli') header('Content-Type: application/json; charset=utf-8');

if (php_sapi_name() !== 'cli' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// Database connection
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
      http_response_code(500);
      echo json_encode(['error' => 'Database connection failed']);
      exit;
    }
  }
  return $pdo;
}

// JSON input helper
function json_input() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

// Send JSON response and exit
function respond($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data);
  exit;
}

// Require authentication — returns user array
function require_auth() {
  session_start();
  if (!isset($_SESSION['user_id'])) {
    respond(['error' => 'Authentication required'], 401);
  }
  $db = db();
  $stmt = $db->prepare('SELECT id, name, email, role, status FROM users WHERE id = ?');
  $stmt->execute([$_SESSION['user_id']]);
  $user = $stmt->fetch();
  if (!$user) {
    session_destroy();
    respond(['error' => 'User not found'], 401);
  }
  if ($user['status'] === 'suspended') {
    respond(['error' => 'Account suspended'], 403);
  }
  return $user;
}

// Require specific role(s)
function require_role($roles) {
  $user = require_auth();
  if (!is_array($roles)) $roles = [$roles];
  if (!in_array($user['role'], $roles)) {
    respond(['error' => 'Insufficient permissions'], 403);
  }
  return $user;
}
