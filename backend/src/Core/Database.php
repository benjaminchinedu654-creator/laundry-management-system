<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use App\Core\Exceptions\DatabaseException;

class Database
{
    private PDO $pdo;

    public function __construct(?PDO $pdo = null)
    {
        if ($pdo === null) {
            require_once __DIR__ . '/../../config/database.php';
            $pdo = \DatabaseConfig::getConnection();
        }
        $this->pdo = $pdo;
    }

    /**
     * Get the raw PDO instance (for special cases).
     */
    public function pdo(): PDO
    {
        return $this->pdo;
    }

    /**
     * Run a raw query and return the PDOStatement.
     */
    public function query(string $sql, array $params = []): \PDOStatement
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new DatabaseException('Query failed: ' . $e->getMessage(), (int) $e->getCode(), $e);
        }
    }

    /**
     * Fetch all rows.
     */
    public function select(string $sql, array $params = []): array
    {
        return $this->query($sql, $params)->fetchAll();
    }

    /**
     * Fetch a single row.
     */
    public function selectOne(string $sql, array $params = []): ?array
    {
        $row = $this->query($sql, $params)->fetch();
        return $row === false ? null : $row;
    }

    /**
     * Fetch a single scalar value (e.g. COUNT(*)).
     */
    public function selectValue(string $sql, array $params = []): mixed
    {
        $row = $this->query($sql, $params)->fetch(PDO::FETCH_NUM);
        return $row === false ? null : $row[0];
    }

    /**
     * Insert a row. Returns last insert ID.
     */
    public function insert(string $table, array $data): int
    {
        $columns = array_keys($data);
        $placeholders = array_map(fn($c) => ':' . $c, $columns);

        $sql = sprintf(
            'INSERT INTO `%s` (`%s`) VALUES (%s)',
            $table,
            implode('`, `', $columns),
            implode(', ', $placeholders)
        );

        $this->query($sql, $data);
        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Update rows matching a condition. Returns affected row count.
     */
    public function update(string $table, array $data, string $where, array $whereParams = []): int
    {
        $set = [];
        foreach (array_keys($data) as $col) {
            $set[] = "`{$col}` = :{$col}";
        }

        $sql = sprintf(
            'UPDATE `%s` SET %s WHERE %s',
            $table,
            implode(', ', $set),
            $where
        );

        $params = array_merge($data, $whereParams);
        return $this->query($sql, $params)->rowCount();
    }

    /**
     * Delete rows matching a condition. Returns affected row count.
     */
    public function delete(string $table, string $where, array $whereParams = []): int
    {
        $sql = sprintf('DELETE FROM `%s` WHERE %s', $table, $where);
        return $this->query($sql, $whereParams)->rowCount();
    }

    /**
     * Check if a row exists.
     */
    public function exists(string $table, string $where, array $params = []): bool
    {
        $sql = sprintf('SELECT 1 FROM `%s` WHERE %s LIMIT 1', $table, $where);
        return $this->selectValue($sql, $params) !== null;
    }

    /**
     * Begin a transaction.
     */
    public function beginTransaction(): void
    {
        $this->pdo->beginTransaction();
    }

    /**
     * Commit the current transaction.
     */
    public function commit(): void
    {
        $this->pdo->commit();
    }

    /**
     * Roll back the current transaction.
     */
    public function rollBack(): void
    {
        if ($this->pdo->inTransaction()) {
            $this->pdo->rollBack();
        }
    }
}