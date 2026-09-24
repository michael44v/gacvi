<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class RoleMiddleware {
    private array $allowedRoles;

    public function __construct(array $allowedRoles = []) {
        $this->allowedRoles = $allowedRoles;
    }

    public static function has(string ...$roles): \Closure {
        return function(Request $request) use ($roles) {
            $user = $request->getUser();
            if (!$user || !isset($user['role'])) {
                Response::error('Forbidden: User role missing', 403);
            }

            $userRoles = is_array($user['role']) ? $user['role'] : [$user['role']];

            // SUPER_ADMIN has access to everything
            if (in_array('SUPER_ADMIN', $userRoles, true) || in_array('ADMIN', $userRoles, true) && in_array('ADMIN', $roles, true)) {
                return;
            }

            $hasAccess = false;
            foreach ($roles as $r) {
                if (in_array($r, $userRoles, true)) {
                    $hasAccess = true;
                    break;
                }
            }

            if (!$hasAccess) {
                Response::error('Forbidden: Insufficient permissions', 403);
            }
        };
    }
}
