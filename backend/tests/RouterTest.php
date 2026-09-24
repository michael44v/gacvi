<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Core\Router;
use App\Core\Request;
use App\Core\JWT;

class RouterTest extends TestCase {
    public function testJwtEncodeAndDecode(): void {
        $payload = ['id' => 1, 'email' => 'admin@gacvi.org', 'role' => 'SUPER_ADMIN'];
        $token = JWT::encode($payload);

        $this->assertIsString($token);

        $decoded = JWT::decode($token);
        $this->assertNotNull($decoded);
        $this->assertEquals(1, $decoded['id']);
        $this->assertEquals('admin@gacvi.org', $decoded['email']);
        $this->assertEquals('SUPER_ADMIN', $decoded['role']);
    }

    public function testJwtInvalidSignature(): void {
        $payload = ['id' => 1];
        $token = JWT::encode($payload);
        $invalidToken = $token . 'tampered';

        $decoded = JWT::decode($invalidToken);
        $this->assertNull($decoded);
    }
}
