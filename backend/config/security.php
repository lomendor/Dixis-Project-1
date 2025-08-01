<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Security Configuration for Dixis Marketplace
    |--------------------------------------------------------------------------
    |
    | This file contains security-related configuration options for production
    | deployment. These settings help protect against common vulnerabilities.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Security Headers
    |--------------------------------------------------------------------------
    */
    'headers' => [
        'enabled' => env('SECURE_HEADERS_ENABLED', true),
        
        // HTTP Strict Transport Security
        'hsts' => [
            'enabled' => env('HSTS_ENABLED', true),
            'max_age' => env('HSTS_MAX_AGE', 31536000), // 1 year
            'include_subdomains' => env('HSTS_INCLUDE_SUBDOMAINS', true),
            'preload' => env('HSTS_PRELOAD', true),
        ],
        
        // Content Security Policy
        'csp' => [
            'enabled' => env('CSP_ENABLED', true),
            'report_only' => env('CSP_REPORT_ONLY', false),
            'directives' => [
                'default-src' => "'self'",
                'script-src' => "'self' 'unsafe-inline' https://js.stripe.com https://www.google-analytics.com",
                'style-src' => "'self' 'unsafe-inline' https://fonts.googleapis.com",
                'font-src' => "'self' https://fonts.gstatic.com",
                'img-src' => "'self' data: https: blob:",
                'connect-src' => "'self' https://api.stripe.com https://www.google-analytics.com",
                'frame-src' => "'self' https://js.stripe.com",
                'object-src' => "'none'",
                'base-uri' => "'self'",
                'form-action' => "'self'",
            ],
        ],
        
        // X-Frame-Options
        'frame_options' => env('X_FRAME_OPTIONS', 'DENY'),
        
        // X-Content-Type-Options
        'content_type_options' => env('X_CONTENT_TYPE_OPTIONS', 'nosniff'),
        
        // X-XSS-Protection
        'xss_protection' => env('X_XSS_PROTECTION', '1; mode=block'),
        
        // Referrer Policy
        'referrer_policy' => env('REFERRER_POLICY', 'strict-origin-when-cross-origin'),
        
        // Permissions Policy
        'permissions_policy' => [
            'camera' => '()',
            'microphone' => '()',
            'geolocation' => '(self)',
            'payment' => '(self)',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */
    'rate_limiting' => [
        'api' => [
            'requests_per_minute' => env('API_RATE_LIMIT_PER_MINUTE', 60),
            'burst_limit' => env('API_BURST_LIMIT', 100),
        ],
        
        'auth' => [
            'login_attempts' => env('LOGIN_RATE_LIMIT', 5),
            'login_decay_minutes' => env('LOGIN_RATE_DECAY', 60),
            'registration_attempts' => env('REGISTRATION_RATE_LIMIT', 3),
            'password_reset_attempts' => env('PASSWORD_RESET_RATE_LIMIT', 3),
        ],
        
        'payment' => [
            'attempts_per_hour' => env('PAYMENT_RATE_LIMIT', 10),
            'failed_attempts_lockout' => env('PAYMENT_FAILED_LOCKOUT', 30), // minutes
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Input Validation & Sanitization
    |--------------------------------------------------------------------------
    */
    'validation' => [
        'max_file_size' => env('MAX_FILE_SIZE', 10240), // KB
        'allowed_file_types' => [
            'images' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'documents' => ['pdf', 'doc', 'docx', 'txt'],
        ],
        
        'sanitize_html' => env('SANITIZE_HTML', true),
        'strip_tags' => env('STRIP_TAGS', true),
        'max_string_length' => env('MAX_STRING_LENGTH', 10000),
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Security
    |--------------------------------------------------------------------------
    */
    'session' => [
        'secure_cookies' => env('SESSION_SECURE_COOKIES', true),
        'http_only' => env('SESSION_HTTP_ONLY', true),
        'same_site' => env('SESSION_SAME_SITE', 'strict'),
        'encrypt' => env('SESSION_ENCRYPT', true),
        'regenerate_on_login' => env('SESSION_REGENERATE_ON_LOGIN', true),
        'timeout_warning' => env('SESSION_TIMEOUT_WARNING', 300), // 5 minutes
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Security
    |--------------------------------------------------------------------------
    */
    'database' => [
        'ssl_mode' => env('DB_SSL_MODE', 'REQUIRED'),
        'ssl_verify' => env('DB_SSL_VERIFY', true),
        'query_timeout' => env('DB_QUERY_TIMEOUT', 30),
        'connection_timeout' => env('DB_CONNECTION_TIMEOUT', 10),
        'max_connections' => env('DB_MAX_CONNECTIONS', 100),
    ],

    /*
    |--------------------------------------------------------------------------
    | API Security
    |--------------------------------------------------------------------------
    */
    'api' => [
        'require_https' => env('API_REQUIRE_HTTPS', true),
        'cors_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '')),
        'cors_methods' => explode(',', env('CORS_ALLOWED_METHODS', 'GET,POST,PUT,DELETE,OPTIONS')),
        'cors_headers' => explode(',', env('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization,X-Requested-With')),
        'api_key_required' => env('API_KEY_REQUIRED', false),
        'webhook_verification' => env('WEBHOOK_VERIFICATION', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Security
    |--------------------------------------------------------------------------
    */
    'uploads' => [
        'scan_for_malware' => env('SCAN_UPLOADS_FOR_MALWARE', true),
        'quarantine_suspicious' => env('QUARANTINE_SUSPICIOUS_FILES', true),
        'max_file_size' => env('MAX_UPLOAD_SIZE', 10240), // KB
        'allowed_mime_types' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ],
        'virus_scan_endpoint' => env('VIRUS_SCAN_ENDPOINT', null),
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging & Monitoring
    |--------------------------------------------------------------------------
    */
    'monitoring' => [
        'log_failed_logins' => env('LOG_FAILED_LOGINS', true),
        'log_suspicious_activity' => env('LOG_SUSPICIOUS_ACTIVITY', true),
        'alert_on_multiple_failures' => env('ALERT_ON_MULTIPLE_FAILURES', true),
        'security_log_retention_days' => env('SECURITY_LOG_RETENTION', 90),
        
        'intrusion_detection' => [
            'enabled' => env('INTRUSION_DETECTION_ENABLED', true),
            'max_requests_per_second' => env('MAX_REQUESTS_PER_SECOND', 10),
            'suspicious_patterns' => [
                'sql_injection',
                'xss_attempts',
                'path_traversal',
                'command_injection',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Encryption & Hashing
    |--------------------------------------------------------------------------
    */
    'encryption' => [
        'algorithm' => env('ENCRYPTION_ALGORITHM', 'AES-256-CBC'),
        'key_rotation_days' => env('KEY_ROTATION_DAYS', 90),
        'hash_algorithm' => env('HASH_ALGORITHM', 'sha256'),
        'password_hash_rounds' => env('BCRYPT_ROUNDS', 12),
    ],

    /*
    |--------------------------------------------------------------------------
    | Backup Security
    |--------------------------------------------------------------------------
    */
    'backup' => [
        'encrypt_backups' => env('ENCRYPT_BACKUPS', true),
        'backup_retention_days' => env('BACKUP_RETENTION_DAYS', 30),
        'offsite_backup' => env('OFFSITE_BACKUP_ENABLED', true),
        'backup_verification' => env('BACKUP_VERIFICATION_ENABLED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Compliance
    |--------------------------------------------------------------------------
    */
    'compliance' => [
        'gdpr_enabled' => env('GDPR_ENABLED', true),
        'data_retention_days' => env('DATA_RETENTION_DAYS', 2555), // 7 years
        'audit_trail' => env('AUDIT_TRAIL_ENABLED', true),
        'privacy_policy_version' => env('PRIVACY_POLICY_VERSION', '1.0'),
        'terms_version' => env('TERMS_VERSION', '1.0'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Emergency Procedures
    |--------------------------------------------------------------------------
    */
    'emergency' => [
        'maintenance_mode_secret' => env('MAINTENANCE_MODE_SECRET', null),
        'emergency_contact_email' => env('EMERGENCY_CONTACT_EMAIL', 'security@dixis.io'),
        'incident_response_webhook' => env('INCIDENT_RESPONSE_WEBHOOK', null),
        'auto_lockdown_threshold' => env('AUTO_LOCKDOWN_THRESHOLD', 100), // suspicious requests per minute
    ],
];
