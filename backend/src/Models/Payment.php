<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class Payment
{
    private Database $db;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? new Database();
    }

    public function findById(int $id): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM payments WHERE id = :id LIMIT 1',
            ['id' => $id]
        );
    }

    public function findByReference(string $reference): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM payments WHERE reference = :ref LIMIT 1',
            ['ref' => $reference]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert('payments', [
            'order_id'  => $data['order_id'],
            'user_id'   => $data['user_id'],
            'amount'    => $data['amount'],
            'method'    => $data['method'],             // cash | card | transfer
            'status'    => $data['status']  ?? 'pending', // pending | success | failed | refunded
            'reference' => $data['reference'] ?? null,
            'paid_at'   => $data['paid_at']  ?? null,
        ]);
    }

    public function markSuccess(int $id, ?string $reference = null): int
    {
        $fields = [
            'status'  => 'success',
            'paid_at' => date('Y-m-d H:i:s'),
        ];
        if ($reference !== null) {
            $fields['reference'] = $reference;
        }
        return $this->db->update('payments', $fields, 'id = :id', ['id' => $id]);
    }

    public function markFailed(int $id): int
    {
        return $this->db->update(
            'payments',
            ['status' => 'failed'],
            'id = :id',
            ['id' => $id]
        );
    }

    public function markRefunded(int $id): int
    {
        return $this->db->update(
            'payments',
            ['status' => 'refunded'],
            'id = :id',
            ['id' => $id]
        );
    }

    public function listByUser(int $userId, int $limit = 20, int $offset = 0): array
    {
        $stmt = $this->db->pdo()->prepare(
            'SELECT * FROM payments WHERE user_id = :uid ORDER BY id DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':uid',    $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit',  $limit,  \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function listByOrder(int $orderId): array
    {
        return $this->db->select(
            'SELECT * FROM payments WHERE order_id = :oid ORDER BY id DESC',
            ['oid' => $orderId]
        );
    }

    public function listAdmin(array $filters = [], int $limit = 20, int $offset = 0): array
    {
        $sql    = 'SELECT p.*, u.full_name AS user_name, o.order_code
                   FROM payments p
                   JOIN users  u ON u.id = p.user_id
                   JOIN orders o ON o.id = p.order_id
                   WHERE 1=1';
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= ' AND p.status = :status';
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['method'])) {
            $sql .= ' AND p.method = :method';
            $params['method'] = $filters['method'];
        }

        $sql .= ' ORDER BY p.id DESC LIMIT :limit OFFSET :offset';

        $stmt = $this->db->pdo()->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue(':' . $k, $v);
        }
        $stmt->bindValue(':limit',  $limit,  \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function totalRevenue(?string $date = null): float
    {
        if ($date) {
            return (float) ($this->db->selectValue(
                "SELECT COALESCE(SUM(amount),0) FROM payments WHERE status = 'success' AND DATE(paid_at) = :d",
                ['d' => $date]
            ) ?? 0);
        }
        return (float) ($this->db->selectValue(
            "SELECT COALESCE(SUM(amount),0) FROM payments WHERE status = 'success'"
        ) ?? 0);
    }
}