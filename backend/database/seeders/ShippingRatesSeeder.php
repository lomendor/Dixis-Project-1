<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use App\Models\WeightTier;
use App\Models\DeliveryMethod;

class ShippingRatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing shipping rates
        ShippingRate::query()->delete();

        // Get all shipping zones
        $zones = ShippingZone::all();
        if ($zones->isEmpty()) {
            $this->command->info('No shipping zones found. Creating default zones...');
            $this->createDefaultZones();
            $zones = ShippingZone::all();
        }

        // Get all weight tiers
        $weightTiers = WeightTier::all();
        if ($weightTiers->isEmpty()) {
            $this->command->info('No weight tiers found. Creating default weight tiers...');
            $this->createDefaultWeightTiers();
            $weightTiers = WeightTier::all();
        }

        // Get all delivery methods
        $deliveryMethods = DeliveryMethod::all();
        if ($deliveryMethods->isEmpty()) {
            $this->command->info('No delivery methods found. Creating default delivery methods...');
            $this->createDefaultDeliveryMethods();
            $deliveryMethods = DeliveryMethod::all();
        }

        // Δημιουργία πίνακα αντιστοίχισης ονομάτων ζωνών με IDs
        $zoneMap = [];
        foreach ($zones as $zone) {
            $zoneMap[$zone->name] = $zone->id;
        }

        // Εμφάνιση των διαθέσιμων ζωνών για αποσφαλμάτωση
        $this->command->info('Available shipping zones:');
        foreach ($zoneMap as $name => $id) {
            $this->command->info("Zone: {$name}, ID: {$id}");
        }

        // Create shipping rates for each combination
        $rates = [];

        // Χρησιμοποιούμε τα πραγματικά IDs των ζωνών από τη βάση δεδομένων
        $zone1Id = $zoneMap['Αστικά Κέντρα'] ?? 1;
        $zone2Id = $zoneMap['Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας'] ?? 2;
        $zone3Id = $zoneMap['Λοιπή Ηπειρωτική Ελλάδα & Εύβοια'] ?? 3;
        $zone4Id = $zoneMap['Νησιά (Εξαιρουμένων Δυσπρόσιτων)'] ?? 4;
        $zone5Id = $zoneMap['Δυσπρόσιτες Περιοχές'] ?? 5;
        $zone6Id = $zoneMap['Αθήνα'] ?? 6;
        $zone7Id = $zoneMap['Θεσσαλονίκη'] ?? 7;

        // Χρησιμοποιούμε τα πραγματικά IDs των weight tiers από τη βάση δεδομένων
        $weightTierIds = WeightTier::all()->pluck('id')->toArray();
        $weightTier1Id = $weightTierIds[0] ?? 7; // TIER_2KG
        $weightTier2Id = $weightTierIds[1] ?? 8; // TIER_5KG
        $weightTier3Id = $weightTierIds[2] ?? 9; // TIER_10KG

        // Χρησιμοποιούμε τα πραγματικά IDs των delivery methods από τη βάση δεδομένων
        $deliveryMethodIds = DeliveryMethod::all()->pluck('id')->toArray();
        $deliveryMethod1Id = $deliveryMethodIds[0] ?? 10; // HOME
        $deliveryMethod2Id = $deliveryMethodIds[1] ?? 11; // PICKUP
        $deliveryMethod3Id = $deliveryMethodIds[2] ?? 12; // LOCKER

        $this->command->info("Using weight tier IDs: {$weightTier1Id}, {$weightTier2Id}, {$weightTier3Id}");
        $this->command->info("Using delivery method IDs: {$deliveryMethod1Id}, {$deliveryMethod2Id}, {$deliveryMethod3Id}");

        // Zone 1 (Αστικά Κέντρα - Αθήνα/Θεσσαλονίκη)
        $rates[] = ['shipping_zone_id' => $zone1Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 3.50];
        $rates[] = ['shipping_zone_id' => $zone1Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 4.50];
        $rates[] = ['shipping_zone_id' => $zone1Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 6.00];
        $rates[] = ['shipping_zone_id' => $zone1Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 2.50];
        $rates[] = ['shipping_zone_id' => $zone1Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 3.50];
        $rates[] = ['shipping_zone_id' => $zone1Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 5.00];
        $rates[] = ['shipping_zone_id' => $zone1Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 2.00];
        $rates[] = ['shipping_zone_id' => $zone1Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 3.00];
        $rates[] = ['shipping_zone_id' => $zone1Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 4.50];

        // Zone 2 (Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας)
        $rates[] = ['shipping_zone_id' => $zone2Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 4.00];
        $rates[] = ['shipping_zone_id' => $zone2Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 5.00];
        $rates[] = ['shipping_zone_id' => $zone2Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 7.00];
        $rates[] = ['shipping_zone_id' => $zone2Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 3.00];
        $rates[] = ['shipping_zone_id' => $zone2Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 4.00];
        $rates[] = ['shipping_zone_id' => $zone2Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 6.00];
        $rates[] = ['shipping_zone_id' => $zone2Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 2.50];
        $rates[] = ['shipping_zone_id' => $zone2Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 3.50];
        $rates[] = ['shipping_zone_id' => $zone2Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 5.50];

        // Zone 3 (Λοιπή Ηπειρωτική Ελλάδα & Εύβοια)
        $rates[] = ['shipping_zone_id' => $zone3Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 4.50];
        $rates[] = ['shipping_zone_id' => $zone3Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 5.50];
        $rates[] = ['shipping_zone_id' => $zone3Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 8.00];
        $rates[] = ['shipping_zone_id' => $zone3Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 3.50];
        $rates[] = ['shipping_zone_id' => $zone3Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 4.50];
        $rates[] = ['shipping_zone_id' => $zone3Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 7.00];
        $rates[] = ['shipping_zone_id' => $zone3Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 3.00];
        $rates[] = ['shipping_zone_id' => $zone3Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 4.00];
        $rates[] = ['shipping_zone_id' => $zone3Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 6.50];

        // Zone 4 (Νησιά - Εξαιρουμένων Δυσπρόσιτων)
        $rates[] = ['shipping_zone_id' => $zone4Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 5.50];
        $rates[] = ['shipping_zone_id' => $zone4Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 7.00];
        $rates[] = ['shipping_zone_id' => $zone4Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 10.00];
        $rates[] = ['shipping_zone_id' => $zone4Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 4.50];
        $rates[] = ['shipping_zone_id' => $zone4Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 6.00];
        $rates[] = ['shipping_zone_id' => $zone4Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 9.00];
        $rates[] = ['shipping_zone_id' => $zone4Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 4.00];
        $rates[] = ['shipping_zone_id' => $zone4Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 5.50];
        $rates[] = ['shipping_zone_id' => $zone4Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 8.50];

        // Zone 5 (Δυσπρόσιτες Περιοχές)
        $rates[] = ['shipping_zone_id' => $zone5Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 7.00];
        $rates[] = ['shipping_zone_id' => $zone5Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 9.00];
        $rates[] = ['shipping_zone_id' => $zone5Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 13.00];
        $rates[] = ['shipping_zone_id' => $zone5Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 6.00];
        $rates[] = ['shipping_zone_id' => $zone5Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 8.00];
        $rates[] = ['shipping_zone_id' => $zone5Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 12.00];
        $rates[] = ['shipping_zone_id' => $zone5Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 5.50];
        $rates[] = ['shipping_zone_id' => $zone5Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 7.50];
        $rates[] = ['shipping_zone_id' => $zone5Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 11.50];

        // Zone 6 (Αθήνα)
        $rates[] = ['shipping_zone_id' => $zone6Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 3.00];
        $rates[] = ['shipping_zone_id' => $zone6Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 4.00];
        $rates[] = ['shipping_zone_id' => $zone6Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 5.50];
        $rates[] = ['shipping_zone_id' => $zone6Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 2.00];
        $rates[] = ['shipping_zone_id' => $zone6Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 3.00];
        $rates[] = ['shipping_zone_id' => $zone6Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 4.50];
        $rates[] = ['shipping_zone_id' => $zone6Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 1.50];
        $rates[] = ['shipping_zone_id' => $zone6Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 2.50];
        $rates[] = ['shipping_zone_id' => $zone6Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 4.00];

        // Zone 7 (Θεσσαλονίκη)
        $rates[] = ['shipping_zone_id' => $zone7Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 3.00];
        $rates[] = ['shipping_zone_id' => $zone7Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 4.00];
        $rates[] = ['shipping_zone_id' => $zone7Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod1Id, 'price' => 5.50];
        $rates[] = ['shipping_zone_id' => $zone7Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 2.00];
        $rates[] = ['shipping_zone_id' => $zone7Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 3.00];
        $rates[] = ['shipping_zone_id' => $zone7Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod2Id, 'price' => 4.50];
        $rates[] = ['shipping_zone_id' => $zone7Id, 'weight_tier_id' => $weightTier1Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 1.50];
        $rates[] = ['shipping_zone_id' => $zone7Id, 'weight_tier_id' => $weightTier2Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 2.50];
        $rates[] = ['shipping_zone_id' => $zone7Id, 'weight_tier_id' => $weightTier3Id, 'delivery_method_id' => $deliveryMethod3Id, 'price' => 4.00];

        // Insert all rates
        foreach ($rates as $rate) {
            // Έλεγχος αν υπάρχει ήδη η τιμή μεταφορικών
            $exists = ShippingRate::where('shipping_zone_id', $rate['shipping_zone_id'])
                ->where('weight_tier_id', $rate['weight_tier_id'])
                ->where('delivery_method_id', $rate['delivery_method_id'])
                ->exists();

            if (!$exists) {
                // Εισαγωγή μόνο αν δεν υπάρχει ήδη
                ShippingRate::create($rate);
            }
        }

        $this->command->info('Shipping rates seeded successfully: ' . count($rates) . ' rates created.');
    }

    /**
     * Create default shipping zones if none exist.
     */
    private function createDefaultZones(): void
    {
        $zones = [
            [
                'id' => 1,
                'name' => 'Αστικά Κέντρα',
                'description' => 'Περιλαμβάνει τα μεγάλα αστικά κέντρα. Ταχύτερη παράδοση και χαμηλότερο κόστος μεταφορικών.',
                'color' => '#4299E1',
                'is_active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας',
                'description' => 'Περιλαμβάνει τις πρωτεύουσες των νομών της ηπειρωτικής Ελλάδας. Παράδοση εντός 1-2 εργάσιμων ημερών.',
                'color' => '#48BB78',
                'is_active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Λοιπή Ηπειρωτική Ελλάδα & Εύβοια',
                'description' => 'Περιλαμβάνει την υπόλοιπη ηπειρωτική Ελλάδα και την Εύβοια. Παράδοση εντός 2-3 εργάσιμων ημερών.',
                'color' => '#ECC94B',
                'is_active' => true,
            ],
            [
                'id' => 4,
                'name' => 'Νησιά (Εξαιρουμένων Δυσπρόσιτων)',
                'description' => 'Περιλαμβάνει τα νησιά, εκτός από τις δυσπρόσιτες περιοχές. Παράδοση εντός 3-5 εργάσιμων ημερών.',
                'color' => '#ED8936',
                'is_active' => true,
            ],
            [
                'id' => 5,
                'name' => 'Δυσπρόσιτες Περιοχές',
                'description' => 'Περιλαμβάνει τις δυσπρόσιτες περιοχές της ηπειρωτικής και νησιωτικής Ελλάδας. Παράδοση εντός 5-7 εργάσιμων ημερών.',
                'color' => '#E53E3E',
                'is_active' => true,
            ],
            [
                'id' => 6,
                'name' => 'Αθήνα',
                'description' => 'Περιλαμβάνει την περιοχή της Αθήνας. Ταχύτερη παράδοση και χαμηλότερο κόστος μεταφορικών.',
                'color' => '#805AD5',
                'is_active' => true,
            ],
            [
                'id' => 7,
                'name' => 'Θεσσαλονίκη',
                'description' => 'Περιλαμβάνει την περιοχή της Θεσσαλονίκης. Ταχύτερη παράδοση και χαμηλότερο κόστος μεταφορικών.',
                'color' => '#3182CE',
                'is_active' => true,
            ],
        ];

        foreach ($zones as $zone) {
            ShippingZone::create($zone);
        }
    }

    /**
     * Create default weight tiers if none exist.
     */
    private function createDefaultWeightTiers(): void
    {
        $weightTiers = [
            ['id' => 1, 'min_weight_grams' => 0, 'max_weight_grams' => 1000, 'description' => 'Έως 1 κιλό'],
            ['id' => 2, 'min_weight_grams' => 1001, 'max_weight_grams' => 2000, 'description' => '1-2 κιλά'],
            ['id' => 3, 'min_weight_grams' => 2001, 'max_weight_grams' => 5000, 'description' => '2-5 κιλά'],
        ];

        foreach ($weightTiers as $tier) {
            WeightTier::create($tier);
        }
    }

    /**
     * Create default delivery methods if none exist.
     */
    private function createDefaultDeliveryMethods(): void
    {
        $deliveryMethods = [
            ['id' => 1, 'name' => 'Ταχυμεταφορά', 'method_code' => 'courier', 'description' => 'Παράδοση με εταιρεία ταχυμεταφορών', 'is_active' => true],
            ['id' => 2, 'name' => 'Ταχυδρομείο', 'method_code' => 'post', 'description' => 'Παράδοση με ΕΛΤΑ', 'is_active' => true],
            ['id' => 3, 'name' => 'Οικονομική Αποστολή', 'method_code' => 'economy', 'description' => 'Οικονομική αποστολή με μεγαλύτερο χρόνο παράδοσης', 'is_active' => true],
        ];

        foreach ($deliveryMethods as $method) {
            DeliveryMethod::create($method);
        }
    }
}
