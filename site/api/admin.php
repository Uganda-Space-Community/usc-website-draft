<?php
require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

function auditLog($actionType, $targetType, $targetId, $details) {
  if (session_status() === PHP_SESSION_NONE) session_start();
  if (!isset($_SESSION['user_id'])) return;
  try {
    $db = db();
    $userId = $_SESSION['user_id'];
    $userName = $_SESSION['user_name'] ?? '';
    if (!$userName) {
      $stmt = $db->prepare('SELECT name FROM users WHERE id = ?');
      $stmt->execute([$userId]);
      $row = $stmt->fetch();
      $userName = $row ? $row['name'] : '';
    }
    $stmt = $db->prepare('INSERT INTO audit_log (user_id, user_name, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$userId, $userName, $actionType, $targetType, $targetId, $details]);
  } catch (Exception $e) {}
}

switch ($action) {

  // ═══════════════════════════════════════════
  //  DASHBOARD STATS
  // ═══════════════════════════════════════════

  case 'stats':
    $user = require_role(['curator', 'admin']);
    $db = db();
    $stats = [];

    // Submission counts by status
    $stmt = $db->query('SELECT status, COUNT(*) as c FROM submissions GROUP BY status');
    foreach ($stmt->fetchAll() as $row) {
      $stats['submissions_' . $row['status']] = (int)$row['c'];
    }

    // Submission counts by type (approved)
    $types = ['event','program','project','organization','news','article','opportunity'];
    foreach ($types as $type) {
      $stmt = $db->prepare('SELECT COUNT(*) as c FROM submissions WHERE type = ? AND status = ?');
      $stmt->execute([$type, 'approved']);
      $stats[$type . 's'] = (int)$stmt->fetch()['c'];
    }

    // Total submissions
    $stmt = $db->query('SELECT COUNT(*) as c FROM submissions');
    $stats['submissions_total'] = (int)$stmt->fetch()['c'];

    // Pending count
    $stmt = $db->query('SELECT COUNT(*) as c FROM submissions WHERE status = "pending"');
    $stats['submissions_pending'] = (int)$stmt->fetch()['c'];

    // User counts
    $stmt = $db->query('SELECT role, COUNT(*) as c FROM users GROUP BY role');
    foreach ($stmt->fetchAll() as $row) {
      $stats['users_' . $row['role']] = (int)$row['c'];
    }
    $stmt = $db->query('SELECT COUNT(*) as c FROM users');
    $stats['users_total'] = (int)$stmt->fetch()['c'];

    // Recent activity (30 days)
    $stmt = $db->query('SELECT DATE(created_at) as day, COUNT(*) as c FROM submissions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY day ORDER BY day');
    $stats['activity_30d'] = $stmt->fetchAll();

    // Recent reviews (last 10)
    $stmt = $db->query('SELECT s.id, s.type, s.status, s.reviewed_at, u.name as reviewer_name FROM submissions s LEFT JOIN users u ON s.reviewed_by = u.id WHERE s.reviewed_at IS NOT NULL ORDER BY s.reviewed_at DESC LIMIT 10');
    $stats['recent_reviews'] = $stmt->fetchAll();

    // Recent submissions (last 10)
    $stmt = $db->query('SELECT s.id, s.type, s.status, s.created_at, u.name as author_name FROM submissions s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC LIMIT 10');
    $stats['recent_submissions'] = $stmt->fetchAll();

    respond($stats);
    break;

  // ═══════════════════════════════════════════
  //  UNIFIED CONTENT CRUD (submissions table)
  // ═══════════════════════════════════════════

  // ── List records ──
  case 'list':
    $user = require_role(['curator', 'admin']);
    $db = db();

    $type = $_GET['type'] ?? '';
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $where = '1=1';
    $params = [];

    $validTypes = ['event','program','project','organization','profile','question','news','article','opportunity'];
    if ($type && in_array($type, $validTypes)) {
      $where .= ' AND s.type = ?';
      $params[] = $type;
    }

    $validStatuses = ['pending','approved','rejected'];
    if ($status && in_array($status, $validStatuses)) {
      $where .= ' AND s.status = ?';
      $params[] = $status;
    }

    if ($search) {
      $where .= ' AND JSON_EXTRACT(s.payload, "$.title") LIKE ?';
      $params[] = "%$search%";
    }

    // Count
    $countStmt = $db->prepare("SELECT COUNT(*) as c FROM submissions s WHERE $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['c'];

    // Fetch
    $stmt = $db->prepare("SELECT s.id, s.type, s.payload, s.status, s.review_note, s.created_at, s.reviewed_at, u.name as author_name, u.email as author_email FROM submissions s LEFT JOIN users u ON s.user_id = u.id WHERE $where ORDER BY s.created_at DESC LIMIT $limit OFFSET $offset");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
      $payload = json_decode($row['payload'], true);
      $row['payload'] = $payload;
      $row['title'] = $payload['title'] ?? $payload['name'] ?? $payload['question'] ?? '(untitled)';
    }

    respond([
      'records' => $rows,
      'total' => $total,
      'page' => $page,
      'pages' => ceil($total / $limit),
      'limit' => $limit
    ]);
    break;

  // ── Get single record ──
  case 'get':
    $user = require_role(['curator', 'admin']);
    $db = db();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) respond(['error' => 'id required'], 400);

    $stmt = $db->prepare('SELECT s.id, s.type, s.payload, s.status, s.review_note, s.user_id, s.created_at, s.reviewed_at, u.name as author_name, u.email as author_email FROM submissions s LEFT JOIN users u ON s.user_id = u.id WHERE s.id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) respond(['error' => 'Not found'], 404);

    $row['payload'] = json_decode($row['payload'], true);
    respond($row);
    break;

  // ── Create record (admin only) ──
  case 'create':
    $user = require_role('admin');
    $input = json_input();
    $type = $input['type'] ?? '';
    $payload = $input['payload'] ?? null;

    $validTypes = ['event','program','project','organization','news','article','opportunity'];
    if (!$type || !in_array($type, $validTypes)) {
      respond(['error' => 'Invalid type'], 400);
    }
    if (!$payload || !is_array($payload)) {
      respond(['error' => 'payload required'], 400);
    }

    $db = db();
    $stmt = $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$type, $user['id'], json_encode($payload), 'approved', $user['id']]);
    respond(['success' => true, 'id' => (int)$db->lastInsertId()]);
    break;

  // ── Update record (admin only) ──
  case 'update':
    $user = require_role('admin');
    $input = json_input();
    $id = (int)($input['id'] ?? 0);
    $payload = $input['payload'] ?? null;

    if (!$id) respond(['error' => 'id required'], 400);
    if (!$payload || !is_array($payload)) respond(['error' => 'payload required'], 400);

    $db = db();
    $stmt = $db->prepare('UPDATE submissions SET payload = ? WHERE id = ?');
    $stmt->execute([json_encode($payload), $id]);
    if ($stmt->rowCount() === 0) respond(['error' => 'Not found'], 404);
    respond(['success' => true]);
    break;

  // ── Delete record (admin only) ──
  case 'delete':
    $user = require_role('admin');
    $input = json_input();
    $id = (int)($input['id'] ?? 0);
    if (!$id) respond(['error' => 'id required'], 400);

    $db = db();
    $stmt = $db->prepare('DELETE FROM submissions WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) respond(['error' => 'Not found'], 404);
    auditLog('delete', 'submission', $id, 'Deleted submission');
    respond(['success' => true]);
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
    $stmt = $db->prepare('UPDATE submissions SET status = ?, reviewed_by = ?, review_note = ?, reviewed_at = NOW() WHERE id = ?');
    $stmt->execute([$newStatus, $user['id'], $note ?: null, $subId]);
    if ($stmt->rowCount() === 0) respond(['error' => 'Not found'], 404);
    auditLog('review', 'submission', $subId, ($newStatus === 'approved' ? 'Approved' : 'Rejected') . ($note ? ': ' . $note : ''));
    respond(['success' => true]);
    break;

  // ── Bulk review ──
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
    $updated = $stmt->rowCount();
    foreach ($ids as $logId) {
      auditLog('bulk-review', 'submission', $logId, ($newStatus === 'approved' ? 'Approved' : 'Rejected') . ' (bulk)');
    }
    respond(['success' => true, 'updated' => $updated]);
    break;

  // ═══════════════════════════════════════════
  //  USER MANAGEMENT (admin only)
  // ═══════════════════════════════════════════

  case 'users':
    $admin = require_role('admin');
    $db = db();
    $search = $_GET['search'] ?? '';
    $role = $_GET['role'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
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
    auditLog('role_change', 'user', $userId, 'Changed role to ' . $newRole);
    respond(['success' => true]);
    break;

  case 'toggle-status':
    $admin = require_role('admin');
    $input = json_input();
    $userId = (int)($input['user_id'] ?? 0);

    if (!$userId) respond(['error' => 'user_id required'], 400);
    if ($userId === $admin['id']) respond(['error' => 'Cannot suspend yourself'], 400);

    $db = db();
    $stmt = $db->prepare('SELECT status FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $u = $stmt->fetch();
    if (!$u) respond(['error' => 'User not found'], 404);

    $newStatus = $u['status'] === 'active' ? 'suspended' : 'active';
    $stmt = $db->prepare('UPDATE users SET status = ? WHERE id = ?');
    $stmt->execute([$newStatus, $userId]);
    auditLog('status_change', 'user', $userId, $newStatus === 'suspended' ? 'Suspended' : 'Unsuspended');
    respond(['success' => true, 'status' => $newStatus]);
    break;

  // ═══════════════════════════════════════════
  //  SETTINGS (admin only)
  // ═══════════════════════════════════════════

  case 'settings':
    $admin = require_role('admin');
    $db = db();

    // Create settings table if not exists
    $db->exec('CREATE TABLE IF NOT EXISTS settings (`key` VARCHAR(255) PRIMARY KEY, value TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      $input = json_input();
      foreach ($input as $key => $value) {
        $stmt = $db->prepare('INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)');
        $stmt->execute([$key, is_string($value) ? $value : json_encode($value)]);
      }
      respond(['success' => true]);
    }

    $stmt = $db->query('SELECT `key`, value FROM settings');
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
      $settings[$row['key']] = $row['value'];
    }
    respond(['settings' => $settings]);
    break;

  default:
    respond(['error' => 'Unknown action'], 400);
}
