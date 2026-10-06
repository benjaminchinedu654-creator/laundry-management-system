<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Auth;
use App\Core\Exceptions\HttpException;

class AuthMiddleware
{
    /** @var array|null */
    private static ?array $currentPayload = null;

    /**
     * Called by Router.
     */
    public function handle(Request $request, array $params = []): void
    {
        $payload = Auth::userFromRequest($request);

        // Ensure token is a customer token
        if (($payload['role'] ?? null) !== 'customer') {
            throw new HttpException(403, 'Customer access required.');
        }

        self::$currentPayload = $payload;
    }

    /**
     * Get the last verified payload (optional helper).
     */
    public static function payload(): ?array
    {
        return self::$currentPayload;
    }
}