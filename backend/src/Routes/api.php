<?php

declare(strict_types=1);

use App\Core\Response;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\ServiceController;
use App\Controllers\OrderController;
use App\Controllers\NotificationController;
use App\Middleware\AuthMiddleware;

/** @var App\Core\Router $router */

// -------------------------------
// Health check (public)
// -------------------------------
$router->get('/api/health', function () {
    Response::success([
        'app'  => APP_NAME,
        'env'  => APP_ENV,
        'time' => date('c'),
    ], 'API is up and running');
});

// -------------------------------
// Customer auth (public)
// -------------------------------
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login',    [AuthController::class, 'login']);

// -------------------------------
// Protected customer routes
// -------------------------------
$router->get('/api/auth/me', [AuthController::class, 'me'], [AuthMiddleware::class]);

$router->put('/api/users/profile',    [UserController::class, 'updateProfile'],  [AuthMiddleware::class]);
$router->patch('/api/users/password', [UserController::class, 'changePassword'], [AuthMiddleware::class]);

// -------------------------------
// Services (public)
// -------------------------------
$router->get('/api/services', [ServiceController::class, 'index']);

// -------------------------------
// Orders (protected)
// -------------------------------
$router->get('/api/orders',              [OrderController::class, 'index'],  [AuthMiddleware::class]);
$router->post('/api/orders',             [OrderController::class, 'create'], [AuthMiddleware::class]);
$router->get('/api/orders/{id}',         [OrderController::class, 'show'],   [AuthMiddleware::class]);
$router->post('/api/orders/{id}/cancel', [OrderController::class, 'cancel'], [AuthMiddleware::class]);

// -------------------------------
// Notifications (protected)
// -------------------------------
$router->patch('/api/notifications/read-all',    [NotificationController::class, 'markAllRead'], [AuthMiddleware::class]);
$router->get  ('/api/notifications',             [NotificationController::class, 'index'],       [AuthMiddleware::class]);
$router->patch('/api/notifications/{id}/read',   [NotificationController::class, 'markRead'],    [AuthMiddleware::class]);
