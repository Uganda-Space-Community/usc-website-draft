<?php
require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

  // ── Submit any form ──
  case 'submit':
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

  // ── Submit question (no auth required) ──
  case 'question':
    $input = json_input();
    $name = trim($input['name'] ?? '');
    $text = trim($input['text'] ?? '');

    if (!$name || !$text) {
      respond(['error' => 'Name and question are required'], 400);
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
    $user = require_auth();
    $input = json_input();
    $answerKey = $input['answer_key'] ?? '';
    $value = (int)($input['value'] ?? 0);

    if (!$answerKey || !in_array($value, [-1, 1])) {
      respond(['error' => 'answer_key and value (1 or -1) required'], 400);
    }

    $db = db();
    $stmt = $db->prepare('INSERT INTO faq_votes (user_id, answer_key, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)');
    $stmt->execute([$user['id'], $answerKey, $value]);

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
