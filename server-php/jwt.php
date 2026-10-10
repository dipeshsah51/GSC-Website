<?php
/**
 * Lightweight JWT (JSON Web Token) Implementation in Pure PHP
 * Compatible with Bearer token authentication in React frontend
 */

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generate_jwt($payload, $secret = JWT_SECRET, $expire_seconds = 2592000) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + $expire_seconds;
    
    $payload_json = json_encode($payload);
    
    $base64_header = base64url_encode($header);
    $base64_payload = base64url_encode($payload_json);
    
    $signature = hash_hmac('sha256', "$base64_header.$base64_payload", $secret, true);
    $base64_signature = base64url_encode($signature);
    
    return "$base64_header.$base64_payload.$base64_signature";
}

function verify_jwt($token, $secret = JWT_SECRET) {
    if (empty($token)) {
        return null;
    }
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    
    list($base64_header, $base64_payload, $base64_signature) = $parts;
    
    $expected_sig = hash_hmac('sha256', "$base64_header.$base64_payload", $secret, true);
    $provided_sig = base64url_decode($base64_signature);
    
    if (!hash_equals($expected_sig, $provided_sig)) {
        return null;
    }
    
    $payload = json_decode(base64url_decode($base64_payload), true);
    if (!$payload) {
        return null;
    }
    
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null; // Token expired
    }
    
    return $payload;
}

function get_bearer_token() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    if (!empty($headers) && preg_match('/Bearer\s(\S+)/i', $headers, $matches)) {
        return $matches[1];
    }
    return null;
}
