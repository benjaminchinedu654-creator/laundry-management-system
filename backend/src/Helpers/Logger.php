<?php

declare(strict_types=1);

namespace App\Helpers;

class Logger
{
    private const LOG_DIR = __DIR__ . '/../../storage/logs';

    /**
     * Log an info-level message.
     */
    public static function info(string $message, array $context = []): void
    {
        self::write('INFO', $message, $context);
    }

    /**
     * Log a warning.
     */
    public static function warning(string $message, array $context = []): void
    {
        self::write('WARNING', $message, $context);
    }

    /**
     * Log an error.
     */
    public static function error(string $message, array $context = []): void
    {
        self::write('ERROR', $message, $context);
    }

    /**
     * Write a line to the daily log file.
     */
    private static function write(string $level, string $message, array $context): void
    {
        if (!is_dir(self::LOG_DIR)) {
            @mkdir(self::LOG_DIR, 0775, true);
        }

        $file = self::LOG_DIR . '/app-' . date('Y-m-d') . '.log';

        $entry = sprintf(
            "[%s] %s: %s %s\n",
            date('Y-m-d H:i:s'),
            $level,
            $message,
            $context ? json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : ''
        );

        @file_put_contents($file, $entry, FILE_APPEND | LOCK_EX);
    }
}
