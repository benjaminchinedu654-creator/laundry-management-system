<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class Admin
{
    private Database $db;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? new Database();
    }

    public function findById(int $id): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM admins WHERE id = :id LIMIT 1',
            ['id' => $id]
        );
    }

    public function findByEmail(string $email): ?array
    {
        return $this->db->selectOne(
            'SELECT * FROM admins WHERE email = :email LIMIT 1',
            ['email' => $email]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert('admins', [
            'full_name'     => $data['full_name'],
            'email'         => $data['email'],
            'password_hash' => $data['password_hash'],
            'is_active'     => 1,
        ]);
    }

    public function updateLastLogin(int $id): void
    {
        $this->db->update(
            'admins',
            ['last_login_at' => date('Y-m-d H:i:s')],
            'id = :id',
            ['id' => $id]
        );
    }

    public function updatePassword(int $id, string $passwordHash): int
    {
        return $this->db->update(
            'admins',
            ['password_hash' => $passwordHash],
            'id = :id',
            ['id' => $id]
        );
    }
}