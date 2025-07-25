<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\GreekVATService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VATController extends Controller
{
    protected GreekVATService $vatService;

    public function __construct(GreekVATService $vatService)
    {
        $this->vatService = $vatService;
    }

    /**
     * Get Greek VAT rates summary
     */
    public function getVATRates()
    {
        try {
            $vatRates = $this->vatService->getVATRatesSummary();

            return response()->json([
                'success' => true,
                'vat_rates' => $vatRates,
                'message' => 'Greek VAT rates retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving VAT rates: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving VAT rates: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate VAT for a product
     */
    public function calculateProductVAT(Request $request)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'price' => 'required|numeric|min:0',
            'postcode' => 'sometimes|string|size:5'
        ]);

        try {
            $product = Product::findOrFail($validatedData['product_id']);
            $postcode = $validatedData['postcode'] ?? '';

            $vatCalculation = $this->vatService->calculateProductVAT(
                $product,
                $validatedData['price'],
                $postcode
            );

            return response()->json([
                'success' => true,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category->name ?? 'N/A'
                ],
                'vat_calculation' => $vatCalculation,
                'message' => 'Product VAT calculated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Product VAT calculation error: ' . $e->getMessage(), [
                'product_id' => $validatedData['product_id'] ?? null,
                'price' => $validatedData['price'] ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error calculating product VAT: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate VAT for cart/order items
     */
    public function calculateCartVAT(Request $request)
    {
        $validatedData = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'postcode' => 'sometimes|string|size:5'
        ]);

        try {
            $postcode = $validatedData['postcode'] ?? '';
            $vatBreakdown = [];
            $totalVAT = 0;
            $totalNet = 0;
            $totalGross = 0;

            foreach ($validatedData['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];
                $unitPrice = $item['price'];
                $lineTotal = $unitPrice * $quantity;

                $vatCalculation = $this->vatService->calculateProductVAT(
                    $product,
                    $unitPrice,
                    $postcode
                );

                $lineNetTotal = $vatCalculation['net_price'] * $quantity;
                $lineVATTotal = $vatCalculation['vat_amount'] * $quantity;

                $totalNet += $lineNetTotal;
                $totalVAT += $lineVATTotal;
                $totalGross += $lineTotal;

                // Group by VAT rate
                $vatRateKey = $vatCalculation['vat_rate_percentage'];
                if (!isset($vatBreakdown[$vatRateKey])) {
                    $vatBreakdown[$vatRateKey] = [
                        'rate' => $vatCalculation['vat_rate'],
                        'rate_percentage' => $vatCalculation['vat_rate_percentage'],
                        'net_amount' => 0,
                        'vat_amount' => 0,
                        'gross_amount' => 0,
                        'items' => []
                    ];
                }

                $vatBreakdown[$vatRateKey]['net_amount'] += $lineNetTotal;
                $vatBreakdown[$vatRateKey]['vat_amount'] += $lineVATTotal;
                $vatBreakdown[$vatRateKey]['gross_amount'] += $lineTotal;
                $vatBreakdown[$vatRateKey]['items'][] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                    'net_amount' => $lineNetTotal,
                    'vat_amount' => $lineVATTotal,
                    'is_basic_food' => $vatCalculation['is_basic_food']
                ];
            }

            return response()->json([
                'success' => true,
                'location_type' => strpos($postcode, '70') === 0 || strpos($postcode, '71') === 0 ? 'island' : 'mainland',
                'postcode' => $postcode,
                'summary' => [
                    'total_net' => round($totalNet, 2),
                    'total_vat' => round($totalVAT, 2),
                    'total_gross' => round($totalGross, 2),
                    'items_count' => count($validatedData['items'])
                ],
                'vat_breakdown' => $vatBreakdown,
                'message' => 'Cart VAT calculated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Cart VAT calculation error: ' . $e->getMessage(), [
                'items_count' => count($validatedData['items'] ?? []),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error calculating cart VAT: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get VAT calculation for an order
     */
    public function getOrderVAT(Request $request)
    {
        $validatedData = $request->validate([
            'order_id' => 'required|integer|exists:orders,id'
        ]);

        try {
            $order = Order::with(['items.product.category'])->findOrFail($validatedData['order_id']);

            // Check authorization - order owner or admin
            if ($order->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $vatCalculation = $this->vatService->calculateOrderVAT($order);

            return response()->json([
                'success' => true,
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'total' => $order->total,
                    'created_at' => $order->created_at
                ],
                'vat_calculation' => $vatCalculation,
                'message' => 'Order VAT calculation retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Order VAT calculation error: ' . $e->getMessage(), [
                'order_id' => $validatedData['order_id'],
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving order VAT calculation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate VAT invoice data for an order
     */
    public function generateInvoiceData(Request $request)
    {
        $validatedData = $request->validate([
            'order_id' => 'required|integer|exists:orders,id'
        ]);

        try {
            $order = Order::with(['items.product.category', 'user'])->findOrFail($validatedData['order_id']);

            // Check authorization
            if ($order->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $invoiceData = $this->vatService->generateVATInvoiceData($order);

            return response()->json([
                'success' => true,
                'invoice_data' => $invoiceData,
                'message' => 'VAT invoice data generated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('VAT invoice generation error: ' . $e->getMessage(), [
                'order_id' => $validatedData['order_id'],
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error generating VAT invoice data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if postcode is for Greek island (affects VAT rate)
     */
    public function checkIslandPostcode(Request $request)
    {
        $validatedData = $request->validate([
            'postcode' => 'required|string|size:5'
        ]);

        try {
            $postcode = $validatedData['postcode'];
            $isIsland = $this->isGreekIsland($postcode);
            
            $vatRate = $isIsland ? 0.13 : 0.24;
            $vatRateFood = 0.06; // Same for islands and mainland

            return response()->json([
                'success' => true,
                'postcode' => $postcode,
                'is_island' => $isIsland,
                'location_type' => $isIsland ? 'island' : 'mainland',
                'location_name' => $this->getLocationName($postcode),
                'vat_rates' => [
                    'standard' => [
                        'rate' => $vatRate,
                        'percentage' => ($vatRate * 100) . '%',
                        'description' => $isIsland ? 'Μειωμένος συντελεστής (Νησιά)' : 'Κανονικός συντελεστής (Ηπειρωτική)'
                    ],
                    'basic_food' => [
                        'rate' => $vatRateFood,
                        'percentage' => '6%',
                        'description' => 'Υπερμειωμένος συντελεστής (Βασικά τρόφιμα)'
                    ]
                ],
                'message' => 'Postcode VAT information retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Postcode VAT check error: ' . $e->getMessage(), [
                'postcode' => $validatedData['postcode'],
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error checking postcode VAT information: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if postcode represents a Greek island
     */
    private function isGreekIsland(string $postcode): bool
    {
        $postcode = preg_replace('/\D/', '', $postcode);
        
        $islandPostcodes = [
            '70', '71', '72', '73', '74', // Crete
            '851', '852', '853', '854', '855', // Dodecanese
            '811', '812', '821', '831', // North Aegean
            '28', '29', '491', // Ionian Islands
            '840', '841', '842', '843', '844', '845', '846', '847', '848', '849' // Cyclades
        ];

        foreach ($islandPostcodes as $islandCode) {
            if (strpos($postcode, $islandCode) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get location name from postcode
     */
    private function getLocationName(string $postcode): string
    {
        $firstTwo = substr($postcode, 0, 2);
        
        $locations = [
            '10' => 'Αθήνα Κέντρο',
            '11' => 'Αθήνα Βόρεια',
            '12' => 'Αθήνα Δυτικά',
            '54' => 'Θεσσαλονίκη',
            '70' => 'Κρήτη - Ηράκλειο',
            '71' => 'Κρήτη - Λασίθι',
            '72' => 'Κρήτη - Ρέθυμνο',
            '73' => 'Κρήτη - Χανιά',
            '85' => 'Δωδεκάνησα'
        ];

        return $locations[$firstTwo] ?? 'Ελλάδα';
    }
}