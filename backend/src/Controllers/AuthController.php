<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Exceptions\HttpException;
use App\Helpers\Validator;
use App\Helpers\Token;
use App\Models\User;

class AuthController
{
    private User $users;

    public function __construct()
    {
        $this->users = new User();
    }

    /**
     * POST /api/auth/register
     * Body: { full_name, email, phone, password, password_confirmation, address? }
     */
    public function register(Request $request): void
    {
        $data = $request->all();

        Validator::make($data)
            ->required('full_name', 'Full name')->max('full_name', 120, 'Full name')
            ->required('email')->email('email')->max('email', 150, 'Email')
            ->required('phone')->phone('phone')
            ->required('password')->min('password', 6, 'Password')
            ->required('password_confirmation', 'Password confirmation')
            ->sameAs('password_confirmation', 'password', 'Password confirmation')
            ->validate();

        $email = strtolower(trim($data['email']));
        $phone = trim($data['phone']);

        // Uniqueness checks
        if ($this->users->findByEmail($email)) {
            throw new HttpException(409, 'An account with this email already exists.');
        }
        if ($this->users->findByPhone($phone)) {
            throw new HttpException(409, 'An account with this phone number already exists.');
        }

        $userId = $this->users->create([
            'full_name'     => trim($data['full_name']),
            'email'         => $email,
            'phone'         => $phone,
            'password_hash' => Auth::hashPassword($data['password']),
            'address'       => isset($data['address']) ? trim($data['address']) : null,
        ]);

        $user  = $this->users->findById($userId);
        $token = Token::forUser($userId);

        Response::success([
            'user'  => $this->publicUser($user),
            'token' => $token,
        ], 'Account created successfully', 201);
    }

    /**
     * POST /api/auth/login
     * Body: { email, password }
     */
    public function login(Request $request): void
    {
        $data = $request->all();

        Validator::make($data)
            ->required('email')->email('email')
            ->required('password')
            ->validate();

        $email = strtolower(trim($data['email']));
        $user  = $this->users->findByEmail($email);

        if (!$user || !Auth::verifyPassword($data['password'], $user['password_hash'])) {
            throw new HttpException(401, 'Invalid email or password.');
        }

        if ((int) $user['is_active'] !== 1) {
            throw new HttpException(403, 'Your account has been deactivated. Please contact support.');
        }

        $token = Token::forUser((int) $user['id']);

        Response::success([
            'user'  => $this->publicUser($user),
            'token' => $token,
        ], 'Logged in successfully');
    }

    /**
     * GET /api/auth/me  (protected)
     */
    public function me(Request $request): void
    {
        $payload = Auth::userFromRequest($request);
        $user    = $this->users->findById((int) $payload['sub']);

        if (!$user) {
            throw new HttpException(404, 'User not found.');
        }
        if ((int) $user['is_active'] !== 1) {
            throw new HttpException(403, 'Account is deactivated.');
        }

        Response::success(['user' => $this->publicUser($user)], 'OK');
    }

    /**
     * Remove sensitive fields before sending to client.
     */
    private function publicUser(array $user): array
    {
        unset($user['password_hash']);
        return $user;
    }
}