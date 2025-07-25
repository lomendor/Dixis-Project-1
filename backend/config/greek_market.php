<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Greek Market Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Greek market integration including VAT rates,
    | payment gateways, shipping, and compliance settings.
    |
    */

    'vat' => [
        'mainland_standard' => env('GREEK_VAT_MAINLAND', 0.24),  // 24%
        'islands_standard' => env('GREEK_VAT_ISLANDS', 0.13),    // 13%
        'reduced_food' => env('GREEK_VAT_REDUCED', 0.06),        // 6%
        'zero_rate' => 0.00,                                     // 0%
    ],

    'company' => [
        'name' => env('APP_COMPANY_NAME', 'Dixis Greek Marketplace'),
        'tax_id' => env('APP_COMPANY_TAX_ID'),
        'address' => env('APP_COMPANY_ADDRESS'),
        'city' => env('APP_COMPANY_CITY'),
        'postcode' => env('APP_COMPANY_POSTCODE'),
        'phone' => env('APP_COMPANY_PHONE'),
        'email' => env('APP_COMPANY_EMAIL'),
    ],

    'payments' => [
        'viva_wallet' => [
            'enabled' => true,
            'sandbox' => env('VIVA_WALLET_SANDBOX', true),
            'client_id' => env('VIVA_WALLET_CLIENT_ID'),
            'client_secret' => env('VIVA_WALLET_CLIENT_SECRET'),
        ],
    ],

    'shipping' => [
        'aftersales_pro' => [
            'enabled' => true,
            'sandbox' => env('AFTERSALES_PRO_SANDBOX', true),
            'api_key' => env('AFTERSALES_PRO_API_KEY'),
            'api_secret' => env('AFTERSALES_PRO_API_SECRET'),
        ],
        'free_shipping_threshold' => 50.0, // €50
        'cod_fee' => 3.0, // €3
    ],

    'features' => [
        'vat_calculation' => true,
        'payment_integration' => true,
        'shipping_integration' => true,
        'greek_language' => true,
        'gdpr_compliance' => false, // TODO: Implement
    ],

    'regions' => [
        'athens' => [
            'postcodes' => ['10*', '11*', '12*', '13*', '14*', '15*', '16*', '17*', '18*', '19*'],
            'shipping_cost' => 3.0,
            'delivery_days' => 1,
        ],
        'thessaloniki' => [
            'postcodes' => ['54*', '55*', '56*', '57*'],
            'shipping_cost' => 3.0,
            'delivery_days' => 1,
        ],
        'mainland' => [
            'postcodes' => ['20*', '21*', '22*', '23*', '30*', '40*', '50*', '60*'],
            'shipping_cost' => 4.0,
            'delivery_days' => 2,
        ],
        'islands' => [
            'postcodes' => ['70*', '71*', '72*', '73*', '74*', '28*', '29*', '80*', '81*', '82*', '83*', '84*', '85*'],
            'shipping_cost' => 6.5,
            'delivery_days' => 4,
        ],
    ],
];