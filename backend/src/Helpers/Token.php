<?php

declare(strict_types=1);

namespace App\Helpers;

use App\Core\Auth;

class Token
{
    /**
     * Issue a token for a customer.
     */
    public static function forUser(int $userId, array $extra = []): string
    {
        return Auth::sign(array_merge([
            'sub'  => $userId,
            'role' => 'customer',
        ], $extra));
    }

    /**
     * Issue a token for an admin.
     */
    public static function forAdmin(int $adminId, array $extra = []): string
    {
        return Auth::sign(array_merge([
            'sub'  => $adminId,
            'role' => 'admin',
        ], $extra));
    }
}