<?php
require_once __DIR__ . '/config.php';

session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

  // ── List all users (admin only) ──
  case 'users':
    $admin = require_role('admin');
    $db = db();
    $search = $_GET['search'] ?? '';
    $role = $_GET['role'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $where = '1=1';
    $params = [];
    if ($search) {
      $where .= ' AND (name LIKE ? OR email LIKE ?)';
      $params[] = "%$search%";
      $params[] = "%$search%";
    }
    if ($role && in_array($role, ['member','curator','admin'])) {
      $where .= ' AND role = ?';
      $params[] = $role;
    }

    $countStmt = $db->prepare("SELECT COUNT(*) as c FROM users WHERE $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['c'];

    $stmt = $db->prepare("SELECT id, name, email, role, status, location, created_at, last_login FROM users WHERE $where ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
    $stmt->execute($params);
    $users = $stmt->fetchAll();

    respond([
      'users' => $users,
      'total' => $total,
      'page' => $page,
      'pages' => ceil($total / $limit)
    ]);
    break;

  // ── Update user role (admin only) ──
  case 'update-role':
    $admin = require_role('admin');
    $input = json_input();
    $userId = (int)($input['user_id'] ?? 0);
    $newRole = $input['role'] ?? '';

    if (!$userId || !in_array($newRole, ['member','curator','admin'])) {
      respond(['error' => 'Invalid user_id or role'], 400);
    }
    if ($userId === $admin['id']) {
      respond(['error' => 'Cannot change your own role'], 400);
    }

    $db = db();
    $stmt = $db->prepare('UPDATE users SET role = ? WHERE id = ?');
    $stmt->execute([$newRole, $userId]);
    respond(['success' => true]);
    break;

  // ── Suspend/unsuspend user (admin only) ──
  case 'toggle-status':
    $admin = require_role('admin');
    $input = json_input();
    $userId = (int)($input['user_id'] ?? 0);

    if (!$userId) respond(['error' => 'user_id required'], 400);
    if ($userId === $admin['id']) respond(['error' => 'Cannot suspend yourself'], 400);

    $db = db();
    $stmt = $db->prepare('SELECT status FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) respond(['error' => 'User not found'], 404);

    $newStatus = $user['status'] === 'active' ? 'suspended' : 'active';
    $stmt = $db->prepare('UPDATE users SET status = ? WHERE id = ?');
    $stmt->execute([$newStatus, $userId]);
    respond(['success' => true, 'status' => $newStatus]);
    break;

  // ── List pending submissions (curator or admin) ──
  case 'pending':
    $user = require_role(['curator', 'admin']);
    $db = db();
    $type = $_GET['type'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $where = 'status = ?';
    $params = ['pending'];
    if ($type && in_array($type, ['event','program','project','organization','profile','question','news','article','opportunity'])) {
      $where .= ' AND type = ?';
      $params[] = $type;
    }

    $countStmt = $db->prepare("SELECT COUNT(*) as c FROM submissions WHERE $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['c'];

    $stmt = $db->prepare("SELECT s.id, s.type, s.payload, s.status, s.created_at, u.name as author_name, u.email as author_email FROM submissions s LEFT JOIN users u ON s.user_id = u.id WHERE $where ORDER BY s.created_at ASC LIMIT $limit OFFSET $offset");
    $stmt->execute($params);
    $submissions = $stmt->fetchAll();

    // Decode JSON payload for each
    foreach ($submissions as &$sub) {
      $sub['payload'] = json_decode($sub['payload'], true);
    }

    respond([
      'submissions' => $submissions,
      'total' => $total,
      'page' => $page,
      'pages' => ceil($total / $limit)
    ]);
    break;

  // ── Review submission (curator or admin) ──
  case 'review':
    $user = require_role(['curator', 'admin']);
    $input = json_input();
    $subId = (int)($input['id'] ?? 0);
    $newStatus = $input['status'] ?? '';
    $note = trim($input['note'] ?? '');

    if (!$subId || !in_array($newStatus, ['approved', 'rejected'])) {
      respond(['error' => 'id and status (approved/rejected) required'], 400);
    }

    $db = db();
    $stmt = $db->prepare('UPDATE submissions SET status = ?, reviewed_by = ?, review_note = ?, reviewed_at = NOW() WHERE id = ? AND status = ?');
    $stmt->execute([$newStatus, $user['id'], $note ?: null, $subId, 'pending']);

    if ($stmt->rowCount() === 0) {
      respond(['error' => 'Submission not found or already reviewed'], 404);
    }
    respond(['success' => true]);
    break;

  // ── Bulk review (curator or admin) ──
  case 'bulk-review':
    $user = require_role(['curator', 'admin']);
    $input = json_input();
    $ids = $input['ids'] ?? [];
    $newStatus = $input['status'] ?? '';

    if (empty($ids) || !in_array($newStatus, ['approved', 'rejected'])) {
      respond(['error' => 'ids array and status required'], 400);
    }

    $db = db();
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $params = array_merge([$newStatus, $user['id'], $newStatus], $ids);
    $stmt = $db->prepare("UPDATE submissions SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id IN ($placeholders) AND status = ?");
    $stmt->execute($params);
    respond(['success' => true, 'updated' => $stmt->rowCount()]);
    break;

  // ── Delete submission (admin only) ──
  case 'delete-submission':
    $admin = require_role('admin');
    $input = json_input();
    $subId = (int)($input['id'] ?? 0);
    if (!$subId) respond(['error' => 'id required'], 400);

    $db = db();
    $stmt = $db->prepare('DELETE FROM submissions WHERE id = ?');
    $stmt->execute([$subId]);
    respond(['success' => true]);
    break;

  // ── Platform stats (admin only) ──
  case 'stats':
    $admin = require_role('admin');
    $db = db();

    $stats = [];
    // User counts
    $stmt = $db->query('SELECT role, COUNT(*) as c FROM users GROUP BY role');
    foreach ($stmt->fetchAll() as $row) {
      $stats['users_' . $row['role']] = (int)$row['c'];
    }
    $stmt = $db->query('SELECT COUNT(*) as c FROM users');
    $stats['users_total'] = (int)$stmt->fetch()['c'];

    // Submission counts by status
    $stmt = $db->query('SELECT status, COUNT(*) as c FROM submissions GROUP BY status');
    foreach ($stmt->fetchAll() as $row) {
      $stats['subs_' . $row['status']] = (int)$row['c'];
    }

    // Submission counts by type
    $stmt = $db->query('SELECT type, COUNT(*) as c FROM submissions WHERE status = "approved" GROUP BY type');
    foreach ($stmt->fetchAll() as $row) {
      $stats[$row['type'] . '_approved'] = (int)$row['c'];
    }

    // Recent activity
    $stmt = $db->query('SELECT DATE(created_at) as day, COUNT(*) as c FROM submissions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY day ORDER BY day');
    $stats['activity_30d'] = $stmt->fetchAll();

    respond($stats);
    break;

  default:
    respond(['error' => 'Unknown action'], 400);
}
