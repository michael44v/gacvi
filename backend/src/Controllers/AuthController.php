<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\JWT;
use App\Repositories\UserRepository;

class AuthController {
    private UserRepository $userRepo;

    public function __construct() {
        $this->userRepo = new UserRepository();
    }

    public function login(Request $request): void {
        $data = $request->getBody();
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            Response::error('Email and password are required', 400);
        }

        $user = $this->userRepo->findByEmail($email);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::error('Invalid email or password', 401);
        }

        if ($user['status'] !== 'ACTIVE') {
            Response::error('User account is suspended or inactive', 403);
        }

        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'role' => $user['roles'][0] ?? 'STUDENT',
            'roles' => $user['roles']
        ];

        $token = JWT::encode($payload);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'roles' => $user['roles']
            ]
        ], 'Login successful');
    }

    public function register(Request $request): void {
        $data = $request->getBody();

        if (empty($data['first_name']) || empty($data['last_name']) || empty($data['email']) || empty($data['password'])) {
            Response::error('First name, last name, email, and password are required', 400);
        }

        if ($this->userRepo->findByEmail($data['email'])) {
            Response::error('An account with this email address already exists', 409);
        }

        $role = $data['role'] ?? 'STUDENT';
        // Only allow student or parent self-registration
        if (!in_array($role, ['STUDENT', 'PARENT'], true)) {
            $role = 'STUDENT';
        }

        $user = $this->userRepo->create($data, $role);

        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'role' => $user['roles'][0] ?? 'STUDENT',
            'roles' => $user['roles']
        ];

        $token = JWT::encode($payload);

        Response::success([
            'token' => $token,
            'user' => $user
        ], 'Registration successful', 201);
    }

    public function me(Request $request): void {
        $user = $request->getUser();
        if (!$user) {
            Response::error('Unauthenticated', 401);
        }

        $userData = $this->userRepo->findById($user['id']);
        Response::success($userData);
    }
}
