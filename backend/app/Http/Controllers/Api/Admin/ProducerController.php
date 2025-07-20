<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Producer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProducerController extends Controller
{
    /**
     * Display a listing of the producers.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'search' => 'sometimes|string|max:100',
            'status' => ['sometimes', 'string', Rule::in(['verified', 'pending', 'all'])],
            'region' => 'sometimes|string|max:100',
            'is_featured' => 'sometimes|boolean',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date',
            'has_products' => 'sometimes|boolean',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
            'sort_by' => ['sometimes', 'string', Rule::in(['id', 'business_name', 'created_at', 'products_count'])],
            'sort_direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'include' => 'sometimes|string',
        ]);

        // Parse includes
        $includes = [];
        if ($request->has('include')) {
            $includes = explode(',', $request->include);
        }

        // Build query
        $query = Producer::query();

        // Always include user
        $query->with('user:id,name,email,is_active');

        // Include product count if requested
        if (in_array('product_count', $includes)) {
            $query->withCount('products');
        }

        // Apply filters
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('tax_id', 'like', "%{$search}%")
                  ->orWhere('region', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'verified') {
                $query->where('verified', true);
            } elseif ($request->status === 'pending') {
                $query->where('verified', false);
            }
        }

        if ($request->has('region') && $request->region) {
            $query->where('region', $request->region);
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->is_featured);
        }

        // Date range filters
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by producers with/without products
        if ($request->has('has_products')) {
            if ($request->has_products) {
                $query->has('products');
            } else {
                $query->doesntHave('products');
            }
        }

        // Apply sorting
        $sortBy = $request->sort_by ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';

        // Special handling for products_count sorting
        if ($sortBy === 'products_count') {
            $query->withCount('products')
                  ->orderBy('products_count', $sortDirection);
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $producers = $query->paginate($perPage);

        // Add regions list for filtering
        $regions = Producer::select('region')
            ->whereNotNull('region')
            ->distinct()
            ->pluck('region');

        return response()->json([
            'data' => $producers->items(),
            'current_page' => $producers->currentPage(),
            'last_page' => $producers->lastPage(),
            'per_page' => $producers->perPage(),
            'total' => $producers->total(),
            'regions' => $regions,
        ]);
    }

    /**
     * Display the specified producer.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $producer = Producer::with([
            'user:id,name,email,phone,is_active,created_at,email_verified_at',
            'products:id,producer_id,name,price,stock,is_active,created_at,updated_at',
            'documents',
        ])->withCount('products')->findOrFail($id);

        // Get product statistics
        $activeProductsCount = $producer->products->where('is_active', true)->count();
        $inactiveProductsCount = $producer->products->where('is_active', false)->count();

        // Get sales statistics
        $salesStats = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('products.producer_id', $id)
            ->where('orders.status', '!=', 'cancelled')
            ->select(
                DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                DB::raw('SUM(order_items.quantity) as total_items_sold'),
                DB::raw('SUM(order_items.subtotal) as total_sales'),
                DB::raw('AVG(order_items.subtotal) as average_order_value')
            )
            ->first();

        // Get recent orders
        $recentOrders = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.producer_id', $id)
            ->select(
                'orders.id',
                'orders.order_number',
                'orders.user_id',
                'orders.status',
                'orders.created_at',
                DB::raw('SUM(order_items.subtotal) as producer_total')
            )
            ->groupBy('orders.id', 'orders.order_number', 'orders.user_id', 'orders.status', 'orders.created_at')
            ->orderBy('orders.created_at', 'desc')
            ->limit(10)
            ->get();

        // Get user information for orders
        $userIds = $recentOrders->pluck('user_id')->unique()->toArray();
        $users = User::whereIn('id', $userIds)->get(['id', 'name', 'email'])->keyBy('id');

        // Add user information to orders
        foreach ($recentOrders as $order) {
            $order->user = $users[$order->user_id] ?? null;
        }

        // Add statistics to response
        $producer->active_products_count = $activeProductsCount;
        $producer->inactive_products_count = $inactiveProductsCount;
        $producer->sales_stats = $salesStats;
        $producer->recent_orders = $recentOrders;

        return response()->json($producer);
    }

    /**
     * Update the specified producer.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $producer = Producer::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'tax_id' => ['sometimes', 'string', 'max:20', Rule::unique('producers')->ignore($producer->id)],
            'tax_office' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'address' => 'sometimes|nullable|string|max:255',
            'city' => 'sometimes|nullable|string|max:100',
            'postal_code' => 'sometimes|nullable|string|max:20',
            'region' => 'sometimes|nullable|string|max:100',
            'website' => 'sometimes|nullable|url|max:255',
            'social_media' => 'sometimes|nullable|array',
            'bio' => 'sometimes|nullable|string',
            'verified' => 'sometimes|boolean',
        ]);

        // Update producer
        $producer->update($validated);

        return response()->json([
            'message' => 'Producer updated successfully',
            'producer' => $producer->fresh(['user:id,name,email,phone']),
        ]);
    }

    /**
     * Verify a producer.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify($id)
    {
        $producer = Producer::with('user')->findOrFail($id);
        $producer->verified = true;
        $producer->verification_date = now();
        $producer->rejection_reason = null; // Clear any previous rejection reason
        $producer->save();

        // Send notification to producer
        try {
            // Create a notification record
            $notification = new \App\Models\Notification([
                'user_id' => $producer->user_id,
                'title' => 'Ο λογαριασμός σας επαληθεύτηκε',
                'message' => 'Συγχαρητήρια! Ο λογαριασμός σας ως παραγωγός έχει επαληθευτεί. Τώρα μπορείτε να προσθέσετε προϊόντα και να ξεκινήσετε τις πωλήσεις.',
                'type' => 'account_verified',
                'is_read' => false,
                'data' => json_encode(['producer_id' => $producer->id])
            ]);
            $notification->save();

            // Send email notification
            // This would typically use Laravel's Mail facade
            // Mail::to($producer->user->email)->send(new ProducerVerifiedMail($producer));
        } catch (\Exception $e) {
            // Log the error but don't fail the verification process
            \Log::error('Failed to send producer verification notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Producer verified successfully',
            'producer' => $producer->fresh(['user']),
        ]);
    }

    /**
     * Reject a producer.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $producer = Producer::with('user')->findOrFail($id);

        // We don't delete the producer, just keep it unverified
        // and store the rejection reason for future reference
        $producer->verified = false;
        $producer->rejection_reason = $request->reason;
        $producer->rejection_date = now();
        $producer->save();

        // Send notification to producer with rejection reason
        try {
            // Create a notification record
            $notification = new \App\Models\Notification([
                'user_id' => $producer->user_id,
                'title' => 'Η επαλήθευση του λογαριασμού σας απορρίφθηκε',
                'message' => 'Δυστυχώς, η επαλήθευση του λογαριασμού σας απορρίφθηκε. Αιτία: ' . $request->reason,
                'type' => 'account_rejected',
                'is_read' => false,
                'data' => json_encode([
                    'producer_id' => $producer->id,
                    'rejection_reason' => $request->reason
                ])
            ]);
            $notification->save();

            // Send email notification
            // This would typically use Laravel's Mail facade
            // Mail::to($producer->user->email)->send(new ProducerRejectedMail($producer, $request->reason));
        } catch (\Exception $e) {
            // Log the error but don't fail the rejection process
            \Log::error('Failed to send producer rejection notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Producer rejected successfully',
            'producer' => $producer->fresh(['user']),
        ]);
    }

    /**
     * Get pending producers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPendingProducers(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'search' => 'sometimes|string|max:100',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
            'sort_by' => ['sometimes', 'string', Rule::in(['id', 'business_name', 'created_at'])],
            'sort_direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
        ]);

        // Build query
        $query = Producer::with(['user:id,name,email,phone,is_active', 'documents'])
            ->where('verified', false);

        // Apply search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('tax_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Apply sorting
        $sortBy = $request->sort_by ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';
        $query->orderBy($sortBy, $sortDirection);

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $pendingProducers = $query->paginate($perPage);

        // Add additional information
        $pendingProducers->getCollection()->transform(function ($producer) {
            // Check if producer has submitted all required documents
            $requiredDocuments = ['identity_document', 'tax_document', 'bank_account_document'];
            $submittedDocuments = $producer->documents->pluck('type')->toArray();
            $producer->has_all_documents = count(array_intersect($requiredDocuments, $submittedDocuments)) === count($requiredDocuments);

            // Add time since application
            $producer->days_pending = now()->diffInDays($producer->created_at);

            return $producer;
        });

        return response()->json($pendingProducers);
    }

    /**
     * Get producer statistics.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats($id)
    {
        $producer = Producer::findOrFail($id);

        // Get product count
        $productCount = $producer->products()->count();
        $activeProductCount = $producer->products()->where('is_active', true)->count();

        // Get order count and total sales
        $orderItems = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.producer_id', $producer->id)
            ->where('orders.status', '!=', 'cancelled')
            ->select(
                DB::raw('COUNT(DISTINCT orders.id) as order_count'),
                DB::raw('SUM(order_items.subtotal) as total_sales')
            )
            ->first();

        $orderCount = $orderItems->order_count ?? 0;
        $totalSales = $orderItems->total_sales ?? 0;

        // Get recent orders
        $recentOrders = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->where('order_items.producer_id', $producer->id)
            ->select(
                'orders.id',
                'orders.order_number',
                'orders.status',
                'orders.created_at',
                DB::raw('SUM(order_items.subtotal) as total')
            )
            ->groupBy('orders.id', 'orders.order_number', 'orders.status', 'orders.created_at')
            ->orderBy('orders.created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'product_count' => $productCount,
            'active_product_count' => $activeProductCount,
            'order_count' => $orderCount,
            'total_sales' => $totalSales,
            'recent_orders' => $recentOrders,
        ]);
    }
}
