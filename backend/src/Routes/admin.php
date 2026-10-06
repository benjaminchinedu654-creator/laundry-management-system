<?php

declare(strict_types=1);

use App\Controllers\Admin\AdminAuthController;
use App\Controllers\Admin\AdminDashboardController;
use App\Controllers\Admin\AdminOrderController;
use App\Controllers\Admin\AdminUserController;
use App\Controllers\Admin\AdminServiceController;
use App\Controllers\Admin\AdminPaymentController;
use App\Controllers\Admin\AdminReportController;
use App\Middleware\AdminMiddleware;

/** @var App\Core\Router $router */

// -------------------------------
// Admin auth (public)
// -------------------------------
$router->post('/api/admin/auth/login', [AdminAuthController::class, 'login']);

// -------------------------------
// Admin routes (protected)
// -------------------------------
$router->get('/api/admin/auth/me',           [AdminAuthController::class, 'me'],             [AdminMiddleware::class]);
$router->patch('/api/admin/auth/password',   [AdminAuthController::class, 'changePassword'], [AdminMiddleware::class]);

$router->get('/api/admin/dashboard',         [AdminDashboardController::class, 'overview'],  [AdminMiddleware::class]);

$router->get('/api/admin/orders',                  [AdminOrderController::class, 'index'],              [AdminMiddleware::class]);
$router->get('/api/admin/orders/{id}',             [AdminOrderController::class, 'show'],               [AdminMiddleware::class]);
$router->patch('/api/admin/orders/{id}/status',    [AdminOrderController::class, 'updateStatus'],       [AdminMiddleware::class]);
$router->patch('/api/admin/orders/{id}/payment',   [AdminOrderController::class, 'updatePaymentStatus'],[AdminMiddleware::class]);

// -------------------------------
// Users
// -------------------------------
$router->get  ('/api/admin/users',             [AdminUserController::class, 'index'],        [AdminMiddleware::class]);
$router->get  ('/api/admin/users/{id}',        [AdminUserController::class, 'show'],         [AdminMiddleware::class]);
$router->patch('/api/admin/users/{id}/status', [AdminUserController::class, 'updateStatus'], [AdminMiddleware::class]);

// -------------------------------
// Services
// -------------------------------
$router->get   ('/api/admin/services',                   [AdminServiceController::class, 'index'],              [AdminMiddleware::class]);
$router->post  ('/api/admin/services',                   [AdminServiceController::class, 'store'],              [AdminMiddleware::class]);
$router->get   ('/api/admin/services/{id}',              [AdminServiceController::class, 'show'],               [AdminMiddleware::class]);
$router->put   ('/api/admin/services/{id}',              [AdminServiceController::class, 'update'],             [AdminMiddleware::class]);
$router->patch ('/api/admin/services/{id}/availability', [AdminServiceController::class, 'updateAvailability'], [AdminMiddleware::class]);
$router->delete('/api/admin/services/{id}',              [AdminServiceController::class, 'destroy'],            [AdminMiddleware::class]);

// -------------------------------
// Payments
// -------------------------------
$router->get  ('/api/admin/payments',              [AdminPaymentController::class, 'index'],        [AdminMiddleware::class]);
$router->post ('/api/admin/payments',              [AdminPaymentController::class, 'store'],        [AdminMiddleware::class]);
$router->get  ('/api/admin/payments/{id}',         [AdminPaymentController::class, 'show'],         [AdminMiddleware::class]);
$router->patch('/api/admin/payments/{id}/status',  [AdminPaymentController::class, 'updateStatus'], [AdminMiddleware::class]);

// -------------------------------
// Reports
// -------------------------------
$router->get('/api/admin/reports/orders',    [AdminReportController::class, 'orders'],    [AdminMiddleware::class]);
$router->get('/api/admin/reports/revenue',   [AdminReportController::class, 'revenue'],   [AdminMiddleware::class]);
$router->get('/api/admin/reports/customers', [AdminReportController::class, 'customers'], [AdminMiddleware::class]);
