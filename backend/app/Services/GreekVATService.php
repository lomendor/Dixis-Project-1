<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

/**
 * Greek VAT Service for Tax Compliance
 * 
 * Handles VAT calculations according to Greek tax laws:
 * - 24% standard VAT rate (mainland Greece)
 * - 13% reduced VAT rate (Greek islands)
 * - 6% super-reduced VAT rate (basic food items)
 * - 0% zero VAT rate (exports, specific exemptions)
 */
class GreekVATService
{
    // Greek VAT rates as defined by Greek tax law
    const VAT_RATES = [
        'standard_mainland' => 0.24,    // 24% - Standard rate for mainland Greece
        'standard_islands' => 0.13,     // 13% - Reduced rate for Greek islands
        'reduced_food' => 0.06,         // 6% - Super-reduced rate for basic food items
        'zero_rate' => 0.00            // 0% - Zero rate for exports and exemptions
    ];

    // Greek island postal codes (simplified list)
    const ISLAND_POSTCODES = [
        // Crete
        '70', '71', '72', '73', '74',
        // Dodecanese (Rhodes, Kos, etc.)
        '851', '852', '853', '854', '855',
        // North Aegean (Lesbos, Chios, Samos)
        '811', '812', '821', '831',
        // Ionian Islands (Corfu, Zakynthos, Kefalonia)
        '28', '29', '491',
        // Cyclades (Santorini, Mykonos, etc.)
        '840', '841', '842', '843', '844', '845', '846', '847', '848', '849'
    ];

    // Basic food items that qualify for 6% VAT rate
    const BASIC_FOOD_CATEGORIES = [
        'bread', 'flour', 'milk', 'cheese', 'eggs', 'meat', 'fish', 
        'fruits', 'vegetables', 'olive_oil', 'honey', 'pasta', 'rice'
    ];

    /**
     * Calculate VAT for an order
     * 
     * @param Order $order
     * @return array
     */
    public function calculateOrderVAT(Order $order): array
    {
        try {
            $isIsland = $this->isGreekIsland($order->shipping_postcode ?? '');
            $vatBreakdown = [];
            $totalVAT = 0;
            $totalNet = 0;

            foreach ($order->items as $item) {
                $product = $item->product;
                $quantity = $item->quantity;
                $itemPrice = $item->price ?? $product->price;
                
                // Determine VAT rate for this product
                $vatRate = $this->determineVATRate($product, $isIsland);
                
                // Calculate net amount (price excluding VAT)
                $netAmount = $itemPrice / (1 + $vatRate);
                $vatAmount = $itemPrice - $netAmount;
                
                $totalNet += $netAmount * $quantity;
                $totalVAT += $vatAmount * $quantity;
                
                // Add to breakdown
                $vatRateKey = $this->getVATRateKey($vatRate, $isIsland);
                if (!isset($vatBreakdown[$vatRateKey])) {
                    $vatBreakdown[$vatRateKey] = [
                        'rate' => $vatRate,
                        'net_amount' => 0,
                        'vat_amount' => 0,
                        'gross_amount' => 0,
                        'items' => []
                    ];
                }
                
                $vatBreakdown[$vatRateKey]['net_amount'] += $netAmount * $quantity;
                $vatBreakdown[$vatRateKey]['vat_amount'] += $vatAmount * $quantity;
                $vatBreakdown[$vatRateKey]['gross_amount'] += $itemPrice * $quantity;
                $vatBreakdown[$vatRateKey]['items'][] = [
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'unit_price' => $itemPrice,
                    'net_amount' => $netAmount * $quantity,
                    'vat_amount' => $vatAmount * $quantity
                ];
            }

            return [
                'success' => true,
                'location_type' => $isIsland ? 'island' : 'mainland',
                'postcode' => $order->shipping_postcode,
                'total_net' => round($totalNet, 2),
                'total_vat' => round($totalVAT, 2),
                'total_gross' => round($totalNet + $totalVAT, 2),
                'vat_breakdown' => $vatBreakdown,
                'calculated_at' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            Log::error('Greek VAT calculation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Failed to calculate Greek VAT: ' . $e->getMessage());
        }
    }

    /**
     * Calculate VAT for a product price
     * 
     * @param Product $product
     * @param float $price
     * @param string $postcode
     * @return array
     */
    public function calculateProductVAT(Product $product, float $price, string $postcode = ''): array
    {
        try {
            $isIsland = $this->isGreekIsland($postcode);
            $vatRate = $this->determineVATRate($product, $isIsland);
            
            // Calculate amounts
            $netAmount = $price / (1 + $vatRate);
            $vatAmount = $price - $netAmount;
            
            return [
                'success' => true,
                'location_type' => $isIsland ? 'island' : 'mainland',
                'vat_rate' => $vatRate,
                'vat_rate_percentage' => ($vatRate * 100) . '%',
                'gross_price' => round($price, 2),
                'net_price' => round($netAmount, 2),
                'vat_amount' => round($vatAmount, 2),
                'product_category' => $product->category->name ?? 'general',
                'is_basic_food' => $this->isBasicFood($product)
            ];

        } catch (\Exception $e) {
            Log::error('Product VAT calculation failed', [
                'product_id' => $product->id,
                'price' => $price,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Failed to calculate product VAT: ' . $e->getMessage());
        }
    }

    /**
     * Get VAT rates summary for Greek market
     * 
     * @return array
     */
    public function getVATRatesSummary(): array
    {
        return [
            'rates' => [
                'mainland_standard' => [
                    'rate' => self::VAT_RATES['standard_mainland'],
                    'percentage' => '24%',
                    'description' => 'Κανονικός συντελεστής Φ.Π.Α. (Ηπειρωτική Ελλάδα)',
                    'applies_to' => 'Γενικά προϊόντα στην ηπειρωτική Ελλάδα'
                ],
                'islands_standard' => [
                    'rate' => self::VAT_RATES['standard_islands'],
                    'percentage' => '13%',
                    'description' => 'Μειωμένος συντελεστής Φ.Π.Α. (Ελληνικά νησιά)',
                    'applies_to' => 'Γενικά προϊόντα σε ελληνικά νησιά'
                ],
                'basic_food' => [
                    'rate' => self::VAT_RATES['reduced_food'],
                    'percentage' => '6%',
                    'description' => 'Υπερμειωμένος συντελεστής Φ.Π.Α.',
                    'applies_to' => 'Βασικά τρόφιμα (ψωμί, γάλα, κρέας, φρούτα, λαχανικά)'
                ],
                'zero_rate' => [
                    'rate' => self::VAT_RATES['zero_rate'],
                    'percentage' => '0%',
                    'description' => 'Μηδενικός συντελεστής Φ.Π.Α.',
                    'applies_to' => 'Εξαγωγές και συγκεκριμένες απαλλαγές'
                ]
            ],
            'island_postcodes' => self::ISLAND_POSTCODES,
            'basic_food_categories' => self::BASIC_FOOD_CATEGORIES,
            'legal_reference' => 'Κώδικας Φ.Π.Α. (Ν. 2859/2000)',
            'last_updated' => '2025-01-01' // Update when VAT rates change
        ];
    }

    /**
     * Generate VAT invoice data for Greek tax compliance
     * 
     * @param Order $order
     * @return array
     */
    public function generateVATInvoiceData(Order $order): array
    {
        try {
            $vatCalculation = $this->calculateOrderVAT($order);
            
            return [
                'invoice_type' => 'retail_receipt', // 'receipt' or 'invoice'
                'invoice_number' => $order->order_number,
                'issue_date' => $order->created_at->format('Y-m-d'),
                'seller' => [
                    'name' => config('app.company_name', 'Dixis Greek Marketplace'),
                    'tax_id' => config('app.company_tax_id'),
                    'address' => config('app.company_address'),
                    'city' => config('app.company_city'),
                    'postcode' => config('app.company_postcode'),
                    'country' => 'GR'
                ],
                'buyer' => [
                    'name' => $order->shipping_name ?? $order->user->name,
                    'address' => $order->shipping_address,
                    'city' => $order->shipping_city,
                    'postcode' => $order->shipping_postcode,
                    'country' => 'GR',
                    'tax_id' => $order->customer_tax_id ?? null
                ],
                'vat_calculation' => $vatCalculation,
                'payment_method' => $order->payment_method ?? 'card',
                'currency' => 'EUR',
                'aade_compliance' => [
                    'mark' => $this->generateAADEMark($order),
                    'uid' => $this->generateAADEUID($order),
                    'qr_code_data' => $this->generateQRCodeData($order, $vatCalculation)
                ]
            ];

        } catch (\Exception $e) {
            Log::error('VAT invoice data generation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Failed to generate VAT invoice data: ' . $e->getMessage());
        }
    }

    /**
     * Determine VAT rate for a product
     * 
     * @param Product $product
     * @param bool $isIsland
     * @return float
     */
    protected function determineVATRate(Product $product, bool $isIsland): float
    {
        // Check if it's a basic food item (6% VAT rate)
        if ($this->isBasicFood($product)) {
            return self::VAT_RATES['reduced_food'];
        }

        // Check for export or special exemptions (0% VAT rate)
        if ($this->isVATExempt($product)) {
            return self::VAT_RATES['zero_rate'];
        }

        // Standard rates: 24% mainland, 13% islands
        return $isIsland 
            ? self::VAT_RATES['standard_islands'] 
            : self::VAT_RATES['standard_mainland'];
    }

    /**
     * Check if location is a Greek island based on postcode
     * 
     * @param string $postcode
     * @return bool
     */
    protected function isGreekIsland(string $postcode): bool
    {
        if (empty($postcode)) {
            return false;
        }

        $postcode = preg_replace('/\D/', '', $postcode); // Keep only digits
        
        foreach (self::ISLAND_POSTCODES as $islandCode) {
            if (strpos($postcode, $islandCode) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if product is basic food (6% VAT rate)
     * 
     * @param Product $product
     * @return bool
     */
    protected function isBasicFood(Product $product): bool
    {
        $categoryName = strtolower($product->category->name ?? '');
        $productName = strtolower($product->name ?? '');
        
        foreach (self::BASIC_FOOD_CATEGORIES as $foodCategory) {
            if (strpos($categoryName, $foodCategory) !== false || 
                strpos($productName, $foodCategory) !== false) {
                return true;
            }
        }

        // Check Greek keywords
        $greekFoodKeywords = [
            'ψωμί', 'αλεύρι', 'γάλα', 'τυρί', 'αυγά', 'κρέας', 'ψάρι',
            'φρούτα', 'λαχανικά', 'ελαιόλαδο', 'μέλι', 'μακαρόνια', 'ρύζι'
        ];

        foreach ($greekFoodKeywords as $keyword) {
            if (strpos($categoryName, $keyword) !== false || 
                strpos($productName, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if product is VAT exempt (0% rate)
     * 
     * @param Product $product
     * @return bool
     */
    protected function isVATExempt(Product $product): bool
    {
        // Add logic for VAT-exempt products (exports, medical, educational, etc.)
        // For now, return false as most products will have VAT
        return false;
    }

    /**
     * Get VAT rate key for breakdown
     * 
     * @param float $vatRate
     * @param bool $isIsland
     * @return string
     */
    protected function getVATRateKey(float $vatRate, bool $isIsland): string
    {
        switch ($vatRate) {
            case self::VAT_RATES['reduced_food']:
                return 'basic_food_6pct';
            case self::VAT_RATES['zero_rate']:
                return 'zero_rate_0pct';
            case self::VAT_RATES['standard_islands']:
                return 'islands_13pct';
            case self::VAT_RATES['standard_mainland']:
                return 'mainland_24pct';
            default:
                return 'other_' . ($vatRate * 100) . 'pct';
        }
    }

    /**
     * Generate AADE (Greek Tax Authority) mark
     * 
     * @param Order $order
     * @return string
     */
    protected function generateAADEMark(Order $order): string
    {
        // Simplified AADE mark generation
        // In production, this would connect to AADE's myDATA system
        return 'AADE-' . $order->order_number . '-' . time();
    }

    /**
     * Generate AADE UID
     * 
     * @param Order $order
     * @return string
     */
    protected function generateAADEUID(Order $order): string
    {
        // Simplified UID generation for AADE compliance
        return 'UID-' . $order->id . '-' . hash('crc32', $order->order_number);
    }

    /**
     * Generate QR code data for Greek tax receipts
     * 
     * @param Order $order
     * @param array $vatCalculation
     * @return string
     */
    protected function generateQRCodeData(Order $order, array $vatCalculation): string
    {
        // QR code data for Greek tax compliance
        $qrData = [
            'invoice' => $order->order_number,
            'date' => $order->created_at->format('Y-m-d'),
            'amount' => $vatCalculation['total_gross'],
            'vat' => $vatCalculation['total_vat'],
            'provider' => config('app.company_tax_id')
        ];

        return base64_encode(json_encode($qrData));
    }
}