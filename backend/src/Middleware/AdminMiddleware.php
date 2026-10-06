<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Auth;
use App\Core\Exceptions\HttpException;
use App\Models\Admin;

class AdminMiddleware
{
    /** @var array|null */
    private static ?array $currentPayload = null;

    public function handle(Request $request, array $params = []): void
    {
        $payload = Auth::userFromRequest($request);

        // Ensure token belongs to an admin
        if (($payload['role'] ?? null) !== 'admin') {
            throw new HttpException(403, 'Admin access required.');
        }

        // Confirm the admin still exists and is active
        $admins = new Admin();
        $admin  = $admins->findById((int) $payload['sub']);

        if (!$admin) {
            throw new HttpException(401, 'Admin account not found.');
        }
        if ((int) $admin['is_active'] !== 1) {
            throw new HttpException(403, 'Admin account is disabled.');
        }

        self::$currentPayload = $payload;
    }

    public static function payload(): ?array
    {
        return self::$currentPayload;
    }
}