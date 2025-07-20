<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Production Environment Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains production-specific configuration settings for
    | the Dixis marketplace platform. These settings are optimized for
    | performance, security, and reliability in production environments.
    |
    */

    'environment' => [
        /*
        |--------------------------------------------------------------------------
        | Environment Settings
        |--------------------------------------------------------------------------
        */
        'app_env' => env('APP_ENV', 'production'),
        'app_debug' => env('APP_DEBUG', false),
        'app_url' => env('APP_URL', 'https://dixis.io'),
        'asset_url' => env('ASSET_URL', 'https://cdn.dixis.io'),
        
        /*
        |--------------------------------------------------------------------------
        | SSL and Security
        |--------------------------------------------------------------------------
        */
        'force_https' => env('FORCE_HTTPS', true),
        'hsts_max_age' => env('HSTS_MAX_AGE', 31536000), // 1 year
        'secure_cookies' => env('SECURE_COOKIES', true),
        'same_site_cookies' => env('SAME_SITE_COOKIES', 'strict'),
    ],

    'database' => [
        /*
        |--------------------------------------------------------------------------
        | Database Production Settings
        |--------------------------------------------------------------------------
        */
        'connections' => [
            'mysql' => [
                'read' => [
                    'host' => explode(',', env('DB_READ_HOST', env('DB_HOST', '127.0.0.1'))),
                ],
                'write' => [
                    'host' => env('DB_WRITE_HOST', env('DB_HOST', '127.0.0.1')),
                ],
                'sticky' => true,
                'options' => [
                    PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
                    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
                ],
            ],
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Connection Pool Settings
        |--------------------------------------------------------------------------
        */
        'pool' => [
            'min_connections' => env('DB_POOL_MIN', 5),
            'max_connections' => env('DB_POOL_MAX', 50),
            'idle_timeout' => env('DB_POOL_IDLE_TIMEOUT', 300),
            'wait_timeout' => env('DB_POOL_WAIT_TIMEOUT', 30),
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Query Optimization
        |--------------------------------------------------------------------------
        */
        'optimization' => [
            'slow_query_log' => env('DB_SLOW_QUERY_LOG', true),
            'slow_query_threshold' => env('DB_SLOW_QUERY_THRESHOLD', 2), // seconds
            'query_cache' => env('DB_QUERY_CACHE', true),
            'query_cache_size' => env('DB_QUERY_CACHE_SIZE', '256M'),
        ],
    ],

    'cache' => [
        /*
        |--------------------------------------------------------------------------
        | Cache Configuration
        |--------------------------------------------------------------------------
        */
        'default' => env('CACHE_DRIVER', 'redis'),
        'prefix' => env('CACHE_PREFIX', 'dixis_prod'),
        
        'stores' => [
            'redis' => [
                'driver' => 'redis',
                'connection' => 'cache',
                'lock_connection' => 'default',
                'serializer' => env('CACHE_REDIS_SERIALIZER', 'igbinary'),
                'compress' => env('CACHE_REDIS_COMPRESS', true),
            ],
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Cache Optimization
        |--------------------------------------------------------------------------
        */
        'optimization' => [
            'preload_critical' => env('CACHE_PRELOAD_CRITICAL', true),
            'background_refresh' => env('CACHE_BACKGROUND_REFRESH', true),
            'compression' => env('CACHE_COMPRESSION', true),
            'serialization' => env('CACHE_SERIALIZATION', 'igbinary'),
        ],
    ],

    'session' => [
        /*
        |--------------------------------------------------------------------------
        | Session Configuration
        |--------------------------------------------------------------------------
        */
        'driver' => env('SESSION_DRIVER', 'redis'),
        'lifetime' => env('SESSION_LIFETIME', 120),
        'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),
        'encrypt' => env('SESSION_ENCRYPT', true),
        'files' => storage_path('framework/sessions'),
        'connection' => env('SESSION_CONNECTION', 'default'),
        'table' => env('SESSION_TABLE', 'sessions'),
        'store' => env('SESSION_STORE', 'default'),
        'lottery' => [2, 100],
        'cookie' => env('SESSION_COOKIE', 'dixis_session'),
        'path' => env('SESSION_PATH', '/'),
        'domain' => env('SESSION_DOMAIN', '.dixis.io'),
        'secure' => env('SESSION_SECURE_COOKIE', true),
        'http_only' => env('SESSION_HTTP_ONLY', true),
        'same_site' => env('SESSION_SAME_SITE', 'strict'),
    ],

    'logging' => [
        /*
        |--------------------------------------------------------------------------
        | Logging Configuration
        |--------------------------------------------------------------------------
        */
        'default' => env('LOG_CHANNEL', 'stack'),
        
        'channels' => [
            'stack' => [
                'driver' => 'stack',
                'channels' => ['daily', 'slack'],
                'ignore_exceptions' => false,
            ],
            
            'daily' => [
                'driver' => 'daily',
                'path' => storage_path('logs/laravel.log'),
                'level' => env('LOG_LEVEL', 'info'),
                'days' => env('LOG_DAILY_DAYS', 14),
                'replace_placeholders' => true,
            ],
            
            'slack' => [
                'driver' => 'slack',
                'url' => env('LOG_SLACK_WEBHOOK_URL'),
                'username' => 'Dixis Production',
                'emoji' => ':boom:',
                'level' => env('LOG_SLACK_LEVEL', 'critical'),
            ],
            
            'security' => [
                'driver' => 'daily',
                'path' => storage_path('logs/security.log'),
                'level' => 'info',
                'days' => 90,
            ],
            
            'api_usage' => [
                'driver' => 'daily',
                'path' => storage_path('logs/api_usage.log'),
                'level' => 'info',
                'days' => 30,
            ],
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Log Optimization
        |--------------------------------------------------------------------------
        */
        'optimization' => [
            'async_logging' => env('LOG_ASYNC', true),
            'buffer_size' => env('LOG_BUFFER_SIZE', 1000),
            'compress_old_logs' => env('LOG_COMPRESS', true),
            'max_file_size' => env('LOG_MAX_FILE_SIZE', '100M'),
        ],
    ],

    'mail' => [
        /*
        |--------------------------------------------------------------------------
        | Mail Configuration
        |--------------------------------------------------------------------------
        */
        'default' => env('MAIL_MAILER', 'smtp'),
        
        'mailers' => [
            'smtp' => [
                'transport' => 'smtp',
                'host' => env('MAIL_HOST', 'smtp.mailgun.org'),
                'port' => env('MAIL_PORT', 587),
                'encryption' => env('MAIL_ENCRYPTION', 'tls'),
                'username' => env('MAIL_USERNAME'),
                'password' => env('MAIL_PASSWORD'),
                'timeout' => null,
                'local_domain' => env('MAIL_EHLO_DOMAIN'),
            ],
            
            'ses' => [
                'transport' => 'ses',
                'region' => env('AWS_DEFAULT_REGION', 'eu-west-1'),
                'options' => [
                    'ConfigurationSetName' => env('SES_CONFIGURATION_SET'),
                    'EmailTags' => [
                        ['Name' => 'Environment', 'Value' => 'production'],
                    ],
                ],
            ],
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Mail Optimization
        |--------------------------------------------------------------------------
        */
        'optimization' => [
            'queue_emails' => env('MAIL_QUEUE', true),
            'queue_connection' => env('MAIL_QUEUE_CONNECTION', 'redis'),
            'rate_limiting' => env('MAIL_RATE_LIMITING', true),
            'max_emails_per_minute' => env('MAIL_MAX_PER_MINUTE', 100),
        ],
    ],

    'queue' => [
        /*
        |--------------------------------------------------------------------------
        | Queue Configuration
        |--------------------------------------------------------------------------
        */
        'default' => env('QUEUE_CONNECTION', 'redis'),
        
        'connections' => [
            'redis' => [
                'driver' => 'redis',
                'connection' => 'default',
                'queue' => env('REDIS_QUEUE', 'default'),
                'retry_after' => env('QUEUE_RETRY_AFTER', 90),
                'block_for' => null,
                'after_commit' => false,
            ],
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Queue Optimization
        |--------------------------------------------------------------------------
        */
        'optimization' => [
            'horizon' => env('QUEUE_HORIZON', true),
            'workers' => env('QUEUE_WORKERS', 3),
            'max_processes' => env('QUEUE_MAX_PROCESSES', 10),
            'memory_limit' => env('QUEUE_MEMORY_LIMIT', 512),
            'timeout' => env('QUEUE_TIMEOUT', 60),
        ],
    ],

    'security' => [
        /*
        |--------------------------------------------------------------------------
        | Security Headers
        |--------------------------------------------------------------------------
        */
        'headers' => [
            'hsts' => [
                'max_age' => 31536000,
                'include_subdomains' => true,
                'preload' => true,
            ],
            'csp' => [
                'default_src' => "'self'",
                'script_src' => "'self' 'unsafe-inline' https://js.stripe.com https://www.google-analytics.com",
                'style_src' => "'self' 'unsafe-inline' https://fonts.googleapis.com",
                'font_src' => "'self' https://fonts.gstatic.com",
                'img_src' => "'self' data: https: blob:",
                'connect_src' => "'self' https://api.stripe.com https://www.google-analytics.com",
                'frame_src' => "'self' https://js.stripe.com",
            ],
            'x_frame_options' => 'DENY',
            'x_content_type_options' => 'nosniff',
            'x_xss_protection' => '1; mode=block',
            'referrer_policy' => 'strict-origin-when-cross-origin',
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Rate Limiting
        |--------------------------------------------------------------------------
        */
        'rate_limiting' => [
            'enabled' => env('RATE_LIMITING_ENABLED', true),
            'store' => env('RATE_LIMITING_STORE', 'redis'),
            'key_generator' => env('RATE_LIMITING_KEY_GENERATOR', 'ip'),
        ],
        
        /*
        |--------------------------------------------------------------------------
        | API Security
        |--------------------------------------------------------------------------
        */
        'api' => [
            'api_key_required' => env('API_KEY_REQUIRED', true),
            'cors_enabled' => env('CORS_ENABLED', true),
            'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'https://dixis.io,https://www.dixis.io')),
            'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
        ],
    ],

    'monitoring' => [
        /*
        |--------------------------------------------------------------------------
        | Application Monitoring
        |--------------------------------------------------------------------------
        */
        'enabled' => env('MONITORING_ENABLED', true),
        'services' => [
            'sentry' => [
                'dsn' => env('SENTRY_LARAVEL_DSN'),
                'environment' => env('APP_ENV', 'production'),
                'release' => env('APP_VERSION'),
                'sample_rate' => env('SENTRY_SAMPLE_RATE', 0.1),
            ],
            'new_relic' => [
                'enabled' => env('NEW_RELIC_ENABLED', false),
                'app_name' => env('NEW_RELIC_APP_NAME', 'Dixis Production'),
                'license_key' => env('NEW_RELIC_LICENSE_KEY'),
            ],
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Performance Monitoring
        |--------------------------------------------------------------------------
        */
        'performance' => [
            'slow_request_threshold' => env('SLOW_REQUEST_THRESHOLD', 3000), // milliseconds
            'memory_usage_threshold' => env('MEMORY_USAGE_THRESHOLD', 128), // MB
            'cpu_usage_threshold' => env('CPU_USAGE_THRESHOLD', 80), // percentage
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Health Checks
        |--------------------------------------------------------------------------
        */
        'health_checks' => [
            'enabled' => env('HEALTH_CHECKS_ENABLED', true),
            'endpoint' => env('HEALTH_CHECK_ENDPOINT', '/health'),
            'checks' => [
                'database' => true,
                'cache' => true,
                'queue' => true,
                'storage' => true,
                'mail' => true,
            ],
        ],
    ],

    'optimization' => [
        /*
        |--------------------------------------------------------------------------
        | Performance Optimization
        |--------------------------------------------------------------------------
        */
        'opcache' => [
            'enabled' => env('OPCACHE_ENABLED', true),
            'memory_consumption' => env('OPCACHE_MEMORY', 256),
            'max_accelerated_files' => env('OPCACHE_MAX_FILES', 20000),
            'validate_timestamps' => env('OPCACHE_VALIDATE', false),
        ],
        
        'compression' => [
            'gzip' => env('GZIP_COMPRESSION', true),
            'brotli' => env('BROTLI_COMPRESSION', true),
            'level' => env('COMPRESSION_LEVEL', 6),
        ],
        
        'cdn' => [
            'enabled' => env('CDN_ENABLED', true),
            'url' => env('CDN_URL', 'https://cdn.dixis.io'),
            'assets' => env('CDN_ASSETS', true),
            'images' => env('CDN_IMAGES', true),
        ],
    ],

    'backup' => [
        /*
        |--------------------------------------------------------------------------
        | Backup Configuration
        |--------------------------------------------------------------------------
        */
        'enabled' => env('BACKUP_ENABLED', true),
        'disk' => env('BACKUP_DISK', 's3'),
        'schedule' => env('BACKUP_SCHEDULE', '0 2 * * *'), // Daily at 2 AM
        'retention' => [
            'daily' => env('BACKUP_RETENTION_DAILY', 7),
            'weekly' => env('BACKUP_RETENTION_WEEKLY', 4),
            'monthly' => env('BACKUP_RETENTION_MONTHLY', 12),
        ],
        'notifications' => [
            'slack' => env('BACKUP_SLACK_WEBHOOK'),
            'email' => env('BACKUP_EMAIL_NOTIFICATIONS', true),
        ],
    ],
];