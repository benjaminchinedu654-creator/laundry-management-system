<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * Send CORS headers so Next.js can call this API.
 */
function setCorsHeaders(): void
{
    $allowed = FRONTEND_URL;

    // Allow the configured frontend origin
    if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowed) {
        header("Access-Control-Allow-Origin: {$allowed}");
    } else {
        // Fallback (useful during dev when Next.js uses 127.0.0.1 vs localhost)
        header("Access-Control-Allow-Origin: {$allowed}");
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // cache preflight for 24h

    // Handle preflight request early
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}