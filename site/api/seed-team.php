<?php
/**
 * USC Team & Author Seeder
 * Run: php api/seed-team.php
 * Creates user accounts for team members, assigns curator roles, and re-seeds content with authorship.
 */

require_once __DIR__ . '/config.php';

$db = db();

$jsonPath = __DIR__ . '/../data/content.json';
$content = json_decode(file_get_contents($jsonPath), true);

echo "=== USC Team & Author Seeder ===\n\n";

// ═══════════════════════════════════════
//  1. CREATE USER ACCOUNTS FOR TEAM
// ═══════════════════════════════════════

$curators = [
  'Ronnie Atuhaire',
  'Zoora Harrison',
  'Angu\'zu Raymond',
  'Halimah Bukirwa',
  'Navneet Singh',
  'Twesigye Duncan'
];

$memberUserIds = [];
$curatorUserIds = [];

if (!empty($content['teamMembers'])) {
  foreach ($content['teamMembers'] as $m) {
    $name = $m['name'];
    $email = $m['email'] ?? strtolower(str_replace([' ','\'','.',','], ['.','','','',''], $name)) . '@space.org.ug';
    $role = in_array($name, $curators) ? 'curator' : 'member';

    // Check if user exists
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $existing = $stmt->fetch();

    if ($existing) {
      // Update role if needed
      if ($role === 'curator') {
        $db->prepare('UPDATE users SET role = ? WHERE id = ?')->execute(['curator', $existing['id']]);
      }
      $userId = $existing['id'];
      echo "Updated: $name ($email) → $role (id:$userId)\n";
    } else {
      $hash = password_hash('space2026', PASSWORD_DEFAULT);
      $db->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
        ->execute([$name, $email, $hash, $role]);
      $userId = $db->lastInsertId();
      echo "Created: $name ($email) → $role (id:$userId)\n";
    }

    if ($role === 'curator') {
      $curatorUserIds[$name] = $userId;
    } else {
      $memberUserIds[$name] = $userId;
    }
  }
}

echo "\nCurators: " . count($curatorUserIds) . "\n";
echo "Members: " . count($memberUserIds) . "\n\n";

// ═══════════════════════════════════════
//  2. CLEAR OLD SEED SUBMISSIONS
// ═══════════════════════════════════════

$db->exec('DELETE FROM submissions WHERE user_id = 1');
echo "Cleared old admin-seeded submissions\n";

// ═══════════════════════════════════════
//  3. RE-SEED CONTENT WITH AUTHORSHIP
// ═══════════════════════════════════════

$authorNames = array_keys($curatorUserIds + $memberUserIds);
$authorIdx = 0;

function getAuthorId(&$authorNames, &$authorIdx, $curatorUserIds, $memberUserIds, $preferredAuthor = null) {
  if ($preferredAuthor && isset($curatorUserIds[$preferredAuthor])) return $curatorUserIds[$preferredAuthor];
  if ($preferredAuthor && isset($memberUserIds[$preferredAuthor])) return $memberUserIds[$preferredAuthor];
  // Round-robin through curators first, then members
  $allIds = array_merge(array_values($curatorUserIds), array_values($memberUserIds));
  $id = $allIds[$authorIdx % count($allIds)];
  $authorIdx++;
  return $id;
}

// ── Events ──
$count = 0;
if (!empty($content['events']['featured'])) {
  foreach ($content['events']['featured'] as $e) {
    $authorName = $e['author'] ?? $authorNames[$count % count($authorNames)];
    $userId = getAuthorId($authorNames, $authorIdx, $curatorUserIds, $memberUserIds, $authorName);
    $payload = [
      'title' => $e['title'],
      'description' => $e['text'] ?? '',
      'date' => $e['date'] ?? '',
      'location' => $e['location'] ?? '',
      'type' => $e['type'] ?? 'Event',
      'status' => $e['status'] ?? 'planned',
      'image' => $e['image'] ?? '',
      'organizer' => $e['organizer'] ?? '',
      'capacity' => $e['capacity'] ?? 'Open',
      'registration' => $e['registration'] ?? 'Open',
      'tags' => $e['tags'] ?? [],
      'agenda' => $e['agenda'] ?? []
    ];
    $reviewedBy = $curatorUserIds[array_keys($curatorUserIds)[array_search($authorName, $authorNames) % count($curatorUserIds)] ?? array_values($curatorUserIds)[0]];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['event', $userId, json_encode($payload), 'approved', $reviewedBy]);
    $count++;
  }
}
if (!empty($content['events']['headlines'])) {
  foreach ($content['events']['headlines'] as $e) {
    $userId = getAuthorId($authorNames, $authorIdx, $curatorUserIds, $memberUserIds);
    $payload = [
      'title' => $e['title'],
      'date' => $e['date'] ?? '',
      'type' => $e['type'] ?? 'Event',
      'status' => $e['status'] ?? 'planned'
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['event', $userId, json_encode($payload), 'approved', array_values($curatorUserIds)[0]]);
    $count++;
  }
}
echo "Seeded $count events with authorship\n";

// ── Programs ──
$count = 0;
if (!empty($content['programs'])) {
  foreach ($content['programs'] as $i => $p) {
    $authorName = $authorNames[$i % count($authorNames)];
    $userId = getAuthorId($authorNames, $authorIdx, $curatorUserIds, $memberUserIds, $authorName);
    $payload = [
      'title' => $p['title'],
      'description' => $p['description'] ?? $p['text'] ?? '',
      'status' => $p['status'] ?? 'active',
      'start' => $p['start'] ?? '',
      'end' => $p['end'] ?? '',
      'totalEvents' => $p['totalEvents'] ?? 0,
      'completedEvents' => $p['completedEvents'] ?? 0,
      'organizer' => $p['organizer'] ?? '',
      'outcomes' => $p['outcomes'] ?? [],
      'participants' => $p['participants'] ?? 0,
      'region' => $p['region'] ?? ''
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['program', $userId, json_encode($payload), 'approved', array_values($curatorUserIds)[0]]);
    $count++;
  }
}
echo "Seeded $count programs with authorship\n";

// ── Organizations ──
$count = 0;
if (!empty($content['organizations'])) {
  foreach ($content['organizations'] as $i => $o) {
    $userId = getAuthorId($authorNames, $authorIdx, $curatorUserIds, $memberUserIds);
    $payload = [
      'name' => $o['name'],
      'category' => $o['category'] ?? '',
      'location' => $o['location'] ?? '',
      'icon' => $o['icon'] ?? 'globe',
      'featured' => $o['featured'] ?? false,
      'description' => $o['description'] ?? '',
      'website' => $o['website'] ?? '#',
      'founded' => $o['founded'] ?? null,
      'members' => $o['members'] ?? 0,
      'focus' => $o['focus'] ?? []
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['organization', $userId, json_encode($payload), 'approved', array_values($curatorUserIds)[0]]);
    $count++;
  }
}
echo "Seeded $count organizations with authorship\n";

// ── News / Announcements ──
$count = 0;
if (!empty($content['announcements'])) {
  foreach ($content['announcements'] as $a) {
    $authorName = $a['author'] ?? $authorNames[$count % count($authorNames)];
    $userId = getAuthorId($authorNames, $authorIdx, $curatorUserIds, $memberUserIds, $authorName);
    $payload = [
      'title' => $a['title'],
      'excerpt' => $a['excerpt'] ?? '',
      'body' => $a['body'] ?? '',
      'category' => $a['category'] ?? '',
      'date' => $a['date'] ?? '',
      'source' => $a['source'] ?? '',
      'image' => $a['image'] ?? '',
      'author' => $authorName
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['news', $userId, json_encode($payload), 'approved', array_values($curatorUserIds)[0]]);
    $count++;
  }
}
echo "Seeded $count news items with authorship\n";

// ── Team Profiles ──
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
      'featured' => $m['featured'] ?? false,
      'email' => $m['email'] ?? '',
      'location' => $m['location'] ?? '',
      'expertise' => $m['expertise'] ?? [],
      'achievements' => $m['achievements'] ?? [],
      'social' => $m['social'] ?? []
    ];
    $stmt = $db->prepare('SELECT id FROM users WHERE name = ?');
    $stmt->execute([$m['name']]);
    $u = $stmt->fetch();
    $userId = $u ? $u['id'] : array_values($memberUserIds)[0];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['profile', $userId, json_encode($payload), 'approved', array_values($curatorUserIds)[0]]);
    $count++;
  }
}
echo "Seeded $count profiles\n";

// ── Programme Tracks ──
$count = 0;
if (!empty($content['programmeTracks'])) {
  foreach ($content['programmeTracks'] as $i => $t) {
    $userId = getAuthorId($authorNames, $authorIdx, $curatorUserIds, $memberUserIds);
    $payload = [
      'title' => $t['title'],
      'description' => $t['description'] ?? '',
      'track' => $t['track'] ?? '',
      'status' => 'active',
      'image' => $t['image'] ?? '',
      'objectives' => $t['objectives'] ?? [],
      'duration' => $t['duration'] ?? '',
      'level' => $t['level'] ?? '',
      'format' => $t['format'] ?? ''
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['program', $userId, json_encode($payload), 'approved', array_values($curatorUserIds)[0]]);
    $count++;
  }
}
echo "Seeded $count programme tracks\n";

// ── Opportunities ──
$count = 0;
if (!empty($content['opportunities'])) {
  foreach ($content['opportunities'] as $o) {
    $userId = getAuthorId($authorNames, $authorIdx, $curatorUserIds, $memberUserIds);
    $payload = [
      'title' => $o['title'],
      'type' => $o['type'] ?? '',
      'organization' => $o['organization'] ?? '',
      'deadline' => $o['deadline'] ?? '',
      'eligible' => $o['eligible'] ?? '',
      'description' => $o['description'] ?? '',
      'link' => $o['link'] ?? '#',
      'amount' => $o['amount'] ?? '',
      'duration' => $o['duration'] ?? '',
      'applicationProcess' => $o['applicationProcess'] ?? '',
      'benefits' => $o['benefits'] ?? []
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['opportunity', $userId, json_encode($payload), 'approved', array_values($curatorUserIds)[0]]);
    $count++;
  }
}
echo "Seeded $count opportunities\n";

// ── Knowledge ──
$count = 0;
if (!empty($content['knowledge'])) {
  foreach ($content['knowledge'] as $k) {
    $authorName = $k['author'] ?? $authorNames[$count % count($authorNames)];
    $userId = getAuthorId($authorNames, $authorIdx, $curatorUserIds, $memberUserIds, $authorName);
    $payload = [
      'slug' => $k['slug'],
      'title' => $k['title'],
      'category' => $k['category'] ?? '',
      'author' => $authorName,
      'institution' => $k['institution'] ?? '',
      'date' => $k['date'] ?? '',
      'summary' => $k['summary'] ?? '',
      'body' => $k['body'] ?? '',
      'image' => $k['image'] ?? '',
      'tags' => $k['tags'] ?? [],
      'doi' => $k['doi'] ?? null,
      'downloads' => $k['downloads'] ?? 0,
      'citations' => $k['citations'] ?? 0
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['article', $userId, json_encode($payload), 'approved', array_values($curatorUserIds)[0]]);
    $count++;
  }
}
echo "Seeded $count knowledge articles\n";

// ── FAQ ──
$count = 0;
if (!empty($content['faq'])) {
  foreach ($content['faq'] as $f) {
    $payload = [
      'question' => $f['question'],
      'slug' => $f['slug'] ?? '',
      'category' => $f['category'] ?? '',
      'answers' => $f['answers'] ?? []
    ];
    $db->prepare('INSERT INTO submissions (type, user_id, payload, status, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, NOW())')
      ->execute(['question', null, json_encode($payload), 'approved', array_values($curatorUserIds)[0]]);
    $count++;
  }
}
echo "Seeded $count FAQ questions\n";

echo "\n=== Done ===\n";
echo "Curator accounts (password: space2026):\n";
foreach ($curatorUserIds as $name => $id) {
  $stmt = $db->prepare('SELECT email FROM users WHERE id = ?');
  $stmt->execute([$id]);
  $email = $stmt->fetch()['email'];
  echo "  $name — $email\n";
}
