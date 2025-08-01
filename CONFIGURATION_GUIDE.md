# 🔧 DIXIS PLATFORM - CONFIGURATION GUIDE

**Purpose**: Step-by-step guide to configure Stripe and Email services  
**Time Required**: ~30 minutes  
**Impact**: Enables payment processing and email notifications

---

## 📋 PREREQUISITES

1. **Stripe Account** (Free)
   - Sign up at: https://stripe.com
   - No credit card required for test mode

2. **Gmail Account** (For email service)
   - Enable 2-factor authentication
   - Generate app-specific password

---

## 🔑 STRIPE CONFIGURATION

### Step 1: Get Stripe Test Keys

1. **Login to Stripe Dashboard**
   - Go to: https://dashboard.stripe.com
   - Make sure you're in **Test Mode** (toggle in top-right)

2. **Get API Keys**
   - Navigate to: https://dashboard.stripe.com/test/apikeys
   - Copy these keys:
     - **Publishable key**: `pk_test_51...`
     - **Secret key**: `sk_test_51...`

3. **Set up Webhook (Optional for now)**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-domain.com/api/v1/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.failed`
   - Copy the **Signing secret**: `whsec_...`

### Step 2: Update backend/.env

```env
# Replace these dummy values with your actual keys
STRIPE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_ABC...your_webhook_secret
```

---

## 📧 EMAIL CONFIGURATION (Gmail)

### Step 1: Prepare Gmail Account

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" → Enter "Dixis Platform"
   - Copy the 16-character password

### Step 2: Update backend/.env

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@dixis.gr"
MAIL_FROM_NAME="Dixis Marketplace"
```

---

## 🧪 TESTING CONFIGURATION

### Test Stripe Integration

```bash
# From backend directory
cd backend

# Test Stripe connection
php artisan tinker
>>> $stripe = new \Stripe\StripeClient(env('STRIPE_SECRET'));
>>> $stripe->paymentIntents->create(['amount' => 1000, 'currency' => 'eur']);
# Should return a PaymentIntent object
```

### Test Email Service

```bash
# From backend directory
php artisan tinker
>>> Mail::raw('Test email from Dixis', function($message) {
...     $message->to('your-email@gmail.com')
...             ->subject('Dixis Platform Test');
... });
# Should send email successfully
```

### Test via API

```bash
# Test payment intent creation
curl -X POST http://localhost:8000/api/v1/payment/test \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'

# Test user registration (will send email)
curl -X POST http://localhost:8000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "consumer"
  }'
```

---

## 🚀 QUICK START (Temporary Testing)

If you want to test immediately without real accounts:

### Option 1: Use Laravel Log Driver (Email Testing)

```env
# Temporary email testing (emails go to storage/logs/laravel.log)
MAIL_MAILER=log
```

### Option 2: Use Stripe Test Keys

```env
# Replace with your own Stripe test keys
STRIPE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET=sk_test_YOUR_SECRET_KEY_HERE
```

**⚠️ WARNING**: Replace with your own keys before going to production!

---

## ✅ VERIFICATION CHECKLIST

- [ ] Stripe test keys configured in .env
- [ ] Email service configured (Gmail or log driver)
- [ ] Payment intent test successful
- [ ] Email sending test successful
- [ ] User registration with email works
- [ ] No errors in `storage/logs/laravel.log`

---

## 🔒 SECURITY NOTES

1. **Never commit .env file** to version control
2. **Use test keys only** for development
3. **App passwords** are safer than regular passwords
4. **Rotate keys** regularly in production
5. **Use environment variables** in production servers

---

## 📞 TROUBLESHOOTING

### Stripe Issues
- Ensure you're using test mode keys (start with `pk_test_` and `sk_test_`)
- Check Laravel logs: `tail -f storage/logs/laravel.log`
- Verify Stripe PHP SDK is installed: `composer require stripe/stripe-php`

### Email Issues
- Gmail: Ensure 2FA is enabled and app password is correct
- Check spam folder for test emails
- Try log driver first: `MAIL_MAILER=log`
- Verify email queue is running: `php artisan queue:work`

---

**Next Step**: After configuration, test the complete e-commerce flow!