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
// Database Setup & Migration (public 1-click helper)
// -------------------------------
$router->get('/api/setup-db', function () {
    try {
        require_once __DIR__ . '/../../config/database.php';
        $pdo = \DatabaseConfig::getConnection();

        $migrationFiles = glob(__DIR__ . '/../../database/migrations/*.sql');
        sort($migrationFiles);
        $executed = [];

        foreach ($migrationFiles as $mFile) {
            $sql = file_get_contents($mFile);
            if ($sql && trim($sql) !== '') {
                $pdo->exec($sql);
                $executed[] = basename($mFile);
            }
        }

        $seederFiles = glob(__DIR__ . '/../../database/seeders/*.sql');
        sort($seederFiles);
        foreach ($seederFiles as $sFile) {
            if (str_contains($sFile, 'admin_seeder.sql')) {
                continue;
            }
            $sql = file_get_contents($sFile);
            if ($sql && trim($sql) !== '') {
                $pdo->exec($sql);
                $executed[] = basename($sFile);
            }
        }

        // Seed default super admin
        $adminEmail = 'admin@laundryapp.com';
        $adminPass  = 'admin123';
        $exists = $pdo->prepare('SELECT id FROM admins WHERE email = ?');
        $exists->execute([$adminEmail]);

        if (!$exists->fetch()) {
            $hash = password_hash($adminPass, PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt = $pdo->prepare(
                'INSERT INTO admins (full_name, email, password_hash, is_active) VALUES (?, ?, ?, 1)'
            );
            $stmt->execute(['Super Admin', $adminEmail, $hash]);
            $executed[] = 'Admin user (' . $adminEmail . ')';
        }

        \App\Core\Response::success([
            'executed' => $executed,
            'admin_credentials' => [
                'email' => $adminEmail,
                'password' => $adminPass,
            ]
        ], 'Database tables and seed data created successfully!');
    } catch (\Throwable $e) {
        \App\Core\Response::error('Database setup failed: ' . $e->getMessage(), 500);
    }
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
