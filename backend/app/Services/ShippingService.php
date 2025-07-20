<?php

namespace App\Services;

use App\Models\Address;
use App\Models\DeliveryMethod;
use App\Models\ExtraWeightCharge;
use App\Models\ProducerFreeShipping;
use App\Models\ProducerShippingMethod;
use App\Models\Product;
use App\Models\PostalCodeZone;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use App\Models\WeightTier;
use App\Models\AdditionalCharge;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ShippingService
{
    // Constants for delivery method codes (can be fetched from DB if needed)
    const METHOD_HOME = 'HOME';
    const METHOD_PICKUP = 'PICKUP';
    const METHOD_LOCKER = 'LOCKER';

    // Default values (consider moving to config/shipping.php)
    const DEFAULT_ZONE_ID = 3; // Zone 3: Λοιπή Ηπειρωτική Ελλάδα & Εύβοια
    const DEFAULT_EXTRA_KG_RATE = 0.90; // Default rate per kg over 10kg
    const DEFAULT_COD_COST = 2.00; // Default Cash on Delivery cost
    const EXTRA_KG_THRESHOLD_GRAMS = 10000; // 10kg threshold for extra charges

    /**
     * Get the volumetric divisor from config or use default.
     */
    protected function getVolumetricDivisor(): int
    {
        // Default value set in config/shipping.php or use 5000
        $divisor = Config::get('shipping.volumetric_divisor', 5000);
        return is_numeric($divisor) && $divisor > 0 ? (int)$divisor : 5000;
    }

    /**
     * Get the shipping zone ID for a given postal code.
     * Finds the most specific matching prefix.
     * Defaults to the default zone ID from config if no match found.
     */
    public function getZoneIdForPostalCode(string $postalCode): int
    {
        $trimmedPC = trim($postalCode);
        $defaultZoneId = Config::get('shipping.default_zone_id', 3); // Default Zone 3

        if (empty($trimmedPC)) {
            Log::warning("ShippingService: Empty postal code provided. Defaulting to Zone ID {$defaultZoneId}.");
            return $defaultZoneId;
        }

        // Ανάκτηση όλων των προθεμάτων ταξινομημένων κατά μήκος για να βρούμε πρώτα τις πιο συγκεκριμένες αντιστοιχίσεις
        $zoneMapping = PostalCodeZone::orderByRaw('LENGTH(postal_code_prefix) DESC')->pluck('shipping_zone_id', 'postal_code_prefix');

        foreach ($zoneMapping as $prefix => $zoneId) {
            if (str_starts_with($trimmedPC, $prefix)) {
                Log::debug("ShippingService: Postal code {$trimmedPC} matched prefix '{$prefix}' to Zone ID {$zoneId}.");
                return $zoneId;
            }
        }

        Log::warning("ShippingService: Postal code {$trimmedPC} not found in zone mappings. Defaulting to Zone ID {$defaultZoneId}.");
        return $defaultZoneId;
    }

    /**
     * Calculate volumetric weight in Grams.
     */
    public function calculateVolumetricWeightGrams(?int $lengthCm, ?int $widthCm, ?int $heightCm): int
    {
        if ($lengthCm === null || $widthCm === null || $heightCm === null || $lengthCm <= 0 || $widthCm <= 0 || $heightCm <= 0) {
            return 0;
        }
        $divisor = $this->getVolumetricDivisor();
        if ($divisor <= 0) {
             Log::error("ShippingService: Invalid volumetric divisor configured: {$divisor}");
             return 0; // Avoid division by zero
        }
        // Calculate volumetric weight in KG first, then convert to grams
        $volumetricKg = ($lengthCm * $widthCm * $heightCm) / $divisor;
        return (int) round($volumetricKg * 1000);
    }

    /**
     * Determine the chargeable weight in Grams.
     */
    public function getChargeableWeightGrams(int $realWeightGrams, ?int $lengthCm = null, ?int $widthCm = null, ?int $heightCm = null): int
    {
        $volumetricWeightGrams = $this->calculateVolumetricWeightGrams($lengthCm, $widthCm, $heightCm);
        return max($realWeightGrams, $volumetricWeightGrams);
    }

    /**
     * Find the WeightTier model for a given chargeable weight in grams.
     *
     * @param int $chargeableWeightGrams The weight in grams to find a tier for
     * @return WeightTier|null The matching weight tier or null if not found
     * @throws \Exception If there's an error fetching weight tiers
     */
    protected function getWeightTier(int $chargeableWeightGrams): ?WeightTier
    {
        try {
            // Βελτιωμένο caching με tags και μεγαλύτερη διάρκεια
            $tiers = Cache::tags(['shipping', 'weight_tiers'])->remember(
                'weight_tiers_sorted',
                now()->addDays(7), // Μεγαλύτερη διάρκεια καθώς τα tiers αλλάζουν σπάνια
                function () {
                    return WeightTier::orderBy('min_weight_grams', 'asc')->get();
                }
            );

            // Έλεγχος για κενό αποτέλεσμα
            if ($tiers->isEmpty()) {
                Log::error("ShippingService: No weight tiers found in database. This is a critical configuration error.");
                throw new \Exception("No weight tiers configured in the system");
            }

            // Βελτιστοποιημένη αναζήτηση με binary search για μεγάλες λίστες tiers
            $count = $tiers->count();
            if ($count > 10) { // Εφαρμογή binary search μόνο για μεγάλες λίστες
                $left = 0;
                $right = $count - 1;

                while ($left <= $right) {
                    $mid = (int)(($left + $right) / 2);
                    $tier = $tiers[$mid];

                    if ($chargeableWeightGrams >= $tier->min_weight_grams && $chargeableWeightGrams <= $tier->max_weight_grams) {
                        return $tier; // Βρέθηκε το τιερ
                    }

                    if ($chargeableWeightGrams < $tier->min_weight_grams) {
                        $right = $mid - 1;
                    } else {
                        $left = $mid + 1;
                    }
                }
            } else {
                // Για μικρές λίστες, χρησιμοποιούμε γραμμική αναζήτηση
                foreach ($tiers as $tier) {
                    if ($chargeableWeightGrams >= $tier->min_weight_grams && $chargeableWeightGrams <= $tier->max_weight_grams) {
                        return $tier;
                    }
                }
            }

            // Χειρισμός βάρους πάνω από το μέγιστο καθορισμένο tier
            $lastTier = $tiers->last();
            if ($lastTier && $chargeableWeightGrams > $lastTier->max_weight_grams) {
                Log::debug("ShippingService: Weight {$chargeableWeightGrams}g exceeds max tier, using last tier for base rate.", [
                    'last_tier_max' => $lastTier->max_weight_grams,
                    'excess_grams' => $chargeableWeightGrams - $lastTier->max_weight_grams
                ]);
                return $lastTier; // Επιστροφή του τελευταίου tier για υπολογισμό βασικού κόστους + επιπλέον κόστος ανά κιλό
            }

            // Χειρισμός βάρους κάτω από το ελάχιστο καθορισμένο tier
            $firstTier = $tiers->first();
            if ($firstTier && $chargeableWeightGrams < $firstTier->min_weight_grams) {
                Log::debug("ShippingService: Weight {$chargeableWeightGrams}g is below min tier, using first tier.", [
                    'first_tier_min' => $firstTier->min_weight_grams
                ]);
                return $firstTier; // Επιστροφή του πρώτου tier για πολύ μικρά βάρη
            }

            Log::warning("ShippingService: No weight tier found for {$chargeableWeightGrams}g despite checks. This should not happen.");
            return null;
        } catch (\Exception $e) {
            Log::error("ShippingService: Error finding weight tier: " . $e->getMessage(), [
                'weight' => $chargeableWeightGrams,
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Επαναρίπτουμε το σφάλμα για να το χειριστεί ο καλών
        }
    }

    /**
     * Find the applicable shipping rate price (producer override or default).
     * Returns the price (float) or null if not found.
     *
     * @param int $shipping_zone_id The shipping zone ID
     * @param int $weight_tier_id The weight tier ID
     * @param int $delivery_method_id The delivery method ID
     * @param int $producer_id The producer ID
     * @return float|null The shipping price or null if not found
     */
    protected function findShippingPrice(int $shipping_zone_id, int $weight_tier_id, int $delivery_method_id, int $producer_id): ?float
    {
        // Δημιουργία κλειδιών cache με συνεπή μορφή
        $producerRateCacheKey = "producer_rate:{$producer_id}:{$shipping_zone_id}:{$weight_tier_id}:{$delivery_method_id}";
        $defaultRateCacheKey = "default_rate:{$shipping_zone_id}:{$weight_tier_id}:{$delivery_method_id}";

        // Χρήση cache tags για καλύτερη διαχείριση και ακύρωση
        $cache = Cache::tags(['shipping', 'rates']);

        // 1. Έλεγχος για Producer Override Rate από τη βάση δεδομένων
        try {
            // Χρήση remember-if για να αποφύγουμε την αποθήκευση null τιμών
            $producerRate = $cache->remember(
                $producerRateCacheKey,
                now()->addHours(6), // Μεγαλύτερη διάρκεια cache
                function () use ($producer_id, $shipping_zone_id, $weight_tier_id, $delivery_method_id) {
                    return ShippingRate::where('producer_id', $producer_id)
                        ->where('shipping_zone_id', $shipping_zone_id)
                        ->where('weight_tier_id', $weight_tier_id)
                        ->where('delivery_method_id', $delivery_method_id)
                        ->first();
                }
            );

            if ($producerRate) {
                Log::debug("ShippingService: Found producer override rate.", [
                    'producer' => $producer_id,
                    'zone' => $shipping_zone_id,
                    'tier' => $weight_tier_id,
                    'method' => $delivery_method_id,
                    'price' => $producerRate->price
                ]);
                return (float) $producerRate->price;
            }
        } catch (\Exception $e) {
            // Καλύτερη καταγραφή σφαλμάτων με περισσότερες πληροφορίες
            Log::error("ShippingService: Error fetching producer rate override: " . $e->getMessage(), [
                'producer' => $producer_id,
                'zone' => $shipping_zone_id,
                'tier' => $weight_tier_id,
                'method' => $delivery_method_id,
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            // Συνεχίζουμε με το default rate σε περίπτωση σφάλματος
        }

        // 2. Έλεγχος για Default Rate από τη βάση δεδομένων
        try {
            $defaultRate = $cache->remember(
                $defaultRateCacheKey,
                now()->addDays(3), // Μεγαλύτερη διάρκεια για τις προεπιλεγμένες τιμές
                function () use ($shipping_zone_id, $weight_tier_id, $delivery_method_id) {
                    // Χρήση whereNull για τις προεπιλεγμένες τιμές (χωρίς producer_id)
                    return ShippingRate::whereNull('producer_id')
                        ->where('shipping_zone_id', $shipping_zone_id)
                        ->where('weight_tier_id', $weight_tier_id)
                        ->where('delivery_method_id', $delivery_method_id)
                        ->first();
                }
            );

            if ($defaultRate) {
                Log::debug("ShippingService: Found default rate.", [
                    'zone' => $shipping_zone_id,
                    'tier' => $weight_tier_id,
                    'method' => $delivery_method_id,
                    'price' => $defaultRate->price
                ]);
                return (float) $defaultRate->price;
            }
        } catch (\Exception $e) {
            Log::error("ShippingService: Error fetching default shipping rate: " . $e->getMessage(), [
                'zone' => $shipping_zone_id,
                'tier' => $weight_tier_id,
                'method' => $delivery_method_id,
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
        }

        // 3. Δεν βρέθηκε καμία τιμή
        Log::warning("ShippingService: No shipping rate found (producer or default).", [
            'producer' => $producer_id,
            'zone' => $shipping_zone_id,
            'tier' => $weight_tier_id,
            'method' => $delivery_method_id
        ]);
        return null; // Δεν βρέθηκε τιμή
    }

    /**
     * Get the rate per extra KG for weights above the threshold.
     * Uses default from config if specific rate not found.
     *
     * @param int $shipping_zone_id The shipping zone ID
     * @param int $delivery_method_id The delivery method ID
     * @return float The rate per extra KG
     */
    protected function getExtraKgRate(int $shipping_zone_id, int $delivery_method_id): float
    {
        try {
            // Χρήση cache tags για καλύτερη διαχείριση
            $cacheKey = "extra_kg_rate:{$shipping_zone_id}:{$delivery_method_id}";
            $rate = Cache::tags(['shipping', 'extra_rates'])->remember(
                $cacheKey,
                now()->addDays(7), // Μεγαλύτερη διάρκεια καθώς οι τιμές αλλάζουν σπάνια
                function () use ($shipping_zone_id, $delivery_method_id) {
                    // Χρήση first() και μετά price_per_kg για καλύτερο χειρισμό null
                    $record = ExtraWeightCharge::where('shipping_zone_id', $shipping_zone_id)
                                        ->where('delivery_method_id', $delivery_method_id)
                                        ->where('is_active', true) // Επιπλέον έλεγχος για ενεργές χρεώσεις
                                        ->first();
                    return $record ? $record->price_per_kg : null;
                }
            );

            if ($rate !== null) {
                Log::debug("ShippingService: Found extra KG rate.", [
                    'zone' => $shipping_zone_id,
                    'method' => $delivery_method_id,
                    'rate' => $rate
                ]);
                return (float) $rate;
            }

            // Δεν βρέθηκε συγκεκριμένη τιμή, δοκιμή για τιμή ζώνης (χωρίς μέθοδο)
            $zoneRateCacheKey = "extra_kg_rate:{$shipping_zone_id}:any";
            $zoneRate = Cache::tags(['shipping', 'extra_rates'])->remember(
                $zoneRateCacheKey,
                now()->addDays(7),
                function () use ($shipping_zone_id) {
                    $record = ExtraWeightCharge::where('shipping_zone_id', $shipping_zone_id)
                                        ->whereNull('delivery_method_id')
                                        ->where('is_active', true)
                                        ->first();
                    return $record ? $record->price_per_kg : null;
                }
            );

            if ($zoneRate !== null) {
                Log::debug("ShippingService: Found zone-level extra KG rate.", [
                    'zone' => $shipping_zone_id,
                    'rate' => $zoneRate
                ]);
                return (float) $zoneRate;
            }
        } catch (\Exception $e) {
            Log::error("ShippingService: Error fetching extra KG rate: " . $e->getMessage(), [
                'zone' => $shipping_zone_id,
                'method' => $delivery_method_id,
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            // Συνεχίζουμε με την προεπιλεγμένη τιμή
        }

        // Χρήση προεπιλεγμένης τιμής από το config
        $defaultExtraKgRate = Config::get('shipping.default_extra_kg_rate', 0.90);
        Log::warning("ShippingService: Extra KG rate not found for zone {$shipping_zone_id}, method {$delivery_method_id}. Using default.", ['default' => $defaultExtraKgRate]);
        return $defaultExtraKgRate;
    }


    /**
     * Get the free shipping threshold amount for a producer, considering zone and method specificity.
     * Returns the threshold amount or null if not set.
     *
     * @param int $producer_id The producer ID
     * @param int $shipping_zone_id The shipping zone ID
     * @param int $delivery_method_id The delivery method ID
     * @return float|null The free shipping threshold or null if not set
     */
    public function getProducerFreeShippingThreshold(int $producer_id, int $shipping_zone_id, int $delivery_method_id): ?float
    {
        try {
            // Χρήση cache tags για καλύτερη διαχείριση
            $cacheKey = "free_threshold:{$producer_id}:{$shipping_zone_id}:{$delivery_method_id}";

            $thresholdRule = Cache::tags(['shipping', 'free_shipping', "producer_{$producer_id}"])->remember(
                $cacheKey,
                now()->addHours(6), // Μεγαλύτερη διάρκεια cache
                function () use ($producer_id, $shipping_zone_id, $delivery_method_id) {
                    // Βελτιωμένο query με καλύτερη δομή
                    return ProducerFreeShipping::where('producer_id', $producer_id)
                        ->where('is_active', true)
                        ->where(function ($query) use ($shipping_zone_id, $delivery_method_id) {
                            // Προσθήκη προτεραιότητας με τη χρήση union all για καλύτερη απόδοση
                            $query->where(function ($q) use ($shipping_zone_id, $delivery_method_id) {
                                // Ακριβής αντιστοιχία για ζώνη και μέθοδο
                                $q->where('shipping_zone_id', $shipping_zone_id)
                                  ->where('delivery_method_id', $delivery_method_id);
                            })->orWhere(function ($q) use ($shipping_zone_id) {
                                // Αντιστοιχία για ζώνη, null μέθοδο (ισχύει για όλες τις μεθόδους στη ζώνη)
                                $q->where('shipping_zone_id', $shipping_zone_id)
                                  ->whereNull('delivery_method_id');
                            })->orWhere(function ($q) {
                                // Γενικός κανόνας (null ζώνη, null μέθοδος)
                                $q->whereNull('shipping_zone_id')
                                  ->whereNull('delivery_method_id');
                            });
                        })
                        // Ταξινόμηση με βάση την εξειδίκευση: συγκεκριμένη ζώνη/μέθοδος πρώτα, μετά ζώνη, μετά γενικός
                        ->orderByRaw("CASE
                                    WHEN shipping_zone_id IS NOT NULL AND delivery_method_id IS NOT NULL THEN 1
                                    WHEN shipping_zone_id IS NOT NULL THEN 2
                                    ELSE 3
                                 END")
                        ->first(); // Λήψη του πιο συγκεκριμένου κανόνα
                }
            );

            // Καταγραφή του αποτελέσματος για καλύτερο debugging
            if ($thresholdRule) {
                Log::debug("ShippingService: Found free shipping threshold rule.", [
                    'producer' => $producer_id,
                    'zone' => $shipping_zone_id,
                    'method' => $delivery_method_id,
                    'threshold' => $thresholdRule->free_shipping_threshold,
                    'rule_type' => $thresholdRule->shipping_zone_id && $thresholdRule->delivery_method_id ? 'specific' :
                                  ($thresholdRule->shipping_zone_id ? 'zone' : 'general')
                ]);
                return (float)$thresholdRule->free_shipping_threshold;
            } else {
                Log::debug("ShippingService: No free shipping threshold found.", [
                    'producer' => $producer_id,
                    'zone' => $shipping_zone_id,
                    'method' => $delivery_method_id
                ]);
                return null;
            }
        } catch (\Exception $e) {
            Log::error("ShippingService: Error fetching free shipping threshold", [
                'producer_id' => $producer_id,
                'zone' => $shipping_zone_id,
                'method' => $delivery_method_id,
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get the cost for Cash on Delivery.
     * Uses default from config if specific rate not found or error occurs.
     *
     * @return float The COD cost
     */
    protected function getCODCost(): float
    {
        $defaultCodCost = Config::get('shipping.default_cod_cost', 2.00);
        try {
            // Χρήση cache tags για καλύτερη διαχείριση
            $codCost = Cache::tags(['shipping', 'additional_charges'])->remember(
                'cod_cost',
                now()->addDays(7), // Μεγαλύτερη διάρκεια καθώς οι τιμές αλλάζουν σπάνια
                function () {
                    // Χρήση first() και μετά price για καλύτερο χειρισμό null
                    $charge = AdditionalCharge::where('code', 'COD')
                                        ->where('is_active', true)
                                        ->first();
                    return $charge ? $charge->price : null;
                }
            );

            // Καταγραφή του αποτελέσματος για καλύτερο debugging
            if ($codCost !== null && is_numeric($codCost)) {
                Log::debug("ShippingService: Found COD cost from database.", ['cost' => $codCost]);
                return (float)$codCost;
            } else {
                Log::info("ShippingService: No COD cost found in database, using default.", ['default' => $defaultCodCost]);
                return $defaultCodCost;
            }
        } catch (\Exception $e) {
            Log::error("ShippingService: Error fetching COD cost: " . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'default_used' => $defaultCodCost
            ]);
            return $defaultCodCost; // Fallback on error
        }
    }

    /**
     * Check if a method is valid based on weight, dimensions, and product flags.
     * Fetches method details from DB/Cache.
     *
     * @param DeliveryMethod $method The delivery method to check
     * @param int $chargeableWeightGrams The chargeable weight in grams
     * @param int|null $lengthCm The maximum length in cm
     * @param int|null $widthCm The maximum width in cm
     * @param int|null $heightCm The maximum height in cm
     * @param Collection $producerItems The collection of producer items
     * @return bool Whether the method is valid
     */
    protected function isMethodValid(DeliveryMethod $method, int $chargeableWeightGrams, ?int $lengthCm, ?int $widthCm, ?int $heightCm, Collection $producerItems): bool
    {
        try {
            // Δημιουργία συνοπτικού κειμένου για τη μέθοδο
            $methodInfo = "Method {$method->code} (ID: {$method->id})";

            // Έλεγχος ορίων βάρους
            if ($method->max_weight_grams !== null && $chargeableWeightGrams > $method->max_weight_grams) {
                Log::debug("ShippingService: {$methodInfo} invalid due to weight limit.", [
                    'weight' => $chargeableWeightGrams,
                    'limit' => $method->max_weight_grams,
                    'excess' => $chargeableWeightGrams - $method->max_weight_grams
                ]);
                return false;
            }

            // Έλεγχος ορίων διαστάσεων (μόνο αν παρέχονται όλες οι διαστάσεις και η μέθοδος έχει όρια)
            // Έλεγχος μήκους
            if ($method->max_length_cm !== null && $lengthCm !== null && $lengthCm > $method->max_length_cm) {
                Log::debug("ShippingService: {$methodInfo} invalid due to length limit.", [
                    'length' => $lengthCm,
                    'limit' => $method->max_length_cm,
                    'excess' => $lengthCm - $method->max_length_cm
                ]);
                return false;
            }

            // Έλεγχος πλάτους
            if ($method->max_width_cm !== null && $widthCm !== null && $widthCm > $method->max_width_cm) {
                Log::debug("ShippingService: {$methodInfo} invalid due to width limit.", [
                    'width' => $widthCm,
                    'limit' => $method->max_width_cm,
                    'excess' => $widthCm - $method->max_width_cm
                ]);
                return false;
            }

            // Έλεγχος ύψους
            if ($method->max_height_cm !== null && $heightCm !== null && $heightCm > $method->max_height_cm) {
                Log::debug("ShippingService: {$methodInfo} invalid due to height limit.", [
                    'height' => $heightCm,
                    'limit' => $method->max_height_cm,
                    'excess' => $heightCm - $method->max_height_cm
                ]);
                return false;
            }

            // Έλεγχος σημαιών καταλληλότητας (ευπαθή, εύθραυστα)
            // Βελτιωμένος έλεγχος με καταμέτρηση των προϊόντων
            $perishableItems = $producerItems->filter(fn ($item) => $item['product']?->is_perishable ?? false);
            $fragileItems = $producerItems->filter(fn ($item) => $item['product']?->is_fragile ?? false);

            $hasPerishable = $perishableItems->isNotEmpty();
            $hasFragile = $fragileItems->isNotEmpty();

            if ($hasPerishable && !($method->suitable_for_perishable ?? false)) {
                Log::debug("ShippingService: {$methodInfo} invalid due to perishable items.", [
                    'perishable_count' => $perishableItems->count(),
                    'perishable_ids' => $perishableItems->pluck('product.id')->toArray()
                ]);
                return false;
            }

            if ($hasFragile && !($method->suitable_for_fragile ?? false)) {
                Log::debug("ShippingService: {$methodInfo} invalid due to fragile items.", [
                    'fragile_count' => $fragileItems->count(),
                    'fragile_ids' => $fragileItems->pluck('product.id')->toArray()
                ]);
                return false;
            }

            // Μέθοδος είναι έγκυρη
            Log::debug("ShippingService: {$methodInfo} is valid for this shipment.", [
                'weight' => $chargeableWeightGrams,
                'dimensions' => [$lengthCm, $widthCm, $heightCm],
                'has_perishable' => $hasPerishable,
                'has_fragile' => $hasFragile
            ]);
            return true;
        } catch (\Exception $e) {
            // Σε περίπτωση σφάλματος, καταγράφουμε το σφάλμα και επιστρέφουμε false για ασφάλεια
            Log::error("ShippingService: Error validating method {$method->code}: " . $e->getMessage(), [
                'method_id' => $method->id,
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            return false; // Θεωρούμε τη μέθοδο μη έγκυρη σε περίπτωση σφάλματος
        }
    }

    /**
     * Calculate available shipping options and cost for a single producer's items.
     *
     * @param int $producerId
     * @param Collection $producerItems Items for this producer
     * @param int $destinationZoneId
     * @param Collection $allActiveMethods All active DeliveryMethod models, keyed by ID
     * @param array $supportedMethodIds Method IDs supported by this producer
     * @return array List of available shipping options for this producer.
     *               Each option is an array: ['method_id', 'method_code', 'name', 'cost', 'supports_cod']
     */
    protected function calculateShippingOptionsForProducer(
        int $producerId,
        Collection $producerItems,
        int $destinationZoneId,
        Collection $allActiveMethods,
        array $supportedMethodIds
    ): array {
        $options = [];

        // 1. Calculate totals for this producer's shipment
        $totalRealWeightGrams = 0;
        $totalValue = 0;
        $maxLengthCm = 0;
        $maxWidthCm = 0;
        $maxHeightCm = 0;
        $containsPerishable = false;
        $containsFragile = false;

        foreach ($producerItems as $item) {
            $product = $item['product'];
            $quantity = $item['quantity'];
            if (!$product) continue; // Skip if product data is missing

            $itemWeight = ($product->weight_grams ?? 0) * $quantity;
            $itemValue = ($product->discount_price ?? $product->price ?? 0) * $quantity;

            $totalRealWeightGrams += $itemWeight;
            $totalValue += $itemValue;

            // Use dimensions from product table directly - MAX dimensions for volumetric calc
            $maxLengthCm = max($maxLengthCm, $product->length_cm ?? 0);
            $maxWidthCm = max($maxWidthCm, $product->width_cm ?? 0);
            $maxHeightCm = max($maxHeightCm, $product->height_cm ?? 0);

            if ($product->is_perishable) $containsPerishable = true;
            if ($product->is_fragile) $containsFragile = true;
        }

        // 2. Get chargeable weight and weight tier
        $chargeableWeightGrams = $this->getChargeableWeightGrams($totalRealWeightGrams, $maxLengthCm, $maxWidthCm, $maxHeightCm);
        $weightTier = $this->getWeightTier($chargeableWeightGrams);

        if (!$weightTier) {
            Log::error("ShippingService: Could not determine weight tier for producer shipment.", [
                'producer_id' => $producerId,
                'chargeable_weight_g' => $chargeableWeightGrams
            ]);
            return []; // No options if tier not found
        }
        $weightTierId = $weightTier->id;

        Log::debug("Producer Calculation Details", [
            'producer' => $producerId,
            'real_g' => $totalRealWeightGrams,
            'vol_g' => $this->calculateVolumetricWeightGrams($maxLengthCm, $maxWidthCm, $maxHeightCm),
            'chargeable_g' => $chargeableWeightGrams,
            'tier_id' => $weightTierId,
            'value' => $totalValue,
        ]);

        // 3. Iterate through all potentially applicable methods (those supported by producer)
        foreach ($supportedMethodIds as $methodId) {
            $method = $allActiveMethods->get($methodId);
            if (!$method) {
                Log::warning("Supported method ID not found in active methods list.", ['producer_id' => $producerId, 'method_id' => $methodId]);
                continue; // Skip if method somehow not active anymore
            }

            // 4. Check validity (weight, dimensions, suitability)
            // Pass the collection of items for suitability checks
            if (!$this->isMethodValid($method, $chargeableWeightGrams, $maxLengthCm, $maxWidthCm, $maxHeightCm, $producerItems)) {
                 continue; // Method constraints not met
            }

            // 5. Check for free shipping
            $freeShippingThreshold = $this->getProducerFreeShippingThreshold($producerId, $destinationZoneId, $methodId);
            $hasFreeShipping = ($freeShippingThreshold !== null && $totalValue >= $freeShippingThreshold);

            if ($hasFreeShipping) {
                $cost = 0.00;
                Log::debug("Applying free shipping for producer", ['producer' => $producerId, 'method' => $method->code, 'threshold' => $freeShippingThreshold, 'value' => $totalValue]);
            } else {
                // 6. Find base price
                $basePrice = $this->findShippingPrice($destinationZoneId, $weightTierId, $methodId, $producerId);
                if ($basePrice === null) {
                    Log::warning("Rate price not found for producer method", ['producer' => $producerId, 'zone' => $destinationZoneId, 'tier' => $weightTierId, 'method' => $methodId]);
                    continue; // No rate found, method not available for this combination
                }

                // 7. Calculate final cost (base + extra weight)
                $cost = $basePrice;
                $extraKgThresholdGrams = Config::get('shipping.extra_kg_threshold_grams', 10000); // Get threshold from config

                if ($chargeableWeightGrams > $extraKgThresholdGrams) {
                    $extraKgRate = $this->getExtraKgRate($destinationZoneId, $methodId); // Already uses config fallback
                    if ($extraKgRate > 0) {
                        // Calculate extra weight in KG, rounding up
                        $extraWeightKg = ceil(($chargeableWeightGrams - $extraKgThresholdGrams) / 1000.0);
                        $cost += max(0, $extraWeightKg) * $extraKgRate; // Ensure non-negative extra weight
                        Log::debug("Extra weight cost added for producer method", ['method' => $method->code, 'extra_kg' => $extraWeightKg, 'rate_per_kg' => $extraKgRate, 'added_cost' => max(0, $extraWeightKg) * $extraKgRate]);
                    }
                }
            }

            // 8. Add valid option to results
            // Ensure 'supports_cod' column exists in delivery_methods table and is retrieved
            $options[] = [
                'method_id'   => $method->id,
                'method_code' => $method->code,
                'name'        => $method->name,
                'cost'        => round($cost, 2),
                'supports_cod'=> $method->supports_cod ?? false // Default to false if not set
            ];
        }

        // 9. Sort options for this producer (e.g., by cost)
        usort($options, fn($a, $b) => $a['cost'] <=> $b['cost']);

        return $options;
    }


    /**
     * Get multi-producer discount information for a shipping rate.
     *
     * @param int $shipping_zone_id The shipping zone ID
     * @param int $weight_tier_id The weight tier ID
     * @param int $delivery_method_id The delivery method ID
     * @param int $producer_id The producer ID
     * @return array|null Array with 'discount_percentage' and 'min_producers' or null if no discount applies
     */
    protected function getMultiProducerDiscount(int $shipping_zone_id, int $weight_tier_id, int $delivery_method_id, int $producer_id): ?array
    {
        try {
            // Create cache key with consistent format
            $cacheKey = "multi_producer_discount:{$producer_id}:{$shipping_zone_id}:{$weight_tier_id}:{$delivery_method_id}";

            // Use cache tags for better management
            $discountInfo = Cache::tags(['shipping', 'discounts'])->remember(
                $cacheKey,
                now()->addHours(6),
                function () use ($producer_id, $shipping_zone_id, $weight_tier_id, $delivery_method_id) {
                    // First check for producer-specific discount
                    $rate = ShippingRate::where('producer_id', $producer_id)
                        ->where('shipping_zone_id', $shipping_zone_id)
                        ->where('weight_tier_id', $weight_tier_id)
                        ->where('delivery_method_id', $delivery_method_id)
                        ->first(['multi_producer_discount', 'min_producers_for_discount']);

                    // If no producer-specific discount, check for default discount
                    if (!$rate || ($rate->multi_producer_discount === null && $rate->min_producers_for_discount === null)) {
                        $rate = ShippingRate::whereNull('producer_id')
                            ->where('shipping_zone_id', $shipping_zone_id)
                            ->where('weight_tier_id', $weight_tier_id)
                            ->where('delivery_method_id', $delivery_method_id)
                            ->first(['multi_producer_discount', 'min_producers_for_discount']);
                    }

                    // Return discount info if found and valid
                    if ($rate && $rate->multi_producer_discount !== null && $rate->min_producers_for_discount !== null) {
                        return [
                            'discount_percentage' => (float)$rate->multi_producer_discount,
                            'min_producers' => (int)$rate->min_producers_for_discount
                        ];
                    }

                    return null; // No discount applies
                }
            );

            return $discountInfo;
        } catch (\Exception $e) {
            Log::error("ShippingService: Error fetching multi-producer discount: " . $e->getMessage(), [
                'producer_id' => $producer_id,
                'zone' => $shipping_zone_id,
                'tier' => $weight_tier_id,
                'method' => $delivery_method_id,
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            return null; // No discount on error
        }
    }

    /**
     * Apply multi-producer discount to shipping costs if applicable.
     *
     * @param array $producerResults The producer results array
     * @param int $producerCount The total number of producers in the order
     * @return array The updated producer results with discounts applied
     */
    protected function applyMultiProducerDiscounts(array $producerResults, int $producerCount): array
    {
        // Only apply discounts if there are multiple producers
        if ($producerCount <= 1) {
            return $producerResults;
        }

        Log::debug("ShippingService: Checking multi-producer discounts for {$producerCount} producers");

        foreach ($producerResults as &$producerResult) {
            $producerId = $producerResult['producer_id'];

            foreach ($producerResult['options'] as &$option) {
                $methodId = $option['method_id'];
                $originalCost = $option['cost'];

                // Get discount info from the database
                // Note: We need to pass shipping_zone_id and weight_tier_id which aren't currently stored in the option
                // For now, we'll add placeholder values and modify the actual implementation later
                $discountInfo = $this->getMultiProducerDiscount(
                    $option['zone_id'] ?? 1, // This should be stored in the option
                    $option['tier_id'] ?? 1, // This should be stored in the option
                    $methodId,
                    $producerId
                );

                // Apply discount if applicable
                if ($discountInfo && $producerCount >= $discountInfo['min_producers']) {
                    $discountPercentage = $discountInfo['discount_percentage'];
                    $discountAmount = $originalCost * ($discountPercentage / 100);
                    $discountedCost = $originalCost - $discountAmount;

                    // Update the option with discounted cost
                    $option['original_cost'] = $originalCost;
                    $option['cost'] = round(max(0, $discountedCost), 2); // Ensure non-negative cost
                    $option['discount_applied'] = [
                        'percentage' => $discountPercentage,
                        'amount' => round($discountAmount, 2)
                    ];

                    Log::debug("ShippingService: Applied multi-producer discount", [
                        'producer_id' => $producerId,
                        'method_id' => $methodId,
                        'original_cost' => $originalCost,
                        'discount_percentage' => $discountPercentage,
                        'discounted_cost' => $option['cost']
                    ]);
                }
            }
        }

        return $producerResults;
    }

    /**
     * Calculate available shipping options per producer for the entire cart.
     *
     * @param Collection $cartItemsWithDetails Collection of items, each containing ['product_id', 'quantity', 'product' => ProductModel]
     * @param Address $destinationAddress Destination Address model.
     * @param bool $codRequested Whether Cash on Delivery is requested.
     * @return array An array containing 'producers' (list of producer options) and 'cod_cost'.
     *               Example: ['producers' => [[ 'producer_id' => 1, 'options' => [...] ]], 'cod_cost' => 2.00 ]
     */
    public function calculateShipping(Collection $cartItemsWithDetails, Address $destinationAddress, bool $codRequested = false): array
    {
        $destinationZoneId = $this->getZoneIdForPostalCode($destinationAddress->postal_code);
        $itemsByProducer = $cartItemsWithDetails->groupBy('product.producer_id');

        // Fetch all active delivery methods and producer supported methods upfront
        $allActiveMethods = Cache::remember('shipping:active_delivery_methods', now()->addHours(1), function () {
            // Ensure necessary fields like supports_cod, suitability flags, limits are selected
            return DeliveryMethod::where('is_active', true)->select([
                'id', 'code', 'name', 'max_weight_grams', 'max_length_cm', 'max_width_cm', 'max_height_cm',
                'suitable_for_perishable', 'suitable_for_fragile', 'supports_cod'
            ])->get()->keyBy('id');
        });
        $producerSupportedMethods = Cache::remember('shipping:producer_supported_methods', now()->addMinutes(30), function () {
             // Group by producer_id for easy lookup
             return ProducerShippingMethod::where('is_enabled', true)->get(['producer_id', 'delivery_method_id'])->groupBy('producer_id');
        });

        $producerResults = [];
        $overallCodCost = 0.00;
        $anyMethodSupportsCod = false; // Flag to check if *any* resulting method supports COD

        foreach ($itemsByProducer as $producerId => $producerItems) {
            // Ensure producer ID is valid integer
             if (!is_numeric($producerId) || $producerId <= 0) {
                 Log::warning("ShippingService: Invalid Producer ID encountered in cart items.", ['producer_id' => $producerId]);
                 continue; // Skip this group
             }
             $producerId = (int)$producerId;

            $supportedMethodIds = $producerSupportedMethods->get($producerId, collect())->pluck('delivery_method_id')->toArray();

            // Skip producer if they support no methods (or data is missing)
             if (empty($supportedMethodIds)) {
                 Log::warning("ShippingService: Producer supports no active shipping methods or data missing.", ['producer_id' => $producerId]);
                 continue;
             }

            $producerOptions = $this->calculateShippingOptionsForProducer(
                $producerId,
                $producerItems,
                $destinationZoneId,
                $allActiveMethods,
                $supportedMethodIds
            );

            // Store zone_id and tier_id in each option for later use with multi-producer discounts
            foreach ($producerOptions as &$option) {
                $option['zone_id'] = $destinationZoneId;
                // Note: tier_id should ideally be stored during calculation, but for now we'll use a placeholder
                $option['tier_id'] = 1; // This should be the actual tier ID used in calculation
            }

            // Only add producer to results if they have at least one valid shipping option
            if (!empty($producerOptions)) {
                 $producerResults[] = [
                     'producer_id' => $producerId,
                     'options' => $producerOptions,
                 ];
                 // Check if any of the methods for this producer supports COD
                 foreach ($producerOptions as $option) {
                     if (!empty($option['supports_cod'])) { // Check if 'supports_cod' is true
                         $anyMethodSupportsCod = true;
                     }
                 }
            } else {
                 // Log that this producer has no valid options for this cart/destination
                 Log::warning("ShippingService: No valid shipping options found for producer for this specific request.", [
                     'producer_id' => $producerId,
                     'destination_zone_id' => $destinationZoneId,
                     // Add cart item IDs maybe?
                 ]);
                 // Important: If ANY producer has NO options, should the whole order fail?
                 // Current logic: Exclude producer, allow order if others have options.
                 // Consider returning an error or specific flag if this happens.
            }
        }

        // If no producer ended up with valid options (e.g., all failed tier lookup or validation)
        if (empty($producerResults)) {
            Log::warning("ShippingService: No producer had any valid shipping options for the entire cart.", [
                'destination_zone_id' => $destinationZoneId,
                // Add cart details maybe?
            ]);
            // Return empty structure, frontend must handle this (e.g., "Shipping not available")
            return ['producers' => [], 'cod_cost' => 0.00];
        }

        // Apply multi-producer discounts if there are multiple producers
        $producerCount = count($producerResults);
        if ($producerCount > 1) {
            $producerResults = $this->applyMultiProducerDiscounts($producerResults, $producerCount);
        }

        // Calculate COD cost only if requested AND at least one available method among all options supports it
        if ($codRequested && $anyMethodSupportsCod) {
            $overallCodCost = $this->getCODCost(); // Already uses config fallback
        }

        return [
            'producers' => $producerResults,
            'cod_cost' => round($overallCodCost, 2),
        ];
    }
}
