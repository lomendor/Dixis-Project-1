<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'quickbooks' => [
        'client_id' => env('QUICKBOOKS_CLIENT_ID'),
        'client_secret' => env('QUICKBOOKS_CLIENT_SECRET'),
        'redirect_uri' => env('QUICKBOOKS_REDIRECT_URI', env('APP_URL') . '/api/integrations/quickbooks/callback'),
        'base_url' => env('QUICKBOOKS_BASE_URL', 'https://sandbox-quickbooks.api.intuit.com'),
        'environment' => env('QUICKBOOKS_ENVIRONMENT', 'sandbox'), // sandbox or production
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'viva_wallet' => [
        'client_id' => env('VIVA_WALLET_CLIENT_ID'),
        'client_secret' => env('VIVA_WALLET_CLIENT_SECRET'),
        'merchant_id' => env('VIVA_WALLET_MERCHANT_ID'),
        'api_key' => env('VIVA_WALLET_API_KEY'),
        'source_code' => env('VIVA_WALLET_SOURCE_CODE'),
        'webhook_secret' => env('VIVA_WALLET_WEBHOOK_SECRET'),
        'sandbox' => env('VIVA_WALLET_SANDBOX', true),
    ],

    'aftersales_pro' => [
        'api_key' => env('AFTERSALES_PRO_API_KEY'),
        'api_secret' => env('AFTERSALES_PRO_API_SECRET'),
        'webhook_secret' => env('AFTERSALES_PRO_WEBHOOK_SECRET'),
        'sandbox' => env('AFTERSALES_PRO_SANDBOX', true),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', env('APP_URL') . '/api/v1/auth/google/callback'),
    ],

];
