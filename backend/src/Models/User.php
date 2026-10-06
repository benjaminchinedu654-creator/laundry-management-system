<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class User
{
    private Database $db;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? new Database();
    }

    /**
     * Find user by ID.
     */
    public function findById(int $id): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM users WHERE id = :id LIMIT 1',
            ['id' => $id]
        );
    }

    /**
     * Find user by email.
     */
    public function findByEmail(string $email): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM users WHERE email = :email LIMIT 1',
            ['email' => $email]
        );
    }

    /**
     * Find user by phone.
     */
    public function findByPhone(string $phone): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM users WHERE phone = :phone LIMIT 1',
            ['phone' => $phone]
        );
    }

    /**
     * Create a new user. Returns new ID.
     */
    public function create(array $data): int
    {
        return $this->db->insert('users', [
            'full_name'     => $data['full_name'],
            'email'         => $data['email'],
            'phone'         => $data['phone'],
            'password_hash' => $data['password_hash'],
            'address'       => $data['address'] ?? null,
            'is_active'     => 1,
        ]);
    }

    /**
     * Update profile fields (name, phone, address).
     */
    public function updateProfile(int $id, array $data): int
    {
        $fields = [];
        if (isset($data['full_name'])) $fields['full_name'] = $data['full_name'];
        if (isset($data['phone']))     $fields['phone']     = $data['phone'];
        if (isset($data['address']))   $fields['address']   = $data['address'];

        if (empty($fields)) return 0;

        return $this->db->update('users', $fields, 'id = :id', ['id' => $id]);
    }

    /**
     * Change password.
     */
    public function updatePassword(int $id, string $passwordHash): int
    {
        return $this->db->update(
            'users',
            ['password_hash' => $passwordHash],
            'id = :id',
            ['id' => $id]
        );
    }

    /**
     * Toggle active state (used by admin).
     */
    public function setActive(int $id, bool $active): int
    {
        return $this->db->update(
            'users',
            ['is_active' => $active ? 1 : 0],
            'id = :id',
            ['id' => $id]
        );
    }

    /**
     * List users (admin) with optional search + pagination.
     */
    public function list(int $limit = 20, int $offset = 0, string $search = ''): array
    {
        $sql    = 'SELECT * FROM users';
        $params = [];

        if ($search !== '') {
            $sql .= ' WHERE full_name LIKE :s OR email LIKE :s OR phone LIKE :s';
            $params['s'] = '%' . $search . '%';
        }

        $sql .= ' ORDER BY id DESC LIMIT :limit OFFSET :offset';

        $stmt = $this->db->pdo()->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue(':' . $k, $v);
        }
        $stmt->bindValue(':limit',  $limit,  \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Total users (for pagination meta).
     */
    public function count(string $search = ''): int
    {
        if ($search === '') {
            return (int) $this->db->selectValue('SELECT COUNT(*) FROM users');
        }
        return (int) $this->db->selectValue(
            'SELECT COUNT(*) FROM users WHERE full_name LIKE :s OR email LIKE :s OR phone LIKE :s',
            ['s' => '%' . $search . '%']
        );
    }
}