<?php
require_once __DIR__ . '/config.php';
start_session();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

  // ── Sign Up ──
  case 'signup':
    require_csrf();
    rate_limit('signup:' . get_client_ip(), 3, 3600);

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
    $pwError = validate_password($password);
    if ($pwError) respond(['error' => $pwError], 400);

    $db = db();
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
      respond(['error' => 'An account with this email already exists'], 409);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    $stmt->execute([$name, $email, $hash]);
    $userId = $db->lastInsertId();

    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;

    respond([
      'success' => true,
      'user' => ['id' => (int)$userId, 'name' => $name, 'email' => $email, 'role' => 'member']
    ]);
    break;

  // ── Login ──
  case 'login':
    require_csrf();
    rate_limit('login:' . get_client_ip(), 5, 60);

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

    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];

    // Update last_login
    $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

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
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
      $p = session_get_cookie_params();
      setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    respond(['success' => true]);
    break;

  // ── Check Session ──
  case 'check':
    if (!isset($_SESSION['user_id'])) {
      respond(['user' => null, 'csrf_token' => csrf_token()]);
    }
    $db = db();
    $stmt = $db->prepare('SELECT id, name, email, role FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user) {
      session_destroy();
      respond(['user' => null, 'csrf_token' => csrf_token()]);
    }
    respond([
      'user' => [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role']
      ],
      'csrf_token' => csrf_token()
    ]);
    break;

  default:
    respond(['error' => 'Unknown action'], 400);
}
