<?php
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$slug = $_GET['slug'] ?? '';

switch ($action) {

  // ── List approved submissions by type ──
  case 'events':
  case 'programs':
  case 'projects':
  case 'organizations':
  case 'opportunities':
  case 'news':
  case 'articles':
  case 'profiles':
  case 'questions':
    $db = db();
    $type = $action === 'articles' ? 'article' : ($action === 'news' ? 'news' : ($action === 'profiles' ? 'profile' : ($action === 'questions' ? 'question' : $action)));
    $stmt = $db->prepare('SELECT id, payload, created_at FROM submissions WHERE type = ? AND status = ? ORDER BY created_at DESC');
    $stmt->execute([$type, 'approved']);
    $rows = $stmt->fetchAll();
    $items = array_map(function($row) {
      $payload = json_decode($row['payload'], true);
      $payload['id'] = (int)$row['id'];
      $payload['created_at'] = $row['created_at'];
      return $payload;
    }, $rows);
    respond([$action => $items]);
    break;

  // ── Get single submission by ID ──
  case 'get':
    if (!$id) respond(['error' => 'id required'], 400);
    $db = db();
    $stmt = $db->prepare('SELECT id, type, payload, status, created_at FROM submissions WHERE id = ? AND status = ?');
    $stmt->execute([$id, 'approved']);
    $row = $stmt->fetch();
    if (!$row) respond(['error' => 'Not found'], 404);
    $payload = json_decode($row['payload'], true);
    $payload['id'] = (int)$row['id'];
    $payload['type'] = $row['type'];
    $payload['created_at'] = $row['created_at'];
    respond($payload);
    break;

  // ── Stats ──
  case 'stats':
    $db = db();
    $counts = [];
    foreach (['event','program','project','organization','profile','question'] as $type) {
      $stmt = $db->prepare('SELECT COUNT(*) as c FROM submissions WHERE type = ? AND status = ?');
      $stmt->execute([$type, 'approved']);
      $counts[$type . 's'] = (int)$stmt->fetch()['c'];
    }
    $stmt = $db->query('SELECT COUNT(*) as c FROM users');
    $counts['users'] = (int)$stmt->fetch()['c'];
    respond($counts);
    break;

  default:
    respond(['error' => 'Unknown action'], 400);
}
