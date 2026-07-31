<?php
require_once __DIR__ . '/config.php';
start_session();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

  // ── Submit any form ──
  case 'submit':
    require_csrf();
    $user = require_auth();
    $input = json_input();
    $type = $input['type'] ?? '';
    $payload = $input['payload'] ?? null;

    if (!$type || !$payload) {
      respond(['error' => 'Type and payload are required'], 400);
    }

    $validTypes = ['event','program','project','organization','profile','question','news','article','opportunity'];
    if (!in_array($type, $validTypes)) {
      respond(['error' => 'Invalid submission type'], 400);
    }

    $db = db();
    $stmt = $db->prepare('INSERT INTO submissions (type, user_id, payload) VALUES (?, ?, ?)');
    $stmt->execute([$type, $user['id'], json_encode($payload)]);

    respond([
      'success' => true,
      'id' => (int)$db->lastInsertId(),
      'message' => 'Submission received. It will appear after review.'
    ]);
    break;

  // ── Submit question (no auth required, rate limited) ──
  case 'question':
    require_csrf();
    rate_limit('question:' . get_client_ip(), 5, 3600);

    $input = json_input();
    $name = trim($input['name'] ?? '');
    $text = trim($input['text'] ?? '');

    if (!$name || !$text) {
      respond(['error' => 'Name and question are required'], 400);
    }
    if (mb_strlen($name) > 200) {
      respond(['error' => 'Name too long'], 400);
    }
    if (mb_strlen($text) > 5000) {
      respond(['error' => 'Question too long (max 5000 characters)'], 400);
    }

    $db = db();
    $stmt = $db->prepare('INSERT INTO submissions (type, user_id, payload) VALUES (?, ?, ?)');
    $stmt->execute(['question', null, json_encode(['name' => $name, 'text' => $text])]);

    respond([
      'success' => true,
      'id' => (int)$db->lastInsertId(),
      'message' => 'Question submitted.'
    ]);
    break;

  // ── Vote on FAQ answer ──
  case 'vote':
    require_csrf();
    rate_limit('vote:' . get_client_ip(), 20, 3600);
    $user = require_auth();
    $input = json_input();
    $answerKey = $input['answer_key'] ?? '';
    $value = (int)($input['value'] ?? 0);

    if (!$answerKey || !in_array($value, [-1, 1])) {
      respond(['error' => 'answer_key and value (1 or -1) required'], 400);
    }

    $db = db();
    try {
      $stmt = $db->prepare('INSERT INTO faq_votes (user_id, answer_key, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)');
      $stmt->execute([$user['id'], $answerKey, $value]);
    } catch (PDOException $e) {
      error_log('Vote failed: ' . $e->getMessage());
      respond(['error' => 'Vote failed. The faq_votes table may not exist on the server.'], 500);
    }

    respond(['success' => true]);
    break;

  // ── List user's own submissions ──
  case 'mine':
    $user = require_auth();
    $db = db();
    $stmt = $db->prepare('SELECT id, type, status, created_at FROM submissions WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$user['id']]);
    respond(['submissions' => $stmt->fetchAll()]);
    break;

  default:
    respond(['error' => 'Unknown action'], 400);
}
