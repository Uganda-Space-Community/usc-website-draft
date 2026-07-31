<?php
require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

  // ── Sign Up ──
  case 'signup':
    $input = json_input();
    $name = trim($input['name'] ?? '');
    $email = trim(strtolower($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (!$name || !$email || !$password) {
      respond(['error' => 'Name, email, and password are required'], 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      respond(['error' => 'Invalid email address'], 400);
    }
    if (strlen($password) < 6) {
      respond(['error' => 'Password must be at least 6 characters'], 400);
    }

    $db = db();

    // Check if email exists
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
      respond(['error' => 'An account with this email already exists'], 409);
    }

    // Create user
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    $stmt->execute([$name, $email, $hash]);
    $userId = $db->lastInsertId();

    // Auto-login
    $_SESSION['user_id'] = $userId;

    respond([
      'success' => true,
      'user' => ['id' => (int)$userId, 'name' => $name, 'email' => $email, 'role' => 'member']
    ]);
    break;

  // ── Login ──
  case 'login':
    $input = json_input();
    $email = trim(strtolower($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
      respond(['error' => 'Email and password are required'], 400);
    }

    $db = db();
    $stmt = $db->prepare('SELECT id, name, email, role, password FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
      respond(['error' => 'Invalid email or password'], 401);
    }

    $_SESSION['user_id'] = $user['id'];

    respond([
      'success' => true,
      'user' => [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role']
      ]
    ]);
    break;

  // ── Logout ──
  case 'logout':
    session_destroy();
    respond(['success' => true]);
    break;

  // ── Check Session ──
  case 'check':
    if (!isset($_SESSION['user_id'])) {
      respond(['user' => null]);
    }
    $db = db();
    $stmt = $db->prepare('SELECT id, name, email, role FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user) {
      session_destroy();
      respond(['user' => null]);
    }
    respond([
      'user' => [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role']
      ]
    ]);
    break;

  default:
    respond(['error' => 'Unknown action'], 400);
}
