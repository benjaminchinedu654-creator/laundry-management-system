<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Auth;
use App\Models\Notification;

class NotificationController
{
    private Notification $notifications;

    public function __construct()
    {
        $this->notifications = new Notification();
    }

    /**
     * GET /api/notifications
     */
    public function index(Request $request): void
    {
        $payload = Auth::userFromRequest($request);
        $userId  = (int) $payload['sub'];

        $page    = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(1, (int) $request->query('per_page', 15)));
        $offset  = ($page - 1) * $perPage;

        $rows  = $this->notifications->listByUser($userId, $perPage, $offset);
        $unread = $this->notifications->unreadCount($userId);

        Response::success([
            'notifications' => $rows,
            'unread'        => $unread,
        ], 'Notifications loaded');
    }

    /**
     * PATCH /api/notifications/{id}/read
     */
    public function markRead(Request $request, array $params): void
    {
        $payload = Auth::userFromRequest($request);
        $userId  = (int) $payload['sub'];
        $id      = (int) ($params['id'] ?? 0);

        $this->notifications->markRead($id, $userId);

        Response::success(null, 'Notification marked as read');
    }

    /**
     * PATCH /api/notifications/read-all
     */
    public function markAllRead(Request $request): void
    {
        $payload = Auth::userFromRequest($request);
        $userId  = (int) $payload['sub'];

        $this->notifications->markAllRead($userId);

        Response::success(null, 'All notifications marked as read');
    }
}