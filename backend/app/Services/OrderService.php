<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Address;
use App\Models\DeliveryMethod;
use App\Services\NotificationService;
use App\Services\PaymentService;
use App\Services\CommissionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService
{
    /**
     * The notification service instance.
     *
     * @var NotificationService
     */
    protected $notificationService;

    /**
     * The payment service instance.
     *
     * @var PaymentService
     */
    protected $paymentService;

    /**
     * The commission service instance.
     *
     * @var CommissionService
     */
    protected $commissionService;

    /**
     * Create a new service instance.
     *
     * @param NotificationService $notificationService
     * @param PaymentService $paymentService
     * @param CommissionService $commissionService
     * @return void
     */
    public function __construct(NotificationService $notificationService, PaymentService $paymentService, CommissionService $commissionService)
    {
        $this->notificationService = $notificationService;
        $this->paymentService = $paymentService;
        $this->commissionService = $commissionService;
    }
    /**
     * Create a new order from frontend data (direct checkout)
     *
     * @param User $user
     * @param array $orderData
     * @return Order
     */
    public function createOrderFromFrontend(User $user, array $orderData): Order
    {
        return DB::transaction(function () use ($user, $orderData) {
            // Create or get addresses
            $shippingAddress = $this->createOrGetAddress($user, $orderData['shippingAddress'], 'shipping');
            $billingAddress = $this->createOrGetAddress($user, $orderData['billingAddress'], 'billing');

            // Calculate order totals
            $subtotal = 0;
            $orderItems = [];

            foreach ($orderData['items'] as $item) {
                $product = Product::findOrFail($item['productId']);

                // Check if product is active
                if (!$product->is_active) {
                    throw new \Exception("Product '{$product->name}' is no longer available");
                }

                // Check if there's enough stock
                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Not enough stock for product '{$product->name}'");
                }

                // Use the price from the request (frontend calculated)
                $price = $item['unitPrice'];
                $itemSubtotal = $price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'producer_id' => $product->producer_id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'subtotal' => $itemSubtotal,
                ];

                // Reduce product stock
                $product->stock_quantity -= $item['quantity'];
                $product->save();
            }

            // Calculate shipping cost based on method
            $shippingCost = $this->calculateShippingCost($orderData['shippingMethod']);

            // Calculate tax (24% VAT for Greece)
            $taxRate = 0.24;
            $taxAmount = $subtotal * $taxRate;

            // Calculate total
            $total = $subtotal + $shippingCost + $taxAmount;

            // Create the order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'shipping_address_id' => $shippingAddress->id,
                'billing_address_id' => $billingAddress->id,
                'shipping_method' => $orderData['shippingMethod'],
                'shipping_cost' => $shippingCost,
                'payment_method' => $orderData['paymentMethod'],
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $total,
            ]);

            // Create order items
            foreach ($orderItems as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'producer_id' => $itemData['producer_id'],
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                    'subtotal' => $itemData['subtotal'],
                ]);
            }

            // Send notifications
            $this->notificationService->notifyNewOrder($order);

            // Return the created order with relationships
            return $order->fresh(['items.product', 'shippingAddress', 'billingAddress']);
        });
    }

    /**
     * Create a new order from cart
     *
     * @param User $user
     * @param array $orderData
     * @return Order
     */
    public function createOrder(User $user, array $orderData): Order
    {
        // Start a database transaction
        return DB::transaction(function () use ($user, $orderData) {
            // Get the user's cart
            $cart = Cart::where('user_id', $user->id)->first();

            if (!$cart || !$cart->items()->exists()) {
                throw new \Exception('Cart is empty');
            }

            // Validate shipping and billing addresses
            $shippingAddress = Address::where('id', $orderData['shipping_address_id'])
                                     ->where('user_id', $user->id)
                                     ->firstOrFail();

            $billingAddress = Address::where('id', $orderData['billing_address_id'])
                                    ->where('user_id', $user->id)
                                    ->firstOrFail();

            // Validate shipping method
            $shippingMethod = DeliveryMethod::where('code', $orderData['shipping_method_code'])
                                           ->firstOrFail();

            // Calculate order totals
            $subtotal = 0;
            $items = [];

            foreach ($cart->items as $cartItem) {
                $product = Product::findOrFail($cartItem->product_id);

                // Check if product is active
                if (!$product->is_active) {
                    throw new \Exception("Product '{$product->name}' is no longer available");
                }

                // Check if there's enough stock
                if ($product->stock < $cartItem->quantity) {
                    throw new \Exception("Not enough stock for product '{$product->name}'");
                }

                // Get the current price (use discount_price if available)
                $price = $product->discount_price ?? $product->price;

                // Calculate item subtotal
                $itemSubtotal = $price * $cartItem->quantity;
                $subtotal += $itemSubtotal;

                // Prepare order item data
                $items[] = [
                    'product_id' => $product->id,
                    'quantity' => $cartItem->quantity,
                    'price' => $price,
                    'attributes' => $cartItem->attributes,
                    'subtotal' => $itemSubtotal,
                ];

                // Reduce product stock
                $product->stock -= $cartItem->quantity;
                $product->save();
            }

            // Calculate shipping cost
            $shippingCost = $orderData['shipping_cost'] ?? $shippingMethod->cost;

            // Calculate tax (if applicable)
            $taxRate = 0.24; // 24% VAT for Greece
            $taxAmount = $subtotal * $taxRate;

            // Calculate total
            $total = $subtotal + $shippingCost + $taxAmount;

            // Create the order
            $order = new Order([
                'user_id' => $user->id,
                'status' => 'pending',
                'shipping_address_id' => $shippingAddress->id,
                'billing_address_id' => $billingAddress->id,
                'shipping_cost' => $shippingCost,
                'payment_method' => $orderData['payment_method'],
                'tax_amount' => $taxAmount,
                'total_amount' => $total,
                'notes' => $orderData['notes'] ?? null,
            ]);

            $order->save();

            // Create order items
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);
                $orderItem = new OrderItem([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'producer_id' => $product->producer_id,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                ]);

                $orderItem->save();
            }

            // Clear the cart
            $cart->items()->delete();

            // Create notification for new order
            $this->notificationService->notifyNewOrder($order);

            // Create payment for the order
            if ($orderData['payment_method'] !== 'stripe') {
                // For non-Stripe payments, create a payment record immediately
                $this->paymentService->createPayment($order, $orderData['payment_method']);
            }

            // Return the created order
            return $order->fresh(['items.product', 'shippingAddress', 'billingAddress', 'payments']);
        });
    }

    /**
     * Create or get address for user
     *
     * @param User $user
     * @param array $addressData
     * @param string $type
     * @return Address
     */
    private function createOrGetAddress(User $user, array $addressData, string $type): Address
    {
        // Check if address already exists for user
        $fullName = $addressData['firstName'] . ' ' . $addressData['lastName'];
        $existingAddress = Address::where('user_id', $user->id)
            ->where('name', $fullName)
            ->where('address_line_1', $addressData['addressLine1'])
            ->where('city', $addressData['city'])
            ->where('postal_code', $addressData['postalCode'])
            ->where('country', $addressData['country'])
            ->first();

        if ($existingAddress) {
            return $existingAddress;
        }

        // Create new address
        return Address::create([
            'user_id' => $user->id,
            'name' => $addressData['firstName'] . ' ' . $addressData['lastName'],
            'address_line_1' => $addressData['addressLine1'],
            'address_line_2' => $addressData['addressLine2'] ?? null,
            'city' => $addressData['city'],
            'region' => $addressData['state'] ?? null,
            'postal_code' => $addressData['postalCode'],
            'country' => $addressData['country'],
            'phone' => $addressData['phone'] ?? null,
            'is_default_shipping' => $type === 'shipping',
            'is_default_billing' => $type === 'billing',
        ]);
    }

    /**
     * Calculate shipping cost based on method
     *
     * @param string $shippingMethod
     * @return float
     */
    private function calculateShippingCost(string $shippingMethod): float
    {
        $costs = [
            'standard' => 5.00,
            'express' => 10.00,
            'overnight' => 20.00,
            'pickup' => 0.00,
            'same_day' => 15.00,
        ];

        return $costs[$shippingMethod] ?? 5.00;
    }

    /**
     * Generate a unique order number
     *
     * @return string
     */
    private function generateOrderNumber(): string
    {
        $prefix = 'DX';
        $timestamp = now()->format('YmdHis');
        $random = str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);

        return $prefix . $timestamp . $random;
    }

    /**
     * Update order status
     *
     * @param Order $order
     * @param string $status
     * @return Order
     */
    public function updateOrderStatus(Order $order, string $status): Order
    {
        $allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

        if (!in_array($status, $allowedStatuses)) {
            throw new \Exception('Invalid order status');
        }

        $oldStatus = $order->status;
        $order->status = $status;
        $order->save();

        // Send notification to user about order status change
        $this->notificationService->notifyOrderStatusChanged($order, $oldStatus, $status);

        return $order;
    }

    /**
     * Process a payment for an order
     *
     * @param Order $order
     * @param string $paymentMethod
     * @param array $paymentData
     * @return Payment
     */
    public function processPayment(Order $order, string $paymentMethod, array $paymentData = []): Payment
    {
        return $this->paymentService->createPayment($order, $paymentMethod, $paymentData);
    }

    /**
     * Confirm a Stripe payment
     *
     * @param string $paymentIntentId
     * @return Payment
     */
    public function confirmStripePayment(string $paymentIntentId): Payment
    {
        return $this->paymentService->confirmStripePayment($paymentIntentId);
    }

    /**
     * Get orders for a user
     *
     * @param User $user
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getUserOrders(User $user, array $filters = [])
    {
        $query = Order::where('user_id', $user->id);

        // Apply filters
        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from']) && $filters['date_from']) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to']) && $filters['date_to']) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Order by created_at desc
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $perPage = $filters['per_page'] ?? 10;

        return $query->paginate($perPage);
    }

    /**
     * Get orders for a producer
     *
     * @param User $producer
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getProducerOrders(User $producer, array $filters = [])
    {
        // Check if producer exists
        if (!$producer->producer) {
            return collect([]);
        }

        // Get producer's products
        $productIds = $producer->producer->products()->pluck('id')->toArray();

        if (empty($productIds)) {
            // Return empty paginated result instead of collection
            return new \Illuminate\Pagination\LengthAwarePaginator(
                [], // empty data
                0,  // total items
                10, // per page
                1,  // current page
                ['path' => request()->url()]
            );
        }

        // Get orders containing producer's products
        $query = Order::whereHas('items', function ($query) use ($productIds) {
            $query->whereIn('product_id', $productIds);
        });

        // Apply filters
        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from']) && $filters['date_from']) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to']) && $filters['date_to']) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Order by created_at desc
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $perPage = $filters['per_page'] ?? 10;

        $orders = $query->with(['items' => function ($query) use ($productIds) {
            $query->whereIn('product_id', $productIds)->with('product:id,name,slug,main_image');
        }, 'user:id,name,email', 'shippingAddress'])->paginate($perPage);

        // Calculate total for producer for each order
        $orders->getCollection()->transform(function ($order) {
            $order->total_for_producer = $order->items->sum('subtotal');
            return $order;
        });

        return $orders;
    }

    /**
     * Get order details for a producer
     *
     * @param User $producer
     * @param int $orderId
     * @return Order|null
     */
    public function getProducerOrderDetails(User $producer, int $orderId)
    {
        // Check if producer exists
        if (!$producer->producer) {
            return null;
        }

        // Get producer's products
        $productIds = $producer->producer->products()->pluck('id')->toArray();

        if (empty($productIds)) {
            return null;
        }

        // Get the order if it contains producer's products
        $order = Order::whereHas('items', function ($query) use ($productIds) {
            $query->whereIn('product_id', $productIds);
        })->where('id', $orderId)->with([
            'items' => function ($query) use ($productIds) {
                $query->whereIn('product_id', $productIds)->with('product');
            },
            'user:id,name,email',
            'shippingAddress'
        ])->first();

        if (!$order) {
            return null;
        }

        // Calculate total for producer
        $totalForProducer = 0;
        $totalCommission = 0;

        foreach ($order->items as $item) {
            $totalForProducer += $item->subtotal;

            // Calculate commission if product belongs to this producer
            if ($item->product && $item->product->producer_id === $producer->producer->id) {
                $commissionRate = $this->commissionService->getProducerCommissionRate($producer->producer);
                $commission = $this->commissionService->calculateCommission($item->subtotal, $commissionRate);
                $totalCommission += $commission;
            }
        }

        $order->total_for_producer = $totalForProducer;
        $order->total_commission = $totalCommission;
        $order->net_payout = $totalForProducer - $totalCommission;

        return $order;
    }
}
