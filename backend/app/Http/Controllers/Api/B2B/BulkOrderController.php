<?php

namespace App\Http\Controllers\Api\B2B;

use App\Http\Controllers\Controller;
use App\Models\BusinessUser;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\B2B\BulkOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BulkOrderController extends Controller
{
    protected BulkOrderService $bulkOrderService;

    public function __construct(BulkOrderService $bulkOrderService)
    {
        $this->bulkOrderService = $bulkOrderService;
    }

    /**
     * Create bulk order from CSV upload
     */
    public function createFromCsv(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
            'delivery_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser || !$businessUser->canPlaceOrders()) {
            return response()->json(['error' => 'Business account not verified'], 403);
        }

        try {
            $result = $this->bulkOrderService->createFromCsv(
                $request->file('csv_file'),
                $businessUser,
                [
                    'delivery_date' => $request->delivery_date,
                    'notes' => $request->notes
                ]
            );

            return response()->json($result, 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process bulk order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create bulk order from product list
     */
    public function createFromProducts(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'products' => 'required|array|min:1|max:100',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1|max:10000',
            'products.*.custom_price' => 'nullable|numeric|min:0',
            'products.*.notes' => 'nullable|string|max:255',
            'delivery_date' => 'nullable|date|after:today',
            'priority' => 'in:normal,high,urgent',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser || !$businessUser->canPlaceOrders()) {
            return response()->json(['error' => 'Business account not verified'], 403);
        }

        try {
            $result = $this->bulkOrderService->createFromProducts(
                $request->products,
                $businessUser,
                [
                    'delivery_date' => $request->delivery_date,
                    'priority' => $request->get('priority', 'normal'),
                    'notes' => $request->notes
                ]
            );

            return response()->json($result, 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create bulk order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bulk order template
     */
    public function getTemplate(): JsonResponse
    {
        $template = [
            'headers' => [
                'product_sku',
                'product_name', 
                'quantity',
                'custom_price',
                'notes'
            ],
            'example_rows' => [
                [
                    'product_sku' => 'PROD-001',
                    'product_name' => 'Organic Tomatoes',
                    'quantity' => '50',
                    'custom_price' => '2.50',
                    'notes' => 'Extra ripe'
                ],
                [
                    'product_sku' => 'PROD-002',
                    'product_name' => 'Fresh Basil',
                    'quantity' => '25',
                    'custom_price' => '',
                    'notes' => ''
                ]
            ],
            'instructions' => [
                'Use the exact column headers shown above',
                'product_sku or product_name is required (SKU takes priority)',
                'quantity must be a positive integer',
                'custom_price is optional (leave empty for standard B2B pricing)',
                'notes are optional',
                'Maximum 100 products per bulk order',
                'File must be in CSV format'
            ]
        ];

        return response()->json($template);
    }

    /**
     * Validate bulk order before submission
     */
    public function validateBulkOrder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'products' => 'required|array|min:1|max:100',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json(['error' => 'Business profile not found'], 404);
        }

        try {
            $validation = $this->bulkOrderService->validateBulkOrder(
                $request->products,
                $businessUser
            );

            return response()->json($validation);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Validation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bulk order history
     */
    public function getBulkOrders(Request $request): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json(['error' => 'Business profile not found'], 404);
        }

        $query = Order::where('business_user_id', $businessUser->id)
            ->where('is_bulk_order', true)
            ->with(['items.product', 'bulkOrderDetails'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->paginate($request->get('per_page', 15));

        return response()->json($orders);
    }

    /**
     * Get bulk order statistics
     */
    public function getBulkOrderStats(): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json(['error' => 'Business profile not found'], 404);
        }

        $stats = [
            'total_bulk_orders' => Order::where('business_user_id', $businessUser->id)
                ->where('is_bulk_order', true)->count(),
            'this_month_orders' => Order::where('business_user_id', $businessUser->id)
                ->where('is_bulk_order', true)
                ->whereMonth('created_at', now()->month)->count(),
            'total_items_ordered' => OrderItem::whereHas('order', function($query) use ($businessUser) {
                $query->where('business_user_id', $businessUser->id)
                      ->where('is_bulk_order', true);
            })->sum('quantity'),
            'total_value' => Order::where('business_user_id', $businessUser->id)
                ->where('is_bulk_order', true)
                ->where('status', '!=', 'cancelled')
                ->sum('total_amount'),
            'average_order_value' => Order::where('business_user_id', $businessUser->id)
                ->where('is_bulk_order', true)
                ->where('status', '!=', 'cancelled')
                ->avg('total_amount'),
            'pending_orders' => Order::where('business_user_id', $businessUser->id)
                ->where('is_bulk_order', true)
                ->where('status', 'pending')->count()
        ];

        return response()->json($stats);
    }
}