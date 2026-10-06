<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class Notification
{
    private Database $db;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? new Database();
    }

    public function create(array $data): int
    {
        return $this->db->insert('notifications', [
            'user_id'  => $data['user_id'],
            'order_id' => $data['order_id'] ?? null,
            'channel'  => $data['channel']  ?? 'in_app',
            'title'    => $data['title'],
            'message'  => $data['message'],
            'is_read'  => 0,
            'sent_at'  => $data['sent_at'] ?? null,
        ]);
    }

    public function listByUser(int $userId, int $limit = 20, int $offset = 0): array
    {
        $stmt = $this->db->pdo()->prepare(
            'SELECT * FROM notifications WHERE user_id = :uid ORDER BY id DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':uid',    $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit',  $limit,  \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function markRead(int $id, int $userId): int
    {
        return $this->db->update(
            'notifications',
            ['is_read' => 1],
            'id = :id AND user_id = :uid',
            ['id' => $id, 'uid' => $userId]
        );
    }

    public function markAllRead(int $userId): int
    {
        return $this->db->update(
            'notifications',
            ['is_read' => 1],
            'user_id = :uid AND is_read = 0',
            ['uid' => $userId]
        );
    }

    public function unreadCount(int $userId): int
    {
        return (int) $this->db->selectValue(
            'SELECT COUNT(*) FROM notifications WHERE user_id = :uid AND is_read = 0',
            ['uid' => $userId]
        );
    }
}