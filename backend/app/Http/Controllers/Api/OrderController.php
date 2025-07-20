<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Address;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Notifications\OrderConfirmation;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * The order service instance.
     *
     * @var OrderService
     */
    protected $orderService;

    /**
     * Create a new controller instance.
     *
     * @param OrderService $orderService
     * @return void
     */
    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Display a listing of the authenticated user's orders.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $filters = $request->only(['status', 'date_from', 'date_to', 'per_page']);
        $orders = $this->orderService->getUserOrders($user, $filters);

        return response()->json($orders);
    }

    /**
     * Store a newly created order in storage (Checkout).
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Validate the request data (frontend format)
        $validatedData = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unitPrice' => 'required|numeric|min:0',
            'shippingAddress' => 'required|array',
            'shippingAddress.firstName' => 'required|string|max:255',
            'shippingAddress.lastName' => 'required|string|max:255',
            'shippingAddress.addressLine1' => 'required|string|max:255',
            'shippingAddress.city' => 'required|string|max:255',
            'shippingAddress.postalCode' => 'required|string|max:20',
            'shippingAddress.country' => 'required|string|max:255',
            'shippingAddress.phone' => 'nullable|string|max:20',
            'billingAddress' => 'required|array',
            'billingAddress.firstName' => 'required|string|max:255',
            'billingAddress.lastName' => 'required|string|max:255',
            'billingAddress.addressLine1' => 'required|string|max:255',
            'billingAddress.city' => 'required|string|max:255',
            'billingAddress.postalCode' => 'required|string|max:20',
            'billingAddress.country' => 'required|string|max:255',
            'paymentMethod' => 'required|string|in:credit_card,debit_card,paypal,cash_on_delivery,bank_transfer',
            'shippingMethod' => 'required|string|in:standard,express,overnight,pickup,same_day',
        ]);

        try {
            $order = $this->orderService->createOrderFromFrontend($user, $validatedData);
            return response()->json($order, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Order creation failed: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified order for the authenticated user.
     */
    public function show(Order $order) // Route model binding by ID
    {
        // Authorization: Ensure the order belongs to the authenticated user
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($order->load([
            'items.product:id,name,slug,main_image,price,discount_price',
            'items.producer:id,business_name',
            'shippingAddress',
            'billingAddress'
        ]));
    }

    /**
     * Display a listing of orders containing items from the authenticated producer.
     */
    public function getProducerOrders(Request $request)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $filters = $request->only(['status', 'date_from', 'date_to', 'per_page']);
        $orders = $this->orderService->getProducerOrders($user, $filters);

        return response()->json($orders);
    }

    /**
     * Display the specified order for the authenticated producer.
     */
    public function getProducerOrderDetails(Request $request, $orderId)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $order = $this->orderService->getProducerOrderDetails($user, $orderId);

        if (!$order) {
            return response()->json(['message' => 'Order not found or does not contain your products.'], 404);
        }

        return response()->json($order);
    }


    /**
     * Update the order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        // Check if the user is authorized to update the order status
        if (Auth::user()->hasRole('admin') ||
            (Auth::user()->hasRole('producer') && $order->items()->where('producer_id', Auth::user()->producer->id)->exists())) {

            $validatedData = $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled,refunded',
            ]);

            try {
                $updatedOrder = $this->orderService->updateOrderStatus($order, $validatedData['status']);
                return response()->json($updatedOrder);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Failed to update order status: ' . $e->getMessage()], 400);
            }
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Cancel an order (by customer).
     */
    public function cancelOrder(Order $order)
    {
        // Check if the user is authorized to cancel the order
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if the order can be cancelled (only pending orders can be cancelled)
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Only pending orders can be cancelled'], 400);
        }

        try {
            $updatedOrder = $this->orderService->updateOrderStatus($order, 'cancelled');
            return response()->json($updatedOrder);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to cancel order: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Resend order confirmation email
     */
    public function resendConfirmation(Order $order)
    {
        // Check if the user is authorized to resend email for this order
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Send the confirmation email
            $order->user->notify(new OrderConfirmation($order));

            Log::info('Order confirmation email resent', [
                'order_id' => $order->id,
                'user_id' => $order->user->id,
                'email' => $order->user->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email επιβεβαίωσης στάλθηκε επιτυχώς'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to resend order confirmation email', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Σφάλμα κατά την αποστολή email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get email status for an order
     */
    public function getEmailStatus(Order $order)
    {
        // Check if the user is authorized to view email status for this order
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Get notifications from database
            $notifications = $order->user->notifications()
                ->where('type', 'App\Notifications\OrderConfirmation')
                ->where('data->order_id', $order->id)
                ->get();

            $emails = $notifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'orderId' => $notification->data['order_id'] ?? null,
                    'type' => 'order_confirmation',
                    'status' => $notification->read_at ? 'delivered' : 'sent',
                    'sentAt' => $notification->created_at->toISOString(),
                    'deliveredAt' => $notification->read_at ? $notification->read_at->toISOString() : null,
                    'error' => null
                ];
            });

            return response()->json([
                'emails' => $emails
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get email status', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'emails' => []
            ]);
        }
    }

    /**
     * Generate email preview (for testing/admin purposes)
     */
    public function getEmailPreview(Order $order, Request $request)
    {
        // Check if the user is authorized to view email preview for this order
        if ($order->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $type = $request->get('type', 'order_confirmation');

        try {
            if ($type === 'order_confirmation') {
                $notification = new OrderConfirmation($order);
                $mailMessage = $notification->toMail($order->user);

                // Generate HTML preview
                $html = view('emails.order-confirmation', [
                    'order' => $order,
                    'user' => $order->user,
                    'paymentMethod' => $this->getPaymentMethodText($order->payment_method),
                    'shippingMethod' => $this->getShippingMethodText($order->shipping_method),
                ])->render();

                return response()->json([
                    'html' => $html,
                    'subject' => 'Επιβεβαίωση Παραγγελίας #' . $order->order_number
                ]);
            }

            return response()->json(['message' => 'Unsupported email type'], 400);
        } catch (\Exception $e) {
            Log::error('Failed to generate email preview', [
                'order_id' => $order->id,
                'type' => $type,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Σφάλμα κατά τη δημιουργία προεπισκόπησης email'
            ], 500);
        }
    }

    /**
     * Get payment method text for display
     */
    private function getPaymentMethodText($method)
    {
        $methods = [
            'cash_on_delivery' => 'Αντικαταβολή',
            'stripe' => 'Πιστωτική/Χρεωστική Κάρτα',
            'bank_transfer' => 'Τραπεζική Μεταφορά',
            'paypal' => 'PayPal'
        ];
        return $methods[$method] ?? $method;
    }

    /**
     * Get shipping method text for display
     */
    private function getShippingMethodText($method)
    {
        $methods = [
            'standard' => 'Κανονική Αποστολή',
            'express' => 'Ταχεία Αποστολή',
            'pickup' => 'Παραλαβή από Κατάστημα',
            'courier' => 'Courier'
        ];
        return $methods[$method] ?? $method;
    }
}
