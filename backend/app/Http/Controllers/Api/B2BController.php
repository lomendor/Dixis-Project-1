<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessUser;
use App\Models\Quote;
use App\Models\Contract;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class B2BController extends Controller
{
    /**
     * Get B2B dashboard data
     */
    public function dashboard(): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json([
                'error' => 'Business profile not found'
            ], 404);
        }

        $analytics = [
            'current_month' => [
                'orders' => $businessUser->orders()
                    ->whereYear('created_at', now()->year)
                    ->whereMonth('created_at', now()->month)
                    ->count(),
                'total_spent' => $businessUser->orders()
                    ->whereYear('created_at', now()->year)
                    ->whereMonth('created_at', now()->month)
                    ->where('status', 'completed')
                    ->sum('total_amount'),
                'pending_orders' => $businessUser->orders()
                    ->whereIn('status', ['pending', 'confirmed', 'processing'])
                    ->count(),
                'active_quotes' => $businessUser->quotes()
                    ->whereIn('status', ['sent', 'viewed'])
                    ->count()
            ],
            'account_info' => [
                'credit_limit' => $businessUser->credit_limit,
                'available_credit' => $businessUser->getAvailableCredit(),
                'discount_tier' => $businessUser->discount_tier,
                'discount_percentage' => $businessUser->getDiscountPercentage(),
                'payment_terms' => $businessUser->payment_terms,
                'verification_status' => $businessUser->verification_status
            ],
            'recent_activity' => [
                'recent_orders' => $businessUser->orders()
                    ->with(['items.product'])
                    ->latest()
                    ->limit(5)
                    ->get(),
                'recent_quotes' => $businessUser->quotes()
                    ->latest()
                    ->limit(3)
                    ->get()
            ]
        ];

        return response()->json($analytics);
    }

    /**
     * Get B2B products with wholesale pricing
     */
    public function products(Request $request): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser || !$businessUser->canPlaceOrders()) {
            return response()->json([
                'error' => 'Business account not verified or inactive'
            ], 403);
        }

        $query = Product::with(['producer', 'category'])
            ->where('is_active', true)
            ->where('b2b_available', true);

        // Apply filters
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('producer')) {
            $query->where('producer_id', $request->producer);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Minimum order quantity filter
        if ($request->has('min_quantity')) {
            $query->where('min_order_quantity', '<=', $request->min_quantity);
        }

        $products = $query->paginate($request->get('per_page', 20));

        // Apply B2B pricing
        $discountPercentage = $businessUser->getDiscountPercentage();
        
        $products->getCollection()->transform(function ($product) use ($discountPercentage) {
            $product->b2b_price = $product->price * (1 - $discountPercentage / 100);
            $product->discount_percentage = $discountPercentage;
            $product->savings = $product->price - $product->b2b_price;
            return $product;
        });

        return response()->json($products);
    }

    /**
     * Request quote for products
     */
    public function requestQuote(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser || !$businessUser->canPlaceOrders()) {
            return response()->json([
                'error' => 'Business account not verified or inactive'
            ], 403);
        }

        DB::beginTransaction();

        try {
            // Create quote
            $quote = Quote::create([
                'business_user_id' => $businessUser->id,
                'title' => $request->title,
                'description' => $request->description,
                'created_by' => $user->id,
                'status' => Quote::STATUS_DRAFT
            ]);

            // Add quote items
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                
                if (!$product || !$product->b2b_available) {
                    throw new \Exception("Product {$item['product_id']} not available for B2B");
                }

                // Apply B2B pricing
                $unitPrice = $product->price * (1 - $businessUser->getDiscountPercentage() / 100);

                $quote->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'notes' => $item['notes'] ?? null
                ]);
            }

            // Send quote for approval
            $quote->send();

            DB::commit();

            return response()->json([
                'message' => 'Quote request submitted successfully',
                'quote' => $quote->load(['items.product'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'error' => 'Failed to create quote',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get business user quotes
     */
    public function quotes(Request $request): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json([
                'error' => 'Business profile not found'
            ], 404);
        }

        $query = $businessUser->quotes()->with(['items.product']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $quotes = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($quotes);
    }

    /**
     * Get specific quote
     */
    public function getQuote(Quote $quote): JsonResponse
    {
        $user = Auth::user();
        
        if ($quote->businessUser->user_id !== $user->id) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        // Mark as viewed if sent
        $quote->markAsViewed();

        return response()->json([
            'quote' => $quote->load(['items.product', 'businessUser'])
        ]);
    }

    /**
     * Accept quote
     */
    public function acceptQuote(Quote $quote): JsonResponse
    {
        $user = Auth::user();
        
        if ($quote->businessUser->user_id !== $user->id) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        if (!$quote->canBeAccepted()) {
            return response()->json([
                'error' => 'Quote cannot be accepted'
            ], 400);
        }

        $quote->accept();

        return response()->json([
            'message' => 'Quote accepted successfully',
            'quote' => $quote
        ]);
    }

    /**
     * Convert quote to order
     */
    public function convertQuoteToOrder(Quote $quote): JsonResponse
    {
        $user = Auth::user();
        
        if ($quote->businessUser->user_id !== $user->id) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        if (!$quote->canBeConverted()) {
            return response()->json([
                'error' => 'Quote cannot be converted to order'
            ], 400);
        }

        // Check credit limit
        if (!$quote->businessUser->hasSufficientCredit($quote->total_amount)) {
            return response()->json([
                'error' => 'Insufficient credit limit'
            ], 400);
        }

        try {
            $order = $quote->convertToOrder();

            return response()->json([
                'message' => 'Quote converted to order successfully',
                'order' => $order->load(['items.product'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to convert quote to order',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get business user orders
     */
    public function orders(Request $request): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json([
                'error' => 'Business profile not found'
            ], 404);
        }

        $query = $businessUser->orders()->with(['items.product']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $orders = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($orders);
    }

    /**
     * Get business user contracts
     */
    public function contracts(Request $request): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json([
                'error' => 'Business profile not found'
            ], 404);
        }

        $query = $businessUser->contracts()->with(['products.product']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $contracts = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($contracts);
    }

    /**
     * Update business profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'business_name' => 'sometimes|string|max:255',
            'business_type' => 'sometimes|in:restaurant,hotel,catering,retail,wholesale,distributor,other',
            'contact_person' => 'sometimes|string|max:255',
            'contact_phone' => 'sometimes|string|max:20',
            'contact_email' => 'sometimes|email|max:255',
            'website' => 'sometimes|url|max:255',
            'business_address' => 'sometimes|array',
            'billing_address' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json([
                'error' => 'Business profile not found'
            ], 404);
        }

        $businessUser->update($request->only([
            'business_name', 'business_type', 'contact_person',
            'contact_phone', 'contact_email', 'website',
            'business_address', 'billing_address'
        ]));

        return response()->json([
            'message' => 'Profile updated successfully',
            'business_user' => $businessUser
        ]);
    }

    /**
     * Get B2B analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json([
                'error' => 'Business profile not found'
            ], 404);
        }

        $startDate = $request->get('start_date', now()->startOfYear());
        $endDate = $request->get('end_date', now());

        $analytics = [
            'summary' => [
                'total_orders' => $businessUser->orders()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'total_spent' => $businessUser->orders()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->sum('total_amount'),
                'average_order_value' => $businessUser->orders()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->avg('total_amount'),
                'total_savings' => $businessUser->orders()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->sum('discount_amount')
            ],
            'monthly_trends' => $this->getMonthlyTrends($businessUser, $startDate, $endDate),
            'top_products' => $this->getTopProducts($businessUser, $startDate, $endDate),
            'order_status_breakdown' => $this->getOrderStatusBreakdown($businessUser, $startDate, $endDate)
        ];

        return response()->json($analytics);
    }

    /**
     * Get monthly trends
     */
    private function getMonthlyTrends(BusinessUser $businessUser, $startDate, $endDate): array
    {
        return $businessUser->orders()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->selectRaw('
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                COUNT(*) as order_count,
                SUM(total_amount) as total_amount,
                AVG(total_amount) as avg_amount
            ')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    /**
     * Get top products
     */
    private function getTopProducts(BusinessUser $businessUser, $startDate, $endDate): array
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.business_user_id', $businessUser->id)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->selectRaw('
                products.id,
                products.name,
                SUM(order_items.quantity) as total_quantity,
                SUM(order_items.total_price) as total_value,
                COUNT(DISTINCT orders.id) as order_count
            ')
            ->groupBy('products.id', 'products.name')
            ->orderBy('total_value', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }

    /**
     * Get order status breakdown
     */
    private function getOrderStatusBreakdown(BusinessUser $businessUser, $startDate, $endDate): array
    {
        return $businessUser->orders()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, COUNT(*) as count, SUM(total_amount) as total_amount')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
    }
}
