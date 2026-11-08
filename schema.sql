CREATE DATABASE IF NOT EXISTS petalhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petalhub;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  salt CHAR(32) NOT NULL,
  password_hash CHAR(128) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  qty INT NOT NULL,
  unit VARCHAR(40) NOT NULL,
  description VARCHAR(300) NOT NULL DEFAULT '',
  image_path VARCHAR(255) NOT NULL DEFAULT '',
  active TINYINT(1) NOT NULL DEFAULT 1,
  available TINYINT(1) NOT NULL DEFAULT 1   -- the admin sets In stock (1) / Out of stock (0)
);

CREATE TABLE IF NOT EXISTS petalhub_settings (
  setting_key VARCHAR(40) PRIMARY KEY,
  setting_value VARCHAR(100) NOT NULL
);

INSERT IGNORE INTO petalhub_settings (setting_key, setting_value) VALUES
  ('weather', ''),
  ('gcash_name', 'PetalHub Flower Shop'),
  ('gcash_number', ''),
  ('gcash_qr', 'payments/gcash-qr.png');

CREATE TABLE IF NOT EXISTS event_flowers (
  event_id VARCHAR(40) PRIMARY KEY,
  flower_ids VARCHAR(255) NOT NULL DEFAULT ''
);

INSERT IGNORE INTO event_flowers (event_id, flower_ids) VALUES
  ('valentines', '1,2,4'),
  ('christmas', '3,5,6'),
  ('newyear', '1,3,6'),
  ('mothersday', '1,4,6'),
  ('halloween', '8,9,10');

CREATE TABLE IF NOT EXISTS weather_flowers (
  weather_id VARCHAR(20) PRIMARY KEY,
  flower_ids VARCHAR(255) NOT NULL DEFAULT ''
);

INSERT IGNORE INTO weather_flowers (weather_id, flower_ids) VALUES
  ('sunny', '3,2,1'),
  ('rainy', '5,6,4');

INSERT IGNORE INTO products (id, name, price, qty, unit) VALUES
  (1, 'White Roses', 18.00, 24, 'bunches available'),
  (2, 'Tulip',       12.00, 40, 'bunches available'),
  (3, 'Sunflower',    9.00, 30, 'bunches available'),
  (4, 'Peony',       22.00, 12, 'bunches available'),
  (5, 'Orchid',      28.00, 15, 'pots available'),
  (6, 'Lily',        16.00, 20, 'bunches available'),
  (7, 'Red Roses',   32.00, 18, 'bunches available'),
  (8, 'Carnation',   14.00, 26, 'bunches available'),
  (9, 'Chrysanthemum', 18.00, 22, 'bunches available'),
  (10, 'Gladiolus',  20.00, 14, 'bunches available');

CREATE TABLE IF NOT EXISTS orders (
  code VARCHAR(12) PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  fulfillment ENUM('pickup','delivery') NOT NULL,
  street VARCHAR(200) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  zip VARCHAR(20) NOT NULL DEFAULT '',
  customer_phone VARCHAR(30) NOT NULL DEFAULT '',
  rider_id INT NULL,
  rider_name VARCHAR(80) NOT NULL DEFAULT '',
  rider_phone VARCHAR(30) NOT NULL DEFAULT '',
  payment VARCHAR(40) NOT NULL,
  status ENUM('Pending','Preparing','Ready','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checkout_key VARCHAR(60) NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'not_required',   -- not_required | awaiting | verified | rejected (GCash QR payments)
  gcash_ref VARCHAR(30) NULL,                                   -- 13-digit GCash reference number from the customer's receipt
  payment_proof VARCHAR(160) NOT NULL DEFAULT '',               -- optional screenshot, stored in payments/proofs
  payment_note VARCHAR(200) NOT NULL DEFAULT '',
  paid_at DATETIME NULL,
  UNIQUE KEY uq_orders_user_key (user_id, checkout_key),
  UNIQUE KEY uq_orders_gcash_ref (gcash_ref),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS delivery_riders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO delivery_riders (name, phone) VALUES
  ('Alvin Jay Ornejo', '09123456789'),
  ('Ynzo Martin Pasaoa', '09123456788'),
  ('Aldrin Magalang', '09696710101');

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(12) NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR(80) NOT NULL,
  qty INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  line_key VARCHAR(60) NULL,
  line_name VARCHAR(80) NOT NULL DEFAULT '',
  arrangement ENUM('single','bouquet','custom') NOT NULL DEFAULT 'single',
  line_qty INT NOT NULL DEFAULT 1,
  wrap_design VARCHAR(40) NULL,
  wrap_color VARCHAR(100) NOT NULL DEFAULT '',
  wrap_notes VARCHAR(300) NOT NULL DEFAULT '',
  wrap_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (order_code) REFERENCES orders(code) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
