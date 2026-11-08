<?php
// PetalHub settings for XAMPP. The defaults match a fresh XAMPP install (MySQL user "root" with no password).
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_NAME', 'petalhub');
define('DB_USER', 'root');
define('DB_PASS', '');            // put your MySQL root password here if you set one

// The admin account is created automatically the first time the system is opened.
define('ADMIN_EMAIL', 'admin@petalhub.com');
define('ADMIN_PASSWORD', 'petalhub2026');   // change this BEFORE the first run (or after, see README.md)

define('PH_TIMEZONE', 'Asia/Manila');

// true = when something goes wrong the page shows the real reason (easy to screenshot and report). Set to false when everything works.
define('PH_DEBUG', true);
