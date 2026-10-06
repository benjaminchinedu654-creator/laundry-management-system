<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Exceptions\HttpException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Notification;

class AdminOrderController
{
    private Order        $orders;
    private OrderItem    $items;
    private Notification $notifications;

    public function __construct()
    {
        $this->orders        = new Order();
        $this->items         = new OrderItem();
        $this->notifications = new Notification();
    }

    /**
     * GET /api/admin/orders
     * Query filters: status, payment_status, search, from_date, to_date, page, per_page
     */
    public function index(Request $request): void
    {
        $page    = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(1, (int) $request->query('per_page', 15)));
        $offset  = ($page - 1) * $perPage;

        $filters = [
            'status'         => $request->query('status'),
            'payment_status' => $request->query('payment_status'),
            'search'         => $request->query('search'),
            'from_date'      => $request->query('from_date'),
            'to_date'        => $request->query('to_date'),
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $orders = $this->orders->listAdmin($filters, $perPage, $offset);
        $total  = $this->orders->countAdmin($filters);

        Response::success([
            'orders' => $orders,
            'meta'   => [
                'page'      => $page,
                'per_page'  => $perPage,
                'total'     => $total,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ], 'Orders loaded');
    }

    /**
     * GET /api/admin/orders/{id}
     */
    public function show(Request $request, array $params): void
    {
        $id    = (int) ($params['id'] ?? 0);
        $order = $this->orders->findById($id);

        if (!$order) {
            throw new HttpException(404, 'Order not found.');
        }

        $order['items'] = $this->items->listByOrder($id);

        Response::success(['order' => $order], 'Order loaded');
    }

    /**
     * PATCH /api/admin/orders/{id}/status
     * Body: { status }
     * Allowed: pending, picked_up, washing, ready, out_for_delivery, delivered, cancelled
     */
    public function updateStatus(Request $request, array $params): void
    {
        $id     = (int) ($params['id'] ?? 0);
        $data   = $request->all();
        $status = $data['status'] ?? null;

        $allowed = ['pending', 'picked_up', 'washing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

        if (!$status || !in_array($status, $allowed, true)) {
            throw new HttpException(422, 'Invalid status.', [
                'status' => ['Status must be one of: ' . implode(', ', $allowed)],
            ]);
        }

        $order = $this->orders->findById($id);
        if (!$order) {
            throw new HttpException(404, 'Order not found.');
        }

        // Prevent unnecessary writes
        if ($order['status'] === $status) {
            Response::success(['order' => $order], 'Status unchanged');
        }

        $this->orders->updateStatus($id, $status);

        // Notify the customer
        $this->notifications->create([
            'user_id'  => (int) $order['user_id'],
            'order_id' => $id,
            'channel'  => 'in_app',
            'title'    => 'Order status updated',
            'message'  => "Your order {$order['order_code']} is now: " . str_replace('_', ' ', $status) . ".",
            'sent_at'  => date('Y-m-d H:i:s'),
        ]);

        $updated = $this->orders->findById($id);
        Response::success(['order' => $updated], 'Order status updated');
    }

    /**
     * PATCH /api/admin/orders/{id}/payment
     * Body: { payment_status }  -> paid | unpaid | refunded
     * Used mainly for cash confirmation.
     */
    public function updatePaymentStatus(Request $request, array $params): void
    {
        $id     = (int) ($params['id'] ?? 0);
        $data   = $request->all();
        $status = $data['payment_status'] ?? null;

        $allowed = ['paid', 'unpaid', 'refunded'];
        if (!$status || !in_array($status, $allowed, true)) {
            throw new HttpException(422, 'Invalid payment status.', [
                'payment_status' => ['Status must be one of: ' . implode(', ', $allowed)],
            ]);
        }

        $order = $this->orders->findById($id);
        if (!$order) {
            throw new HttpException(404, 'Order not found.');
        }

        $this->orders->updatePaymentStatus($id, $status);

        $updated = $this->orders->findById($id);
        Response::success(['order' => $updated], 'Payment status updated');
    }
}