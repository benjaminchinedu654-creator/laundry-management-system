<?php

declare(strict_types=1);

namespace App\Core;

use App\Core\Exceptions\HttpException;

class Router
{
    /** @var array<string, array<int, array>> */
    private array $routes = [
        'GET'    => [],
        'POST'   => [],
        'PUT'    => [],
        'PATCH'  => [],
        'DELETE' => [],
    ];

    /** @var string[] */
    private array $groupMiddleware = [];

    /**
     * Register a GET route.
     */
    public function get(string $path, array|callable $handler, array $middleware = []): void
    {
        $this->add('GET', $path, $handler, $middleware);
    }

    public function post(string $path, array|callable $handler, array $middleware = []): void
    {
        $this->add('POST', $path, $handler, $middleware);
    }

    public function put(string $path, array|callable $handler, array $middleware = []): void
    {
        $this->add('PUT', $path, $handler, $middleware);
    }

    public function patch(string $path, array|callable $handler, array $middleware = []): void
    {
        $this->add('PATCH', $path, $handler, $middleware);
    }

    public function delete(string $path, array|callable $handler, array $middleware = []): void
    {
        $this->add('DELETE', $path, $handler, $middleware);
    }

    /**
     * Group routes under a prefix + shared middleware.
     */
    public function group(string $prefix, array $middleware, callable $callback): void
    {
        $previousPrefix     = $this->currentPrefix ?? '';
        $previousMiddleware = $this->groupMiddleware;

        $this->currentPrefix    = $previousPrefix . $prefix;
        $this->groupMiddleware  = array_merge($previousMiddleware, $middleware);

        $callback($this);

        $this->currentPrefix    = $previousPrefix;
        $this->groupMiddleware  = $previousMiddleware;
    }

    private ?string $currentPrefix = '';

    /**
     * Internal: register a route.
     */
    private function add(string $method, string $path, array|callable $handler, array $middleware): void
    {
        $fullPath = $this->normalizePath(($this->currentPrefix ?? '') . $path);

        $this->routes[$method][] = [
            'path'       => $fullPath,
            'handler'    => $handler,
            'middleware' => array_merge($this->groupMiddleware, $middleware),
            'regex'      => $this->pathToRegex($fullPath),
        ];
    }

    /**
     * Normalize: ensure leading slash, no trailing slash (except root).
     */
    private function normalizePath(string $path): string
    {
        if ($path === '' || $path === '/') return '/';
        $path = '/' . ltrim($path, '/');
        return rtrim($path, '/');
    }

    /**
     * Convert `/api/orders/{id}` → regex with named capture.
     */
    private function pathToRegex(string $path): string
    {
        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    /**
     * Dispatch the incoming request.
     */
    public function dispatch(Request $request): void
    {
        $method = $request->method();
        $uri    = $this->normalizePath($request->uri());

        if (!isset($this->routes[$method])) {
            throw new HttpException(405, 'Method not allowed');
        }

        foreach ($this->routes[$method] as $route) {
            if (preg_match($route['regex'], $uri, $matches)) {
                // Named params only
                $params = array_filter(
                    $matches,
                    fn($k) => !is_int($k),
                    ARRAY_FILTER_USE_KEY
                );

                // Run middleware chain
                foreach ($route['middleware'] as $mw) {
                    $this->runMiddleware($mw, $request, $params);
                }

                // Call the handler
                $this->invokeHandler($route['handler'], $request, $params);
                return;
            }
        }

        throw new HttpException(404, 'Route not found: ' . $uri);
    }

    /**
     * Run a middleware (class name or callable).
     */
    private function runMiddleware(mixed $mw, Request $request, array $params): void
    {
        if (is_callable($mw)) {
            $mw($request, $params);
            return;
        }

        if (is_string($mw) && class_exists($mw)) {
            $instance = new $mw();
            if (method_exists($instance, 'handle')) {
                $instance->handle($request, $params);
                return;
            }
        }

        throw new HttpException(500, 'Invalid middleware');
    }

    /**
     * Call controller method or closure.
     */
    private function invokeHandler(array|callable $handler, Request $request, array $params): void
    {
        if (is_callable($handler)) {
            $handler($request, $params);
            return;
        }

        if (is_array($handler) && count($handler) === 2) {
            [$class, $method] = $handler;
            if (!class_exists($class)) {
                throw new HttpException(500, "Controller not found: {$class}");
            }
            $controller = new $class();
            if (!method_exists($controller, $method)) {
                throw new HttpException(500, "Method not found: {$class}::{$method}");
            }
            $controller->{$method}($request, $params);
            return;
        }

        throw new HttpException(500, 'Invalid route handler');
    }
}