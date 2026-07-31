<?php
require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

  // ── Get my profile ──
  case 'profile':
    $user = require_auth();
    $db = db();
    $stmt = $db->prepare('SELECT id, name, email, role, bio, interests, location, avatar_url, website, twitter, linkedin, created_at FROM users WHERE id = ?');
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch();
    $profile['affiliations'] = json_decode($profile['affiliations'] ?? '[]', true);
    $profile['connections'] = json_decode($profile['connections'] ?? '[]', true);
    respond(['user' => $profile]);
    break;

  // ── Update my profile ──
  case 'update-profile':
    $user = require_auth();
    $input = json_input();
    $db = db();

    $fields = [];
    $params = [];
    foreach (['name', 'bio', 'interests', 'location', 'avatar_url', 'website', 'twitter', 'linkedin'] as $field) {
      if (array_key_exists($field, $input)) {
        $fields[] = "$field = ?";
        $params[] = trim($input[$field]);
      }
    }
    if (array_key_exists('affiliations', $input)) {
      $fields[] = "affiliations = ?";
      $params[] = json_encode($input['affiliations']);
    }
    if (array_key_exists('connections', $input)) {
      $fields[] = "connections = ?";
      $params[] = json_encode($input['connections']);
    }
    if (empty($fields)) respond(['error' => 'No fields to update'], 400);

    $params[] = $user['id'];
    $stmt = $db->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($params);
    respond(['success' => true]);
    break;

  // ── Change password ──
  case 'change-password':
    $user = require_auth();
    $input = json_input();
    $current = $input['current_password'] ?? '';
    $newPass = $input['new_password'] ?? '';

    if (!$current || !$newPass) respond(['error' => 'Current and new password required'], 400);
    if (strlen($newPass) < 6) respond(['error' => 'New password must be at least 6 characters'], 400);

    $db = db();
    $stmt = $db->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->execute([$user['id']]);
    $hash = $stmt->fetch()['password'];

    if (!password_verify($current, $hash)) {
      respond(['error' => 'Current password is incorrect'], 401);
    }

    $newHash = password_hash($newPass, PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([$newHash, $user['id']]);
    respond(['success' => true]);
    break;

  // ── Get my submissions ──
  case 'my-submissions':
    $user = require_auth();
    $db = db();
    $type = $_GET['type'] ?? '';
    $status = $_GET['status'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $where = 'user_id = ?';
    $params = [$user['id']];
    if ($type) {
      $where .= ' AND type = ?';
      $params[] = $type;
    }
    if ($status && in_array($status, ['pending','approved','rejected'])) {
      $where .= ' AND status = ?';
      $params[] = $status;
    }

    $countStmt = $db->prepare("SELECT COUNT(*) as c FROM submissions WHERE $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['c'];

    $stmt = $db->prepare("SELECT id, type, payload, status, review_note, created_at, reviewed_at FROM submissions WHERE $where ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
    $stmt->execute($params);
    $subs = $stmt->fetchAll();
    foreach ($subs as &$sub) {
      $sub['payload'] = json_decode($sub['payload'], true);
    }

    respond([
      'submissions' => $subs,
      'total' => $total,
      'page' => $page,
      'pages' => ceil($total / $limit)
    ]);
    break;

  // ── Delete my submission ──
  case 'delete-submission':
    $user = require_auth();
    $input = json_input();
    $subId = (int)($input['id'] ?? 0);
    if (!$subId) respond(['error' => 'id required'], 400);

    $db = db();
    $stmt = $db->prepare('DELETE FROM submissions WHERE id = ? AND user_id = ? AND status = ?');
    $stmt->execute([$subId, $user['id'], 'pending']);
    if ($stmt->rowCount() === 0) {
      respond(['error' => 'Not found or cannot delete (already reviewed)'], 404);
    }
    respond(['success' => true]);
    break;

  default:
    respond(['error' => 'Unknown action'], 400);
}
