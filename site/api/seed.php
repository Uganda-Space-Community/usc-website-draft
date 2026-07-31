<?php
/**
 * USC Database Seeder
 * Run: php api/seed.php
 * Reads data/content.json and populates the database with seed data.
 */

require_once __DIR__ . '/config.php';

$db = db();

// ── Load content.json ──
$jsonPath = __DIR__ . '/../data/content.json';
if (!file_exists($jsonPath)) {
  echo "ERROR: data/content.json not found\n";
  exit(1);
}
$content = json_decode(file_get_contents($jsonPath), true);
if (!$content) {
  echo "ERROR: Failed to parse content.json\n";
  exit(1);
}

echo "=== USC Database Seeder ===\n\n";

// ═══════════════════════════════════════
//  1. CREATE ADMIN USER
// ═══════════════════════════════════════

$adminEmail = 'admin@space.org.ug';
$adminPass = 'admin123';

$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$adminEmail]);
if (!$stmt->fetch()) {
  $hash = password_hash($adminPass, PASSWORD_DEFAULT);
  $db->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
    ->execute(['Admin', $adminEmail, $hash, 'admin']);
  echo "Created admin user: $adminEmail / $adminPass\n";
} else {
  echo "Admin user already exists, skipping\n";
}

// ═══════════════════════════════════════
//  2. SEED EVENTS
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['events']['featured'])) {
  foreach ($content['events']['featured'] as $e) {
    $payload = [
      'title' => $e['title'],
      'description' => $e['text'] ?? '',
      'date' => $e['date'] ?? '',
      'location' => $e['location'] ?? '',
      'type' => $e['type'] ?? 'Event',
      'status' => $e['status'] ?? 'planned',
      'image' => $e['image'] ?? ''
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['event', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
if (!empty($content['events']['headlines'])) {
  foreach ($content['events']['headlines'] as $e) {
    $payload = [
      'title' => $e['title'],
      'date' => $e['date'] ?? '',
      'type' => $e['type'] ?? 'Event',
      'status' => $e['status'] ?? 'planned'
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['event', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count events\n";

// ═══════════════════════════════════════
//  3. SEED PROGRAMS
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['programs'])) {
  foreach ($content['programs'] as $p) {
    $payload = [
      'title' => $p['title'],
      'description' => $p['text'] ?? '',
      'status' => $p['status'] ?? 'active',
      'start' => $p['start'] ?? '',
      'end' => $p['end'] ?? '',
      'totalEvents' => $p['totalEvents'] ?? 0,
      'completedEvents' => $p['completedEvents'] ?? 0
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['program', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count programs\n";

// ═══════════════════════════════════════
//  4. SEED ORGANIZATIONS
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['organizations'])) {
  foreach ($content['organizations'] as $o) {
    $payload = [
      'name' => $o['name'],
      'category' => $o['category'] ?? '',
      'location' => $o['location'] ?? '',
      'icon' => $o['icon'] ?? 'globe',
      'featured' => $o['featured'] ?? false
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['organization', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count organizations\n";

// ═══════════════════════════════════════
//  5. SEED NEWS / ANNOUNCEMENTS
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['announcements'])) {
  foreach ($content['announcements'] as $a) {
    $payload = [
      'title' => $a['title'],
      'excerpt' => $a['excerpt'] ?? '',
      'category' => $a['category'] ?? '',
      'date' => $a['date'] ?? '',
      'source' => $a['source'] ?? '',
      'image' => $a['image'] ?? ''
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['news', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count news items\n";

// ═══════════════════════════════════════
//  6. SEED TEAM MEMBERS AS PROFILES
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['teamMembers'])) {
  foreach ($content['teamMembers'] as $m) {
    $payload = [
      'name' => $m['name'],
      'role' => $m['role'] ?? '',
      'organisation' => $m['organisation'] ?? '',
      'bio' => $m['bio'] ?? '',
      'affiliations' => $m['affiliations'] ?? [],
      'image' => $m['image'] ?? '',
      'featured' => $m['featured'] ?? false
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['profile', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count team profiles\n";

// ═══════════════════════════════════════
//  7. SEED PROGRAMME TRACKS AS PROGRAMS
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['programmeTracks'])) {
  foreach ($content['programmeTracks'] as $t) {
    $payload = [
      'title' => $t['title'],
      'description' => $t['description'] ?? '',
      'track' => $t['track'] ?? '',
      'status' => 'active',
      'image' => $t['image'] ?? ''
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['program', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count programme tracks\n";

// ═══════════════════════════════════════
//  8. SEED FAQ QUESTIONS
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['faq'])) {
  foreach ($content['faq'] as $f) {
    $payload = [
      'question' => $f['question'] ?? '',
      'answers' => $f['answers'] ?? [],
      'category' => $f['category'] ?? ''
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['question', null, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count FAQ questions\n";

echo "\n=== Done ===\n";
echo "Admin login: admin@space.org.ug / admin123\n";
