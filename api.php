<?php
require __DIR__ . '/config.php';
date_default_timezone_set(PH_TIMEZONE);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

class ApiError extends Exception {}
function fail($code, $msg){ throw new ApiError($msg, $code); }
function send($code, $obj){ http_response_code($code); echo json_encode($obj, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function emptyObj(){ return new stdClass(); }

/* ---------- database ---------- */
function db(){
  static $pdo = null;
  if ($pdo) return $pdo;
  try {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, array(
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false));
  } catch (PDOException $e) {
    error_log('PetalHub DB connect: ' . $e->getMessage());
    $driverCode = isset($e->errorInfo[1]) ? (int)$e->errorInfo[1] : 0;
    if ($driverCode === 1045) fail(500, 'MySQL rejected the configured credentials. Check DB_HOST, DB_PORT, DB_USER and DB_PASS in config.php.');
    if ($driverCode === 1049) fail(500, 'The petalhub database does not exist. Import schema.sql in phpMyAdmin, then check config.php.');
    fail(500, 'Cannot connect to the MySQL database. In XAMPP start MySQL, import schema.sql in phpMyAdmin, and check config.php.');
  }
  $pdo->exec("SET time_zone = '" . date('P') . "'"); // keep MySQL NOW() and PHP on the same clock
  return $pdo;
}
function q($sql, $args = array()){ $st = db()->prepare($sql); $st->execute($args); return $st; }
function rows($sql, $args = array()){ return q($sql, $args)->fetchAll(); }
function row($sql, $args = array()){ $r = q($sql, $args)->fetch(); return $r ? $r : null; }
function marks($n){ return implode(',', array_fill(0, $n, '?')); }

/* ---------- small helpers ---------- */
function body($max = 100000){
  $raw = file_get_contents('php://input');
  if (strlen($raw) > $max) fail(413, 'That upload is too large. Please choose a smaller image.');
  if ($raw === '' || $raw === false) return array();
  $j = json_decode($raw, true);
  if (!is_array($j)) fail(400, 'Invalid JSON.');
  return $j;
}
function cut($s, $n){ return function_exists('mb_substr') ? mb_substr($s, 0, $n, 'UTF-8') : substr($s, 0, $n); }
function lower($s){ return function_exists('mb_strtolower') ? mb_strtolower($s, 'UTF-8') : strtolower($s); }
function str($v, $n){ return is_string($v) ? cut(trim($v), $n) : ''; }
function isInt($v){ return is_int($v) || (is_float($v) && floor($v) == $v); }
function isNum($v){ return is_int($v) || is_float($v); }
function get($a, $k, $d = null){ return is_array($a) && array_key_exists($k, $a) ? $a[$k] : $d; }
function iso($dt){ return gmdate('Y-m-d\TH:i:s', strtotime($dt)) . '.000Z'; }

/* ---------- passwords ---------- */
// New hashes are PBKDF2 ("p2:..."). Accounts made by the old Node version used scrypt; those still work when PHP's sodium
// extension is available, and are upgraded to PBKDF2 the first time the person logs in.
function hashPw($pw, $salt){ return 'p2:' . hash_pbkdf2('sha256', $pw, $salt, 120000, 64, false); }
function checkHash($stored, $pw, $salt){
  if ($stored === null || $stored === '') return false;
  if (substr($stored, 0, 3) === 'p2:') return hash_equals($stored, hashPw($pw, $salt));
  if (function_exists('sodium_crypto_pwhash_scryptsalsa208sha256') && strlen($salt) === 32){
    try { return hash_equals($stored, bin2hex(sodium_crypto_pwhash_scryptsalsa208sha256(64, $pw, $salt, 524288, 16777216))); } catch (Exception $e) { return false; }
  }
  return false;
}
function newSalt(){ return bin2hex(random_bytes(16)); }
function addUser($name, $email, $pw, $role){
  $salt = newSalt();
  q('INSERT INTO users (name, email, salt, password_hash, role) VALUES (?,?,?,?,?)', array($name, $email, $salt, hashPw($pw, $salt), $role));
  return (int)db()->lastInsertId();
}

function seedDeliveryRiders(){
  $lock = row("SELECT GET_LOCK('petalhub_seed_riders', 30) AS l");
  if (!$lock || (int)$lock['l'] !== 1) fail(503, 'Could not initialize delivery riders. Please try again.');
  try {
    $seeds = array(
      array('Alvin Jay Ornejo', '09123456789'),
      array('Ynzo Martin Pasaoa', '09123456788'),
      array('Aldrin Magalang', '09696710101')
    );
    $existingPhones = array_map(function($rider){ return preg_replace('/\\D/', '', $rider['phone']); }, rows('SELECT phone FROM delivery_riders'));
    foreach ($seeds as $rider){
      if (in_array($rider[1], $existingPhones, true)) continue;
      q('INSERT INTO delivery_riders (name, phone) VALUES (?, ?)', $rider);
      $existingPhones[] = $rider[1];
    }
  } finally {
    q("SELECT RELEASE_LOCK('petalhub_seed_riders')");
  }
}

/* ---------- GCash payment helpers (QR code, proof of payment) ---------- */
function paymentDir($sub = ''){
  $d = __DIR__ . '/payments' . ($sub !== '' ? '/' . $sub : '');
  if (!is_dir($d)) @mkdir($d, 0775, true);
  return $d;
}
// uploaded files can never be run as PHP, and payment proofs can never be opened by a direct link
function protectPaymentDirs(){
  $a = paymentDir(); $b = paymentDir('proofs');
  if (is_dir($a) && !is_file($a . '/.htaccess')) @file_put_contents($a . '/.htaccess', "<FilesMatch \"\\.(php|phtml|phar)$\">\n  Require all denied\n</FilesMatch>\n");
  if (is_dir($b) && !is_file($b . '/.htaccess')) @file_put_contents($b . '/.htaccess', "Require all denied\n");
}
function decodeImage($dataUrl, $maxBytes){
  if (!is_string($dataUrl) || !preg_match('#^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=\r\n]+)$#', $dataUrl, $m)) fail(400, 'Please upload a PNG, JPG or WebP image.');
  $bin = base64_decode($m[2], true);
  if ($bin === false || strlen($bin) < 100) fail(400, 'That image could not be read.');
  if (strlen($bin) > $maxBytes) fail(400, 'That image is too large. Please choose one under ' . round($maxBytes / 1000000, 1) . ' MB.');
  $info = @getimagesizefromstring($bin);
  $types = array(IMAGETYPE_PNG => 'png', IMAGETYPE_JPEG => 'jpg');
  if (defined('IMAGETYPE_WEBP')) $types[IMAGETYPE_WEBP] = 'webp';
  if (!$info || !isset($types[$info[2]])) fail(400, 'That file is not a valid image.');
  return array('bin' => $bin, 'ext' => $types[$info[2]], 'mime' => $info['mime']);
}
function paymentSettings(){
  $o = array('gcash_name' => 'PetalHub Flower Shop', 'gcash_number' => '', 'gcash_qr' => 'payments/gcash-qr.png');
  foreach (rows("SELECT setting_key, setting_value FROM petalhub_settings WHERE setting_key IN ('gcash_name','gcash_number','gcash_qr')") as $r) $o[$r['setting_key']] = $r['setting_value'];
  $file = __DIR__ . '/' . $o['gcash_qr'];
  if (!is_file($file)){ $o['gcash_qr'] = 'payments/gcash-qr.png'; $file = __DIR__ . '/payments/gcash-qr.png'; }
  return array('name' => $o['gcash_name'], 'number' => $o['gcash_number'], 'qr' => $o['gcash_qr'] . (is_file($file) ? '?v=' . filemtime($file) : ''), 'hasQr' => is_file($file));
}
// put the stems of a cancelled order back on the shelf (and put a flower that sold out back on sale)
function returnStock($code){
  foreach (rows('SELECT product_id, qty FROM order_items WHERE order_code = ?', array($code)) as $it)
    q('UPDATE products SET available = IF(qty = 0, 1, available), qty = qty + ? WHERE id = ?', array($it['qty'], $it['product_id']));
}

/* ---------- first-run setup (adds missing columns, creates the admin account) ---------- */
function ensureSetup(){
  // an admin made by the old Node version can only be read when PHP has the sodium extension; otherwise reset it to config.php's password
  if (!function_exists('sodium_crypto_pwhash_scryptsalsa208sha256')){ $sl = newSalt(); q("UPDATE users SET salt = ?, password_hash = ? WHERE role = 'admin' AND password_hash NOT LIKE 'p2:%'", array($sl, hashPw(ADMIN_PASSWORD, $sl))); }
  $check = "SELECT (SELECT COUNT(*) FROM users WHERE role = 'admin') AS a,
                   (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND INDEX_NAME = 'uq_orders_user_key') AS k,
                   (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME IN ('line_key','line_name','arrangement','line_qty','wrap_design','wrap_color','wrap_notes','wrap_fee')) AS i,
                   (SELECT COUNT(*) FROM products WHERE id BETWEEN 7 AND 10) AS p,
                   (SELECT COUNT(*) FROM products WHERE id = 1 AND name = 'White Roses') AS w,
                   (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'available') AS av,
                   (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'image_path') AS img,
                   (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME IN ('customer_phone','rider_id','rider_name','rider_phone')) AS delivery_fields,
                   (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_riders') AS riders_table,
                   (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('petalhub_settings','event_flowers','weather_flowers')) AS merchandising_tables,
                   (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME IN ('payment_status','gcash_ref','payment_proof','payment_note','paid_at')) AS pay_fields,
                   (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND INDEX_NAME = 'uq_orders_gcash_ref') AS gk";
  $ready = function($s){ return $s['a'] > 0 && $s['k'] > 0 && $s['i'] == 8 && $s['p'] == 4 && $s['w'] > 0 && $s['av'] > 0 && $s['img'] > 0 && $s['delivery_fields'] == 4 && $s['riders_table'] == 1 && $s['merchandising_tables'] == 3 && $s['pay_fields'] == 5 && $s['gk'] > 0; };
  $s = row($check);
  if ($ready($s)){
    q("INSERT IGNORE INTO petalhub_settings (setting_key, setting_value) VALUES ('weather',''), ('gcash_name','PetalHub Flower Shop'), ('gcash_number',''), ('gcash_qr','payments/gcash-qr.png')");
    q("INSERT IGNORE INTO event_flowers (event_id, flower_ids) VALUES ('halloween','8,9,10')");
    seedDeliveryRiders();
    return;
  }
  // Several requests can arrive at the same moment on the very first page load: only one of them may run the setup.
  $lock = row("SELECT GET_LOCK('petalhub_setup', 30) AS l");
  try {
    $s = row($check); // look again now that we hold the lock; another request may have finished the setup already
    if ($ready($s)){
      q("INSERT IGNORE INTO petalhub_settings (setting_key, setting_value) VALUES ('weather','')");
      q("INSERT IGNORE INTO event_flowers (event_id, flower_ids) VALUES ('halloween','8,9,10')");
      seedDeliveryRiders();
      return;
    }
    q("CREATE TABLE IF NOT EXISTS petalhub_settings (setting_key VARCHAR(40) PRIMARY KEY, setting_value VARCHAR(100) NOT NULL)");
    q("CREATE TABLE IF NOT EXISTS event_flowers (event_id VARCHAR(40) PRIMARY KEY, flower_ids VARCHAR(255) NOT NULL DEFAULT '')");
    q("CREATE TABLE IF NOT EXISTS weather_flowers (weather_id VARCHAR(20) PRIMARY KEY, flower_ids VARCHAR(255) NOT NULL DEFAULT '')");
    q("CREATE TABLE IF NOT EXISTS delivery_riders (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) NOT NULL, phone VARCHAR(30) NOT NULL, active TINYINT(1) NOT NULL DEFAULT 1, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)");
    q("INSERT IGNORE INTO petalhub_settings (setting_key, setting_value) VALUES ('weather','')");
    q("INSERT IGNORE INTO event_flowers (event_id, flower_ids) VALUES ('valentines','1,2,4'), ('christmas','3,5,6'), ('newyear','1,3,6'), ('mothersday','1,4,6'), ('halloween','8,9,10')");
    q("INSERT IGNORE INTO weather_flowers (weather_id, flower_ids) VALUES ('sunny','3,2,1'), ('rainy','5,6,4')");
    $addCol = function($t, $c, $def){
      if (rows('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?', array($t, $c))) return;
      try { q('ALTER TABLE ' . $t . ' ADD COLUMN ' . $c . ' ' . $def); }
      catch (PDOException $e) { if (!isset($e->errorInfo[1]) || $e->errorInfo[1] != 1060) throw $e; } // 1060 = column already exists
    };
    $addCol('products', 'active', 'TINYINT(1) NOT NULL DEFAULT 1');
    $addCol('products', 'description', "VARCHAR(300) NOT NULL DEFAULT ''");
    $addCol('products', 'image_path', "VARCHAR(255) NOT NULL DEFAULT ''");
    // the admin decides In stock / Out of stock; 1 = on sale, 0 = marked Out of stock (customers cannot add it to a cart)
    $addCol('products', 'available', 'TINYINT(1) NOT NULL DEFAULT 1');
    $addCol('order_items', 'line_key', 'VARCHAR(60) NULL');
    $addCol('order_items', 'line_name', "VARCHAR(80) NOT NULL DEFAULT ''");
    $addCol('order_items', 'arrangement', "ENUM('single','bouquet','custom') NOT NULL DEFAULT 'single'");
    $addCol('order_items', 'line_qty', 'INT NOT NULL DEFAULT 1');
    $addCol('order_items', 'wrap_design', 'VARCHAR(40) NULL');
    $addCol('order_items', 'wrap_color', "VARCHAR(100) NOT NULL DEFAULT ''");
    $addCol('order_items', 'wrap_notes', "VARCHAR(300) NOT NULL DEFAULT ''");
    $addCol('order_items', 'wrap_fee', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
    // every checkout carries a one-time key; the UNIQUE index makes it impossible to store the same checkout twice
    $addCol('orders', 'checkout_key', 'VARCHAR(60) NULL');
    $addCol('orders', 'customer_phone', "VARCHAR(30) NOT NULL DEFAULT ''");
    $addCol('orders', 'rider_id', 'INT NULL');
    $addCol('orders', 'rider_name', "VARCHAR(80) NOT NULL DEFAULT ''");
    $addCol('orders', 'rider_phone', "VARCHAR(30) NOT NULL DEFAULT ''");
    // GCash QR payments: the customer submits the GCash reference number, the admin verifies it before the order moves forward
    $addCol('orders', 'payment_status', "VARCHAR(20) NOT NULL DEFAULT 'not_required'"); // not_required | awaiting | verified | rejected
    $addCol('orders', 'gcash_ref', 'VARCHAR(30) NULL');
    $addCol('orders', 'payment_proof', "VARCHAR(160) NOT NULL DEFAULT ''");
    $addCol('orders', 'payment_note', "VARCHAR(200) NOT NULL DEFAULT ''");
    $addCol('orders', 'paid_at', 'DATETIME NULL');
    try { q('ALTER TABLE orders ADD UNIQUE KEY uq_orders_gcash_ref (gcash_ref)'); }
    catch (PDOException $e) { if (!isset($e->errorInfo[1]) || $e->errorInfo[1] != 1061) throw $e; } // 1061 = key already exists
    q("INSERT IGNORE INTO petalhub_settings (setting_key, setting_value) VALUES ('gcash_name','PetalHub Flower Shop'), ('gcash_number',''), ('gcash_qr','payments/gcash-qr.png')");
    if (!$s['k']){
      try { q('ALTER TABLE orders ADD UNIQUE KEY uq_orders_user_key (user_id, checkout_key)'); }
      catch (PDOException $e) { if (!isset($e->errorInfo[1]) || $e->errorInfo[1] != 1061) throw $e; } // 1061 = key already exists
    }
    if (!$s['a']){
      try { addUser('Admin', strtolower(ADMIN_EMAIL), ADMIN_PASSWORD, 'admin'); }
      catch (PDOException $e) { if (!isset($e->errorInfo[1]) || $e->errorInfo[1] != 1062) throw $e; } // 1062 = admin already exists
    }
    q("INSERT IGNORE INTO products (id, name, price, qty, unit) VALUES
      (7, 'Red Roses', 32.00, 18, 'bunches available'),
      (8, 'Carnation', 14.00, 26, 'bunches available'),
      (9, 'Chrysanthemum', 18.00, 22, 'bunches available'),
      (10, 'Gladiolus', 20.00, 14, 'bunches available')");
    q("UPDATE products SET name = 'White Roses' WHERE id = 1 AND name = 'Garden Rose'");
    seedDeliveryRiders();
  } finally {
    q("SELECT RELEASE_LOCK('petalhub_setup')");
  }
}

/* ---------- login sessions ---------- */
function bearer(){
  if (!empty($_SERVER['HTTP_X_AUTH_TOKEN'])) return $_SERVER['HTTP_X_AUTH_TOKEN'];
  $a = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : '');
  if ($a === '' && function_exists('getallheaders')) foreach (getallheaders() as $k => $v) if (strtolower($k) === 'authorization') $a = $v;
  return preg_match('/^Bearer (.+)$/', $a, $m) ? $m[1] : '';
}
function authUser(){
  $t = bearer(); if ($t === '') return null;
  return row('SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > NOW()', array(hash('sha256', $t)));
}
function startSession($u){
  $t = bin2hex(random_bytes(24));
  q('DELETE FROM sessions WHERE expires_at < NOW()');
  q('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))', array(hash('sha256', $t), $u['id']));
  send(200, array('token' => $t, 'user' => array('name' => $u['name'], 'email' => $u['email'], 'role' => $u['role'])));
}
// at most 10 login / register attempts per visitor per 5 minutes
function throttled(){
  $f = sys_get_temp_dir() . '/petalhub_throttle_' . md5(isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0') . '.json';
  $fh = @fopen($f, 'c+'); if (!$fh) return false;
  flock($fh, LOCK_EX);
  $now = time(); $t = array('n' => 0, 'reset' => $now + 300);
  $d = json_decode((string)stream_get_contents($fh), true);
  if (is_array($d) && isset($d['reset']) && $d['reset'] > $now) $t = $d;
  $t['n']++;
  ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($t));
  flock($fh, LOCK_UN); fclose($fh);
  return $t['n'] > 10;
}

/* ---------- shaping rows for the website ---------- */
function pub($p){
  $qty = (int)$p['qty']; $on = $qty > 0 && (!isset($p['available']) || (int)$p['available'] === 1);
  return array('id' => (int)$p['id'], 'name' => isset($p['name']) ? $p['name'] : '', 'desc' => isset($p['description']) ? $p['description'] : '', 'price' => (float)$p['price'],
    'qty' => $qty, 'unit' => $p['unit'], 'available' => $on, 'imagePath' => isset($p['image_path']) ? $p['image_path'] : '',
    'stock' => ($on && $qty > 0) ? $qty . ' ' . $p['unit'] : 'Out of stock');
}
function toOrders($rs){
  if (!$rs) return array();
  $codes = array_map(function($r){ return $r['code']; }, $rs);
  $items = rows('SELECT order_code, product_id AS id, name, qty, price, line_key, line_name, arrangement, line_qty, wrap_design, wrap_color, wrap_notes, wrap_fee FROM order_items WHERE order_code IN (' . marks(count($codes)) . ') ORDER BY id', $codes);
  $out = array();
  foreach ($rs as $r){
    $mine = array();
    foreach ($items as $i) if ($i['order_code'] === $r['code']) $mine[] = array(
      'id' => (int)$i['id'], 'name' => $i['name'], 'qty' => (int)$i['qty'], 'price' => (float)$i['price'],
      'lineKey' => $i['line_key'], 'lineName' => $i['line_name'], 'arrangement' => $i['arrangement'],
      'lineQty' => (int)$i['line_qty'], 'wrapDesign' => $i['wrap_design'], 'wrapColor' => $i['wrap_color'],
      'wrapNotes' => $i['wrap_notes'], 'wrapFee' => (float)$i['wrap_fee']);
    $out[] = array('code' => $r['code'], 'date' => iso($r['created_at']), 'customer' => $r['customer'], 'email' => $r['email'], 'total' => (float)$r['total'], 'status' => $r['status'],
      'items' => $mine, 'fulfillment' => $r['fulfillment'], 'address' => array('street' => $r['street'], 'city' => $r['city'], 'zip' => $r['zip']),
      'customerPhone' => isset($r['customer_phone']) ? $r['customer_phone'] : '',
      'riderId' => isset($r['rider_id']) && $r['rider_id'] !== null ? (int)$r['rider_id'] : null,
      'riderName' => isset($r['rider_name']) ? $r['rider_name'] : '', 'riderPhone' => isset($r['rider_phone']) ? $r['rider_phone'] : '',
      'payment' => $r['payment'],
      'paymentStatus' => isset($r['payment_status']) ? $r['payment_status'] : 'not_required',
      'gcashRef' => isset($r['gcash_ref']) ? $r['gcash_ref'] : null,
      'hasProof' => !empty($r['payment_proof']),
      'paymentNote' => isset($r['payment_note']) ? $r['payment_note'] : '',
      'paidAt' => !empty($r['paid_at']) ? iso($r['paid_at']) : null);
  }
  return $out;
}
function inTx($fn){
  $pdo = db(); $pdo->beginTransaction();
  try { $out = $fn(); $pdo->commit(); return $out; }
  catch (Exception $e) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $e; }
}

/* ---------- the API ---------- */
function handle(){
  $m = $_SERVER['REQUEST_METHOD'];
  $route = '/' . trim(isset($_GET['route']) ? $_GET['route'] : '', '/');
  $FLOW = array('Pending', 'Preparing', 'Ready', 'Completed');
  db(); ensureSetup();

  if ($m === 'GET' && $route === '/products')
    send(200, array_map('pub', rows('SELECT id, name, description, price, qty, unit, available, image_path FROM products WHERE active = 1 ORDER BY id')));
  if ($m === 'GET' && $route === '/merchandising'){
    $settings = array();
    foreach (rows("SELECT setting_key, setting_value FROM petalhub_settings WHERE setting_key = 'weather'") as $setting)
      $settings[$setting['setting_key']] = $setting['setting_value'];
    $events = array();
    foreach (rows('SELECT event_id, flower_ids FROM event_flowers') as $event)
      $events[$event['event_id']] = $event['flower_ids'] === '' ? array() : array_map('intval', explode(',', $event['flower_ids']));
    $weatherFlowers = array();
    foreach (rows('SELECT weather_id, flower_ids FROM weather_flowers') as $weather)
      $weatherFlowers[$weather['weather_id']] = $weather['flower_ids'] === '' ? array() : array_map('intval', explode(',', $weather['flower_ids']));
    send(200, array('weather' => isset($settings['weather']) && in_array($settings['weather'], array('sunny','rainy'), true) ? $settings['weather'] : '',
      'eventFlowers' => $events, 'weatherFlowers' => $weatherFlowers));
  }
  if ($m === 'GET' && $route === '/payment-info') send(200, paymentSettings());
  $me = authUser();
  if ($m === 'GET' && $route === '/me') $me ? send(200, array('user' => array('name' => $me['name'], 'email' => $me['email'], 'role' => $me['role']))) : send(401, array('error' => 'Please log in.'));
  if ($m === 'POST' && $route === '/logout'){ if (bearer() !== '') q('DELETE FROM sessions WHERE token_hash = ?', array(hash('sha256', bearer()))); send(200, emptyObj()); }

  if ($m === 'POST' && ($route === '/register' || $route === '/login')){
    if (throttled()) fail(429, 'Too many attempts. Try again in a few minutes.');
    $b = body(); $email = lower(str(get($b, 'email'), 200)); $pw = is_string(get($b, 'pass')) ? $b['pass'] : '';
    if ($route === '/login'){
      $u = row('SELECT * FROM users WHERE email = ?', array($email));
      if (!$u || !checkHash($u['password_hash'], $pw, $u['salt'])) fail(401, 'Incorrect email or password.');
      if (substr($u['password_hash'], 0, 3) !== 'p2:'){ $s = newSalt(); q('UPDATE users SET salt = ?, password_hash = ? WHERE id = ?', array($s, hashPw($pw, $s), $u['id'])); }
      startSession($u);
    }
    $name = str(get($b, 'name'), 80);
    if ($name === '' || !preg_match('/^\S+@\S+\.\S+$/', $email)) fail(400, 'Enter your name and a valid email.');
    if (strlen($pw) < 6) fail(400, 'Password must be at least 6 characters.');
    if (row('SELECT id FROM users WHERE email = ?', array($email))) fail(409, 'An account with that email already exists. Please log in.');
    $id = addUser($name, $email, $pw, 'customer');
    startSession(array('id' => $id, 'name' => $name, 'email' => $email, 'role' => 'customer'));
  }

  if ($m === 'GET' && $route === '/orders/mine'){
    if (!$me) fail(401, 'Please log in.');
    send(200, toOrders(rows('SELECT o.*, u.name AS customer, u.email FROM orders o JOIN users u ON u.id = o.user_id WHERE o.user_id = ? ORDER BY o.created_at DESC, o.code DESC', array($me['id']))));
  }

  if ($m === 'POST' && $route === '/orders'){
    if (!$me) fail(401, 'Please log in to place an order.');
    $b = body(2800000); $want = array(); $requested = array(); $lineMap = array(); $its = get($b, 'items');
    if (!is_array($its) || !count($its) || count($its) > 50) fail(400, 'Your cart is empty.');
    $wrapPrices = array('pink-elegance' => 75.00, 'classic-kraft' => 50.00, 'midnight-luxury' => 80.00, 'minimalist-white' => 45.00);
    foreach ($its as $index => $i){
      $id = get($i, 'id'); $n = get($i, 'qty');
      if (!is_numeric($id) || !is_numeric($n) || !isInt($id + 0) || !isInt($n + 0) || $n < 1 || $n > 99) fail(400, 'Invalid cart.');
      $id = (int)$id; $arrangement = get($i, 'arrangement', 'single');
      if (!in_array($arrangement, array('single', 'bouquet', 'custom'), true)) fail(400, 'Invalid arrangement.');
      $lineQty = get($i, 'line_qty', $n);
      if (!is_numeric($lineQty) || !isInt($lineQty + 0) || $lineQty < 1 || $lineQty > 99) fail(400, 'Invalid cart quantity.');
      $lineKey = str(get($i, 'line_key'), 60);
      if ($lineKey === '') $lineKey = 'legacy-' . $index;
      $wrapDesign = str(get($i, 'wrap_design'), 40);
      if ($wrapDesign !== '' && ($arrangement === 'single' || !isset($wrapPrices[$wrapDesign]))) fail(400, 'Invalid wrapping option.');
      $line = array(
        'line_key' => $lineKey,
        'line_name' => str(get($i, 'line_name'), 80),
        'arrangement' => $arrangement,
        'line_qty' => (int)$lineQty,
        'wrap_design' => $wrapDesign === '' ? null : $wrapDesign,
        'wrap_color' => str(get($i, 'wrap_color'), 100),
        'wrap_notes' => str(get($i, 'wrap_notes'), 300)
      );
      if (isset($lineMap[$lineKey]) && $lineMap[$lineKey] !== $line) fail(400, 'Invalid cart grouping.');
      $lineMap[$lineKey] = $line;
      $requested[] = array('id' => $id, 'qty' => (int)$n, 'line' => $line);
      $want[$id] = (isset($want[$id]) ? $want[$id] : 0) + (int)$n;
    }
    $f = get($b, 'fulfillment'); $delivery = $f === 'delivery';
    if (!$delivery && $f !== 'pickup') fail(400, 'Choose pickup or delivery.');
    $a = get($b, 'address', array());
    $ad = $delivery ? array('street' => str(get($a, 'street'), 200), 'city' => str(get($a, 'city'), 100), 'zip' => str(get($a, 'zip'), 20), 'phone' => str(get($a, 'phone'), 30)) : array('street' => '', 'city' => '', 'zip' => '', 'phone' => '');
    if ($delivery && ($ad['street'] === '' || $ad['city'] === '')) fail(400, 'Enter a delivery address.');
    if ($delivery && (!preg_match('/^[0-9+().\\s-]{7,30}$/', $ad['phone']) || strlen(preg_replace('/\\D/', '', $ad['phone'])) < 7)) fail(400, 'Enter a valid contact phone number for delivery.');
    $payMap = array('gcash' => 'GCash (QR)', 'cash' => $delivery ? 'Cash on delivery' : 'Cash on pickup');
    $pk = get($b, 'payment'); $pay = is_string($pk) && isset($payMap[$pk]) ? $payMap[$pk] : null;
    if (!$pay) fail(400, 'Choose a payment method.');
    // GCash QR: the customer pays by scanning the shop's QR code, then submits the 13-digit reference number from the GCash receipt.
    // The order is saved as "awaiting verification" and the admin must verify the payment before it can move forward.
    $isGcash = $pk === 'gcash'; $ref = null; $proofImage = null;
    if ($isGcash){
      $ref = preg_replace('/\D/', '', (string)get($b, 'gcashRef', ''));
      if (strlen($ref) !== 13) fail(400, 'Enter the 13-digit GCash reference number shown on your payment receipt.');
      $proofIn = get($b, 'proof');
      if (is_string($proofIn) && $proofIn !== '') $proofImage = decodeImage($proofIn, 2000000);
    }
    $key = str(get($b, 'key'), 60); if ($key === '') $key = null;
    $existing = function() use ($me, $key){ return $key ? row('SELECT code FROM orders WHERE user_id = ? AND checkout_key = ?', array($me['id'], $key)) : null; };
    try {
      $out = inTx(function() use ($want, $requested, $lineMap, $wrapPrices, $existing, $me, $f, $ad, $pay, $key, $isGcash, $ref){
        $ids = array_keys($want); sort($ids);
        $prods = rows('SELECT id, name, price, qty, available FROM products WHERE id IN (' . marks(count($ids)) . ') AND active = 1 ORDER BY id FOR UPDATE', $ids);
        $dup = $existing(); // checked again after the product lock, so two simultaneous requests cannot both pass
        if ($dup) return array('code' => $dup['code'], 'duplicate' => true);
        if ($isGcash && row('SELECT code FROM orders WHERE gcash_ref = ?', array($ref))) fail(409, 'This GCash reference number was already used for another order. Please check the number on your receipt.');
        if (count($prods) !== count($ids)) fail(400, 'Unknown product.');
        $total = 0;
        foreach ($prods as $p){
          if (!(int)$p['available']) fail(409, $p['name'] . ' is out of stock.');
          if ($want[(int)$p['id']] > $p['qty']) fail(409, $p['qty'] ? 'Only ' . $p['qty'] . ' left of ' . $p['name'] . '.' : $p['name'] . ' is out of stock.');
          $total += (float)$p['price'] * $want[(int)$p['id']];
        }
        foreach ($lineMap as $line) if ($line['wrap_design']) $total += $wrapPrices[$line['wrap_design']] * $line['line_qty'];
        $total = round($total, 2);
        do { $oc = 'PH-' . random_int(100000, 999999); } while (row('SELECT 1 FROM orders WHERE code = ?', array($oc)));
        q('INSERT INTO orders (code, user_id, total, fulfillment, street, city, zip, customer_phone, payment, checkout_key, payment_status, gcash_ref) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
          array($oc, $me['id'], $total, $f, $ad['street'], $ad['city'], $ad['zip'], $ad['phone'], $pay, $key, $isGcash ? 'awaiting' : 'not_required', $ref));
        $productsById = array();
        foreach ($prods as $p) $productsById[(int)$p['id']] = $p;
        $feesApplied = array();
        foreach ($requested as $item){
          $p = $productsById[$item['id']]; $line = $item['line'];
          $fee = 0;
          if (!isset($feesApplied[$line['line_key']]) && $line['wrap_design']){
            $fee = $wrapPrices[$line['wrap_design']] * $line['line_qty'];
            $feesApplied[$line['line_key']] = true;
          }
          $lineName = $line['line_name'] !== '' ? $line['line_name'] : $p['name'];
          q('INSERT INTO order_items (order_code, product_id, name, qty, price, line_key, line_name, arrangement, line_qty, wrap_design, wrap_color, wrap_notes, wrap_fee) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
            array($oc, $p['id'], $p['name'], $item['qty'], $p['price'], $line['line_key'], $lineName, $line['arrangement'], $line['line_qty'], $line['wrap_design'], $line['wrap_color'], $line['wrap_notes'], $fee));
        }
        foreach ($prods as $p){
          $used = $want[(int)$p['id']];
          q('UPDATE products SET available = IF(qty = ?, 0, available), qty = qty - ? WHERE id = ?', array($used, $used, $p['id']));
        }
        return array('code' => $oc);
      });
    } catch (PDOException $e) {
      $dupInfo = isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062;
      if ($dupInfo && strpos($e->getMessage(), 'uq_orders_gcash_ref') !== false) fail(409, 'This GCash reference number was already used for another order. Please check the number on your receipt.');
      if ($dupInfo && $key && ($dup = $existing())) $out = array('code' => $dup['code'], 'duplicate' => true);
      else throw $e;
    }
    // the proof-of-payment picture is saved after the order exists, under a random name, and can only be opened by the admin
    if ($proofImage && empty($out['duplicate'])){
      protectPaymentDirs();
      $file = $out['code'] . '-' . bin2hex(random_bytes(6)) . '.' . $proofImage['ext'];
      if (@file_put_contents(paymentDir('proofs') . '/' . $file, $proofImage['bin']) !== false) q('UPDATE orders SET payment_proof = ? WHERE code = ?', array($file, $out['code']));
    }
    $out['paymentStatus'] = $isGcash ? 'awaiting' : 'not_required';
    send(!empty($out['duplicate']) ? 200 : 201, $out);
  }

  if (strpos($route, '/admin/') === 0){
    if (!$me || $me['role'] !== 'admin') fail(403, 'Admin access only.');
    if ($m === 'GET' && $route === '/admin/orders')
      send(200, toOrders(rows('SELECT o.*, u.name AS customer, u.email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC, o.code DESC')));
    if ($m === 'PUT' && preg_match('#^/admin/orders/(PH-\d+)/payment$#', $route, $r)){
      $code = $r[1]; $b = body(); $action = get($b, 'action'); $note = str(get($b, 'note'), 200);
      if (!in_array($action, array('verify', 'reject'), true)) fail(400, 'Choose Verify or Reject.');
      $out = inTx(function() use ($code, $action, $note){
        $o = row('SELECT status, payment_status FROM orders WHERE code = ? FOR UPDATE', array($code));
        if (!$o) fail(404, 'Order not found.');
        if ($o['payment_status'] !== 'awaiting') fail(409, 'This payment has already been ' . ($o['payment_status'] === 'verified' ? 'verified.' : ($o['payment_status'] === 'rejected' ? 'rejected.' : 'handled (no GCash payment is waiting).')));
        if ($action === 'verify'){
          q("UPDATE orders SET payment_status = 'verified', paid_at = NOW(), payment_note = ? WHERE code = ?", array($note, $code));
          return array('code' => $code, 'paymentStatus' => 'verified');
        }
        if ($o['status'] === 'Cancelled') fail(409, 'This order is already cancelled.');
        returnStock($code);
        q("UPDATE orders SET payment_status = 'rejected', status = 'Cancelled', payment_note = ? WHERE code = ?", array($note !== '' ? $note : 'The GCash payment could not be verified.', $code));
        return array('code' => $code, 'paymentStatus' => 'rejected', 'status' => 'Cancelled');
      });
      send(200, $out);
    }
    if ($m === 'GET' && preg_match('#^/admin/orders/(PH-\d+)/proof$#', $route, $r)){
      $o = row('SELECT payment_proof FROM orders WHERE code = ?', array($r[1]));
      $file = $o && $o['payment_proof'] !== '' ? paymentDir('proofs') . '/' . basename($o['payment_proof']) : '';
      if ($file === '' || !is_file($file)) fail(404, 'No proof of payment was uploaded for this order.');
      $info = @getimagesize($file);
      header('Content-Type: ' . ($info && !empty($info['mime']) ? $info['mime'] : 'application/octet-stream'));
      header('Content-Length: ' . filesize($file));
      readfile($file); exit;
    }
    if ($m === 'PUT' && $route === '/admin/payment-settings'){
      $b = body(); $name = str(get($b, 'name'), 100); $number = str(get($b, 'number'), 30);
      if ($name === '') fail(400, 'Enter the name shown on the GCash account.');
      if ($number !== '' && !preg_match('/^[0-9+\s-]{7,30}$/', $number)) fail(400, 'Enter a valid GCash mobile number, for example 0917 123 4567.');
      q("INSERT INTO petalhub_settings (setting_key, setting_value) VALUES ('gcash_name', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", array($name));
      q("INSERT INTO petalhub_settings (setting_key, setting_value) VALUES ('gcash_number', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", array($number));
      send(200, paymentSettings());
    }
    if ($m === 'POST' && $route === '/admin/payment-qr'){
      $img = decodeImage(get(body(2800000), 'image'), 2000000);
      protectPaymentDirs();
      $dir = paymentDir();
      foreach (glob($dir . '/gcash-qr-custom.*') ?: array() as $old) @unlink($old);
      $path = 'payments/gcash-qr-custom.' . $img['ext'];
      if (@file_put_contents(__DIR__ . '/' . $path, $img['bin']) === false) fail(500, 'The QR image could not be saved. Check that the petalhub/payments folder can be written to.');
      q("INSERT INTO petalhub_settings (setting_key, setting_value) VALUES ('gcash_qr', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", array($path));
      send(200, paymentSettings());
    }
    if ($m === 'GET' && $route === '/admin/riders')
      send(200, rows('SELECT id, name, phone FROM delivery_riders WHERE active = 1 ORDER BY name, id'));
    if ($m === 'POST' && $route === '/admin/riders'){
      $b = body(); $name = str(get($b, 'name'), 80); $phone = str(get($b, 'phone'), 30);
      if ($name === '') fail(400, 'Enter the rider name.');
      if (!preg_match('/^[0-9+().\\s-]{7,30}$/', $phone) || strlen(preg_replace('/\\D/', '', $phone)) < 7) fail(400, 'Enter a valid rider phone number.');
      $normalizedPhone = preg_replace('/\\D/', '', $phone);
      $lock = row("SELECT GET_LOCK('petalhub_add_rider', 30) AS l");
      if (!$lock || (int)$lock['l'] !== 1) fail(503, 'Could not save the rider right now. Please try again.');
      try {
        foreach (rows('SELECT phone FROM delivery_riders WHERE active = 1') as $existingRider){
          if (preg_replace('/\\D/', '', $existingRider['phone']) === $normalizedPhone)
            fail(409, 'A rider with this phone number already exists.');
        }
        q('INSERT INTO delivery_riders (name, phone) VALUES (?, ?)', array($name, $phone));
        $created = array('id' => (int)db()->lastInsertId(), 'name' => $name, 'phone' => $phone);
      } finally {
        q("SELECT RELEASE_LOCK('petalhub_add_rider')");
      }
      send(201, $created);
    }
    if ($m === 'DELETE' && preg_match('#^/admin/riders/(\d+)$#', $route, $r)){
      $id = (int)$r[1];
      $rider = row('SELECT id FROM delivery_riders WHERE id = ? AND active = 1', array($id));
      if (!$rider) fail(404, 'Delivery rider not found.');
      q('UPDATE delivery_riders SET active = 0 WHERE id = ?', array($id));
      send(200, array('id' => $id, 'deleted' => true));
    }
    if ($m === 'PUT' && preg_match('#^/admin/orders/(PH-\d+)/rider$#', $route, $r)){
      $code = $r[1]; $riderId = get(body(), 'riderId');
      if ($riderId !== null && (!is_int($riderId) || $riderId < 1)) fail(400, 'Choose a valid delivery rider.');
      $result = inTx(function() use ($code, $riderId){
        $order = row('SELECT fulfillment FROM orders WHERE code = ? FOR UPDATE', array($code));
        if (!$order) fail(404, 'Order not found.');
        if ($order['fulfillment'] !== 'delivery') fail(400, 'A delivery rider can only be assigned to delivery orders.');
        if ($riderId === null){
          q("UPDATE orders SET rider_id = NULL, rider_name = '', rider_phone = '' WHERE code = ?", array($code));
          return array('riderId' => null, 'riderName' => '', 'riderPhone' => '');
        }
        $rider = row('SELECT id, name, phone FROM delivery_riders WHERE id = ? AND active = 1', array($riderId));
        if (!$rider) fail(404, 'Delivery rider not found.');
        q('UPDATE orders SET rider_id = ?, rider_name = ?, rider_phone = ? WHERE code = ?', array($rider['id'], $rider['name'], $rider['phone'], $code));
        return array('riderId' => (int)$rider['id'], 'riderName' => $rider['name'], 'riderPhone' => $rider['phone']);
      });
      send(200, array_merge(array('code' => $code), $result));
    }
    if ($m === 'GET' && $route === '/admin/products') send(200, array_map('pub', rows('SELECT id, name, description, price, qty, unit, available, image_path FROM products WHERE active = 1 ORDER BY id')));
    if ($m === 'POST' && $route === '/admin/products'){
      $b = body(); $nameInput = get($b, 'name'); $imageInput = get($b, 'imagePath'); $price = get($b, 'price');
      if (!is_string($nameInput) || trim($nameInput) === '' || strlen(trim($nameInput)) > 80) fail(400, 'Enter a flower name up to 80 characters.');
      if (!is_string($imageInput) || !preg_match('#^flowers/[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp|gif)$#i', $imageInput)) fail(400, 'Enter an image path inside the flowers folder, such as flowers/rose.jpg.');
      if (!isNum($price) || !($price >= 0 && $price <= 1e5)) fail(400, 'Enter a valid price.');
      $name = trim($nameInput);
      $lock = row("SELECT GET_LOCK('petalhub_add_product', 30) AS l");
      if (!$lock || (int)$lock['l'] !== 1) fail(503, 'Could not create the flower right now. Please try again.');
      try {
        $id = (int)row('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM products')['next_id'];
        q('INSERT INTO products (id, name, price, qty, unit, description, image_path, active, available) VALUES (?, ?, ?, 0, ?, ?, ?, 1, 1)',
          array($id, $name, $price, 'bunches available', '', $imageInput));
        $created = pub(row('SELECT id, name, description, price, qty, unit, available, image_path FROM products WHERE id = ?', array($id)));
      } finally {
        q("SELECT RELEASE_LOCK('petalhub_add_product')");
      }
      send(201, $created);
    }
    if ($m === 'DELETE' && preg_match('#^/admin/products/(\d+)$#', $route, $r)){
      $id = (int)$r[1];
      inTx(function() use ($id){
        if (!row('SELECT id FROM products WHERE id = ? AND active = 1 FOR UPDATE', array($id))) fail(404, 'Product not found.');
        q('UPDATE products SET active = 0 WHERE id = ?', array($id));
        foreach (rows('SELECT event_id, flower_ids FROM event_flowers') as $event){
          $ids = $event['flower_ids'] === '' ? array() : array_map('intval', explode(',', $event['flower_ids']));
          $ids = array_values(array_filter($ids, function($flowerId) use ($id){ return $flowerId !== $id; }));
          q('UPDATE event_flowers SET flower_ids = ? WHERE event_id = ?', array(implode(',', $ids), $event['event_id']));
        }
        foreach (rows('SELECT weather_id, flower_ids FROM weather_flowers') as $weather){
          $ids = $weather['flower_ids'] === '' ? array() : array_map('intval', explode(',', $weather['flower_ids']));
          $ids = array_values(array_filter($ids, function($flowerId) use ($id){ return $flowerId !== $id; }));
          q('UPDATE weather_flowers SET flower_ids = ? WHERE weather_id = ?', array(implode(',', $ids), $weather['weather_id']));
        }
      });
      send(200, array('id' => $id, 'deleted' => true));
    }
    if ($m === 'GET' && $route === '/admin/customers') send(200, rows("SELECT name, email FROM users WHERE role = 'customer' ORDER BY id"));
    if ($m === 'PUT' && $route === '/admin/weather'){
      $weather = get(body(), 'weather');
      if (!is_string($weather) || !in_array($weather, array('', 'sunny', 'rainy'), true)) fail(400, 'Choose Sunny, Rainy, or no weather picks.');
      q("UPDATE petalhub_settings SET setting_value = ? WHERE setting_key = 'weather'", array($weather));
      send(200, array('weather' => $weather));
    }
    if ($m === 'PUT' && preg_match('#^/admin/weather-flowers/(sunny|rainy)$#', $route, $r)){
      $flowerIds = get(body(), 'flowerIds');
      if (!is_array($flowerIds) || count($flowerIds) > 10) fail(400, 'Choose up to 10 flowers for this weather pick.');
      $ids = array();
      foreach ($flowerIds as $id){
        if (!is_int($id) || $id < 1 || isset($ids[$id])) fail(400, 'Invalid flower selection.');
        $ids[$id] = $id;
      }
      if (count($ids)){
        $valid = rows('SELECT id FROM products WHERE active = 1 AND id IN (' . marks(count($ids)) . ')', array_values($ids));
        if (count($valid) !== count($ids)) fail(400, 'One or more selected flowers are no longer available.');
      }
      $csv = implode(',', array_values($ids));
      q('UPDATE weather_flowers SET flower_ids = ? WHERE weather_id = ?', array($csv, $r[1]));
      send(200, array('weather' => $r[1], 'flowerIds' => array_values($ids)));
    }
    if ($m === 'PUT' && preg_match('#^/admin/events/(valentines|christmas|newyear|mothersday|halloween)$#', $route, $r)){
      $flowerIds = get(body(), 'flowerIds');
      if (!is_array($flowerIds) || count($flowerIds) > 10) fail(400, 'Choose up to 10 flowers for this event.');
      $ids = array();
      foreach ($flowerIds as $id){
        if (!is_int($id) || $id < 1 || isset($ids[$id])) fail(400, 'Invalid flower selection.');
        $ids[$id] = $id;
      }
      if (count($ids)){
        $valid = rows('SELECT id FROM products WHERE active = 1 AND id IN (' . marks(count($ids)) . ')', array_values($ids));
        if (count($valid) !== count($ids)) fail(400, 'One or more selected flowers are no longer available.');
      }
      $csv = implode(',', array_values($ids));
      q('UPDATE event_flowers SET flower_ids = ? WHERE event_id = ?', array($csv, $r[1]));
      send(200, array('eventId' => $r[1], 'flowerIds' => array_values($ids)));
    }
    if ($m === 'PATCH' && preg_match('#^/admin/orders/(PH-\d+)$#', $route, $r)){
      $s = get(body(), 'status'); $code = $r[1];
      $out = inTx(function() use ($s, $code, $FLOW){
        $o = row('SELECT status, fulfillment, rider_id, payment_status FROM orders WHERE code = ? FOR UPDATE', array($code));
        if (!$o) fail(404, 'Order not found.');
        $i = array_search($o['status'], $FLOW, true);
        if ($o['payment_status'] === 'awaiting' && $s !== 'Cancelled') fail(400, 'Verify the GCash payment first. The order cannot move forward until the payment is confirmed.');
        if ($s === 'Ready' && $o['fulfillment'] === 'delivery' && $o['rider_id'] === null)
          fail(400, 'Assign a delivery rider before marking this order Ready.');
        if ($s === 'Cancelled' && $i !== false && $i < count($FLOW) - 1){
          returnStock($code);
          if ($o['payment_status'] === 'awaiting') q("UPDATE orders SET payment_status = 'rejected', payment_note = 'Order cancelled before the payment was verified.' WHERE code = ?", array($code));
        } elseif (!($i !== false && isset($FLOW[$i + 1]) && $s === $FLOW[$i + 1])) fail(400, "That status change isn't allowed.");
        q('UPDATE orders SET status = ? WHERE code = ?', array($s, $code));
        return array('code' => $code, 'status' => $s);
      });
      send(200, $out);
    }
    if (preg_match('#^/admin/products/(\d+)$#', $route, $r)){
      $id = (int)$r[1];
      if ($m === 'PUT'){
        $b = body(); $price = get($b, 'price'); $qty = get($b, 'qty'); $av = get($b, 'available');
        if (!isNum($price) || !($price >= 0 && $price <= 1e5) || !isInt($qty) || $qty < 0 || $qty > 1e5) fail(400, 'Enter a valid price and quantity.');
        if (!is_bool($av)) fail(400, 'Choose In stock or Out of stock.');
        if (!row('SELECT id FROM products WHERE id = ?', array($id))) fail(404, 'Product not found.');
        $newAvailable = (int)$qty > 0 && $av;
        q('UPDATE products SET price = ?, qty = ?, available = ? WHERE id = ?', array($price, (int)$qty, $newAvailable ? 1 : 0, $id));
        send(200, pub(row('SELECT id, name, description, price, qty, unit, available, image_path FROM products WHERE id = ?', array($id))));
      }
    }
  }
  fail(404, 'Not found.');
}

try { handle(); }
catch (ApiError $e) { send($e->getCode() ?: 500, array('error' => $e->getMessage())); }
catch (Throwable $e) {
  error_log('PetalHub: ' . $e->getMessage() . ' (' . basename($e->getFile()) . ':' . $e->getLine() . ')');
  // PH_DEBUG (config.php) shows the real reason on screen, which makes problems easy to report. Set it to false when you are done.
  $detail = (!defined('PH_DEBUG') || PH_DEBUG) ? ' ' . $e->getMessage() . ' [' . basename($e->getFile()) . ':' . $e->getLine() . ']' : '';
  send(500, array('error' => 'Server error.' . $detail));
}
