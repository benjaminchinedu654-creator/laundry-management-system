<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Exceptions\HttpException;
use App\Helpers\Validator;
use App\Models\Order;
use App\Models\Payment;

class AdminPaymentController
{
    private Payment  $payments;
    private Order    $orders;
    private Database $db;

    public function __construct()
    {
        $this->payments = new Payment();
        $this->orders   = new Order();
        $this->db       = new Database();
    }

    /**
     * GET /api/admin/payments
     * Query: status, method, page, per_page
     */
    public function index(Request $request): void
    {
        $page    = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(1, (int) $request->query('per_page', 15)));
        $offset  = ($page - 1) * $perPage;

        $filters = array_filter([
            'status' => $request->query('status'),
            'method' => $request->query('method'),
        ], fn($v) => $v !== null && $v !== '');

        $rows = $this->payments->listAdmin($filters, $perPage, $offset);

        Response::success([
            'payments' => $rows,
            'totals'   => [
                'all_time' => $this->payments->totalRevenue(),
                'today'    => $this->payments->totalRevenue(date('Y-m-d')),
            ],
        ], 'Payments loaded');
    }

    /**
     * POST /api/admin/payments
     * Record a payment manually (e.g. cash received).
     * Body: { order_id, amount, method, status?, reference?, paid_at? }
     */
    public function store(Request $request): void
    {
        $data = $request->all();

        Validator::make($data)
            ->required('order_id', 'Order ID')->numeric('order_id', 'Order ID')
            ->required('amount', 'Amount')->numeric('amount', 'Amount')
            ->required('method', 'Method')->in('method', ['cash','card','transfer'], 'Method')
            ->validate();

        $orderId = (int) $data['order_id'];
        $order   = $this->orders->findById($orderId);
        if (!$order) {
            throw new HttpException(404, 'Order not found.');
        }

        $amount = round((float) $data['amount'], 2);
        if ($amount <= 0) {
            throw new HttpException(422, 'Amount must be greater than zero.', [
                'amount' => ['Amount must be greater than zero.'],
            ]);
        }

        $status = $data['status'] ?? 'success';
        if (!in_array($status, ['pending','success','failed','refunded'], true)) {
            throw new HttpException(422, 'Invalid status.');
        }

        $paymentId = $this->payments->create([
            'order_id'  => $orderId,
            'user_id'   => (int) $order['user_id'],
            'amount'    => $amount,
            'method'    => $data['method'],
            'status'    => $status,
            'reference' => $data['reference'] ?? null,
            'paid_at'   => $status === 'success'
                ? ($data['paid_at'] ?? date('Y-m-d H:i:s'))
                : null,
        ]);

        // If successful, mark order paid
        if ($status === 'success') {
            $this->orders->updatePaymentStatus($orderId, 'paid');
        }

        Response::success([
            'payment' => $this->payments->findById($paymentId),
        ], 'Payment recorded', 201);
    }

    /**
     * GET /api/admin/payments/{id}
     */
    public function show(Request $request, array $params): void
    {
        $id = (int) ($params['id'] ?? 0);
        $payment = $this->payments->findById($id);

        if (!$payment) {
            throw new HttpException(404, 'Payment not found.');
        }

        Response::success(['payment' => $payment], 'Payment loaded');
    }

    /**
     * PATCH /api/admin/payments/{id}/status
     * Body: { status: pending|success|failed|refunded }
     */
    public function updateStatus(Request $request, array $params): void
    {
        $id     = (int) ($params['id'] ?? 0);
        $status = $request->input('status');

        $allowed = ['pending','success','failed','refunded'];
        if (!$status || !in_array($status, $allowed, true)) {
            throw new HttpException(422, 'Invalid status.', [
                'status' => ['Status must be one of: ' . implode(', ', $allowed)],
            ]);
        }

        $payment = $this->payments->findById($id);
        if (!$payment) {
            throw new HttpException(404, 'Payment not found.');
        }

        // Route status through the correct method
        switch ($status) {
            case 'success':  $this->payments->markSuccess($id);  break;
            case 'failed':   $this->payments->markFailed($id);   break;
            case 'refunded': $this->payments->markRefunded($id); break;
            case 'pending':
                $this->db->update('payments', ['status' => 'pending'], 'id = :id', ['id' => $id]);
                break;
        }

        // Sync order payment_status
        $orderId = (int) $payment['order_id'];
        if ($status === 'success') {
            $this->orders->updatePaymentStatus($orderId, 'paid');
        } elseif ($status === 'refunded') {
            $this->orders->updatePaymentStatus($orderId, 'refunded');
        } elseif ($status === 'failed') {
            $this->orders->updatePaymentStatus($orderId, 'unpaid');
        }

        Response::success([
            'payment' => $this->payments->findById($id),
        ], 'Payment status updated');
    }
}