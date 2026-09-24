<?php

namespace App\Core;

class Request {
    private string $method;
    private string $uri;
    private array $headers;
    private array $query;
    private array $body;
    private ?array $user = null;

    public function __construct() {
        $this->method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $rawUri = $_SERVER['REQUEST_URI'] ?? '/';
        $this->uri = parse_url($rawUri, PHP_URL_PATH) ?? '/';
        $this->headers = $this->extractHeaders();
        $this->query = $_GET;
        $this->body = $this->extractBody();
    }

    private function extractHeaders(): array {
        $headers = [];
        if (function_exists('getallheaders')) {
            $all = getallheaders();
            if ($all) {
                foreach ($all as $k => $v) {
                    $headers[strtolower($k)] = $v;
                }
                return $headers;
            }
        }

        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                $headers[strtolower($header)] = $value;
            }
        }
        return $headers;
    }

    private function extractBody(): array {
        $contentType = $this->headers['content-type'] ?? '';
        if (str_contains($contentType, 'application/json')) {
            $input = file_get_contents('php://input');
            $decoded = json_decode($input, true);
            return is_array($decoded) ? $decoded : [];
        }
        return $_POST;
    }

    public function getMethod(): string {
        return $this->method;
    }

    public function getUri(): string {
        return $this->uri;
    }

    public function getHeader(string $name, ?string $default = null): ?string {
        return $this->headers[strtolower($name)] ?? $default;
    }

    public function getQuery(?string $key = null, mixed $default = null): mixed {
        if ($key === null) return $this->query;
        return $this->query[$key] ?? $default;
    }

    public function getBody(?string $key = null, mixed $default = null): mixed {
        if ($key === null) return $this->body;
        return $this->body[$key] ?? $default;
    }

    public function setUser(array $user): void {
        $this->user = $user;
    }

    public function getUser(): ?array {
        return $this->user;
    }
}
