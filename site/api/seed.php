<?php
/**
 * USC Database Seeder
 * Run: php api/seed.php
 * Reads data/content.json and populates the database with seed data.
 */

// CLI only — prevent web execution
if (php_sapi_name() !== 'cli') {
  http_response_code(403);
  echo 'Forbidden';
  exit(1);
}

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
    $payload = $e;
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['event', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
if (!empty($content['events']['headlines'])) {
  foreach ($content['events']['headlines'] as $e) {
    $payload = $e;
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
    $payload = $p;
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
    $payload = $o;
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
    $payload = $a;
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
    $payload = $m;
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
    $payload = $t;
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
    $payload = $f;
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['question', null, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count FAQ questions\n";

// ═══════════════════════════════════════
//  9. SEED OPPORTUNITIES
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['opportunities'])) {
  foreach ($content['opportunities'] as $o) {
    $payload = $o;
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['opportunity', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count opportunities\n";

// ═══════════════════════════════════════
//  10. SEED KNOWLEDGE BASE
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['knowledge'])) {
  foreach ($content['knowledge'] as $k) {
    $payload = $k;
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['article', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count knowledge articles\n";

// ═══════════════════════════════════════
//  11. SEED ACTIVITIES
// ═══════════════════════════════════════

$count = 0;
if (!empty($content['activities'])) {
  foreach ($content['activities'] as $a) {
    $payload = $a;
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['event', 1, json_encode($payload), 'approved', 1]);
    $count++;
  }
}
echo "Seeded $count activities\n";

echo "\n=== Done ===\n";
echo "Admin login: admin@space.org.ug / admin123\n";
