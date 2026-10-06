<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class Order
{
    private Database $db;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? new Database();
    }

    public function findById(int $id): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM orders WHERE id = :id LIMIT 1',
            ['id' => $id]
        );
    }

    public function findByCode(string $code): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM orders WHERE order_code = :code LIMIT 1',
            ['code' => $code]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert('orders', [
            'order_code'       => $data['order_code'],
            'user_id'          => $data['user_id'],
            'status'           => $data['status']           ?? 'pending',
            'pickup_address'   => $data['pickup_address'],
            'pickup_date'      => $data['pickup_date'],
            'pickup_time'      => $data['pickup_time'],
            'delivery_address' => $data['delivery_address'],
            'delivery_date'    => $data['delivery_date'],
            'delivery_time'    => $data['delivery_time'],
            'special_notes'    => $data['special_notes']    ?? null,
            'subtotal'         => $data['subtotal']         ?? 0,
            'total'            => $data['total']            ?? 0,
            'payment_status'   => $data['payment_status']   ?? 'unpaid',
        ]);
    }

    /**
     * List orders for one user.
     */
    public function listByUser(int $userId, int $limit = 20, int $offset = 0): array
    {
        $stmt = $this->db->pdo()->prepare(
            'SELECT * FROM orders WHERE user_id = :uid ORDER BY id DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':uid',    $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit',  $limit,  \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Count orders for one user.
     */
    public function countByUser(int $userId): int
    {
        return (int) $this->db->selectValue(
            'SELECT COUNT(*) FROM orders WHERE user_id = :uid',
            ['uid' => $userId]
        );
    }

    /**
     * Admin list with filters + pagination.
     * $filters: ['status' => 'pending', 'search' => 'LDR-...', 'user_id' => 5]
     */
    public function listAdmin(array $filters = [], int $limit = 20, int $offset = 0): array
    {
        $sql    = 'SELECT o.*, u.full_name AS user_name, u.email AS user_email, u.phone AS user_phone
                   FROM orders o
                   JOIN users u ON u.id = o.user_id
                   WHERE 1=1';
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= ' AND o.status = :status';
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['payment_status'])) {
            $sql .= ' AND o.payment_status = :payment_status';
            $params['payment_status'] = $filters['payment_status'];
        }
        if (!empty($filters['user_id'])) {
            $sql .= ' AND o.user_id = :user_id';
            $params['user_id'] = (int) $filters['user_id'];
        }
        if (!empty($filters['search'])) {
            $sql .= ' AND (o.order_code LIKE :search OR u.full_name LIKE :search OR u.phone LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }
        if (!empty($filters['from_date'])) {
            $sql .= ' AND o.created_at >= :from_date';
            $params['from_date'] = $filters['from_date'] . ' 00:00:00';
        }
        if (!empty($filters['to_date'])) {
            $sql .= ' AND o.created_at <= :to_date';
            $params['to_date'] = $filters['to_date'] . ' 23:59:59';
        }

        $sql .= ' ORDER BY o.id DESC LIMIT :limit OFFSET :offset';

        $stmt = $this->db->pdo()->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue(':' . $k, $v);
        }
        $stmt->bindValue(':limit',  $limit,  \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function countAdmin(array $filters = []): int
    {
        $sql    = 'SELECT COUNT(*) FROM orders o JOIN users u ON u.id = o.user_id WHERE 1=1';
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= ' AND o.status = :status';
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['payment_status'])) {
            $sql .= ' AND o.payment_status = :payment_status';
            $params['payment_status'] = $filters['payment_status'];
        }
        if (!empty($filters['user_id'])) {
            $sql .= ' AND o.user_id = :user_id';
            $params['user_id'] = (int) $filters['user_id'];
        }
        if (!empty($filters['search'])) {
            $sql .= ' AND (o.order_code LIKE :search OR u.full_name LIKE :search OR u.phone LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }
        if (!empty($filters['from_date'])) {
            $sql .= ' AND o.created_at >= :from_date';
            $params['from_date'] = $filters['from_date'] . ' 00:00:00';
        }
        if (!empty($filters['to_date'])) {
            $sql .= ' AND o.created_at <= :to_date';
            $params['to_date'] = $filters['to_date'] . ' 23:59:59';
        }

        return (int) $this->db->selectValue($sql, $params);
    }

    public function updateStatus(int $id, string $status): int
    {
        return $this->db->update(
            'orders',
            ['status' => $status],
            'id = :id',
            ['id' => $id]
        );
    }

    public function updatePaymentStatus(int $id, string $status): int
    {
        return $this->db->update(
            'orders',
            ['payment_status' => $status],
            'id = :id',
            ['id' => $id]
        );
    }

    public function updateTotals(int $id, float $subtotal, float $total): int
    {
        return $this->db->update(
            'orders',
            ['subtotal' => $subtotal, 'total' => $total],
            'id = :id',
            ['id' => $id]
        );
    }

    /**
     * Generate a unique order code.
     * Format: LDR-YYYYMMDD-####
     */
    public function generateOrderCode(): string
    {
        $date = date('Ymd');
        $prefix = "LDR-{$date}-";

        $last = $this->db->selectValue(
            'SELECT order_code FROM orders WHERE order_code LIKE :p ORDER BY id DESC LIMIT 1',
            ['p' => $prefix . '%']
        );

        $next = 1;
        if ($last) {
            $parts = explode('-', $last);
            $next  = ((int) end($parts)) + 1;
        }

        return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Dashboard metrics used by admin.
     */
    public function dashboardMetrics(): array
    {
        $today = date('Y-m-d');

        return [
            'total_orders'      => (int) $this->db->selectValue('SELECT COUNT(*) FROM orders'),
            'today_orders'      => (int) $this->db->selectValue(
                'SELECT COUNT(*) FROM orders WHERE DATE(created_at) = :d',
                ['d' => $today]
            ),
            'pending_orders'    => (int) $this->db->selectValue(
                "SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered','cancelled')"
            ),
            'delivered_orders'  => (int) $this->db->selectValue(
                "SELECT COUNT(*) FROM orders WHERE status = 'delivered'"
            ),
            'revenue_total'     => (float) ($this->db->selectValue(
                "SELECT COALESCE(SUM(total),0) FROM orders WHERE payment_status = 'paid'"
            ) ?? 0),
            'revenue_today'     => (float) ($this->db->selectValue(
                "SELECT COALESCE(SUM(total),0) FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = :d",
                ['d' => $today]
            ) ?? 0),
        ];
    }
}