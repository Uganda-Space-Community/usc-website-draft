<?php
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

switch ($action) {

  // ── Approved submissions by type ──
  case 'events':
  case 'programs':
  case 'projects':
  case 'organizations':
  case 'opportunities':
  case 'news':
  case 'articles':
    $db = db();
    $stmt = $db->prepare('SELECT id, payload, created_at FROM submissions WHERE type = ? AND status = ? ORDER BY created_at DESC');
    $stmt->execute([$action === 'articles' ? 'article' : ($action === 'news' ? 'news' : $action), 'approved']);
    $rows = $stmt->fetchAll();
    $items = array_map(function($row) {
      $payload = json_decode($row['payload'], true);
      $payload['id'] = (int)$row['id'];
      $payload['created_at'] = $row['created_at'];
      return $payload;
    }, $rows);
    respond([$action => $items]);
    break;

  // ── Community profiles ──
  case 'profiles':
    $db = db();
    $stmt = $db->prepare('SELECT payload FROM submissions WHERE type = ? AND status = ? ORDER BY created_at DESC');
    $stmt->execute(['profile', 'approved']);
    $rows = $stmt->fetchAll();
    $items = array_map(fn($r) => json_decode($r['payload'], true), $rows);
    respond(['profiles' => $items]);
    break;

  // ── FAQ questions ──
  case 'faqs':
    $db = db();
    $stmt = $db->prepare('SELECT id, payload, created_at FROM submissions WHERE type = ? AND status = ? ORDER BY created_at DESC');
    $stmt->execute(['question', 'approved']);
    $rows = $stmt->fetchAll();
    $items = array_map(function($row) {
      $payload = json_decode($row['payload'], true);
      $payload['id'] = (int)$row['id'];
      return $payload;
    }, $rows);
    respond(['faqs' => $items]);
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
