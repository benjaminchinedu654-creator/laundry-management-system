<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Models\Order;
use App\Models\User;
use App\Models\Payment;

class AdminDashboardController
{
    private Order   $orders;
    private User    $users;
    private Payment $payments;
    private Database $db;

    public function __construct()
    {
        $this->orders   = new Order();
        $this->users    = new User();
        $this->payments = new Payment();
        $this->db       = new Database();
    }

    /**
     * GET /api/admin/dashboard
     */
    public function overview(Request $request): void
    {
        $metrics = $this->orders->dashboardMetrics();

        // Extra metrics for the dashboard
        $metrics['total_customers'] = $this->users->count();
        $metrics['revenue_total']   = $this->payments->totalRevenue();

        // Recent orders (last 5)
        $recent = $this->db->select(
            'SELECT o.id, o.order_code, o.status, o.total, o.payment_status, o.created_at,
                    u.full_name AS user_name, u.phone AS user_phone
             FROM orders o
             JOIN users u ON u.id = o.user_id
             ORDER BY o.id DESC
             LIMIT 5'
        );

        // Orders by status (for chart)
        $byStatus = $this->db->select(
            'SELECT status, COUNT(*) AS count FROM orders GROUP BY status'
        );

        Response::success([
            'metrics'      => $metrics,
            'recent_orders' => $recent,
            'by_status'    => $byStatus,
        ], 'Dashboard loaded');
    }
}