<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class OrderItem
{
    private Database $db;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? new Database();
    }

    /**
     * Bulk-insert items for an order.
     * $items = [
     *   ['service_id' => 1, 'service_name' => 'Shirt', 'category' => 'Wash & Iron',
     *    'quantity' => 3, 'unit_price' => 500.00, 'line_total' => 1500.00],
     *   ...
     * ]
     */
    public function createMany(int $orderId, array $items): void
    {
        if (empty($items)) return;

        $sql = 'INSERT INTO order_items
                (order_id, service_id, service_name, category, quantity, unit_price, line_total)
                VALUES (:order_id, :service_id, :service_name, :category, :quantity, :unit_price, :line_total)';

        $stmt = $this->db->pdo()->prepare($sql);

        foreach ($items as $item) {
            $stmt->execute([
                ':order_id'     => $orderId,
                ':service_id'   => $item['service_id'],
                ':service_name' => $item['service_name'],
                ':category'     => $item['category'],
                ':quantity'     => $item['quantity'],
                ':unit_price'   => $item['unit_price'],
                ':line_total'   => $item['line_total'],
            ]);
        }
    }

    public function listByOrder(int $orderId): array
    {
        return $this->db->select(
            'SELECT * FROM order_items WHERE order_id = :oid ORDER BY id ASC',
            ['oid' => $orderId]
        );
    }

    public function deleteByOrder(int $orderId): int
    {
        return $this->db->delete('order_items', 'order_id = :oid', ['oid' => $orderId]);
    }
}