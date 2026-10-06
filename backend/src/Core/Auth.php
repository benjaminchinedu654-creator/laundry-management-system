<?php

declare(strict_types=1);

namespace App\Core;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use App\Core\Exceptions\HttpException;

class Auth
{
    /**
     * Sign a JWT with the given payload.
     */
    public static function sign(array $payload, ?int $expiry = null): string
    {
        $now    = time();
        $expiry = $expiry ?? JWT_EXPIRY;

        $payload = array_merge($payload, [
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $expiry,
            'iss' => APP_URL,
        ]);

        return JWT::encode($payload, JWT_SECRET, 'HS256');
    }

    /**
     * Decode + validate a JWT. Throws 401 on failure.
     */
    public static function verify(string $token): array
    {
        try {
            $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
            return (array) $decoded;
        } catch (ExpiredException $e) {
            throw new HttpException(401, 'Token has expired');
        } catch (\Throwable $e) {
            throw new HttpException(401, 'Invalid token');
        }
    }

    /**
     * Read token from request, verify it, return payload.
     */
    public static function userFromRequest(Request $request): array
    {
        $token = $request->bearerToken();
        if (!$token) {
            throw new HttpException(401, 'Missing authentication token');
        }
        return self::verify($token);
    }

    /**
     * Hash a password.
     */
    public static function hashPassword(string $plain): string
    {
        return password_hash($plain, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verify a password against a hash.
     */
    public static function verifyPassword(string $plain, string $hash): bool
    {
        return password_verify($plain, $hash);
    }
}