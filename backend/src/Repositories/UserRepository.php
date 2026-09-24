<?php

namespace App\Repositories;

use App\Core\Database;

class UserRepository {
    private \PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user) return null;

        $user['roles'] = $this->getUserRoles($user['id']);
        return $user;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT id, first_name, last_name, email, phone, status, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) return null;

        $user['roles'] = $this->getUserRoles($user['id']);
        return $user;
    }

    public function getUserRoles(int $userId): array {
        $stmt = $this->db->prepare("
            SELECT r.name
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    public function create(array $data, string $roleName = 'STUDENT'): array {
        $stmt = $this->db->prepare("
            INSERT INTO users (first_name, last_name, email, password_hash, phone, status)
            VALUES (?, ?, ?, ?, ?, 'ACTIVE')
        ");
        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt->execute([
            $data['first_name'],
            $data['last_name'],
            $data['email'],
            $hash,
            $data['phone'] ?? null
        ]);

        $userId = (int)$this->db->lastInsertId();

        // Get Role ID
        $rStmt = $this->db->prepare("SELECT id FROM roles WHERE name = ?");
        $rStmt->execute([$roleName]);
        $roleId = $rStmt->fetchColumn();

        if ($roleId) {
            $urStmt = $this->db->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
            $urStmt->execute([$userId, $roleId]);
        }

        return $this->findById($userId);
    }

    public function getAll(int $limit = 100, int $offset = 0): array {
        $stmt = $this->db->prepare("
            SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.created_at
            FROM users u
            ORDER BY u.id DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $limit, \PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, \PDO::PARAM_INT);
        $stmt->execute();
        $users = $stmt->fetchAll();

        foreach ($users as &$user) {
            $user['roles'] = $this->getUserRoles($user['id']);
        }

        return $users;
    }
}
