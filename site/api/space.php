<?php
/**
 * USC Space API Proxy
 * Proxies NASA APOD, Launch Library 2, and SNAPI with file-based caching.
 * Priority: Uganda > East Africa > Africa > Global
 */
require_once __DIR__ . '/config.php';

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
  default:
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action. Use: apod, launches, news']);
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

  $url = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&ordering=net';
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
