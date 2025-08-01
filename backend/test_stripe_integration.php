<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;

echo "🧪 STRIPE INTEGRATION TESTING\n";
echo "=============================\n\n";

// Check if we have products and users
$userCount = User::count();
$productCount = Product::count();

echo "📊 Database Status:\n";
echo "   - Users: {$userCount}\n";
echo "   - Products: {$productCount}\n";
echo "   - Orders: " . Order::count() . "\n\n";

if ($userCount === 0) {
    echo "❌ No users found! Creating test user...\n";
    $user = User::create([
        'firstName' => 'Test',
        'lastName' => 'User',
        'email' => 'test@dixis.io',
        'password' => bcrypt('password'),
        'role' => 'customer',
        'email_verified_at' => now(),
    ]);
    echo "✅ Test user created: {$user->email}\n\n";
} else {
    $user = User::first();
    echo "✅ Using existing user: {$user->email}\n\n";
}

if ($productCount === 0) {
    echo "❌ No products found! Cannot test without products.\n";
    exit(1);
}

// Create a test address first
echo "📦 Creating test address...\n";
$address = \App\Models\Address::create([
    'user_id' => $user->id,
    'name' => 'Test Address',
    'address_line_1' => 'Test Street 123',
    'address_line_2' => '',
    'city' => 'Athens',
    'postal_code' => '10431',
    'region' => 'Attica',
    'country' => 'Greece',
    'phone' => '+30 210 1234567',
    'is_default_shipping' => true,
    'is_default_billing' => true,
]);

echo "✅ Test address created: {$address->id}\n";

// Create a test order
echo "📦 Creating test order...\n";
$product = Product::first();
$order = Order::create([
    'user_id' => $user->id,
    'status' => 'pending',
    'total_amount' => 25.50,
    'shipping_cost' => 3.50,
    'tax_amount' => 2.00,
    'discount_amount' => 0.00,
    'shipping_address_id' => $address->id,
    'billing_address_id' => $address->id,
    'payment_method' => 'credit_card',
    'payment_status' => 'pending',
    'notes' => 'Test order for Stripe integration',
]);

echo "✅ Test order created: Order #{$order->id}\n";
echo "   - Total: €{$order->total_amount}\n";
echo "   - User: {$user->email}\n\n";

// Test PaymentIntent creation
echo "💳 Testing PaymentIntent creation...\n";

try {
    // Mock Laravel Auth facade
    \Illuminate\Support\Facades\Auth::shouldReceive('id')
        ->andReturn($user->id);
    \Illuminate\Support\Facades\Auth::shouldReceive('user')
        ->andReturn($user);
    
    // Create a mock request
    $request = Request::create('/api/v1/payments/create-intent', 'POST', [
        'order_id' => $order->id,
        'currency' => 'EUR',
    ]);
    
    // Mock authentication
    $request->setUserResolver(function () use ($user) {
        return $user;
    });

    // Create PaymentController and test
    $controller = new PaymentController();
    $response = $controller->createPaymentIntent($request);
    
    $responseData = json_decode($response->getContent(), true);
    
    if ($response->getStatusCode() === 200) {
        echo "✅ PaymentIntent created successfully!\n";
        echo "   - Client Secret: " . substr($responseData['client_secret'], 0, 20) . "...\n";
        echo "   - Payment ID: {$responseData['payment_id']}\n";
        echo "   - Amount: €{$responseData['amount']}\n";
        echo "   - Currency: {$responseData['currency']}\n\n";
        
        // Check if payment record was created in database
        $payment = \App\Models\Payment::find($responseData['payment_id']);
        if ($payment) {
            echo "✅ Payment record created in database:\n";
            echo "   - ID: {$payment->id}\n";
            echo "   - Order ID: {$payment->order_id}\n";
            echo "   - Stripe Payment Intent ID: {$payment->stripe_payment_intent_id}\n";
            echo "   - Status: {$payment->status}\n";
            echo "   - Amount: €{$payment->amount}\n\n";
        } else {
            echo "❌ Payment record not found in database!\n\n";
        }
        
        echo "🎯 PaymentIntent Test: PASSED ✅\n\n";
    } else {
        echo "❌ PaymentIntent creation failed!\n";
        echo "   - Status: {$response->getStatusCode()}\n";
        echo "   - Response: " . $response->getContent() . "\n\n";
        echo "🎯 PaymentIntent Test: FAILED ❌\n\n";
    }
    
} catch (Exception $e) {
    echo "❌ Exception during PaymentIntent creation:\n";
    echo "   - Error: {$e->getMessage()}\n";
    echo "   - File: {$e->getFile()}:{$e->getLine()}\n\n";
    echo "🎯 PaymentIntent Test: FAILED ❌\n\n";
}

echo "🧪 Integration testing completed!\n";
echo "Order ID {$order->id} is ready for frontend testing.\n";
echo "Use this order ID in your frontend tests.\n\n";

?>