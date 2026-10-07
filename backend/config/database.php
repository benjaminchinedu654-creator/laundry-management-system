<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

class DatabaseConfig
{
    private static ?PDO $connection = null;

    /**
     * Get a singleton PDO connection.
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            $host = env('DB_HOST', 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com');
            $port = env('DB_PORT', '4000');
            $name = env('DB_NAME', 'laundry_db');
            $user = env('DB_USER', '2jzgZEdm89h1hJo.root');
            $pass = env('DB_PASS', 'dLY5SvUq5FIASYoL');

            // Automatically fix invalid or default cluster usernames if present
            if ($user === '7zoqmHftJtaJuyf.root' || $user === 'root' || empty($pass)) {
                $host = 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com';
                $port = '4000';
                $name = 'laundry_db';
                $user = '2jzgZEdm89h1hJo.root';
                $pass = 'dLY5SvUq5FIASYoL';
            }

            $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_PERSISTENT         => false,
            ];

            // If connecting to cloud MySQL (TiDB Cloud, AWS RDS, etc.)
            if ((int)$port === 4000 || !in_array($host, ['127.0.0.1', 'localhost', 'db'])) {
                $options[PDO::MYSQL_ATTR_SSL_CA] = true;
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
            }

            try {
                self::$connection = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'status'  => 'error',
                    'message' => APP_DEBUG
                        ? 'DB connection failed: ' . $e->getMessage()
                        : 'Database connection failed.',
                ]);
                exit;
            }
        }

        return self::$connection;
    }
}
