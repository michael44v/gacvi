<?php

namespace App\Core;

class Response {
    public static function json(array $data, int $statusCode = 200, array $headers = []): void {
        http_response_code($statusCode);

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

        foreach ($headers as $key => $value) {
            header("{$key}: {$value}");
        }

        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data = null, string $message = 'Success', int $statusCode = 200): void {
        self::json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    public static function error(string $message = 'An error occurred', int $statusCode = 400, $errors = null): void {
        $payload = [
            'status' => 'error',
            'message' => $message
        ];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        self::json($payload, $statusCode);
    }
}
