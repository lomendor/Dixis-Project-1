<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Database Optimization Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for database optimization,
    | performance monitoring, caching strategies, and backup procedures
    | specifically tuned for Dixis production environment.
    |
    */

    'performance' => [
        /*
        |--------------------------------------------------------------------------
        | Query Performance Monitoring
        |--------------------------------------------------------------------------
        */
        'slow_query_threshold' => env('DB_SLOW_QUERY_THRESHOLD', 1000), // milliseconds
        'log_slow_queries' => env('DB_LOG_SLOW_QUERIES', true),
        'query_timeout' => env('DB_QUERY_TIMEOUT', 30), // seconds
        
        /*
        |--------------------------------------------------------------------------
        | Connection Pool Settings
        |--------------------------------------------------------------------------
        */
        'max_connections' => env('DB_MAX_CONNECTIONS', 100),
        'connection_timeout' => env('DB_CONNECTION_TIMEOUT', 10),
        'idle_timeout' => env('DB_IDLE_TIMEOUT', 300),
        
        /*
        |--------------------------------------------------------------------------
        | Memory and Buffer Settings
        |--------------------------------------------------------------------------
        */
        'innodb_buffer_pool_size' => env('DB_INNODB_BUFFER_POOL_SIZE', '1G'),
        'query_cache_size' => env('DB_QUERY_CACHE_SIZE', '256M'),
        'sort_buffer_size' => env('DB_SORT_BUFFER_SIZE', '2M'),
        'read_buffer_size' => env('DB_READ_BUFFER_SIZE', '128K'),
    ],

    'caching' => [
        /*
        |--------------------------------------------------------------------------
        | Cache Configuration
        |--------------------------------------------------------------------------
        */
        'default_ttl' => [
            'short' => 300,      // 5 minutes
            'medium' => 1800,    // 30 minutes
            'long' => 3600,      // 1 hour
            'very_long' => 86400 // 24 hours
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Cache Strategies by Data Type
        |--------------------------------------------------------------------------
        */
        'strategies' => [
            'products' => [
                'ttl' => 1800, // 30 minutes
                'tags' => ['products'],
                'invalidate_on' => ['product.updated', 'product.deleted']
            ],
            'categories' => [
                'ttl' => 3600, // 1 hour
                'tags' => ['categories'],
                'invalidate_on' => ['category.updated', 'category.deleted']
            ],
            'producers' => [
                'ttl' => 3600, // 1 hour
                'tags' => ['producers'],
                'invalidate_on' => ['producer.updated', 'producer.verified']
            ],
            'orders' => [
                'ttl' => 300, // 5 minutes
                'tags' => ['orders'],
                'invalidate_on' => ['order.updated', 'order.status_changed']
            ],
            'invoices' => [
                'ttl' => 1800, // 30 minutes
                'tags' => ['invoices'],
                'invalidate_on' => ['invoice.updated', 'invoice.paid']
            ],
            'b2b_pricing' => [
                'ttl' => 1800, // 30 minutes
                'tags' => ['b2b', 'pricing'],
                'invalidate_on' => ['business_user.updated', 'product.price_changed']
            ]
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Cache Warm-up Configuration
        |--------------------------------------------------------------------------
        */
        'warmup' => [
            'enabled' => env('CACHE_WARMUP_ENABLED', true),
            'schedule' => '0 */6 * * *', // Every 6 hours
            'items' => [
                'featured_products' => 10,
                'category_tree' => true,
                'active_producers' => 20,
                'popular_products' => 50
            ]
        ]
    ],

    'indexing' => [
        /*
        |--------------------------------------------------------------------------
        | Index Optimization Settings
        |--------------------------------------------------------------------------
        */
        'auto_analyze' => env('DB_AUTO_ANALYZE', true),
        'analyze_threshold' => 0.1, // 10% data change
        
        /*
        |--------------------------------------------------------------------------
        | Critical Indexes for Performance
        |--------------------------------------------------------------------------
        */
        'critical_indexes' => [
            'products' => [
                'single' => ['slug', 'producer_id', 'category_id', 'is_active', 'is_featured', 'price', 'stock'],
                'composite' => [
                    ['is_active', 'is_featured'],
                    ['producer_id', 'is_active'],
                    ['category_id', 'is_active'],
                    ['is_active', 'created_at'],
                    ['is_active', 'price']
                ]
            ],
            'orders' => [
                'single' => ['user_id', 'status', 'created_at', 'total_amount'],
                'composite' => [
                    ['user_id', 'status'],
                    ['status', 'created_at'],
                    ['created_at', 'total_amount']
                ]
            ],
            'invoices' => [
                'single' => ['user_id', 'status', 'invoice_number', 'due_date'],
                'composite' => [
                    ['user_id', 'status'],
                    ['status', 'due_date'],
                    ['issue_date', 'status']
                ]
            ]
        ]
    ],

    'backup' => [
        /*
        |--------------------------------------------------------------------------
        | Backup Configuration
        |--------------------------------------------------------------------------
        */
        'enabled' => env('DB_BACKUP_ENABLED', true),
        'disk' => env('DB_BACKUP_DISK', 'local'),
        'path' => env('DB_BACKUP_PATH', 'backups'),
        
        /*
        |--------------------------------------------------------------------------
        | Backup Schedules
        |--------------------------------------------------------------------------
        */
        'schedules' => [
            'full' => [
                'frequency' => 'daily',
                'time' => '02:00',
                'retention_days' => 30,
                'compress' => true
            ],
            'incremental' => [
                'frequency' => 'hourly',
                'retention_days' => 7,
                'compress' => false
            ],
            'critical_tables' => [
                'frequency' => 'every_30_minutes',
                'tables' => ['orders', 'order_items', 'invoices', 'payments'],
                'retention_days' => 3
            ]
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Backup Verification
        |--------------------------------------------------------------------------
        */
        'verification' => [
            'enabled' => true,
            'test_restore' => env('DB_BACKUP_TEST_RESTORE', false),
            'integrity_check' => true
        ]
    ],

    'monitoring' => [
        /*
        |--------------------------------------------------------------------------
        | Performance Monitoring
        |--------------------------------------------------------------------------
        */
        'enabled' => env('DB_MONITORING_ENABLED', true),
        'metrics' => [
            'query_time' => true,
            'connection_count' => true,
            'cache_hit_rate' => true,
            'index_usage' => true,
            'table_sizes' => true
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Alert Thresholds
        |--------------------------------------------------------------------------
        */
        'alerts' => [
            'slow_query_threshold' => 2000, // milliseconds
            'connection_usage_threshold' => 80, // percentage
            'cache_hit_rate_threshold' => 85, // percentage
            'disk_usage_threshold' => 85, // percentage
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Monitoring Schedule
        |--------------------------------------------------------------------------
        */
        'check_interval' => 300, // 5 minutes
        'report_interval' => 3600, // 1 hour
        'cleanup_interval' => 86400 // 24 hours
    ],

    'optimization' => [
        /*
        |--------------------------------------------------------------------------
        | Automatic Optimization
        |--------------------------------------------------------------------------
        */
        'auto_optimize' => env('DB_AUTO_OPTIMIZE', true),
        'optimize_schedule' => '0 3 * * 0', // Weekly on Sunday at 3 AM
        
        /*
        |--------------------------------------------------------------------------
        | Optimization Tasks
        |--------------------------------------------------------------------------
        */
        'tasks' => [
            'analyze_tables' => true,
            'optimize_tables' => true,
            'rebuild_indexes' => false, // Only when needed
            'update_statistics' => true,
            'cleanup_logs' => true
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Table Maintenance
        |--------------------------------------------------------------------------
        */
        'maintenance' => [
            'fragmentation_threshold' => 10, // percentage
            'auto_defragment' => true,
            'statistics_update_threshold' => 20 // percentage of data change
        ]
    ],

    'production' => [
        /*
        |--------------------------------------------------------------------------
        | Production-Specific Settings
        |--------------------------------------------------------------------------
        */
        'read_replicas' => [
            'enabled' => env('DB_READ_REPLICAS_ENABLED', false),
            'connections' => [
                // Add read replica connections here
            ]
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Connection Pooling
        |--------------------------------------------------------------------------
        */
        'pooling' => [
            'enabled' => env('DB_POOLING_ENABLED', false),
            'min_connections' => 5,
            'max_connections' => 50,
            'idle_timeout' => 300
        ],
        
        /*
        |--------------------------------------------------------------------------
        | High Availability
        |--------------------------------------------------------------------------
        */
        'high_availability' => [
            'failover_enabled' => env('DB_FAILOVER_ENABLED', false),
            'health_check_interval' => 30,
            'max_retry_attempts' => 3
        ]
    ]
];