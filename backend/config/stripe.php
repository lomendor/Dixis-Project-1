<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stripe Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration settings for Stripe payment processing.
    | These values are loaded from environment variables for security.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Stripe API Keys
    |--------------------------------------------------------------------------
    |
    | Your Stripe publishable and secret keys.
    | Never expose secret keys in client-side code.
    |
    */

    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Webhook secret for verifying that requests come from Stripe.
    | This is critical for security.
    |
    */

    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Currency Settings
    |--------------------------------------------------------------------------
    |
    | Default currency for payments.
    | Stripe supports many currencies: https://stripe.com/docs/currencies
    |
    */

    'currency' => env('STRIPE_CURRENCY', 'EUR'),

    /*
    |--------------------------------------------------------------------------
    | Payment Intent Configuration
    |--------------------------------------------------------------------------
    |
    | Default settings for PaymentIntents created through the application.
    |
    */

    'payment_intent' => [
        'automatic_payment_methods' => [
            'enabled' => true,
        ],
        'capture_method' => 'automatic', // or 'manual'
        'confirmation_method' => 'automatic', // or 'manual'
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Events
    |--------------------------------------------------------------------------
    |
    | List of webhook events that your application should handle.
    | These events will be processed by the StripeWebhookController.
    |
    */

    'webhook_events' => [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.canceled',
        'checkout.session.completed',
        'charge.dispute.created',
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Configuration
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting for various payment-related endpoints.
    |
    */
    
    'rate_limiting' => [
        'payment_creation' => [
            'max_attempts' => 5,
            'decay_minutes' => 1,
        ],
        'webhook_processing' => [
            'max_attempts' => 100,
            'decay_minutes' => 1,
        ],
        'payment_confirmation' => [
            'max_attempts' => 10,
            'decay_minutes' => 1,
        ],
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Fraud Detection Rules
    |--------------------------------------------------------------------------
    |
    | Configure fraud detection thresholds and rules.
    |
    */
    
    'fraud_detection' => [
        'max_amount_per_day_per_user' => 5000, // EUR
        'max_transactions_per_day_per_user' => 10,
        'suspicious_amount_threshold' => 1000, // EUR
        'require_3ds_above_amount' => 100, // EUR
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Configure how Stripe transactions should be logged.
    |
    */
    
    'logging' => [
        'channel' => 'stripe',
        'log_successful_payments' => true,
        'log_failed_payments' => true,
        'log_webhook_events' => true,
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Alert Configuration
    |--------------------------------------------------------------------------
    |
    | Configure thresholds for sending alerts to administrators.
    |
    */
    
    'alerts' => [
        'failed_payment_threshold' => 5, // per hour
        'webhook_failure_threshold' => 3, // consecutive failures
        'high_value_payment_threshold' => 1000, // EUR
        'admin_email' => env('ADMIN_EMAIL', 'admin@dixis.gr'),
    ],

];