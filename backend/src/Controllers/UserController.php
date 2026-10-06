<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Exceptions\HttpException;
use App\Helpers\Validator;
use App\Models\User;

class UserController
{
    private User $users;

    public function __construct()
    {
        $this->users = new User();
    }

    /**
     * PUT /api/users/profile  (protected)
     * Body: { full_name?, phone?, address? }
     */
    public function updateProfile(Request $request): void
    {
        $payload = Auth::userFromRequest($request);
        $userId  = (int) $payload['sub'];

        $user = $this->users->findById($userId);
        if (!$user) {
            throw new HttpException(404, 'User not found.');
        }

        $data = $request->all();

        Validator::make($data)
            ->max('full_name', 120, 'Full name')
            ->phone('phone')
            ->validate();

        // Uniqueness check if phone is being changed
        if (!empty($data['phone']) && $data['phone'] !== $user['phone']) {
            if ($this->users->findByPhone($data['phone'])) {
                throw new HttpException(409, 'Phone number is already in use.');
            }
        }

        $updates = [];
        if (array_key_exists('full_name', $data)) $updates['full_name'] = trim((string) $data['full_name']);
        if (array_key_exists('phone', $data))     $updates['phone']     = trim((string) $data['phone']);
        if (array_key_exists('address', $data))   $updates['address']   = trim((string) $data['address']);

        if (!empty($updates)) {
            $this->users->updateProfile($userId, $updates);
        }

        $updated = $this->users->findById($userId);
        unset($updated['password_hash']);

        Response::success(['user' => $updated], 'Profile updated successfully');
    }

    /**
     * PATCH /api/users/password  (protected)
     * Body: { current_password, new_password, new_password_confirmation }
     */
    public function changePassword(Request $request): void
    {
        $payload = Auth::userFromRequest($request);
        $userId  = (int) $payload['sub'];

        $user = $this->users->findById($userId);
        if (!$user) {
            throw new HttpException(404, 'User not found.');
        }

        $data = $request->all();

        Validator::make($data)
            ->required('current_password')
            ->required('new_password')->min('new_password', 6, 'New password')
            ->required('new_password_confirmation', 'New password confirmation')
            ->sameAs('new_password_confirmation', 'new_password', 'New password confirmation')
            ->validate();

        if (!Auth::verifyPassword($data['current_password'], $user['password_hash'])) {
            throw new HttpException(400, 'Current password is incorrect.');
        }

        $this->users->updatePassword($userId, Auth::hashPassword($data['new_password']));

        Response::success(null, 'Password updated successfully');
    }
}