<?php

declare(strict_types=1);

use Dotenv\Dotenv;

// Load Composer autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Load .env file safely if it exists (for local dev); in production/Docker, platform injects env vars
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->safeLoad();
}

// Helper: get env with default
function env(string $key, mixed $default = null): mixed
{
    $val = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    return ($val !== false && $val !== null && $val !== '') ? $val : $default;
}

// App constants
define('APP_NAME',    env('APP_NAME', 'Laundry App'));
define('APP_ENV',     env('APP_ENV', 'production'));
define('APP_URL',     env('APP_URL', 'http://localhost:8000'));
define('APP_DEBUG',   filter_var(env('APP_DEBUG', true), FILTER_VALIDATE_BOOLEAN));

// JWT
define('JWT_SECRET',  env('JWT_SECRET', 'default_secret_change_me'));
define('JWT_EXPIRY',  (int) env('JWT_EXPIRY', 86400));

// CORS
define('FRONTEND_URL', env('FRONTEND_URL', 'http://localhost:3000'));

// Mail
define('MAIL_HOST',      env('MAIL_HOST', 'smtp.gmail.com'));
define('MAIL_PORT',      (int) env('MAIL_PORT', 587));
define('MAIL_USER',      env('MAIL_USER', ''));
define('MAIL_PASS',      env('MAIL_PASS', ''));
define('MAIL_FROM',      env('MAIL_FROM', 'noreply@laundryapp.com'));
define('MAIL_FROM_NAME', env('MAIL_FROM_NAME', APP_NAME));

// Error reporting
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// Set timezone
date_default_timezone_set('Africa/Lagos');
