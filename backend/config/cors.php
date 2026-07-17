<?php

$splitOrigins = static function (?string $value): array {
    return array_values(array_filter(array_map('trim', explode(',', (string) $value))));
};

$localOrigins = in_array(env('APP_ENV'), ['local', 'testing'], true)
    ? ['http://localhost:5173', 'http://127.0.0.1:5173']
    : [];

$allowedOrigins = array_values(array_unique(array_filter(array_merge(
    $splitOrigins(env('FRONTEND_URL')),
    $splitOrigins(env('CORS_ALLOWED_ORIGINS')),
    $localOrigins
))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With', 'X-XSRF-TOKEN'],
    'exposed_headers' => [],
    'max_age' => 600,
    'supports_credentials' => true,
];