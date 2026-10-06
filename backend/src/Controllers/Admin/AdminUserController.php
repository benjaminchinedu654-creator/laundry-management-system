<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Exceptions\HttpException;
use App\Models\User;
use App\Models\Order;

class AdminUserController
{
    private User  $users;
    private Order $orders;

    public function __construct()
    {
        $this->users  = new User();
        $this->orders = new Order();
    }

    /**
     * GET /api/admin/users
     * Query: search, page, per_page
     */
    public function index(Request $request): void
    {
        $page    = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(1, (int) $request->query('per_page', 15)));
        $offset  = ($page - 1) * $perPage;
        $search  = (string) ($request->query('search', ''));

        $users = $this->users->list($perPage, $offset, $search);
        $total = $this->users->count($search);

        // Strip password hashes
        $users = array_map(function ($u) {
            unset($u['password_hash']);
            return $u;
        }, $users);

        Response::success([
            'users' => $users,
            'meta'  => [
                'page'      => $page,
                'per_page'  => $perPage,
                'total'     => $total,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ], 'Users loaded');
    }

    /**
     * GET /api/admin/users/{id}
     * Includes recent orders for that customer.
     */
    public function show(Request $request, array $params): void
    {
        $id   = (int) ($params['id'] ?? 0);
        $user = $this->users->findById($id);

        if (!$user) {
            throw new HttpException(404, 'User not found.');
        }
        unset($user['password_hash']);

        $orders = $this->orders->listByUser($id, 20, 0);

        Response::success([
            'user'   => $user,
            'orders' => $orders,
        ], 'User loaded');
    }

    /**
     * PATCH /api/admin/users/{id}/status
     * Body: { is_active: 0|1 }
     */
    public function updateStatus(Request $request, array $params): void
    {
        $id = (int) ($params['id'] ?? 0);

        $user = $this->users->findById($id);
        if (!$user) {
            throw new HttpException(404, 'User not found.');
        }

        $data = $request->all();
        if (!array_key_exists('is_active', $data)) {
            throw new HttpException(422, 'is_active is required.', [
                'is_active' => ['Provide 0 (deactivate) or 1 (activate).'],
            ]);
        }

        $active = (int) $data['is_active'] === 1;
        $this->users->setActive($id, $active);

        $updated = $this->users->findById($id);
        unset($updated['password_hash']);

        Response::success([
            'user' => $updated,
        ], $active ? 'User activated' : 'User deactivated');
    }
}