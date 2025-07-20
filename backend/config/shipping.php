<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Volumetric Weight Divisor
    |--------------------------------------------------------------------------
    |
    | The divisor used to calculate volumetric weight (in KG) from dimensions
    | in centimeters (Length * Width * Height / Divisor). Common values are
    | 5000 or 6000 depending on the courier standards.
    |
    */

    'volumetric_divisor' => 5000,

    /*
    |--------------------------------------------------------------------------
    | Default Shipping Zone ID
    |--------------------------------------------------------------------------
    |
    | The ID of the shipping zone to use as a fallback if a destination
    | postal code doesn't match any defined prefix in the postal_code_zones table.
    | Ensure this zone ID exists in your shipping_zones table.
    | (e.g., 3 corresponds to 'Λοιπή Ηπειρωτική Ελλάδα & Εύβοια')
    |
    */

    'default_zone_id' => 3,

    /*
    |--------------------------------------------------------------------------
    | Default Cost for Cash on Delivery (COD)
    |--------------------------------------------------------------------------
    |
    | The default additional cost applied when Cash on Delivery is selected.
    | This is used if a specific cost is not found in the additional_charges table
    | for the 'COD' code.
    |
    */

    'default_cod_cost' => 2.00,

    /*
    |--------------------------------------------------------------------------
    | Extra Weight Threshold (Grams)
    |--------------------------------------------------------------------------
    |
    | The chargeable weight threshold (in grams) above which extra weight
    | charges apply. For example, 10000 means extra charges apply for weights
    | over 10kg.
    |
    */

    'extra_kg_threshold_grams' => 10000,

    /*
    |--------------------------------------------------------------------------
    | Default Extra Kilogram Rate
    |--------------------------------------------------------------------------
    |
    | The default cost applied per kilogram for the weight exceeding the
    | 'extra_kg_threshold_grams'. This is used as a fallback if a specific rate
    | is not found in the extra_weight_charges table for the applicable
    | zone and delivery method.
    |
    */

    'default_extra_kg_rate' => 0.90,

]; 