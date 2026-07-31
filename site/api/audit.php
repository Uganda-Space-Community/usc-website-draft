<?php
require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

  case 'list':
    $user = require_role(['curator', 'admin']);
    $db = db();

    $limit = min(200, max(1, (int)($_GET['limit'] ?? 50)));
    $offset = max(0, (int)($_GET['offset'] ?? 0));
    $actionType = $_GET['action_type'] ?? '';
    $userId = $_GET['user_id'] ?? '';

    $where = '1=1';
    $params = [];

    $validTypes = ['review', 'bulk-review', 'role_change', 'status_change', 'delete'];
    if ($actionType && in_array($actionType, $validTypes)) {
      $where .= ' AND action_type = ?';
      $params[] = $actionType;
    }

    if ($userId) {
      $where .= ' AND user_id = ?';
      $params[] = (int)$userId;
    }

    $countStmt = $db->prepare("SELECT COUNT(*) as c FROM audit_log WHERE $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['c'];

    $stmt = $db->prepare("SELECT id, user_id, user_name, action_type, target_type, target_id, details, created_at FROM audit_log WHERE $where ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    respond([
      'records' => $rows,
      'total' => $total,
    ]);
    break;

  case 'log':
    if (!isset($_SESSION['user_id'])) {
      respond(['ok' => false, 'error' => 'Not authenticated'], 401);
    }

    $input = json_input();
    $actionType = $input['action_type'] ?? '';
    $targetType = $input['target_type'] ?? '';
    $targetId = $input['target_id'] ?? null;
    $details = $input['details'] ?? '';

    if (!$actionType) {
      respond(['error' => 'action_type required'], 400);
    }

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
    $stmt->execute([$userId, $userName, $actionType, $targetType ?: null, $targetId, $details ?: null]);

    respond(['ok' => true, 'id' => (int)$db->lastInsertId()]);
    break;

  default:
    respond(['error' => 'Unknown action'], 400);
}
