<?php
// These are the locks for your database door
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'your_secure_db_user');
define('DB_PASSWORD', 'your_secure_db_password');
define('DB_NAME', 'tesloiq_platform_db');

try {
    // This connects the website to the database box
    $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    // If something goes wrong, it tells you here
    die("CRITICAL ERROR: Could not connect to the database! " . $e->getMessage());
}
?>