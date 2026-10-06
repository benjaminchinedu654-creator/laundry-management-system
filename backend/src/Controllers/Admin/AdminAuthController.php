<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Exceptions\HttpException;
use App\Helpers\Validator;
use App\Helpers\Token;
use App\Models\Admin;

class AdminAuthController
{
    private Admin $admins;

    public function __construct()
    {
        $this->admins = new Admin();
    }

    /**
     * POST /api/admin/auth/login
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
        $admin = $this->admins->findByEmail($email);

        if (!$admin || !Auth::verifyPassword($data['password'], $admin['password_hash'])) {
            throw new HttpException(401, 'Invalid email or password.');
        }
        if ((int) $admin['is_active'] !== 1) {
            throw new HttpException(403, 'Admin account is disabled.');
        }

        // Update last login timestamp
        $this->admins->updateLastLogin((int) $admin['id']);

        $token = Token::forAdmin((int) $admin['id']);

        Response::success([
            'admin' => $this->publicAdmin($admin),
            'token' => $token,
        ], 'Admin logged in');
    }

    /**
     * GET /api/admin/auth/me  (protected)
     */
    public function me(Request $request): void
    {
        $payload = Auth::userFromRequest($request);
        $admin   = $this->admins->findById((int) $payload['sub']);

        if (!$admin) {
            throw new HttpException(404, 'Admin not found.');
        }

        Response::success(['admin' => $this->publicAdmin($admin)], 'OK');
    }

    /**
     * PATCH /api/admin/auth/password  (protected)
     * Body: { current_password, new_password, new_password_confirmation }
     */
    public function changePassword(Request $request): void
    {
        $payload = Auth::userFromRequest($request);
        $adminId = (int) $payload['sub'];

        $admin = $this->admins->findById($adminId);
        if (!$admin) {
            throw new HttpException(404, 'Admin not found.');
        }

        $data = $request->all();

        Validator::make($data)
            ->required('current_password')
            ->required('new_password')->min('new_password', 6, 'New password')
            ->required('new_password_confirmation', 'New password confirmation')
            ->sameAs('new_password_confirmation', 'new_password', 'New password confirmation')
            ->validate();

        if (!Auth::verifyPassword($data['current_password'], $admin['password_hash'])) {
            throw new HttpException(400, 'Current password is incorrect.');
        }

        $this->admins->updatePassword($adminId, Auth::hashPassword($data['new_password']));

        Response::success(null, 'Password updated successfully');
    }

    private function publicAdmin(array $admin): array
    {
        unset($admin['password_hash']);
        return $admin;
    }
}