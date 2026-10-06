<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Database;
use App\Core\Exceptions\HttpException;
use App\Helpers\Validator;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\Notification;

class OrderController
{
    private Order        $orders;
    private OrderItem    $items;
    private Service      $services;
    private Notification $notifications;
    private Database     $db;

    public function __construct()
    {
        $this->orders        = new Order();
        $this->items         = new OrderItem();
        $this->services      = new Service();
        $this->notifications = new Notification();
        $this->db            = new Database();
    }

    /**
     * POST /api/orders  (protected)
     * Body:
     * {
     *   "pickup_address": "...",
     *   "pickup_date": "2026-01-15",
     *   "pickup_time": "09:00",
     *   "delivery_address": "...",
     *   "delivery_date": "2026-01-17",
     *   "delivery_time": "16:00",
     *   "special_notes": "no bleach",     // optional
     *   "items": [
     *     { "service_id": 1, "quantity": 3 },
     *     { "service_id": 6, "quantity": 1 }
     *   ]
     * }
     */
    public function create(Request $request): void
    {
        $payload = Auth::userFromRequest($request);
        $userId  = (int) $payload['sub'];

        $data = $request->all();

        // ---------- 1. Basic validation ----------
        Validator::make($data)
            ->required('pickup_address', 'Pickup address')->max('pickup_address', 255, 'Pickup address')
            ->required('pickup_date', 'Pickup date')->date('pickup_date', 'Pickup date')
            ->required('pickup_time', 'Pickup time')->time('pickup_time', 'Pickup time')
            ->required('delivery_address', 'Delivery address')->max('delivery_address', 255, 'Delivery address')
            ->required('delivery_date', 'Delivery date')->date('delivery_date', 'Delivery date')
            ->required('delivery_time', 'Delivery time')->time('delivery_time', 'Delivery time')
            ->validate();

        // ---------- 2. Validate items array ----------
        if (empty($data['items']) || !is_array($data['items'])) {
            throw new HttpException(422, 'At least one item is required.', [
                'items' => ['Please select at least one item.'],
            ]);
        }

        // ---------- 3. Fetch services in one query ----------
        $serviceIds = array_map(fn($i) => (int) ($i['service_id'] ?? 0), $data['items']);
        $serviceIds = array_values(array_unique(array_filter($serviceIds)));

        if (empty($serviceIds)) {
            throw new HttpException(422, 'Invalid items.', [
                'items' => ['Each item must have a valid service_id.'],
            ]);
        }

        $serviceMap = $this->services->findManyByIds($serviceIds);

        // Verify all requested services exist and are available
        foreach ($serviceIds as $sid) {
            if (!isset($serviceMap[$sid])) {
                throw new HttpException(422, "Service ID {$sid} does not exist.");
            }
            if ((int) $serviceMap[$sid]['is_available'] !== 1) {
                throw new HttpException(422, "Service '{$serviceMap[$sid]['name']}' is currently unavailable.");
            }
        }

        // ---------- 4. Build order items + compute totals ----------
        $preparedItems = [];
        $subtotal      = 0.0;

        foreach ($data['items'] as $raw) {
            $sid = (int) ($raw['service_id'] ?? 0);
            $qty = (int) ($raw['quantity'] ?? 0);

            if ($qty < 1) {
                throw new HttpException(422, 'Quantity must be at least 1.', [
                    'items' => ["Item with service_id {$sid} has invalid quantity."],
                ]);
            }

            $svc        = $serviceMap[$sid];
            $unitPrice  = (float) $svc['unit_price'];
            $lineTotal  = round($unitPrice * $qty, 2);

            $preparedItems[] = [
                'service_id'   => $sid,
                'service_name' => $svc['name'],
                'category'     => $svc['category'],
                'quantity'     => $qty,
                'unit_price'   => $unitPrice,
                'line_total'   => $lineTotal,
            ];
            $subtotal += $lineTotal;
        }

        $subtotal = round($subtotal, 2);
        $total    = $subtotal; // no delivery fee for now; add later if needed

        // ---------- 5. Save order + items inside a transaction ----------
        $this->db->beginTransaction();

        try {
            $orderCode = $this->orders->generateOrderCode();

            $orderId = $this->orders->create([
                'order_code'       => $orderCode,
                'user_id'          => $userId,
                'status'           => 'pending',
                'pickup_address'   => trim((string) $data['pickup_address']),
                'pickup_date'      => $data['pickup_date'],
                'pickup_time'      => $data['pickup_time'],
                'delivery_address' => trim((string) $data['delivery_address']),
                'delivery_date'    => $data['delivery_date'],
                'delivery_time'    => $data['delivery_time'],
                'special_notes'    => isset($data['special_notes']) ? trim((string) $data['special_notes']) : null,
                'subtotal'         => $subtotal,
                'total'            => $total,
                'payment_status'   => 'unpaid',
            ]);

            $this->items->createMany($orderId, $preparedItems);

            // In-app notification for the user
            $this->notifications->create([
                'user_id'  => $userId,
                'order_id' => $orderId,
                'channel'  => 'in_app',
                'title'    => 'Order placed',
                'message'  => "Your order {$orderCode} has been received.",
                'sent_at'  => date('Y-m-d H:i:s'),
            ]);

            $this->db->commit();
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }

        // ---------- 6. Return the created order ----------
        $order = $this->orders->findById($orderId);
        $order['items'] = $this->items->listByOrder($orderId);

        Response::success(['order' => $order], 'Order created successfully', 201);
    }

    /**
     * GET /api/orders  (protected)
     * Query: ?page=1&per_page=10
     */
    public function index(Request $request): void
    {
        $payload = Auth::userFromRequest($request);
        $userId  = (int) $payload['sub'];

        $page    = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(1, (int) $request->query('per_page', 10)));
        $offset  = ($page - 1) * $perPage;

        $orders = $this->orders->listByUser($userId, $perPage, $offset);
        $total  = $this->orders->countByUser($userId);

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
     * GET /api/orders/{id}  (protected)
     */
    public function show(Request $request, array $params): void
    {
        $payload = Auth::userFromRequest($request);
        $userId  = (int) $payload['sub'];
        $id      = (int) ($params['id'] ?? 0);

        $order = $this->orders->findById($id);
        if (!$order) {
            throw new HttpException(404, 'Order not found.');
        }
        if ((int) $order['user_id'] !== $userId) {
            throw new HttpException(403, 'You are not allowed to view this order.');
        }

        $order['items'] = $this->items->listByOrder($id);

        Response::success(['order' => $order], 'Order loaded');
    }

    /**
     * POST /api/orders/{id}/cancel  (protected)
     * Only allowed while status = pending.
     */
    public function cancel(Request $request, array $params): void
    {
        $payload = Auth::userFromRequest($request);
        $userId  = (int) $payload['sub'];
        $id      = (int) ($params['id'] ?? 0);

        $order = $this->orders->findById($id);
        if (!$order) {
            throw new HttpException(404, 'Order not found.');
        }
        if ((int) $order['user_id'] !== $userId) {
            throw new HttpException(403, 'You are not allowed to cancel this order.');
        }
        if ($order['status'] !== 'pending') {
            throw new HttpException(400, 'Only pending orders can be cancelled.');
        }

        $this->orders->updateStatus($id, 'cancelled');

        $this->notifications->create([
            'user_id'  => $userId,
            'order_id' => $id,
            'channel'  => 'in_app',
            'title'    => 'Order cancelled',
            'message'  => "Your order {$order['order_code']} has been cancelled.",
            'sent_at'  => date('Y-m-d H:i:s'),
        ]);

        $updated = $this->orders->findById($id);
        Response::success(['order' => $updated], 'Order cancelled');
    }
}