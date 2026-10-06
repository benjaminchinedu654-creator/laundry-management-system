<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';

// Connect WITHOUT selecting a database first
$host = env('DB_HOST', '127.0.0.1');
$port = env('DB_PORT', '3306');
$name = env('DB_NAME', 'laundry_db');
$user = env('DB_USER', 'root');
$pass = env('DB_PASS', '');

echo "=== Laundry DB Migration Runner ===\n\n";

try {
    // 1. Connect to MySQL server (no DB)
    $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    // 2. Create database if missing
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Database `{$name}` ready.\n";

    // 3. Use it
    $pdo->exec("USE `{$name}`");

    // 4. Run migrations
    $migrationFiles = glob(__DIR__ . '/migrations/*.sql');
    sort($migrationFiles);

    foreach ($migrationFiles as $file) {
        $sql = file_get_contents($file);
        if ($sql === false || trim($sql) === '') {
            echo "⚠️  Skipped empty: " . basename($file) . "\n";
            continue;
        }
        $pdo->exec($sql);
        echo "✅ Migrated: " . basename($file) . "\n";
    }

    // 5. Run seeders
    $seederFiles = glob(__DIR__ . '/seeders/*.sql');
    sort($seederFiles);

    foreach ($seederFiles as $file) {
        $sql = file_get_contents($file);
        if ($sql === false || trim($sql) === '') {
            echo "⚠️  Skipped empty: " . basename($file) . "\n";
            continue;
        }
        // Skip the placeholder admin seeder — we seed admin via PHP (see below)
        if (str_contains($file, 'admin_seeder.sql')) {
            echo "ℹ️  Skipping admin_seeder.sql (handled by PHP).\n";
            continue;
        }
        $pdo->exec($sql);
        echo "✅ Seeded: " . basename($file) . "\n";
    }

    // 6. Seed admin with a real bcrypt hash
    $adminEmail = 'admin@laundryapp.com';
    $adminPass  = 'admin123';

    $exists = $pdo->prepare("SELECT id FROM admins WHERE email = ?");
    $exists->execute([$adminEmail]);

    if (!$exists->fetch()) {
        $hash = password_hash($adminPass, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $pdo->prepare(
            "INSERT INTO admins (full_name, email, password_hash, is_active)
             VALUES (?, ?, ?, 1)"
        );
        $stmt->execute(['Super Admin', $adminEmail, $hash]);
        echo "✅ Admin created: {$adminEmail} / {$adminPass}\n";
    } else {
        echo "ℹ️  Admin already exists — skipped.\n";
    }

    echo "\n🎉 All done.\n";
} catch (Throwable $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}