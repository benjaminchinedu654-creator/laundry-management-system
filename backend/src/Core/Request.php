<?php

declare(strict_types=1);

namespace App\Core;

class Request
{
    private array $query;
    private array $body;
    private array $headers;
    private array $files;
    private array $server;

    public function __construct()
    {
        $this->server  = $_SERVER;
        $this->query   = $_GET;
        $this->files   = $_FILES;
        $this->headers = $this->parseHeaders();
        $this->body    = $this->parseBody();
    }

    /**
     * Parse HTTP headers into a lowercase key map.
     */
    private function parseHeaders(): array
    {
        $headers = [];

        foreach ($this->server as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = str_replace('_', '-', strtolower(substr($key, 5)));
                $headers[$name] = $value;
            }
        }

        // Content-Type and Content-Length are not prefixed with HTTP_
        if (isset($this->server['CONTENT_TYPE'])) {
            $headers['content-type'] = $this->server['CONTENT_TYPE'];
        }
        if (isset($this->server['CONTENT_LENGTH'])) {
            $headers['content-length'] = $this->server['CONTENT_LENGTH'];
        }

        // Also support Authorization from apache_request_headers (fallback)
        if (function_exists('apache_request_headers')) {
            foreach (apache_request_headers() as $k => $v) {
                $headers[strtolower($k)] = $v;
            }
        }

        return $headers;
    }

    /**
     * Parse the request body (JSON, form-encoded, or multipart).
     */
    private function parseBody(): array
    {
        $contentType = $this->headers['content-type'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            $decoded = json_decode($raw ?: '[]', true);
            return is_array($decoded) ? $decoded : [];
        }

        if (str_contains($contentType, 'multipart/form-data')) {
            return $_POST;
        }

        if (str_contains($contentType, 'application/x-www-form-urlencoded')) {
            return $_POST;
        }

        // Fallback — try JSON
        $raw = file_get_contents('php://input');
        if ($raw !== false && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) return $decoded;
        }

        return $_POST;
    }

    // ---------- Getters ----------

    public function method(): string
    {
        return strtoupper($this->server['REQUEST_METHOD'] ?? 'GET');
    }

    public function uri(): string
    {
        $uri = $this->server['REQUEST_URI'] ?? '/';
        $pos = strpos($uri, '?');
        return $pos === false ? $uri : substr($uri, 0, $pos);
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function allQuery(): array
    {
        return $this->query;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function all(): array
    {
        return $this->body;
    }

    public function header(string $key, mixed $default = null): mixed
    {
        return $this->headers[strtolower($key)] ?? $default;
    }

    public function bearerToken(): ?string
    {
        $auth = $this->header('authorization', '');
        if (is_string($auth) && preg_match('/Bearer\s+(.+)/i', $auth, $m)) {
            return trim($m[1]);
        }
        return null;
    }

    public function file(string $key): ?array
    {
        return $this->files[$key] ?? null;
    }

    public function ip(): string
    {
        return $this->server['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    public function userAgent(): string
    {
        return $this->server['HTTP_USER_AGENT'] ?? '';
    }
}