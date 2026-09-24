<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\JWT;

class AuthMiddleware {
    public function handle(Request $request): void {
        $authHeader = $request->getHeader('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            Response::error('Unauthorized access. Token missing.', 401);
        }

        $token = substr($authHeader, 7);
        $payload = JWT::decode($token);

        if (!$payload) {
            Response::error('Invalid or expired authentication token.', 401);
        }

        $request->setUser($payload);
    }
}
