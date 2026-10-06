<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class Service
{
    private Database $db;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? new Database();
    }

    public function findById(int $id): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM services WHERE id = :id LIMIT 1',
            ['id' => $id]
        );
    }

    /**
     * Public list — only available services.
     */
    public function listAvailable(): array
    {
        return $this->db->select(
            'SELECT * FROM services WHERE is_available = 1 ORDER BY category, name'
        );
    }

    /**
     * Admin list — includes unavailable.
     */
    public function listAll(): array
    {
        return $this->db->select(
            'SELECT * FROM services ORDER BY category, name'
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert('services', [
            'name'         => $data['name'],
            'category'     => $data['category'],
            'unit_price'   => $data['unit_price'],
            'description'  => $data['description'] ?? null,
            'is_available' => isset($data['is_available']) ? (int) $data['is_available'] : 1,
        ]);
    }

    public function update(int $id, array $data): int
    {
        $allowed = ['name', 'category', 'unit_price', 'description', 'is_available'];
        $fields  = [];
        foreach ($allowed as $k) {
            if (array_key_exists($k, $data)) $fields[$k] = $data[$k];
        }
        if (empty($fields)) return 0;

        return $this->db->update('services', $fields, 'id = :id', ['id' => $id]);
    }

    public function delete(int $id): int
    {
        return $this->db->delete('services', 'id = :id', ['id' => $id]);
    }

    public function setAvailability(int $id, bool $available): int
    {
        return $this->db->update(
            'services',
            ['is_available' => $available ? 1 : 0],
            'id = :id',
            ['id' => $id]
        );
    }

    /**
     * Get many services by IDs (for order creation price check).
     * Returns [id => row].
     */
    public function findManyByIds(array $ids): array
    {
        if (empty($ids)) return [];

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $rows = $this->db->select(
            "SELECT * FROM services WHERE id IN ({$placeholders})",
            $ids
        );

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['id']] = $row;
        }
        return $map;
    }
}