# 🎯 STRIPE INTEGRATION MASTER PLAN

## 📋 OVERVIEW
Complete implementation plan for Stripe payment integration in Dixis Fresh e-commerce platform.

**Project Structure:**
- Backend: Laravel 11 (Port 8000)
- Frontend: Next.js 15 (Port 3000)
- Payment Provider: Stripe

---

## PHASE 1: BACKEND SETUP (Laravel)

### 1.1 Stripe PHP Package Installation
```bash
cd /Users/panagiotiskourkoutis/Dixis\ Project\ 2/backend
composer require stripe/stripe-php
```

### 1.2 Environment Configuration
Add to `.env`:
```env
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 1.3 Laravel Configuration
Create `config/stripe.php`:
```php
<?php
return [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
];
```

### 1.4 Database Migrations
Create migration for payments table:
```bash
php artisan make:migration create_payments_table
```

Migration content:
```php
Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->string('stripe_payment_intent_id')->unique();
    $table->decimal('amount', 10, 2);
    $table->string('currency', 3)->default('EUR');
    $table->enum('status', ['pending', 'succeeded', 'failed', 'canceled'])->default('pending');
    $table->json('stripe_data')->nullable();
    $table->timestamps();
});
```

Update orders table:
```bash
php artisan make:migration add_payment_fields_to_orders_table
```

### 1.5 Laravel Models
Create Payment model:
```bash
php artisan make:model Payment
```

### 1.6 Laravel Controllers
Create controllers:
```bash
php artisan make:controller PaymentController
php artisan make:controller StripeWebhookController
```

### 1.7 Routes
Add to `routes/api.php`:
```php
// Payment routes
Route::post('/payments/create-intent', [PaymentController::class, 'createPaymentIntent']);
Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);
```

---

## PHASE 2: FRONTEND SETUP (Next.js)

### 2.1 Stripe.js Installation
```bash
cd /Users/panagiotiskourkoutis/Dixis\ Project\ 2/dixis-fresh
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2.2 Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2.3 Components to Create/Update
1. `src/providers/StripeProvider.tsx` (NEW)
2. `src/components/checkout/StripePaymentElement.tsx` (NEW)
3. `src/components/checkout/PaymentForm.tsx` (UPDATE)
4. `src/components/checkout/CheckoutProcess.tsx` (UPDATE)

---

## PHASE 3: IMPLEMENTATION DETAILS

### 3.1 Payment Flow
1. User adds items to cart
2. User proceeds to checkout
3. Frontend calls Laravel `/api/v1/payments/create-intent`
4. Laravel creates Stripe PaymentIntent
5. Frontend receives client_secret
6. User completes payment with Stripe Elements
7. Stripe webhook confirms payment
8. Laravel updates order status

### 3.2 Critical Webhook Events
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`

### 3.3 Error Handling
- Payment failures
- Network errors
- Webhook signature verification
- Order status synchronization

---

## PHASE 4: TESTING

### 4.1 Test Cards
- Success: `4242424242424242`
- Decline: `4000000000000002`
- 3D Secure: `4000002500003155`

### 4.2 Webhook Testing
```bash
stripe listen --forward-to localhost:8000/api/v1/stripe/webhook
```

---

## FILES TO CREATE/MODIFY

### Laravel Backend (NEW)
- `app/Http/Controllers/PaymentController.php`
- `app/Http/Controllers/StripeWebhookController.php`
- `app/Models/Payment.php`
- `database/migrations/xxx_create_payments_table.php`
- `database/migrations/xxx_add_payment_fields_to_orders_table.php`
- `config/stripe.php`

### Laravel Backend (UPDATE)
- `routes/api.php`
- `app/Models/Order.php`

### Next.js Frontend (NEW)
- `src/providers/StripeProvider.tsx`
- `src/components/checkout/StripePaymentElement.tsx`

### Next.js Frontend (UPDATE)
- `src/components/checkout/PaymentForm.tsx`
- `src/components/checkout/CheckoutProcess.tsx`
- `.env.local`

---

## EXECUTION ORDER

1. **Backend Setup** (Laravel)
   - Install Stripe PHP package
   - Create database migrations
   - Create models and controllers
   - Setup routes and configuration

2. **Frontend Setup** (Next.js)
   - Install Stripe.js packages
   - Create Stripe provider
   - Update payment components

3. **Integration Testing**
   - Test payment flow
   - Setup webhook handling
   - Validate error scenarios

4. **Production Preparation**
   - Environment configuration
   - Security validation
   - Performance testing

---

## SECURITY CONSIDERATIONS

- Always verify webhook signatures
- Use HTTPS in production
- Validate payment amounts server-side
- Store sensitive data securely
- Implement proper error logging

---

## PHASE 4: PRODUCTION DEPLOYMENT

### 4.1 Stripe Dashboard Configuration

#### **Live API Keys Setup**
```bash
# Replace test keys with live keys in production .env
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
```

#### **Webhook Endpoint Configuration**
1. **Create Production Webhook**
   - URL: `https://yourdomain.com/api/v1/stripe/webhook`
   - Events to send:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `checkout.session.completed`

2. **Webhook Security**
   ```bash
   # Update webhook secret in production
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   ```

3. **Test Webhook Delivery**
   ```bash
   # Use Stripe CLI to test production webhook
   stripe listen --forward-to https://yourdomain.com/api/v1/stripe/webhook
   stripe trigger payment_intent.succeeded
   ```

### 4.2 Environment Configuration

#### **Production Environment Variables**
```env
# Laravel Backend (.env)
APP_ENV=production
APP_DEBUG=false
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
STRIPE_CURRENCY=EUR

# Next.js Frontend (.env.local)
NODE_ENV=production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### **SSL/HTTPS Requirements**
- **Mandatory for production**: Stripe requires HTTPS for live payments
- **Certificate validation**: Ensure valid SSL certificate
- **Webhook endpoints**: Must be accessible via HTTPS

### 4.3 Security Enhancements

#### **Rate Limiting Implementation**
```php
// Laravel: config/stripe.php
'rate_limiting' => [
    'payment_creation' => [
        'max_attempts' => 5,
        'decay_minutes' => 1,
    ],
    'webhook_processing' => [
        'max_attempts' => 100,
        'decay_minutes' => 1,
    ],
],
```

#### **Laravel Rate Limiting Middleware**
```php
// app/Http/Middleware/StripeRateLimit.php
Route::middleware(['throttle:stripe-payments'])->group(function () {
    Route::post('/payments/create-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);
});
```

#### **Fraud Detection Rules**
```php
// Enhanced PaymentIntent creation with fraud detection
$paymentIntent = PaymentIntent::create([
    'amount' => $amount,
    'currency' => $currency,
    'automatic_payment_methods' => ['enabled' => true],
    'metadata' => [
        'order_id' => $order->id,
        'user_id' => $order->user_id,
        'user_email' => $order->user->email,
        'ip_address' => request()->ip(),
    ],
    'radar_options' => [
        'session' => request()->header('X-Stripe-Session-ID'),
    ],
]);
```

### 4.4 Monitoring & Alerts

#### **Laravel Logging Configuration**
```php
// config/logging.php
'channels' => [
    'stripe' => [
        'driver' => 'daily',
        'path' => storage_path('logs/stripe.log'),
        'level' => 'info',
        'days' => 30,
    ],
],
```

#### **Payment Monitoring**
```php
// app/Services/PaymentMonitoringService.php
class PaymentMonitoringService
{
    public function logPaymentAttempt($paymentIntent, $status)
    {
        Log::channel('stripe')->info('Payment attempt', [
            'payment_intent_id' => $paymentIntent->id,
            'amount' => $paymentIntent->amount,
            'status' => $status,
            'user_id' => auth()->id(),
            'timestamp' => now(),
        ]);
    }

    public function alertFailedPayments($threshold = 5)
    {
        $failedCount = Payment::where('status', 'failed')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($failedCount >= $threshold) {
            // Send alert to administrators
            Mail::to(config('app.admin_email'))->send(new PaymentFailureAlert($failedCount));
        }
    }
}
```

#### **Health Check Endpoint**
```php
// routes/api.php
Route::get('/health/stripe', function () {
    try {
        \Stripe\Stripe::setApiKey(config('stripe.secret'));
        \Stripe\Account::retrieve();

        return response()->json([
            'status' => 'healthy',
            'stripe_connection' => 'ok',
            'timestamp' => now(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'unhealthy',
            'error' => $e->getMessage(),
            'timestamp' => now(),
        ], 500);
    }
});
```

---

## PHASE 5: FEATURE ENHANCEMENTS

### 5.1 Saved Payment Methods

#### **Customer Creation & Management**
```php
// app/Services/StripeCustomerService.php
class StripeCustomerService
{
    public function createOrRetrieveCustomer($user)
    {
        if ($user->stripe_customer_id) {
            return Customer::retrieve($user->stripe_customer_id);
        }

        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        $user->update(['stripe_customer_id' => $customer->id]);
        return $customer;
    }

    public function savePaymentMethod($user, $paymentMethodId)
    {
        $customer = $this->createOrRetrieveCustomer($user);

        $paymentMethod = PaymentMethod::retrieve($paymentMethodId);
        $paymentMethod->attach(['customer' => $customer->id]);

        return $paymentMethod;
    }
}
```

#### **Payment Method Management UI**
```tsx
// src/components/account/SavedPaymentMethods.tsx
export default function SavedPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('/api/v1/payment-methods');
      const data = await response.json();
      setPaymentMethods(data.payment_methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaymentMethod = async (paymentMethodId) => {
    try {
      await fetch(`/api/v1/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });
      setPaymentMethods(prev =>
        prev.filter(pm => pm.id !== paymentMethodId)
      );
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Αποθηκευμένες Κάρτες</h3>

      {paymentMethods.map((pm) => (
        <div key={pm.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="w-6 h-6 text-gray-400" />
            <div>
              <p className="font-medium">•••• •••• •••• {pm.card.last4}</p>
              <p className="text-sm text-gray-500">
                {pm.card.brand.toUpperCase()} • Λήγει {pm.card.exp_month}/{pm.card.exp_year}
              </p>
            </div>
          </div>

          <button
            onClick={() => deletePaymentMethod(pm.id)}
            className="text-red-600 hover:text-red-700"
          >
            Διαγραφή
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 5.2 Additional Payment Methods

#### **Apple Pay / Google Pay Integration**
```tsx
// src/components/checkout/ExpressPaymentMethods.tsx
import { PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';

export default function ExpressPaymentMethods({ total, onPaymentSuccess }) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'GR',
        currency: 'eur',
        total: {
          label: 'Σύνολο Παραγγελίας',
          amount: Math.round(total * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr);
        }
      });

      pr.on('paymentmethod', async (ev) => {
        // Process payment
        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: ev.paymentMethod.id
        });

        if (error) {
          ev.complete('fail');
        } else {
          ev.complete('success');
          onPaymentSuccess();
        }
      });
    }
  }, [stripe, total]);

  if (!paymentRequest) return null;

  return (
    <div className="mb-6">
      <PaymentRequestButtonElement
        options={{ paymentRequest }}
        className="PaymentRequestButton"
      />
      <div className="text-center my-4 text-gray-500">ή</div>
    </div>
  );
}
```

#### **SEPA Direct Debit (European Bank Transfers)**
```php
// Laravel: SEPA Direct Debit PaymentIntent
$paymentIntent = PaymentIntent::create([
    'amount' => $amount,
    'currency' => 'eur',
    'payment_method_types' => ['sepa_debit'],
    'metadata' => [
        'order_id' => $order->id,
    ],
]);
```

### 5.3 Analytics & Reporting

#### **Payment Analytics Dashboard**
```php
// app/Http/Controllers/PaymentAnalyticsController.php
class PaymentAnalyticsController extends Controller
{
    public function dashboard()
    {
        $analytics = [
            'total_revenue' => Payment::where('status', 'succeeded')->sum('amount'),
            'total_transactions' => Payment::where('status', 'succeeded')->count(),
            'success_rate' => $this->calculateSuccessRate(),
            'average_order_value' => $this->calculateAverageOrderValue(),
            'monthly_revenue' => $this->getMonthlyRevenue(),
            'payment_methods_breakdown' => $this->getPaymentMethodsBreakdown(),
        ];

        return response()->json($analytics);
    }

    private function calculateSuccessRate()
    {
        $total = Payment::count();
        $successful = Payment::where('status', 'succeeded')->count();

        return $total > 0 ? round(($successful / $total) * 100, 2) : 0;
    }

    private function getMonthlyRevenue()
    {
        return Payment::where('status', 'succeeded')
            ->selectRaw('MONTH(created_at) as month, SUM(amount) as revenue')
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }
}
```

#### **Financial Reports Export**
```php
// app/Services/PaymentReportService.php
class PaymentReportService
{
    public function generateMonthlyReport($month, $year)
    {
        $payments = Payment::with(['order.user'])
            ->where('status', 'succeeded')
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->get();

        $csvData = $payments->map(function ($payment) {
            return [
                'Date' => $payment->created_at->format('Y-m-d H:i:s'),
                'Order ID' => $payment->order_id,
                'Customer Email' => $payment->order->user->email,
                'Amount' => $payment->amount,
                'Currency' => $payment->currency,
                'Payment Method' => $payment->payment_gateway,
                'Stripe Payment ID' => $payment->stripe_payment_intent_id,
            ];
        });

        return $this->generateCSV($csvData, "payments_{$year}_{$month}.csv");
    }
}
```

---

## NEXT STEPS

### **IMMEDIATE PRIORITIES:**
1. **Complete Phase 4** - Production deployment and security
2. **Implement Phase 5.1** - Saved payment methods for better UX
3. **Add Phase 5.3** - Analytics for business insights

### **FUTURE ENHANCEMENTS:**
- Subscription billing for recurring orders
- Multi-currency support for international customers
- Advanced fraud detection rules
- Customer billing portal integration

Start with Phase 4 for production readiness, then gradually implement Phase 5 features based on business needs.
