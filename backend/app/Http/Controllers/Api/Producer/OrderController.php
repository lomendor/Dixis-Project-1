<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for the authenticated producer
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $query = Order::whereHas('items', function ($q) use ($producer) {
            $q->whereHas('product', function ($q) use ($producer) {
                $q->where('producer_id', $producer->id);
            });
        });

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Include relationships
        $query->with(['user', 'items' => function ($q) use ($producer) {
            $q->whereHas('product', function ($q) use ($producer) {
                $q->where('producer_id', $producer->id);
            })->with('product');
        }, 'shippingAddress', 'billingAddress']);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $orders = $query->paginate($perPage);

        // Calculate producer-specific totals for each order
        $orders->getCollection()->transform(function ($order) use ($producer) {
            $producerItems = $order->items->filter(function ($item) use ($producer) {
                return $item->product->producer_id === $producer->id;
            });

            $order->producer_total = $producerItems->sum(function ($item) {
                return $item->quantity * $item->price;
            });

            $order->producer_items_count = $producerItems->count();
            
            return $order;
        });

        return response()->json($orders);
    }

    /**
     * Display the specified order
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $order = Order::with([
            'user',
            'items' => function ($q) use ($producer) {
                $q->whereHas('product', function ($q) use ($producer) {
                    $q->where('producer_id', $producer->id);
                })->with('product.images');
            },
            'shippingAddress',
            'billingAddress',
            'payment'
        ])->findOrFail($id);

        // Check if order has items from this producer
        if ($order->items->isEmpty()) {
            return response()->json(['message' => 'Δεν έχετε πρόσβαση σε αυτή την παραγγελία'], 403);
        }

        // Calculate producer-specific totals
        $producerTotal = $order->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });

        $order->producer_total = $producerTotal;
        $order->producer_items_count = $order->items->count();

        // Get order status history (if available)
        $statusHistory = DB::table('order_status_history')
            ->where('order_id', $order->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $order->status_history = $statusHistory;

        return response()->json($order);
    }

    /**
     * Update the status of the order items for this producer
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,ready_for_shipping,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        $order = Order::findOrFail($id);

        // Get items for this producer
        $producerItems = $order->items()->whereHas('product', function ($q) use ($producer) {
            $q->where('producer_id', $producer->id);
        })->get();

        if ($producerItems->isEmpty()) {
            return response()->json(['message' => 'Δεν έχετε πρόσβαση σε αυτή την παραγγελία'], 403);
        }

        // Update status for producer's items
        foreach ($producerItems as $item) {
            $item->status = $validated['status'];
            if (isset($validated['tracking_number'])) {
                $item->tracking_number = $validated['tracking_number'];
            }
            $item->save();
        }

        // Log status change
        DB::table('order_status_history')->insert([
            'order_id' => $order->id,
            'producer_id' => $producer->id,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Check if all items have the same status to update main order status
        $allStatuses = $order->items()->pluck('status')->unique();
        
        if ($allStatuses->count() === 1) {
            $order->status = $allStatuses->first();
            $order->save();
        } elseif ($allStatuses->contains('shipped') && !$allStatuses->contains('pending') && !$allStatuses->contains('processing')) {
            $order->status = 'partially_shipped';
            $order->save();
        }

        // Send notification to customer
        if ($validated['status'] === 'shipped') {
            // Trigger notification for shipment
            $order->user->notify(new \App\Notifications\OrderStatusChanged($order, $validated['status'], $producer->business_name));
        }

        return response()->json([
            'message' => 'Η κατάσταση της παραγγελίας ενημερώθηκε επιτυχώς',
            'order' => $order->load(['items' => function ($q) use ($producer) {
                $q->whereHas('product', function ($q) use ($producer) {
                    $q->where('producer_id', $producer->id);
                })->with('product');
            }])
        ]);
    }

    /**
     * Get order statistics for the producer
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $dateFrom = $request->get('date_from', now()->subMonth());
        $dateTo = $request->get('date_to', now());

        // Get order statistics
        $stats = [
            'total_orders' => Order::whereHas('items', function ($q) use ($producer) {
                $q->whereHas('product', function ($q) use ($producer) {
                    $q->where('producer_id', $producer->id);
                });
            })->whereBetween('created_at', [$dateFrom, $dateTo])->count(),

            'pending_orders' => Order::whereHas('items', function ($q) use ($producer) {
                $q->whereHas('product', function ($q) use ($producer) {
                    $q->where('producer_id', $producer->id);
                })->where('status', 'pending');
            })->whereBetween('created_at', [$dateFrom, $dateTo])->count(),

            'completed_orders' => Order::whereHas('items', function ($q) use ($producer) {
                $q->whereHas('product', function ($q) use ($producer) {
                    $q->where('producer_id', $producer->id);
                })->where('status', 'delivered');
            })->whereBetween('created_at', [$dateFrom, $dateTo])->count(),

            'total_revenue' => OrderItem::whereHas('product', function ($q) use ($producer) {
                $q->where('producer_id', $producer->id);
            })->whereHas('order', function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('created_at', [$dateFrom, $dateTo])
                  ->where('status', '!=', 'cancelled');
            })->sum(DB::raw('quantity * price')),

            'average_order_value' => 0
        ];

        if ($stats['total_orders'] > 0) {
            $stats['average_order_value'] = $stats['total_revenue'] / $stats['total_orders'];
        }

        return response()->json($stats);
    }
}