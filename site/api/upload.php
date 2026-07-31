<?php
require_once __DIR__ . '/config.php';
start_session();

$user = require_auth();
require_csrf();
rate_limit('upload:' . $user['id'], 10, 3600);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(['error' => 'POST required'], 405);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
  $err = $_FILES['image']['error'] ?? 'no file';
  respond(['error' => 'Upload failed', 'code' => $err], 400);
}

$file = $_FILES['image'];

// Validate MIME type
$allowed = ['image/jpeg', 'image/png', 'image/webp'];
$extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowed)) {
  respond(['error' => 'Only JPG, PNG, and WebP images are allowed'], 400);
}

// Validate file size (5MB max)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
  respond(['error' => 'File too large. Maximum size is 5MB'], 400);
}

// Validate image dimensions
$imagesize = @getimagesize($file['tmp_name']);
if (!$imagesize) {
  respond(['error' => 'Invalid image file'], 400);
}
if ($imagesize[0] > 8000 || $imagesize[1] > 8000) {
  respond(['error' => 'Image dimensions too large (max 8000x8000)'], 400);
}

// Create uploads directory if it doesn't exist
$uploadDir = __DIR__ . '/../img/uploads';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0755, true);
}

// Generate filename using MIME-derived extension
$ext = $extMap[$mime];
$base = pathinfo($file['name'], PATHINFO_FILENAME);
$safeBase = preg_replace('/[^a-zA-Z0-9_-]/', '_', $base);
$date = date('Y-m-d');
$filename = $date . '-' . $safeBase . '.' . $ext;

// Handle duplicate filenames
$target = $uploadDir . '/' . $filename;
$counter = 1;
while (file_exists($target)) {
  $target = $uploadDir . '/' . $date . '-' . $safeBase . '-' . $counter . '.' . $ext;
  $filename = $date . '-' . $safeBase . '-' . $counter . '.' . $ext;
  $counter++;
}

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $target)) {
  respond(['error' => 'Failed to save file'], 500);
}

$url = 'img/uploads/' . $filename;
respond(['url' => $url, 'filename' => $filename]);
