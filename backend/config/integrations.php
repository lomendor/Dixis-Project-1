<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Integration Settings
    |--------------------------------------------------------------------------
    */
    
    'timeout' => env('INTEGRATION_TIMEOUT', 30),
    'connect_timeout' => env('INTEGRATION_CONNECT_TIMEOUT', 10),
    'retry_attempts' => env('INTEGRATION_RETRY_ATTEMPTS', 3),
    'retry_delay' => env('INTEGRATION_RETRY_DELAY', 60),
    'logging_enabled' => env('INTEGRATION_LOGGING_ENABLED', true),
    
    /*
    |--------------------------------------------------------------------------
    | Queue Configuration
    |--------------------------------------------------------------------------
    */
    
    'queue' => [
        'connection' => env('INTEGRATION_QUEUE_CONNECTION', 'redis'),
        'name' => 'integrations',
        'retry_after' => 300,
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Shipping Integrations
    |--------------------------------------------------------------------------
    */

    'shipping' => [
        'greek_couriers' => [
            'elta' => [
                'enabled' => env('ELTA_ENABLED', false),
                'api_key' => env('ELTA_API_KEY', ''),
                'api_url' => env('ELTA_API_URL', 'https://api.elta.gr/v1'),
                'origin_postal_code' => env('ELTA_ORIGIN_POSTAL_CODE', '10431'),
                'sender_name' => env('ELTA_SENDER_NAME', 'Dixis'),
                'sender_address' => env('ELTA_SENDER_ADDRESS', ''),
                'sender_city' => env('ELTA_SENDER_CITY', 'Athens'),
                'sender_postal_code' => env('ELTA_SENDER_POSTAL_CODE', '10431'),
                'sender_phone' => env('ELTA_SENDER_PHONE', ''),
                'sender_email' => env('ELTA_SENDER_EMAIL', ''),
            ],

            'acs' => [
                'enabled' => env('ACS_ENABLED', false),
                'api_key' => env('ACS_API_KEY', ''),
                'api_url' => env('ACS_API_URL', 'https://webservices.acscourier.net/ACSRestServices'),
                'company_id' => env('ACS_COMPANY_ID', ''),
                'company_password' => env('ACS_COMPANY_PASSWORD', ''),
                'user_id' => env('ACS_USER_ID', ''),
                'user_password' => env('ACS_USER_PASSWORD', ''),
                'sender_name' => env('ACS_SENDER_NAME', 'Dixis'),
                'sender_address' => env('ACS_SENDER_ADDRESS', ''),
                'sender_city' => env('ACS_SENDER_CITY', 'Athens'),
                'sender_postal_code' => env('ACS_SENDER_POSTAL_CODE', '10431'),
                'sender_phone' => env('ACS_SENDER_PHONE', ''),
            ],

            'speedex' => [
                'enabled' => env('SPEEDEX_ENABLED', false),
                'api_key' => env('SPEEDEX_API_KEY', ''),
                'api_url' => env('SPEEDEX_API_URL', 'https://api.speedex.gr/v1'),
                'username' => env('SPEEDEX_USERNAME', ''),
                'password' => env('SPEEDEX_PASSWORD', ''),
                'sender_name' => env('SPEEDEX_SENDER_NAME', 'Dixis'),
                'sender_address' => env('SPEEDEX_SENDER_ADDRESS', ''),
                'sender_city' => env('SPEEDEX_SENDER_CITY', 'Athens'),
                'sender_postal_code' => env('SPEEDEX_SENDER_POSTAL_CODE', '10431'),
                'sender_phone' => env('SPEEDEX_SENDER_PHONE', ''),
            ],

            'courier_center' => [
                'enabled' => env('COURIER_CENTER_ENABLED', false),
                'api_key' => env('COURIER_CENTER_API_KEY', ''),
                'api_url' => env('COURIER_CENTER_API_URL', 'https://api.couriercenter.gr/v1'),
                'username' => env('COURIER_CENTER_USERNAME', ''),
                'password' => env('COURIER_CENTER_PASSWORD', ''),
                'sender_name' => env('COURIER_CENTER_SENDER_NAME', 'Dixis'),
                'sender_address' => env('COURIER_CENTER_SENDER_ADDRESS', ''),
                'sender_city' => env('COURIER_CENTER_SENDER_CITY', 'Athens'),
                'sender_postal_code' => env('COURIER_CENTER_SENDER_POSTAL_CODE', '10431'),
                'sender_phone' => env('COURIER_CENTER_SENDER_PHONE', ''),
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Accounting Integrations
    |--------------------------------------------------------------------------
    */

    'accounting' => [
        'default' => env('DEFAULT_ACCOUNTING_PROVIDER', 'quickbooks'),

        'quickbooks' => [
            'client_id' => env('QUICKBOOKS_CLIENT_ID'),
            'client_secret' => env('QUICKBOOKS_CLIENT_SECRET'),
            'redirect_uri' => env('QUICKBOOKS_REDIRECT_URI'),
            'base_url' => env('QUICKBOOKS_BASE_URL', 'Production'),
            'scope' => env('QUICKBOOKS_SCOPE', 'com.intuit.quickbooks.accounting'),
        ],

        'xero' => [
            'client_id' => env('XERO_CLIENT_ID'),
            'client_secret' => env('XERO_CLIENT_SECRET'),
            'redirect_uri' => env('XERO_REDIRECT_URI'),
            'tenant_id' => env('XERO_TENANT_ID'),
        ],
    ],
];
