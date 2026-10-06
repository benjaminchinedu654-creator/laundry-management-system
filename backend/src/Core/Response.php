<?php

declare(strict_types=1);

namespace App\Core;

class Response
{
    /**
     * Send a JSON response and stop execution.
     */
    public static function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Success response.
     */
    public static function success(
        mixed $data = null,
        string $message = 'OK',
        int $status = 200
    ): void {
        self::json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * Error response.
     */
    public static function error(
        string $message = 'Something went wrong',
        int $status = 400,
        array $errors = []
    ): void {
        self::json([
            'status'  => 'error',
            'message' => $message,
            'errors'  => $errors,
        ], $status);
    }

    /**
     * Validation error (422) with field errors.
     */
    public static function validation(array $errors, string $message = 'Validation failed'): void
    {
        self::error($message, 422, $errors);
    }

    /**
     * Unauthorized (401).
     */
    public static function unauthorized(string $message = 'Unauthorized'): void
    {
        self::error($message, 401);
    }

    /**
     * Forbidden (403).
     */
    public static function forbidden(string $message = 'Forbidden'): void
    {
        self::error($message, 403);
    }

    /**
     * Not found (404).
     */
    public static function notFound(string $message = 'Resource not found'): void
    {
        self::error($message, 404);
    }

    /**
     * Server error (500).
     */
    public static function serverError(string $message = 'Server error'): void
    {
        self::error($message, 500);
    }
}