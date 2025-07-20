<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Get a consumer user
$consumer = User::where('role', 'consumer')->first();

if (!$consumer) {
    // Create a consumer if none exists
    $consumer = new User();
    $consumer->name = "Test Consumer";
    $consumer->email = "consumer@dixis.gr";
    $consumer->password = bcrypt("password");
    $consumer->role = "consumer";
    $consumer->email_verified_at = now();
    $consumer->save();

    echo "Created consumer user: " . $consumer->name . " (ID: " . $consumer->id . ")\n";
} else {
    echo "Using existing consumer: " . $consumer->name . " (ID: " . $consumer->id . ")\n";
}

// Create a shipping address for the consumer
$address = Address::where('user_id', $consumer->id)->first();

if (!$address) {
    $address = new Address();
    $address->user_id = $consumer->id;
    $address->name = "Shipping Address";
    $address->address_line_1 = "Λεωφόρος Αλεξάνδρας 123";
    $address->address_line_2 = "";
    $address->city = "Αθήνα";
    $address->postal_code = "11521";
    $address->region = "Αττική";
    $address->country = "Ελλάδα";
    $address->phone = "2101234567";
    $address->is_default_shipping = true;
    $address->is_default_billing = true;
    $address->save();

    echo "Created address for consumer\n";
} else {
    echo "Using existing address for consumer\n";
}

// Get products
$products = Product::all();

if ($products->count() == 0) {
    echo "No products found. Please add products first.\n";
    exit;
}

echo "Found " . $products->count() . " products\n";

// Create orders with different statuses
$statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

// Create orders for the last 6 months
for ($month = 5; $month >= 0; $month--) {
    $date = Carbon::now()->subMonths($month);

    // Create 2-4 orders per month
    $numOrders = rand(2, 4);

    echo "Creating " . $numOrders . " orders for " . $date->format('F Y') . "\n";

    for ($i = 0; $i < $numOrders; $i++) {
        // Create order
        $order = new Order();
        $order->user_id = $consumer->id;
        $order->business_id = null;
        $order->status = $statuses[array_rand($statuses)];
        $order->total_amount = 0; // Will be calculated based on items
        $order->shipping_cost = 5.00;
        $order->tax_amount = 0; // Will be calculated
        $order->discount_amount = 0;
        $order->shipping_address_id = $address->id;
        $order->billing_address_id = $address->id;
        $order->payment_method = 'card';
        $order->payment_status = 'paid';
        $order->notes = '';

        // Set created_at to a random date within the month
        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();
        $randomDate = Carbon::createFromTimestamp(rand($startOfMonth->timestamp, $endOfMonth->timestamp));
        $order->created_at = $randomDate;
        $order->updated_at = $randomDate;

        $order->save();

        // Add 1-3 random products to the order
        $numProducts = rand(1, 3);
        $subtotal = 0;

        for ($j = 0; $j < $numProducts; $j++) {
            $product = $products->random();
            $quantity = rand(1, 3);
            $price = $product->discount_price ?? $product->price;
            $itemSubtotal = $price * $quantity;
            $subtotal += $itemSubtotal;

            $orderItem = new OrderItem();
            $orderItem->order_id = $order->id;
            $orderItem->product_id = $product->id;
            $orderItem->producer_id = $product->producer_id;
            $orderItem->quantity = $quantity;
            $orderItem->price = $price;
            $orderItem->subtotal = $itemSubtotal;
            $orderItem->save();
        }

        // Update order totals
        $tax = $subtotal * 0.24; // 24% VAT
        $total = $subtotal + $tax + $order->shipping_cost - $order->discount_amount;

        $order->total_amount = $total;
        $order->tax_amount = $tax;
        $order->save();

        echo "Created order #" . $order->id . " with " . $numProducts . " products, total: " . number_format($total, 2) . " €\n";
    }
}

echo "\nDone!\n";
