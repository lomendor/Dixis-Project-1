'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useB2BCartStore } from '@/stores/b2b/b2bCartStore';
import { ShoppingCart, Plus, Minus, CreditCard, TrendingUp, Upload } from 'lucide-react';
import { NetworkAwareLoading, LazyLoad, IncrementalLoading, ProgressiveImage, SkeletonGrid, SkeletonCard } from '@/components/mobile/ProgressiveLoading';
import TouchGestures from '@/components/mobile/TouchInteractions';
import { SwipeableCard, PullToRefresh } from '@/components/mobile/TouchInteractions';

interface B2BProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesale_price: number;
  main_image: string;
  producer: {
    business_name: string;
    city: string;
  };
  category: {
    name: string;
  };
  min_order_quantity: number;
  bulk_discount_threshold: number;
  bulk_discount_percentage: number;
  stock: number;
}

export default function B2BDashboardPage() {
  const [products, setProducts] = useState<B2BProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // B2B Cart Store
  const {
    items: cartItems,
    addItem,
    updateQuantity,
    getSubtotal,
    getTotalDiscount,
    getTotal,
    getAvailableCredit,
    canAffordOrder,
    creditLimit,
    usedCredit
  } = useB2BCartStore();

  useEffect(() => {
    fetchB2BProducts();
  }, []);

  const fetchB2BProducts = async () => {
    try {
      // Fetch B2B products from correct API endpoint
      const response = await fetch('/api/products?b2b_available=1&per_page=12');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform backend data to match component interface
      const transformedProducts = data.data.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description || product.short_description || '',
        price: product.price,
        wholesale_price: product.wholesale_price || product.price * 0.85,
        main_image: product.main_image || '/images/products/default.jpg',
        producer: {
          business_name: product?.producer?.business_name || 'Άγνωστος Παραγωγός',
          city: product?.producer?.city || 'Ελλάδα'
        },
        category: {
          name: product?.category?.name || 'Άλλα'
        },
        min_order_quantity: product.min_order_quantity || 1,
        bulk_discount_threshold: product.bulk_discount_threshold || null,
        bulk_discount_percentage: product.bulk_discount_percentage || null,
        stock: product.stock_quantity || 0
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      logger.error('Failed to fetch B2B products:', toError(error), errorToContext(error));
      setError('Σφάλμα φόρτωσης προϊόντων');
    } finally {
      setIsLoading(false);
    }
  };  const calculateSavings = (retailPrice: number, wholesalePrice: number) => {
    const savings = retailPrice - wholesalePrice;
    const percentage = ((savings / retailPrice) * 100).toFixed(0);
    return { savings: savings.toFixed(2), percentage };
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, newQuantity)
    }));
  };

  const handleAddToCart = (product: B2BProduct) => {
    const quantity = quantities[product.id] || product.min_order_quantity;
    addItem(product, quantity);
    setQuantities(prev => ({
      ...prev,
      [product.id]: 0
    }));
  };

  const getCartItemQuantity = (productId: string) => {
    const cartItem = cartItems.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto mobile-container py-4 lg:py-8">
          <NetworkAwareLoading
            fallback={
              <div className="text-center">
                <SkeletonCard className="max-w-md mx-auto mb-8" />
                <SkeletonGrid items={6} />
              </div>
            }
            slowConnectionFallback={
              <div className="text-center">
                <SkeletonCard className="max-w-md mx-auto mb-8" />
                <SkeletonGrid items={3} />
              </div>
            }
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Φόρτωση B2B προϊόντων...</p>
            </div>
          </NetworkAwareLoading>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={fetchB2BProducts}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile-optimized Header */}
        <div className="bg-white shadow safe-area-top">
          <div className="max-w-7xl mx-auto mobile-container">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 lg:py-6 space-y-4 lg:space-y-0">
              <TouchGestures onDoubleTap={() => window.location.reload()}>
                <div>
                  <h1 className="mobile-title lg:text-2xl font-bold text-gray-900">Dixis B2B Portal</h1>
                  <p className="mobile-caption lg:text-sm text-gray-600">Χονδρικές Πωλήσεις & Bulk Orders</p>
                </div>
              </TouchGestures>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Mobile-optimized Cart Summary */}
                <TouchGestures onLongPress={() => logger.debug('Cart summary long press')}>
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-md touch-feedback mobile-btn w-full sm:w-auto justify-center sm:justify-start">
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                    <span className="mobile-caption lg:text-sm font-medium text-green-700">
                      {cartItems.length} προϊόντα - €{getTotal().toFixed(2)}
                    </span>
                  </div>
                </TouchGestures>

                {/* Mobile-optimized Credit Status */}
                <TouchGestures onLongPress={() => logger.debug('Credit status long press')}>
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-md w-full sm:w-auto justify-center sm:justify-start">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="mobile-caption lg:text-sm font-medium text-blue-700">
                      Πίστωση: €{getAvailableCredit().toFixed(2)}
                    </span>
                  </div>
                </TouchGestures>

                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <span className="mobile-caption lg:text-sm text-gray-600">Καλώς ήρθατε, Test Business</span>
                  <TouchGestures onLongPress={() => logger.debug('Logout long press')}>
                    <Link
                      href="/b2b/login"
                      className="mobile-btn touch-feedback bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md mobile-caption lg:text-sm font-medium text-gray-700 w-full sm:w-auto text-center"
                    >
                      Αποσύνδεση
                    </Link>
                  </TouchGestures>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      {/* Mobile-optimized Main Content */}
      <div className="max-w-7xl mx-auto mobile-container py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile-optimized Left Column - Products */}
          <div className="flex-1">
            {/* Mobile-first Stats Cards */}
            <div className="mobile-b2b-stats lg:grid-cols-4 mb-6 lg:mb-8">
              <div className="mobile-b2b-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mobile-subtitle lg:text-lg font-semibold text-gray-900">Τρέχουσα Παραγγελία</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-green-600">€{getTotal().toFixed(2)}</p>
                    <p className="mobile-caption lg:text-sm text-gray-500">{cartItems.length} προϊόντα</p>
                  </div>
                  <ShoppingCart className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                </div>
              </div>
              
              <div className="mobile-b2b-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mobile-subtitle lg:text-lg font-semibold text-gray-900">Εξοικονόμηση</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-green-600">€{getTotalDiscount().toFixed(2)}</p>
                    <p className="mobile-caption lg:text-sm text-gray-500">Χονδρικές τιμές</p>
                  </div>
                  <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                </div>
              </div>
              
              <div className="mobile-b2b-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mobile-subtitle lg:text-lg font-semibold text-gray-900">Διαθέσιμη Πίστωση</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-600">€{getAvailableCredit().toFixed(2)}</p>
                    <p className="mobile-caption lg:text-sm text-gray-500">από €{creditLimit}</p>
                  </div>
                  <CreditCard className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="mobile-b2b-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mobile-subtitle lg:text-lg font-semibold text-gray-900">Διαθέσιμα Προϊόντα</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-600">{products.length}</p>
                    <p className="mobile-caption lg:text-sm text-gray-500">B2B κατάλογος</p>
                  </div>
                </div>
              </div>
        </div>

            {/* Mobile-optimized Products Grid */}
            <div className="mobile-card">
              <div className="p-4 lg:px-6 lg:py-4 border-b border-gray-200 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
                <div>
                  <h2 className="mobile-title lg:text-xl font-semibold text-gray-900">Κατάλογος Χονδρικής</h2>
                  <p className="mobile-caption lg:text-sm text-gray-600">Ειδικές τιμές για επιχειρήσεις</p>
                </div>
                <Link
                  href="/b2b/bulk-upload"
                  className="mobile-btn touch-feedback bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mobile-caption lg:text-sm font-medium flex items-center justify-center space-x-2 w-full lg:w-auto"
                >
                  <Upload className="w-4 h-4" />
                  <span>Bulk Upload</span>
                </Link>
              </div>

          {error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchB2BProducts}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Δοκιμάστε ξανά
              </button>
            </div>
          ) : (
            <IncrementalLoading<B2BProduct>
              items={products}
              initialCount={6}
              incrementCount={6}
              loadMoreText="Φόρτωση περισσότερων B2B προϊόντων"
              className="mobile-product-grid lg:grid-cols-3 p-4 lg:p-6"
              renderItem={(product: B2BProduct, index: number) => {
                const { savings, percentage } = calculateSavings(product.price, product.wholesale_price);
                
                return (
                  <LazyLoad key={product.id} threshold={0.1} rootMargin="50px">
                    <SwipeableCard
                      onSwipeLeft={() => handleAddToCart(product)}
                      onSwipeRight={() => logger.debug('Product swipe right', { productId: product.id })}
                      leftAction={{ icon: <span>🛒</span>, label: "Προσθήκη", color: "bg-green-500" }}
                      rightAction={{ icon: <span>ℹ️</span>, label: "Info", color: "bg-blue-500" }}
                    >
                      <TouchGestures
                        onLongPress={() => logger.debug('B2B Product long press', { productId: product.id })}
                        onDoubleTap={() => handleAddToCart(product)}
                      >
                        <div className="mobile-card touch-feedback border border-gray-200 p-3 lg:p-4 hover:shadow-md transition-shadow">
                          <ProgressiveImage
                            src={product.main_image}
                            alt={product.name}
                            className="w-full h-32 lg:h-48 object-cover rounded-md mb-3 lg:mb-4"
                            quality="medium"
                            placeholder="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=75&fit=crop&blur=10"
                          />
                          
                          <h3 className="mobile-subtitle lg:font-semibold text-gray-900 mb-2">{product.name}</h3>
                          <p className="mobile-caption lg:text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="mobile-caption lg:text-sm text-gray-500">Λιανική:</span>
                      <span className="mobile-caption lg:text-sm line-through text-gray-400">€{product.price}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="mobile-caption lg:text-sm font-medium text-green-600">Χονδρική:</span>
                      <span className="mobile-body lg:text-lg font-bold text-green-600">€{product.wholesale_price}</span>
                    </div>
                    
                    <div className="bg-green-50 p-2 rounded-md mb-3 lg:mb-4">
                      <p className="mobile-caption lg:text-sm text-green-700">
                        Εξοικονομείτε €{savings} ({percentage}%)
                      </p>
                    </div>
                    
                    <div className="mobile-caption text-gray-500 mb-3 lg:mb-4 space-y-1">
                      <p>Ελάχιστη παραγγελία: {product.min_order_quantity} τεμ.</p>
                      <p>Απόθεμα: {product.stock} τεμ.</p>
                      {product.bulk_discount_threshold && (
                        <p className="text-green-600">
                          Bulk έκπτωση {product.bulk_discount_percentage}% για {product.bulk_discount_threshold}+ τεμ.
                        </p>
                      )}
                    </div>

                    {/* Mobile-optimized Quantity Controls */}
                    <div className="mb-3 lg:mb-4">
                      <label className="block mobile-caption lg:text-sm font-medium text-gray-700 mb-2">
                        Ποσότητα
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(
                            product.id,
                            (quantities[product.id] || product.min_order_quantity) - 1
                          )}
                          className="mobile-btn touch-feedback p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                          disabled={(quantities[product.id] || product.min_order_quantity) <= product.min_order_quantity}
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <input
                          type="number"
                          min={product.min_order_quantity}
                          max={product.stock}
                          value={quantities[product.id] || product.min_order_quantity}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                          className="mobile-input w-20 text-center border border-gray-300 rounded-md py-2"
                        />

                        <button
                          onClick={() => handleQuantityChange(
                            product.id,
                            (quantities[product.id] || product.min_order_quantity) + 1
                          )}
                          className="mobile-btn touch-feedback p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                          disabled={(quantities[product.id] || product.min_order_quantity) >= product.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Cart Status */}
                      {getCartItemQuantity(product.id) > 0 && (
                        <p className="mobile-caption lg:text-sm text-green-600 mt-1">
                          Στο καλάθι: {getCartItemQuantity(product.id)} τεμ.
                        </p>
                      )}
                    </div>

                          <TouchGestures onLongPress={() => logger.debug('Add to B2B cart long press', { productId: product.id })}>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="mobile-btn touch-feedback w-full bg-green-600 hover:bg-green-700 text-white py-3 lg:py-2 px-4 rounded-md mobile-caption lg:text-sm font-medium flex items-center justify-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Προσθήκη στην Παραγγελία</span>
                            </button>
                          </TouchGestures>
                        </div>
                      </TouchGestures>
                    </SwipeableCard>
                  </LazyLoad>
                );
              }}
            />
          )}
        </div>

          </div> {/* End Left Column */}

          {/* Mobile-optimized Right Column - Order Summary */}
          <div className="w-full lg:w-80">
            <div className="mobile-card sticky top-4 lg:top-8">
              <div className="p-4 lg:px-6 lg:py-4 border-b border-gray-200">
                <h3 className="mobile-title lg:text-lg font-semibold text-gray-900">Σύνοψη Παραγγελίας</h3>
              </div>

            <div className="p-4 lg:p-6">
              {cartItems.length === 0 ? (
                <p className="mobile-body text-gray-500 text-center py-6 lg:py-8">
                  Δεν έχετε προσθέσει προϊόντα στην παραγγελία
                </p>
              ) : (
                <>
                  {/* Mobile-optimized Cart Items */}
                  <div className="space-y-3 mb-4 lg:mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="mobile-cart-item bg-gray-50 rounded-md">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 lg:w-12 lg:h-12 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="mobile-caption lg:text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="mobile-caption lg:text-sm text-gray-500">
                            {item.quantity} × €{item.wholesale_price}
                          </p>
                        </div>
                        <div className="mobile-cart-actions">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="mobile-btn touch-feedback p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="mobile-caption lg:text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="mobile-btn touch-feedback p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile-optimized Order Totals */}
                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="mobile-caption lg:text-sm text-gray-600">Υποσύνολο:</span>
                      <span className="mobile-caption lg:text-sm font-medium">€{getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="mobile-caption lg:text-sm text-green-600">Εξοικονόμηση:</span>
                      <span className="mobile-caption lg:text-sm font-medium text-green-600">-€{getTotalDiscount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mobile-body lg:text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Σύνολο:</span>
                      <span>€{getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Mobile-optimized Credit Check */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <div className="flex justify-between">
                      <span className="mobile-caption lg:text-sm text-blue-700">Διαθέσιμη Πίστωση:</span>
                      <span className="mobile-caption lg:text-sm font-medium text-blue-700">€{getAvailableCredit().toFixed(2)}</span>
                    </div>
                    {!canAffordOrder() && (
                      <p className="text-red-600 mobile-caption lg:text-sm mt-1">
                        Ανεπαρκής πίστωση για αυτή την παραγγελία
                      </p>
                    )}
                  </div>

                  {/* Mobile-optimized Order Action Buttons */}
                  {cartItems.length > 0 && (
                    <div className="mt-4 lg:mt-6 space-y-3">
                      <button
                        disabled={!canAffordOrder()}
                        className="mobile-btn touch-feedback w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium"
                      >
                        Υποβολή Παραγγελίας
                      </button>
                      <Link
                        href="/b2b/quotes/request"
                        className="mobile-btn touch-feedback w-full bg-blue-600 hover:bg-blue-700 text-white py-3 lg:py-2 px-4 rounded-md mobile-caption lg:text-sm text-center block"
                      >
                        Αίτημα Προσφοράς
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Mobile-optimized Navigation Links */}
              <div className="mt-4 lg:mt-6 space-y-3">
                <Link
                  href="/b2b/quotes"
                  className="mobile-btn touch-feedback w-full bg-gray-600 hover:bg-gray-700 text-white py-3 lg:py-2 px-4 rounded-md mobile-caption lg:text-sm text-center block"
                >
                  Οι Προσφορές μου
                </Link>
                <Link
                  href="/b2b/invoices"
                  className="mobile-btn touch-feedback w-full bg-purple-600 hover:bg-purple-700 text-white py-3 lg:py-2 px-4 rounded-md mobile-caption lg:text-sm text-center block"
                >
                  Τιμολόγια
                </Link>
                <Link
                  href="/b2b/analytics"
                  className="mobile-btn touch-feedback w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 lg:py-2 px-4 rounded-md mobile-caption lg:text-sm text-center block"
                >
                  Αναλυτικά Στοιχεία
                </Link>
              </div>
            </div>
          </div>
        </div>

        </div> {/* End Main Flex Container */}
      </div>
      </div>
    </PullToRefresh>
  );
}