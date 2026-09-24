<?php

namespace App\Core;

class JWT {
    private static string $secretKey = 'gacvi_jwt_secret_key_change_in_production_2026';
    private static string $algo = 'HS256';

    public static function encode(array $payload, int $ttl = 86400): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algo]);

        $payload['iat'] = time();
        $payload['exp'] = time() + $ttl;
        $payloadStr = json_encode($payload);

        $base64Header = self::base64UrlEncode($header);
        $base64Payload = self::base64UrlEncode($payloadStr);

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::getSecret(), true);
        $base64Signature = self::base64UrlEncode($signature);

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    public static function decode(string $jwt): ?array {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $sigB64] = $tokenParts;

        $signature = self::base64UrlEncode(hash_hmac('sha256', $headerB64 . "." . $payloadB64, self::getSecret(), true));

        if (!hash_equals($signature, $sigB64)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($payloadB64), true);

        if (!isset($payload['exp']) || $payload['exp'] < time()) {
            return null; // Expired
        }

        return $payload;
    }

    private static function getSecret(): string {
        return $_ENV['JWT_SECRET'] ?? self::$secretKey;
    }

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }
}
