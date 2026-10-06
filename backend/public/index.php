<?php

declare(strict_types=1);

use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Core\Exceptions\HttpException;

// Load config (also loads Composer autoloader + .env)
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/cors.php';

// Send CORS headers + handle OPTIONS preflight
setCorsHeaders();

// Create request + router
$request = new Request();
$router  = new Router();

// Load routes
require_once __DIR__ . '/../src/Routes/api.php';
require_once __DIR__ . '/../src/Routes/admin.php';

// Global error handling
try {
    $router->dispatch($request);
} catch (HttpException $e) {
    Response::error($e->getMessage(), $e->getStatusCode(), $e->getErrors());
} catch (Throwable $e) {
    if (APP_DEBUG) {
        Response::error($e->getMessage(), 500, [
            'file'  => $e->getFile(),
            'line'  => $e->getLine(),
            'trace' => explode("\n", $e->getTraceAsString()),
        ]);
    } else {
        Response::serverError('An unexpected error occurred.');
    }
}