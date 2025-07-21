<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FilterController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProducerController;
use App\Http\Controllers\Api\Integrations\QuickBooksAuthController;
use App\Http\Controllers\ProducerController as ProducerRegistrationController;
use App\Http\Controllers\Api\ProducerProfileController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ProductQuestionController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\AdoptionController;
use App\Http\Controllers\Api\ProducerReviewController;
use App\Http\Controllers\Api\RecommendedProductsController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\OptimizedProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes (No auth required)
Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
    Route::post('/resend-verification-email', [AuthController::class, 'resendVerificationEmail'])->middleware(['auth:sanctum']);

    // Product Routes
    Route::get('/products', [ProductController::class, 'index']); // List products
    Route::get('/products/featured', [ProductController::class, 'featured']); // Get featured products
    Route::get('/products/new', [ProductController::class, 'newArrivals']); // Get new arrivals
    Route::get('/products/popular', [ProductController::class, 'popular']); // Get popular products
    Route::get('/products/related', [ProductController::class, 'getRelatedProducts']); // Get general related products
    Route::get('/products/search', [ProductController::class, 'search']); // Search products
    Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show'); // Show product by slug
    Route::get('/products/{product}/related', [ProductController::class, 'related']); // Get related products

    // Category Routes
    Route::get('/categories', [CategoryController::class, 'index']); // List categories
    Route::get('/categories/{category:slug}', [CategoryController::class, 'show']); // Show category by slug
    Route::get('/categories/{category:slug}/products', [CategoryController::class, 'products']); // Get products by category

    // Filter Routes
    Route::get('/filters', [App\Http\Controllers\Api\FilterController::class, 'index']); // Get all filters
    Route::get('/filters/categories/{category}', [App\Http\Controllers\Api\FilterController::class, 'getFiltersForCategory']); // Get filters for specific category

    // Producer Review Routes
    Route::get('/producers/{producerId}/reviews', [ProducerReviewController::class, 'getProducerReviews']);
    Route::get('/producers/{producerId}/reviews/stats', [ProducerReviewController::class, 'getProducerReviewStats']);

    // Review Routes
    Route::get('/products/{product}/reviews', [ReviewController::class, 'getProductReviews']); // Get reviews for a product
    Route::get('/products/{product}/reviews/stats', [ReviewController::class, 'getProductReviewStats']); // Get review statistics for a product

    // Product Question Routes
    Route::get('/products/{product}/questions', [ProductQuestionController::class, 'getProductQuestions']); // Get questions for a product

    // Producer Routes (Public Profiles)  
    Route::get('/producers', [ProducerController::class, 'index']); // List all producers
    Route::get('/producers/{id}', [ProducerController::class, 'show'])->name('producers.show'); // Show producer by ID
    
    // Producer Registration (Public)
    Route::post('/producer/register', [ProducerRegistrationController::class, 'register']);
    
    // Producer Media Routes
    Route::get('/producers/{id}/media', [\App\Http\Controllers\Api\ProducerMediaController::class, 'index']);
    
    // Producer Questions Routes
    Route::get('/producers/{id}/questions', [\App\Http\Controllers\Api\ProducerQuestionsController::class, 'index']);
    Route::post('/producers/{id}/questions', [\App\Http\Controllers\Api\ProducerQuestionsController::class, 'store'])->middleware('auth:sanctum');
    
    // Producer Seasonality Routes
    Route::get('/producers/{id}/seasonality', [\App\Http\Controllers\Api\ProducerSeasonalityController::class, 'index']);
    
    // Producer Environmental Routes
    Route::get('/producers/{id}/environmental', [\App\Http\Controllers\Api\ProducerEnvironmentalController::class, 'index']);

    // Cart Routes
    Route::post('/cart/guest', [CartController::class, 'createGuestCart']); // Create a guest cart
    Route::get('/cart/{cartId}', [CartController::class, 'getCart']); // Get cart by ID
    Route::post('/cart/{cartId}/items', [CartController::class, 'addItem']); // Add item to cart
    Route::put('/cart/{cartId}/items/{itemId}', [CartController::class, 'updateItem']); // Update cart item
    Route::delete('/cart/{cartId}/items/{itemId}', [CartController::class, 'removeItem']); // Remove item from cart
    Route::delete('/cart/{cartId}/clear', [CartController::class, 'clearCart']); // Clear cart

    // Recommendations Routes
    Route::prefix('recommendations')->group(function () {
        Route::get('/products', [RecommendedProductsController::class, 'getRecommendedProducts']); // Get recommended products
        Route::get('/personalized', [RecommendedProductsController::class, 'getPersonalizedRecommendations']); // Get personalized recommendations
        Route::get('/seasonal', [RecommendedProductsController::class, 'getSeasonalRecommendations']); // Get seasonal recommendations
        Route::get('/frequently-bought-together/{productId}', [RecommendedProductsController::class, 'getFrequentlyBoughtTogether']); // Get frequently bought together products
    });

    // Shipping Routes
    Route::prefix('shipping')->group(function () {
        Route::post('/calculate', [ShippingController::class, 'calculate']); // Shipping Calculation
        Route::get('/zones', [ShippingController::class, 'getShippingZones']); // Get all active zones
        Route::get('/zones-geojson', [ShippingController::class, 'getZonesGeoJson']); // Get zones with GeoJSON data
        Route::get('/zones/{zoneId}/geojson', [ShippingController::class, 'getZoneGeoJson']); // Get GeoJSON data for a specific zone
        Route::post('/find-zone', [ShippingController::class, 'findZoneByPostalCode']); // Find shipping zone by postal code
        Route::get('/delivery-methods', [ShippingController::class, 'getDeliveryMethods']); // Get all active delivery methods
        Route::get('/weight-tiers', [ShippingController::class, 'getWeightTiers']); // Get all weight tiers
        Route::get('/rates', [ShippingController::class, 'getShippingRates']); // Get all shipping rates
    });

    // Adoption Routes (Public)
    Route::get('/adoptable-items', [\App\Http\Controllers\Api\AdoptableItemController::class, 'index']);
    Route::get('/adoptable-items/{slug}', [\App\Http\Controllers\Api\AdoptableItemController::class, 'show']);

    // Greek Courier Routes (Public)
    require __DIR__ . '/api_greek_couriers.php';

    // Invoice Routes (Public and Authenticated)
    require __DIR__ . '/api_invoices.php';

    // Stripe Webhook (Public - no auth required, signature verified in controller)
    Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);
    
    // Health Check Endpoints (Public)
    Route::get('/health', [HealthController::class, 'index']);
    Route::get('/health/detailed', [HealthController::class, 'detailed']);
    Route::get('/health/performance', [HealthController::class, 'performance']);
    Route::get('/health/cache', [HealthController::class, 'cache']);
    Route::get('/health/system', [HealthController::class, 'system']);

    // Optimized Product Routes (with caching and performance monitoring)
    Route::prefix('optimized')->middleware(['performance.monitor'])->group(function () {
        Route::get('/products', [OptimizedProductController::class, 'index'])
            ->middleware('api.cache:5,products');
        Route::get('/products/featured', [OptimizedProductController::class, 'featured'])
            ->middleware('api.cache:30,products,products:featured');
        Route::get('/products/search', [OptimizedProductController::class, 'search'])
            ->middleware('api.cache:10,products,search');
        Route::get('/products/{product:slug}', [OptimizedProductController::class, 'show'])
            ->middleware('api.cache:15,products');
    });

    // Authenticated Routes (Require auth:sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            $user = $request->user();
            $userData = $user->toArray();
            $userData['roles'] = $user->getRoleNames();
            $userData['permissions'] = $user->getAllPermissions()->pluck('name');
            return response()->json($userData);
        });

        // Producer Map Coordinates
        Route::put('/producers/{producer}/map-coordinates', [ProducerController::class, 'updateMapCoordinates']);

        // Auth Routes (Authenticated)
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user/profile', [AuthController::class, 'getProfile']);
        Route::put('/user/profile', [AuthController::class, 'updateProfile']);
        Route::put('/user/password', [AuthController::class, 'updatePassword']);

        // Cart Routes (Authenticated)
        Route::get('/cart', [CartController::class, 'getUserCart']); // Get user's cart
        Route::post('/cart', [CartController::class, 'addItemToUserCart']); // Add item to user's cart
        Route::put('/cart/items/{itemId}', [CartController::class, 'updateUserCartItem']); // Update user cart item
        Route::delete('/cart/items/{itemId}', [CartController::class, 'removeUserCartItem']); // Remove user cart item
        Route::delete('/cart/clear', [CartController::class, 'clearUserCart']); // Clear user cart
        Route::post('/cart/merge/{guestCartId}', [CartController::class, 'mergeGuestCart']); // Merge guest cart with user cart

        // Order Routes
        Route::get('/orders', [OrderController::class, 'index']); // Get user's orders
        Route::get('/orders/{order}', [OrderController::class, 'show']); // Get order details
        Route::post('/orders', [OrderController::class, 'store']); // Create a new order
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']); // Cancel an order
        Route::post('/orders/{order}/payment', [OrderController::class, 'processPayment']); // Process payment for an order

        // Email Routes for Orders
        Route::post('/orders/{order}/resend-confirmation', [OrderController::class, 'resendConfirmation']); // Resend order confirmation email
        Route::get('/orders/{order}/email-status', [OrderController::class, 'getEmailStatus']); // Get email status for order
        Route::get('/orders/{order}/email-preview', [OrderController::class, 'getEmailPreview']); // Get email preview (admin/testing)

        // Payment Routes (Stripe Integration) with Rate Limiting
        Route::prefix('payments')->middleware(['throttle:stripe-payments'])->group(function () {
            Route::post('/create-intent', [PaymentController::class, 'createPaymentIntent'])
                ->middleware('App\Http\Middleware\StripeRateLimit:payment_creation');
            Route::post('/confirm', [PaymentController::class, 'confirmPayment'])
                ->middleware('App\Http\Middleware\StripeRateLimit:payment_confirmation');
            Route::get('/{payment}', [PaymentController::class, 'show']); // Get payment status
        });
        
        // Payment Method Management Routes
        Route::prefix('payment-methods')->group(function () {
            Route::get('/', [App\Http\Controllers\PaymentMethodController::class, 'index']);
            Route::post('/setup-intent', [App\Http\Controllers\PaymentMethodController::class, 'createSetupIntent']);
            Route::post('/', [App\Http\Controllers\PaymentMethodController::class, 'store']);
            Route::delete('/{id}', [App\Http\Controllers\PaymentMethodController::class, 'destroy']);
            Route::post('/set-default', [App\Http\Controllers\PaymentMethodController::class, 'setDefault']);
        });

        // Wishlist Routes
        Route::get('/wishlist', [WishlistController::class, 'index']); // Get user's wishlist
        Route::post('/wishlist', [WishlistController::class, 'store']); // Add item to wishlist
        Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']); // Remove item from wishlist
        Route::post('/wishlist/toggle/{productId}', [WishlistController::class, 'toggle']); // Toggle product in wishlist

        // Review Routes (Authenticated Actions)
        Route::post('/reviews', [ReviewController::class, 'store']); // Create a new review
        Route::put('/reviews/{id}', [ReviewController::class, 'update']); // Update an existing review
        Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']); // Delete a review
        Route::get('/user/reviews', [ReviewController::class, 'getUserReviews']); // Get reviews by the authenticated user

        // Producer Review Routes (Authenticated Actions)
        Route::post('/producer-reviews', [ProducerReviewController::class, 'store']);
        Route::put('/producer-reviews/{id}', [ProducerReviewController::class, 'update']);
        Route::delete('/producer-reviews/{id}', [ProducerReviewController::class, 'destroy']);
        Route::get('/user/producer-reviews', [ProducerReviewController::class, 'getUserProducerReviews']);

        // Product Question Routes (Authenticated Actions)
        Route::post('/products/{product}/questions', [ProductQuestionController::class, 'store']); // Ask a question
        Route::put('/questions/{question}', [ProductQuestionController::class, 'update']); // Update a question
        Route::delete('/questions/{question}', [ProductQuestionController::class, 'destroy']); // Delete a question
        Route::put('/questions/{question}/answer', [ProductQuestionController::class, 'answer']); // Producer role check is inside controller
        Route::get('/user/questions', [ProductQuestionController::class, 'getUserQuestions']); // Get questions by the authenticated user

        // Adoption Routes
        Route::get('/adoptions', [AdoptionController::class, 'index']); // Get user's adoptions
        Route::get('/adoptions/{adoption}', [AdoptionController::class, 'show']); // Get adoption details
        Route::post('/adoptions', [AdoptionController::class, 'store']); // Create a new adoption
        Route::get('/adoptions/{adoption}/updates', [AdoptionController::class, 'getUpdates']); // Get adoption updates

        // Producer Registration Routes (Authenticated but not role-restricted)
        Route::prefix('producer')->group(function () {
            Route::get('/profile', [ProducerRegistrationController::class, 'profile']);
            Route::put('/profile', [ProducerRegistrationController::class, 'updateProfile']);
            Route::get('/dashboard/stats', [ProducerRegistrationController::class, 'dashboardStats']);
        });
        
        // Admin Analytics Routes
        Route::middleware(['role:admin'])->prefix('admin')->group(function () {
            Route::get('/payment-analytics', [App\Http\Controllers\PaymentAnalyticsController::class, 'dashboard']);
            Route::get('/payment-reports/periods', [App\Http\Controllers\PaymentReportController::class, 'availablePeriods']);
            Route::post('/payment-reports/monthly', [App\Http\Controllers\PaymentReportController::class, 'monthlyReport']);
            Route::post('/payment-reports/custom', [App\Http\Controllers\PaymentReportController::class, 'customReport']);
            Route::post('/payment-reports/tax', [App\Http\Controllers\PaymentReportController::class, 'taxReport']);
        });

        // Producer Specific Routes
        Route::middleware(['role:producer'])->prefix('producer')->name('producer.')->group(function () {
            // Dashboard
            Route::get('/dashboard/stats', [\App\Http\Controllers\Api\Producer\DashboardController::class, 'getStats'])->name('dashboard.stats');
            
            // Producer Media Routes (Admin)
            Route::post('/media/upload', [\App\Http\Controllers\Api\ProducerMediaController::class, 'upload'])->name('media.upload');
            Route::put('/media/{media_id}', [\App\Http\Controllers\Api\ProducerMediaController::class, 'update'])->name('media.update');
            Route::delete('/media/{media_id}', [\App\Http\Controllers\Api\ProducerMediaController::class, 'destroy'])->name('media.delete');
            Route::put('/media/reorder', [\App\Http\Controllers\Api\ProducerMediaController::class, 'reorder'])->name('media.reorder');
            
            // Producer Questions Routes
            Route::get('/questions', [\App\Http\Controllers\Api\Producer\QuestionsController::class, 'index'])->name('questions.index');
            Route::post('/questions/{id}/answer', [\App\Http\Controllers\Api\Producer\QuestionsController::class, 'answer'])->name('questions.answer');
            Route::get('/questions/stats', [\App\Http\Controllers\Api\Producer\QuestionsController::class, 'stats'])->name('questions.stats');
            
            // Producer Seasonality Routes
            Route::post('/seasonality', [\App\Http\Controllers\Api\Producer\SeasonalityController::class, 'update'])->name('seasonality.update');
            
            // Adoptable Items
            Route::get('/adoptable-items', [\App\Http\Controllers\Api\Producer\AdoptableItemController::class, 'index'])->name('adoptable-items.index');
            Route::post('/adoptable-items', [\App\Http\Controllers\Api\Producer\AdoptableItemController::class, 'store'])->name('adoptable-items.store');
            Route::get('/adoptable-items/{id}', [\App\Http\Controllers\Api\Producer\AdoptableItemController::class, 'show'])->name('adoptable-items.show');
            Route::put('/adoptable-items/{id}', [\App\Http\Controllers\Api\Producer\AdoptableItemController::class, 'update'])->name('adoptable-items.update');
            Route::delete('/adoptable-items/{id}', [\App\Http\Controllers\Api\Producer\AdoptableItemController::class, 'destroy'])->name('adoptable-items.destroy');

            // Products
            Route::get('/products', [\App\Http\Controllers\Api\Producer\ProductController::class, 'index'])->name('products.index');
            Route::get('/products/stats', [\App\Http\Controllers\Api\Producer\ProductController::class, 'stats'])->name('products.stats');
            Route::post('/products', [\App\Http\Controllers\Api\Producer\ProductController::class, 'store'])->name('products.store');
            Route::get('/products/{id}', [\App\Http\Controllers\Api\Producer\ProductController::class, 'show'])->name('products.show');
            Route::put('/products/{id}', [\App\Http\Controllers\Api\Producer\ProductController::class, 'update'])->name('products.update');
            Route::delete('/products/{id}', [\App\Http\Controllers\Api\Producer\ProductController::class, 'destroy'])->name('products.destroy');
            Route::post('/products/{id}/images', [\App\Http\Controllers\Api\Producer\ProductController::class, 'uploadImages'])->name('products.images.upload');
            Route::delete('/products/{id}/images/{imageId}', [\App\Http\Controllers\Api\Producer\ProductController::class, 'deleteImage'])->name('products.images.delete');
            Route::post('/products/{id}/main-image/{imageId}', [\App\Http\Controllers\Api\Producer\ProductController::class, 'setMainImage'])->name('products.images.main');

            // Orders
            Route::get('/orders', [\App\Http\Controllers\Api\Producer\OrderController::class, 'index'])->name('orders.index');
            Route::get('/orders/{id}', [\App\Http\Controllers\Api\Producer\OrderController::class, 'show'])->name('orders.show');
            Route::put('/orders/{id}/status', [\App\Http\Controllers\Api\Producer\OrderController::class, 'updateStatus'])->name('orders.status.update');

            // Questions
            Route::get('/questions', [\App\Http\Controllers\Api\Producer\QuestionController::class, 'index'])->name('questions.index');
            Route::get('/questions/{id}', [\App\Http\Controllers\Api\Producer\QuestionController::class, 'show'])->name('questions.show');
            Route::put('/questions/{id}/answer', [\App\Http\Controllers\Api\Producer\QuestionController::class, 'answer'])->name('questions.answer');

            // Producer Product Cost Breakdown
            Route::post('/products/{id}/costs', [\App\Http\Controllers\Api\Producer\ProductCostController::class, 'store'])->name('products.costs.store');

            // Producer Subscription Routes
            Route::get('/subscription', [\App\Http\Controllers\Api\Producer\SubscriptionController::class, 'show'])->name('subscription.show');
            Route::post('/subscription', [\App\Http\Controllers\Api\Producer\SubscriptionController::class, 'subscribe'])->name('subscription.subscribe');
            Route::put('/subscription', [\App\Http\Controllers\Api\Producer\SubscriptionController::class, 'update'])->name('subscription.update');
            Route::delete('/subscription', [\App\Http\Controllers\Api\Producer\SubscriptionController::class, 'cancel'])->name('subscription.cancel');
            Route::get('/subscription/plans', [\App\Http\Controllers\Api\Producer\SubscriptionController::class, 'getPlans'])->name('subscription.plans');
            Route::get('/subscription/invoices', [\App\Http\Controllers\Api\Producer\SubscriptionController::class, 'getInvoices'])->name('subscription.invoices');

            // Producer Shipping Settings Routes
            Route::get('/shipping/methods', [\App\Http\Controllers\Api\Producer\ShippingController::class, 'getMethods'])->name('shipping.methods');
            Route::post('/shipping/methods', [\App\Http\Controllers\Api\Producer\ShippingController::class, 'storeMethods'])->name('shipping.methods.store');
            Route::get('/shipping/free-shipping', [\App\Http\Controllers\Api\Producer\ShippingController::class, 'getFreeShippingRules'])->name('shipping.free-shipping');
            Route::post('/shipping/free-shipping', [\App\Http\Controllers\Api\Producer\ShippingController::class, 'storeFreeShippingRules'])->name('shipping.free-shipping.store');
            Route::get('/shipping/custom-rates', [\App\Http\Controllers\Api\Producer\ShippingController::class, 'getCustomRates'])->name('shipping.custom-rates');
            Route::post('/shipping/custom-rates', [\App\Http\Controllers\Api\Producer\ShippingController::class, 'storeCustomRates'])->name('shipping.custom-rates.store');
            Route::post('/shipping/custom-rates/upload', [\App\Http\Controllers\Api\Producer\ShippingController::class, 'uploadCustomRates'])->name('shipping.custom-rates.upload');
            Route::post('/shipping/custom-rates/toggle', [\App\Http\Controllers\Api\Producer\ShippingController::class, 'toggleCustomRates'])->name('shipping.custom-rates.toggle');
            Route::delete('/shipping/custom-rates/{id}', [\App\Http\Controllers\Api\Producer\ShippingController::class, 'deleteCustomRate'])->name('shipping.custom-rates.delete');

            // Producer Adoptions
            Route::get('/adoptions', [\App\Http\Controllers\Api\Producer\AdoptionController::class, 'index'])->name('adoptions.index');
            Route::get('/adoptions/{id}', [\App\Http\Controllers\Api\Producer\AdoptionController::class, 'show'])->name('adoptions.show');

            // Producer Adoption Updates
            Route::post('/adoptions/{id}/updates', [\App\Http\Controllers\Api\Producer\AdoptionUpdateController::class, 'store'])->name('adoptions.updates.store');
            Route::put('/adoptions/{adoptionId}/updates/{id}', [\App\Http\Controllers\Api\Producer\AdoptionUpdateController::class, 'update'])->name('adoptions.updates.update');
            Route::delete('/adoptions/{adoptionId}/updates/{id}', [\App\Http\Controllers\Api\Producer\AdoptionUpdateController::class, 'destroy'])->name('adoptions.updates.destroy');

            // Profile
            Route::get('/profile', [\App\Http\Controllers\Api\Producer\ProfileController::class, 'show'])->name('profile.show');
            Route::put('/profile', [\App\Http\Controllers\Api\Producer\ProfileController::class, 'update'])->name('profile.update');
            Route::post('/profile/logo', [\App\Http\Controllers\Api\Producer\ProfileController::class, 'uploadLogo'])->name('profile.logo.upload');
            Route::post('/profile/cover', [\App\Http\Controllers\Api\Producer\ProfileController::class, 'uploadCover'])->name('profile.cover.upload');

            // Documents
            Route::get('/documents', [\App\Http\Controllers\Api\Producer\DocumentController::class, 'index'])->name('documents.index');
            Route::post('/documents', [\App\Http\Controllers\Api\Producer\DocumentController::class, 'store'])->name('documents.store');
            Route::delete('/documents/{id}', [\App\Http\Controllers\Api\Producer\DocumentController::class, 'destroy'])->name('documents.destroy');
        });

        // B2B Routes (Business Users)
        Route::middleware(['role:business'])->prefix('b2b')->name('b2b.')->group(function () {
            // B2B Products
            Route::get('/products', [\App\Http\Controllers\Api\B2BController::class, 'products'])->name('products');
            Route::post('/quotes', [\App\Http\Controllers\Api\B2BController::class, 'createQuote'])->name('quotes.create');
            Route::get('/quotes', [\App\Http\Controllers\Api\B2BController::class, 'getQuotes'])->name('quotes.index');
            Route::get('/quotes/{id}', [\App\Http\Controllers\Api\B2BController::class, 'getQuote'])->name('quotes.show');

            // Bulk Orders
            Route::post('/bulk-orders/csv', [\App\Http\Controllers\Api\B2B\BulkOrderController::class, 'createFromCsv'])->name('bulk-orders.csv');
            Route::post('/bulk-orders/products', [\App\Http\Controllers\Api\B2B\BulkOrderController::class, 'createFromProducts'])->name('bulk-orders.products');
            Route::post('/bulk-orders/validate', [\App\Http\Controllers\Api\B2B\BulkOrderController::class, 'validateBulkOrder'])->name('bulk-orders.validate');

            // Credit Management
            Route::get('/credit/status', [\App\Http\Controllers\Api\B2B\CreditLimitController::class, 'getCreditStatus'])->name('credit.status');
            Route::post('/credit/request', [\App\Http\Controllers\Api\B2B\CreditLimitController::class, 'requestCreditIncrease'])->name('credit.request');
            Route::get('/credit/transactions', [\App\Http\Controllers\Api\B2B\CreditLimitController::class, 'getCreditTransactions'])->name('credit.transactions');
        });

        // Admin Routes
        Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
            // Dashboard
            Route::get('/dashboard/stats', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'getStats'])->name('dashboard.stats');

            // Users
            Route::prefix('users')->name('users.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\UserController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\UserController::class, 'show'])->name('show');
                Route::put('/{id}', [\App\Http\Controllers\Api\Admin\UserController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\UserController::class, 'destroy'])->name('destroy');
                Route::post('/{id}/roles', [\App\Http\Controllers\Api\Admin\UserController::class, 'assignRoles'])->name('roles.assign');
            });

            // Producers
            Route::prefix('producers')->name('producers.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\ProducerController::class, 'index'])->name('index');
                Route::get('/pending', [\App\Http\Controllers\Api\Admin\ProducerController::class, 'getPendingProducers'])->name('pending');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\ProducerController::class, 'show'])->name('show');
                Route::put('/{id}', [\App\Http\Controllers\Api\Admin\ProducerController::class, 'update'])->name('update');
                Route::post('/{id}/verify', [\App\Http\Controllers\Api\Admin\ProducerController::class, 'verify'])->name('verify');
                Route::post('/{id}/reject', [\App\Http\Controllers\Api\Admin\ProducerController::class, 'reject'])->name('reject');
                Route::get('/{id}/stats', [\App\Http\Controllers\Api\Admin\ProducerController::class, 'getStats'])->name('stats');
                
                // Environmental Stats
                Route::put('/{id}/environmental', [\App\Http\Controllers\Api\Admin\ProducerEnvironmentalController::class, 'update'])->name('environmental.update');
            });

            // Products
            Route::prefix('products')->name('products.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\ProductController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\Api\Admin\ProductController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'show'])->name('show');
                Route::get('/{id}/edit', [\App\Http\Controllers\Api\Admin\ProductController::class, 'edit'])->name('edit');
                Route::put('/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'destroy'])->name('destroy');
                Route::post('/{id}/approve', [\App\Http\Controllers\Api\Admin\ProductController::class, 'approve'])->name('approve');
                Route::post('/{id}/reject', [\App\Http\Controllers\Api\Admin\ProductController::class, 'reject'])->name('reject');
            });

            // Categories
            Route::prefix('categories')->name('categories.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'show'])->name('show');
                Route::put('/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'destroy'])->name('destroy');
            });

            // Orders
            Route::prefix('orders')->name('orders.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\OrderController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\OrderController::class, 'show'])->name('show');
                Route::put('/{id}/status', [\App\Http\Controllers\Api\Admin\OrderController::class, 'updateStatus'])->name('status.update');
            });

            // Reviews
            Route::prefix('reviews')->name('reviews.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'index'])->name('index');
                Route::get('/pending', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'getPendingReviews'])->name('pending');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'show'])->name('show');
                Route::put('/{id}', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'destroy'])->name('destroy');
                Route::post('/{id}/approve', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'approve'])->name('approve');
                Route::post('/{id}/reject', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'reject'])->name('reject');
            });

            // Questions
            Route::prefix('questions')->name('questions.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\QuestionController::class, 'index'])->name('index');
                Route::get('/unanswered', [\App\Http\Controllers\Api\Admin\QuestionController::class, 'getUnansweredQuestions'])->name('unanswered');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\QuestionController::class, 'show'])->name('show');
                Route::put('/{id}', [\App\Http\Controllers\Api\Admin\QuestionController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\QuestionController::class, 'destroy'])->name('destroy');
            });

            // Shipping
            Route::prefix('shipping')->name('shipping.')->group(function () {
                Route::get('/zones', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'getZones'])->name('zones.index');
                Route::post('/zones', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'storeZone'])->name('zones.store');
                Route::get('/zones/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'showZone'])->name('zones.show');
                Route::put('/zones/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'updateZone'])->name('zones.update');
                Route::delete('/zones/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'destroyZone'])->name('zones.destroy');

                Route::get('/delivery-methods', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'getDeliveryMethods'])->name('delivery-methods.index');
                Route::post('/delivery-methods', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'storeDeliveryMethod'])->name('delivery-methods.store');
                Route::get('/delivery-methods/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'showDeliveryMethod'])->name('delivery-methods.show');
                Route::put('/delivery-methods/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'updateDeliveryMethod'])->name('delivery-methods.update');
                Route::delete('/delivery-methods/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'destroyDeliveryMethod'])->name('delivery-methods.destroy');

                Route::get('/weight-tiers', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'getWeightTiers'])->name('weight-tiers.index');
                Route::post('/weight-tiers', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'storeWeightTier'])->name('weight-tiers.store');
                Route::get('/weight-tiers/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'showWeightTier'])->name('weight-tiers.show');
                Route::put('/weight-tiers/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'updateWeightTier'])->name('weight-tiers.update');
                Route::delete('/weight-tiers/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'destroyWeightTier'])->name('weight-tiers.destroy');

                Route::get('/rates', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'getRates'])->name('rates.index');
                Route::post('/rates', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'storeRate'])->name('rates.store');
                Route::get('/rates/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'showRate'])->name('rates.show');
                Route::put('/rates/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'updateRate'])->name('rates.update');
                Route::delete('/rates/{id}', [\App\Http\Controllers\Api\Admin\ShippingController::class, 'destroyRate'])->name('rates.destroy');
            });

            // Attributes
            Route::prefix('attributes')->name('attributes.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\AttributeController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\Api\Admin\AttributeController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\AttributeController::class, 'show'])->name('show');
                Route::put('/{id}', [\App\Http\Controllers\Api\Admin\AttributeController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\AttributeController::class, 'destroy'])->name('destroy');
            });

            // Adoptions
            Route::prefix('adoptions')->name('adoptions.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\AdoptionController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\AdoptionController::class, 'show'])->name('show');
                Route::put('/{id}', [\App\Http\Controllers\Api\Admin\AdoptionController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\AdoptionController::class, 'destroy'])->name('destroy');
                Route::post('/{id}/cancel', [\App\Http\Controllers\Api\Admin\AdoptionController::class, 'cancel'])->name('cancel');
                Route::post('/{id}/renew', [\App\Http\Controllers\Api\Admin\AdoptionController::class, 'renew'])->name('renew');
            });

            // Adoptable Items
            Route::prefix('adoptable-items')->name('adoptable-items.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\AdoptableItemController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\Api\Admin\AdoptableItemController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\Api\Admin\AdoptableItemController::class, 'show'])->name('show');
                Route::put('/{id}', [\App\Http\Controllers\Api\Admin\AdoptableItemController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\AdoptableItemController::class, 'destroy'])->name('destroy');
            });

            // Settings
            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Admin\SettingController::class, 'index'])->name('index');
                Route::put('/', [\App\Http\Controllers\Api\Admin\SettingController::class, 'update'])->name('update');
            });

            // B2B Management (Admin)
            Route::prefix('b2b')->name('b2b.')->group(function () {
                Route::get('/credit-requests', [\App\Http\Controllers\Api\B2B\CreditLimitController::class, 'getCreditRequests'])->name('credit.requests');
                Route::post('/credit-requests/{id}/approve', [\App\Http\Controllers\Api\B2B\CreditLimitController::class, 'approveCreditRequest'])->name('credit.approve');
                Route::post('/credit-requests/{id}/reject', [\App\Http\Controllers\Api\B2B\CreditLimitController::class, 'rejectCreditRequest'])->name('credit.reject');
                Route::get('/business-users', [\App\Http\Controllers\Api\Admin\BusinessUserController::class, 'index'])->name('business-users.index');
                Route::get('/business-users/{id}', [\App\Http\Controllers\Api\Admin\BusinessUserController::class, 'show'])->name('business-users.show');
            });

            // Integrations
            Route::prefix('integrations')->name('integrations.')->group(function () {
                Route::prefix('quickbooks')->name('quickbooks.')->group(function () {
                    Route::get('/status', [\App\Http\Controllers\Admin\IntegrationController::class, 'getQuickBooksStatus'])->name('status');
                    Route::get('/auth', [\App\Http\Controllers\Admin\IntegrationController::class, 'initiateQuickBooksAuth'])->name('auth');
                    Route::post('/disconnect', [\App\Http\Controllers\Admin\IntegrationController::class, 'disconnectQuickBooks'])->name('disconnect');
                    Route::post('/sync/{type}', [\App\Http\Controllers\Admin\IntegrationController::class, 'syncQuickBooks'])->name('sync');
                });
            });
        });
    });
});

// Analytics and AI routes (available to all authenticated users)
Route::middleware(['auth:sanctum'])->group(function () {
    // Analytics routes
    Route::prefix('analytics')->group(function () {
        Route::post('/track', [App\Http\Controllers\Api\AnalyticsController::class, 'track']);
        Route::get('/summary', [App\Http\Controllers\Api\AnalyticsController::class, 'getSummary']);
        Route::get('/user-profile', [App\Http\Controllers\Api\AnalyticsController::class, 'getUserProfile']);
        Route::get('/trending-products', [App\Http\Controllers\Api\AnalyticsController::class, 'getTrendingProducts']);
        Route::get('/popular-searches', [App\Http\Controllers\Api\AnalyticsController::class, 'getPopularSearches']);
        Route::get('/conversion-funnel', [App\Http\Controllers\Api\AnalyticsController::class, 'getConversionFunnel']);
        Route::get('/dashboard', [App\Http\Controllers\Api\AnalyticsController::class, 'getDashboardAnalytics']);
        Route::get('/product-performance/{productId}', [App\Http\Controllers\Api\AnalyticsController::class, 'getProductPerformance']);
        Route::get('/user-segmentation', [App\Http\Controllers\Api\AnalyticsController::class, 'getUserSegmentation']);
        Route::get('/search-analytics', [App\Http\Controllers\Api\AnalyticsController::class, 'getSearchAnalytics']);
    });

    // ML Recommendations routes
    Route::prefix('ml')->group(function () {
        Route::get('/recommendations/personalized', [App\Http\Controllers\Api\MLController::class, 'getPersonalizedRecommendations']);
        Route::get('/recommendations/realtime', [App\Http\Controllers\Api\MLController::class, 'getRealTimeRecommendations']);
        Route::get('/recommendations/contextual', [App\Http\Controllers\Api\MLController::class, 'getContextualRecommendations']);
        Route::get('/recommendations/trending', [App\Http\Controllers\Api\MLController::class, 'getTrendingRecommendations']);
        Route::get('/recommendations/ab-test', [App\Http\Controllers\Api\MLController::class, 'getABTestRecommendations']);
    });

    // Intelligent Search routes
    Route::prefix('search')->group(function () {
        Route::get('/intelligent', [App\Http\Controllers\Api\SearchController::class, 'intelligentSearch']);
        Route::get('/autocomplete', [App\Http\Controllers\Api\SearchController::class, 'getAutocompleteSuggestions']);
        Route::get('/spelling-suggestions', [App\Http\Controllers\Api\SearchController::class, 'getSpellingSuggestions']);
    });

    // Business Intelligence routes
    Route::prefix('business-intelligence')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Api\BusinessIntelligenceController::class, 'getDashboardAnalytics']);
        Route::get('/revenue-forecast', [App\Http\Controllers\Api\BusinessIntelligenceController::class, 'getRevenueForecast']);
        Route::get('/customer-insights', [App\Http\Controllers\Api\BusinessIntelligenceController::class, 'getCustomerInsights']);
        Route::get('/product-performance', [App\Http\Controllers\Api\BusinessIntelligenceController::class, 'getProductPerformance']);
        Route::get('/market-trends', [App\Http\Controllers\Api\BusinessIntelligenceController::class, 'getMarketTrends']);
        Route::get('/export', [App\Http\Controllers\Api\BusinessIntelligenceController::class, 'exportAnalytics']);
    });

    // Email Marketing routes
    Route::prefix('email-marketing')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Api\EmailMarketingController::class, 'getDashboard']);
        Route::get('/templates', [App\Http\Controllers\Api\EmailMarketingController::class, 'getTemplates']);
        Route::post('/templates', [App\Http\Controllers\Api\EmailMarketingController::class, 'createTemplate']);
        Route::post('/campaigns', [App\Http\Controllers\Api\EmailMarketingController::class, 'createCampaign']);
        Route::post('/campaigns/{campaign}/send', [App\Http\Controllers\Api\EmailMarketingController::class, 'sendCampaign']);
        Route::get('/campaigns/{campaign}/analytics', [App\Http\Controllers\Api\EmailMarketingController::class, 'getCampaignAnalytics']);
        Route::get('/automated-sequences', [App\Http\Controllers\Api\EmailMarketingController::class, 'getAutomatedSequences']);
    });
});

// Public analytics routes (no authentication required)
Route::prefix('analytics')->group(function () {
    Route::post('/track', [App\Http\Controllers\Api\AnalyticsController::class, 'track']); // Allow anonymous tracking
});

// Public newsletter routes (no authentication required)
Route::prefix('newsletter')->group(function () {
    Route::post('/subscribe', [App\Http\Controllers\Api\EmailMarketingController::class, 'subscribe']);
    Route::post('/unsubscribe', [App\Http\Controllers\Api\EmailMarketingController::class, 'unsubscribe']);
});

// QuickBooks Integration Routes (authenticated)
Route::middleware('auth:api')->prefix('integrations/quickbooks')->group(function () {
    Route::post('/connect', [QuickBooksAuthController::class, 'connect']);
    Route::get('/callback', [QuickBooksAuthController::class, 'callback']);
    Route::get('/status', [QuickBooksAuthController::class, 'status']);
    Route::post('/disconnect', [QuickBooksAuthController::class, 'disconnect']);
    Route::get('/test', [QuickBooksAuthController::class, 'test']);
});

// API Aliases (without v1 prefix) for frontend compatibility
Route::get('/orders', [OrderController::class, 'index'])->middleware('auth:sanctum');
Route::get('/user/profile', [AuthController::class, 'getProfile'])->middleware('auth:sanctum');
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/related', [ProductController::class, 'getRelatedProducts']);
