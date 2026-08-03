<?php
/**
 * USC Space API Proxy
 * Proxies NASA APOD, Launch Library 2, and SNAPI with file-based caching.
 * Priority: Uganda > East Africa > Africa > Global
 */
require_once __DIR__ . '/config.php';

define('ISS_OBS_LAT', 0.3163);   // Kampala
define('ISS_OBS_LON', 32.5822);
define('ISS_MIN_ELEV', 10.0);

$cacheDir = __DIR__ . '/../cache';
if (!is_dir($cacheDir)) mkdir($cacheDir, 0755, true);

$action = $_GET['action'] ?? '';
$date = $_GET['date'] ?? date('Y-m-d');

switch ($action) {
  case 'apod':
    serveAPOD($cacheDir, $date);
    break;
  case 'launches':
    serveLaunches($cacheDir);
    break;
  case 'news':
    serveNews($cacheDir);
    break;
  case 'iss':
    serveISS($cacheDir);
    break;
  case 'celestial':
    serveCelestial();
    break;
  default:
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action. Use: apod, launches, news, iss, celestial']);
}

// ═══ NASA APOD ═══
function serveAPOD($cacheDir, $date) {
  $cacheFile = $cacheDir . '/apod_' . preg_replace('/[^0-9-]/', '', $date) . '.json';

  // APOD: one file per day, re-fetch only if file is from a different day
  if (file_exists($cacheFile)) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    if ($cached && ($cached['date'] ?? '') === $date) {
      header('X-Cache: HIT');
      echo json_encode($cached);
      return;
    }
  }

  $apiKey = defined('NASA_API_KEY') ? NASA_API_KEY : 'DEMO_KEY';
  $url = "https://api.nasa.gov/planetary/apod?api_key={$apiKey}&date={$date}&thumbs=true";
  $response = fetchWithTimeout($url, 10);

  if ($response && isset($response['url'])) {
    file_put_contents($cacheFile, json_encode($response));
    header('X-Cache: MISS');
    echo json_encode($response);
  } else {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to fetch APOD', 'fallback' => true]);
  }
}

// ═══ Launch Library 2 ═══
function serveLaunches($cacheDir) {
  $cacheFile = $cacheDir . '/ll2_launches.json';
  $ttl = 3600; // 1 hour

  if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
    header('X-Cache: HIT');
    echo file_get_contents($cacheFile);
    return;
  }

  $url = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=25&ordering=net';
  $response = fetchWithTimeout($url, 15);

  if ($response && isset($response['results'])) {
    $output = [
      'source' => 'Launch Library 2',
      'fetched' => date('c'),
      'launches' => array_map(function($l) {
        return [
          'id' => $l['id'] ?? '',
          'name' => $l['name'] ?? '',
          'provider' => $l['launch_service_provider']['name'] ?? '',
          'net' => $l['net'] ?? '',
          'status' => $l['status']['name'] ?? '',
          'pad' => $l['pad']['name'] ?? '',
          'location' => $l['pad']['location']['name'] ?? '',
          'mission' => $l['mission']['name'] ?? null,
          'mission_type' => $l['mission']['type'] ?? null,
          'image' => $l['image'] ?? null,
          'url' => $l['url'] ?? '',
        ];
      }, $response['results']),
    ];

    // Prioritize: Uganda > East Africa > Africa > Global
    $output['launches'] = prioritizeByRegion($output['launches']);

    file_put_contents($cacheFile, json_encode($output));
    header('X-Cache: MISS');
    echo json_encode($output);
  } else {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to fetch launches', 'fallback' => true]);
  }
}

// ═══ Spaceflight News API (SNAPI) ═══
function serveNews($cacheDir) {
  $cacheFile = $cacheDir . '/snapi_news.json';
  $ttl = 3600; // 1 hour

  if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
    header('X-Cache: HIT');
    echo file_get_contents($cacheFile);
    return;
  }

  $url = 'https://api.spaceflightnewsapi.net/v4/articles/?limit=10&ordering=-published_at';
  $response = fetchWithTimeout($url, 10);

  if ($response && isset($response['results'])) {
    $output = [
      'source' => 'Spaceflight News API',
      'fetched' => date('c'),
      'articles' => array_map(function($a) {
        return [
          'id' => $a['id'] ?? '',
          'title' => $a['title'] ?? '',
          'summary' => $a['summary'] ?? '',
          'news_site' => $a['news_site'] ?? '',
          'url' => $a['url'] ?? '',
          'image_url' => $a['image_url'] ?? '',
          'published_at' => $a['published_at'] ?? '',
          'featured' => $a['featured'] ?? false,
        ];
      }, $response['results']),
    ];

    // Prioritize: Uganda > East Africa > Africa > Global
    $output['articles'] = prioritizeByRegion($output['articles']);

    file_put_contents($cacheFile, json_encode($output));
    header('X-Cache: MISS');
    echo json_encode($output);
  } else {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to fetch news', 'fallback' => true]);
  }
}

// ═══ ISS Flyovers (Kampala) ═══
// TLE from Celestrak (cached 6h), passes computed with a J2-secular propagator (cached 1h).
function serveISS($cacheDir) {
  $passFile = $cacheDir . '/iss_passes.json';
  $passTtl = 3600; // 1 hour

  if (file_exists($passFile) && (time() - filemtime($passFile)) < $passTtl) {
    header('X-Cache: HIT');
    echo file_get_contents($passFile);
    return;
  }

  $tle = getISSTLE($cacheDir);
  if (!$tle) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to fetch ISS TLE', 'fallback' => true]);
    return;
  }

  $passes = computeISSPasses($tle, ISS_OBS_LAT, ISS_OBS_LON, 10, ISS_MIN_ELEV);

  $output = [
    'source' => 'Celestrak TLE + SGP4-lite',
    'fetched' => date('c'),
    'observer' => ['lat' => ISS_OBS_LAT, 'lon' => ISS_OBS_LON, 'label' => 'Kampala, Uganda'],
    'passes' => $passes,
  ];

  file_put_contents($passFile, json_encode($output));
  header('X-Cache: MISS');
  echo json_encode($output);
}

function getISSTLE($cacheDir) {
  $tleFile = $cacheDir . '/iss_tle.txt';
  $ttl = 21600; // 6 hours

  if (file_exists($tleFile) && (time() - filemtime($tleFile)) < $ttl) {
    $raw = file_get_contents($tleFile);
    if ($raw) return explode("\n", trim($raw));
  }

  $ctx = stream_context_create([
    'http' => [
      'timeout' => 15,
      'method' => 'GET',
      'header' => "User-Agent: USC-Space-API/1.0\r\nAccept: text/plain\r\n",
    ],
  ]);
  $raw = @file_get_contents('https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE', false, $ctx);
  if ($raw === false || strpos($raw, '25544') === false) return null;

  $lines = explode("\n", trim($raw));
  if (count($lines) < 3) return null;

  file_put_contents($tleFile, $raw);
  return array_slice($lines, 0, 3);
}

// Compute upcoming ISS passes over a ground station using a J2-secular propagator.
function computeISSPasses($tle, $obsLat, $obsLon, $numPasses = 10, $minElev = 10.0) {
  $els = parseTLE($tle);
  if (!$els) return [];

  $els['obsLat'] = deg2rad($obsLat);
  $els['obsLon'] = deg2rad($obsLon);

  $now = time();
  $end = $now + 8 * 86400; // look ahead 8 days

  // Sample every 30 s and find contiguous windows above min elevation
  $passes = [];
  $inPass = false;
  $passStart = 0;
  $passMaxElev = 0;
  $step = 30;

  for ($t = $now; $t <= $end; $t += $step) {
    $elev = elevationAt($t, $els);

    if ($elev > deg2rad($minElev)) {
      if (!$inPass) { $inPass = true; $passStart = $t; $passMaxElev = $elev; }
      if ($elev > $passMaxElev) $passMaxElev = $elev;
    } else {
      if ($inPass) {
        $passes[] = makePassRecord($passStart, $t - $step, $passMaxElev);
        $inPass = false;
        if (count($passes) >= $numPasses) break;
      }
    }
  }
  if ($inPass) $passes[] = makePassRecord($passStart, min($t, $end), $passMaxElev);

  return $passes;
}

// Elevation (radians) of ISS as seen from the observer at unix time $t.
// Elements array comes from parseTLE() with obsLat/obsLon added (radians).
function elevationAt($t, $els) {
  $mu = 398600.4418;          // km^3/s^2
  $re = 6378.137;             // km
  $j2 = 1.08262668e-3;

  static $cache = [];
  $cacheKey = $els['epoch'] . '|' . $els['n0'];
  if (!isset($cache[$cacheKey])) {
    $n0 = $els['n0'] * 2 * M_PI / 86400.0;   // rad/s
    $i0 = $els['inc'];
    $e0 = $els['ecc'];

    // Semi-major axis from mean motion (Kozai first-order J2 correction)
    $a1 = pow($mu / ($n0 * $n0), 1.0 / 3.0);
    $p0 = $a1 * (1 - $e0 * $e0);
    $delta1 = 1.5 * $j2 * pow($re / $p0, 2) * (3 * pow(cos($i0), 2) - 1) / pow(1 - $e0 * $e0, 1.5);
    $a0 = $a1 * (1 - $delta1 / 3.0 - $delta1 * $delta1 - 134.0 / 81.0 * pow($delta1, 3));
    $n = $n0 / (1 + $delta1);   // corrected mean motion rad/s
    $p = $a0 * (1 - $e0 * $e0);

    // J2 secular rates (rad/s)
    $k = 1.5 * $j2 * pow($re / $p, 2) * $n;
    $raanDot = -$k * cos($i0);
    $argpDot = 0.5 * $k * (5 * pow(cos($i0), 2) - 1);
    $mDot = $n + 0.5 * $k * sqrt(1 - $e0 * $e0) * (3 * pow(cos($i0), 2) - 1);

    $cache[$cacheKey] = [
      'a' => $a0, 'e' => $e0, 'inc' => $i0,
      'raan0' => $els['raan'], 'argp0' => $els['argp'], 'M0' => $els['M'],
      'raanDot' => $raanDot, 'argpDot' => $argpDot, 'mDot' => $mDot,
    ];
  }
  $c = $cache[$cacheKey];

  $dt = $t - $els['epoch']; // seconds since epoch; rates below are per second

  $m = fmod($c['M0'] + $c['mDot'] * $dt, 2 * M_PI); if ($m < 0) $m += 2 * M_PI;
  $raan = fmod($c['raan0'] + $c['raanDot'] * $dt, 2 * M_PI); if ($raan < 0) $raan += 2 * M_PI;
  $argp = fmod($c['argp0'] + $c['argpDot'] * $dt, 2 * M_PI); if ($argp < 0) $argp += 2 * M_PI;

  // Solve Kepler's equation
  $E = $m;
  for ($it = 0; $it < 8; $it++) {
    $dE = ($E - $c['e'] * sin($E) - $m) / (1 - $c['e'] * cos($E));
    $E -= $dE;
    if (abs($dE) < 1e-8) break;
  }
  $nu = atan2(sqrt(1 - $c['e'] * $c['e']) * sin($E), cos($E) - $c['e']);
  $r = $c['a'] * (1 - $c['e'] * cos($E));

  // ECI position (TEME approximation)
  $u = $argp + $nu;
  $x = $r * (cos($raan) * cos($u) - sin($raan) * sin($u) * cos($c['inc']));
  $y = $r * (sin($raan) * cos($u) + cos($raan) * sin($u) * cos($c['inc']));
  $z = $r * (sin($u) * sin($c['inc']));

  // Observer ECI (GMST)
  $jd = $t / 86400.0 + 2440587.5;
  $gmst = deg2rad(fmod(280.46061837 + 360.98564736629 * ($jd - 2451545.0), 360.0));
  $lst = $gmst + $els['obsLon'];
  $rx = $re * cos($els['obsLat']) * cos($lst);
  $ry = $re * cos($els['obsLat']) * sin($lst);
  $rz = $re * sin($els['obsLat']);

  $dx = $x - $rx; $dy = $y - $ry; $dz = $z - $rz;
  $range = sqrt($dx * $dx + $dy * $dy + $dz * $dz);
  if ($range < 1) return -1.0;

  return asin(($dx * $rx + $dy * $ry + $dz * $rz) / ($range * sqrt($rx * $rx + $ry * $ry + $rz * $rz)));
}

function makePassRecord($rise, $set, $maxElev) {
  return [
    'rise' => date('c', $rise),
    'set' => date('c', $set),
    'duration_min' => round(($set - $rise) / 60.0, 1),
    'max_elevation' => round(rad2deg($maxElev), 1),
    'max_elevation_time' => date('c', (int)(($rise + $set) / 2)),
  ];
}

function parseTLE($lines) {
  if (count($lines) < 2) return null;
  $l1 = $lines[1];
  $l2 = $lines[2];

  $epochYear = (int)trim(substr($l1, 18, 2));
  $epochYear += $epochYear < 57 ? 2000 : 1900;
  $epochDay = (float)trim(substr($l1, 20, 12));

  $ts = mktime(0, 0, 0, 1, 1, $epochYear) - 86400 + (int)($epochDay * 86400);

  return [
    'epoch' => $ts,
    'inc' => deg2rad((float)trim(substr($l2, 8, 8))),
    'raan' => deg2rad((float)trim(substr($l2, 17, 8))),
    'ecc' => (float)('0.' . trim(substr($l2, 26, 7))),
    'argp' => deg2rad((float)trim(substr($l2, 34, 8))),
    'M' => deg2rad((float)trim(substr($l2, 43, 8))),
    'n0' => (float)trim(substr($l2, 52, 11)),
  ];
}

// ═══ Curated Celestial Events ═══
function serveCelestial() {
  $file = __DIR__ . '/../data/celestial-events.json';
  if (!file_exists($file)) {
    http_response_code(404);
    echo json_encode(['error' => 'Celestial events data not found']);
    return;
  }

  $data = json_decode(file_get_contents($file), true);
  if (!$data) {
    http_response_code(502);
    echo json_encode(['error' => 'Invalid celestial events data', 'fallback' => true]);
    return;
  }

  // Only future events, oldest first
  $now = time();
  $events = array_values(array_filter($data['events'] ?? [], function ($e) use ($now) {
    $ts = strtotime($e['date'] ?? '');
    return $ts !== false && $ts >= $now - 86400;
  }));
  usort($events, function ($a, $b) { return strtotime($a['date']) - strtotime($b['date']); });

  echo json_encode([
    'source' => 'Curated (IMO / NASA / StarWalk data)',
    'fetched' => date('c'),
    'events' => $events,
  ]);
}

// ═══ Region Prioritization ═══
// Uganda > East Africa > Africa > Global
function prioritizeByRegion($items) {
  $regionScores = [
    'uganda' => 3,
    'east africa' => 2,
    'african' => 1,
    'africa' => 1,
  ];

  $scored = array_map(function($item) use ($regionScores) {
    $text = strtolower(implode(' ', array_filter([
      $item['name'] ?? '',
      $item['title'] ?? '',
      $item['summary'] ?? '',
      $item['description'] ?? '',
      $item['text'] ?? '',
      $item['provider'] ?? '',
      $item['location'] ?? '',
      $item['news_site'] ?? '',
      $item['mission'] ?? '',
    ])));

    $score = 0;
    foreach ($regionScores as $region => $pts) {
      if (strpos($text, $region) !== false) {
        $score = max($score, $pts);
      }
    }

    // Also boost specific Uganda/East Africa mentions
    $boostWords = ['uganda', 'kampala', 'entebbe', 'makerere', 'kenya', 'tanzania', 'rwanda', 'burundi', 'south sudan', 'ethiopia', 'nairobi', 'dar es salaam'];
    foreach ($boostWords as $w) {
      if (strpos($text, $w) !== false) $score = max($score, 2);
    }

    return ['_item' => $item, '_score' => $score];
  }, $items);

  usort($scored, function($a, $b) {
    return $b['_score'] - $a['_score'];
  });

  return array_map(function($s) {
    unset($s['_item']['_score']);
    return $s['_item'];
  }, $scored);
}

// ═══ HTTP Helper ═══
function fetchWithTimeout($url, $timeout = 10) {
  $ctx = stream_context_create([
    'http' => [
      'timeout' => $timeout,
      'method' => 'GET',
      'header' => "User-Agent: USC-Space-API/1.0\r\nAccept: application/json\r\n",
    ],
  ]);

  $response = @file_get_contents($url, false, $ctx);
  if ($response === false) return null;

  $data = json_decode($response, true);
  return is_array($data) ? $data : null;
}
