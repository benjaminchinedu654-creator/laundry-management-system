<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;

class AdminReportController
{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    /**
     * GET /api/admin/reports/orders
     * Query: from_date, to_date
     */
    public function orders(Request $request): void
    {
        [$from, $to] = $this->range($request);

        $rows = $this->db->select(
            'SELECT o.order_code, o.status, o.payment_status, o.total, o.created_at,
                    u.full_name AS customer, u.phone AS phone
             FROM orders o
             JOIN users u ON u.id = o.user_id
             WHERE o.created_at BETWEEN :from AND :to
             ORDER BY o.id DESC',
            ['from' => $from . ' 00:00:00', 'to' => $to . ' 23:59:59']
        );

        $summary = $this->db->selectOne(
            'SELECT COUNT(*) AS total_orders,
                    COALESCE(SUM(total), 0) AS total_value,
                    COALESCE(SUM(CASE WHEN payment_status = "paid" THEN total ELSE 0 END), 0) AS paid_value
             FROM orders
             WHERE created_at BETWEEN :from AND :to',
            ['from' => $from . ' 00:00:00', 'to' => $to . ' 23:59:59']
        );

        Response::success([
            'range'   => ['from' => $from, 'to' => $to],
            'summary' => $summary,
            'orders'  => $rows,
        ], 'Orders report');
    }

    /**
     * GET /api/admin/reports/revenue
     * Query: from_date, to_date
     */
    public function revenue(Request $request): void
    {
        [$from, $to] = $this->range($request);

        $byDay = $this->db->select(
            'SELECT DATE(created_at) AS day,
                    COALESCE(SUM(CASE WHEN payment_status = "paid" THEN total ELSE 0 END), 0) AS revenue
             FROM orders
             WHERE created_at BETWEEN :from AND :to
             GROUP BY DATE(created_at)
             ORDER BY day ASC',
            ['from' => $from . ' 00:00:00', 'to' => $to . ' 23:59:59']
        );

        $total = $this->db->selectOne(
            'SELECT COALESCE(SUM(total), 0) AS total_revenue
             FROM orders
             WHERE payment_status = "paid" AND created_at BETWEEN :from AND :to',
            ['from' => $from . ' 00:00:00', 'to' => $to . ' 23:59:59']
        );

        Response::success([
            'range'         => ['from' => $from, 'to' => $to],
            'total_revenue' => (float) $total['total_revenue'],
            'by_day'        => $byDay,
        ], 'Revenue report');
    }

    /**
     * GET /api/admin/reports/customers
     */
    public function customers(Request $request): void
    {
        $rows = $this->db->select(
            'SELECT u.id, u.full_name, u.email, u.phone,
                    COUNT(o.id) AS order_count,
                    COALESCE(SUM(o.total), 0) AS lifetime_value
             FROM users u
             LEFT JOIN orders o ON o.user_id = u.id
             GROUP BY u.id
             ORDER BY lifetime_value DESC, u.id DESC'
        );

        Response::success(['customers' => $rows], 'Customers report');
    }

    /**
     * Default date range: last 30 days.
     */
    private function range(Request $request): array
    {
        $from = $request->query('from_date') ?: date('Y-m-d', strtotime('-29 days'));
        $to   = $request->query('to_date')   ?: date('Y-m-d');
        return [$from, $to];
    }
}