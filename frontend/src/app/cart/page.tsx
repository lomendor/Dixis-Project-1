'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  ShoppingCart,
  CreditCard,
  Leaf,
  Users,
  MapPin,
  Award,
  Truck,
  TreePine,
  Star,
  Clock,
  Heart
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { isProductCartItem } from '@/lib/api/models/cart/types';

export default function CartPage() {
  const { 
    cart, 
    isLoading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCartStore();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να αδειάσετε το καλάθι;')) {
      await clearCart();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-6 bg-green-500/30 rounded w-32 mb-4"></div>
              <div className="h-10 bg-green-500/30 rounded w-64"></div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      </div>
                      <div className="h-10 bg-gray-300 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-32"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">Το Καλάθι σας</h1>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Σφάλμα φόρτωσης καλαθιού</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Δοκιμάστε ξανά
                </button>
                <Link
                  href="/products"
                  className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Επιστροφή στα προϊόντα
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="container mx-auto px-4 py-8">
            <Link 
              href="/products" 
              className="inline-flex items-center text-green-100 hover:text-white font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Συνέχεια αγορών
            </Link>
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-4 py-2 rounded-full text-sm font-medium">
                <Leaf className="mr-2 h-4 w-4" />
                Από τον Αγρό στο Τραπέζι σας
              </div>
            </div>
            <h1 className="text-4xl font-bold mt-4">Το Καλάθι σας</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Enhanced Empty State */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-gray-100">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center"
              >
                <ShoppingBag className="w-16 h-16 text-green-600" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Το καλάθι σας περιμένει τη φρεσκάδα!
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Ανακαλύψτε αυθεντικά ελληνικά προϊόντα από επιλεγμένους παραγωγούς 
                και φέρτε τη γεύση της φύσης στο σπίτι σας.
              </p>

              {/* Farm-to-Table Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">50+ Παραγωγοί</h3>
                  <p className="text-sm text-gray-600">Πιστοποιημένοι Έλληνες αγρότες</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">24h Παράδοση</h3>
                  <p className="text-sm text-gray-600">Φρέσκο από τον αγρό</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Βιολογικά</h3>
                  <p className="text-sm text-gray-600">Πιστοποιημένη ποιότητα</p>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/products"
                  className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Εξερεύνηση Προϊόντων
                  <span className="ml-2">→</span>
                </Link>
                
                <div className="text-center">
                  <Link
                    href="/producers"
                    className="text-green-600 hover:text-green-700 font-medium underline decoration-2 underline-offset-4"
                  >
                    Γνωρίστε τους παραγωγούς μας
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Group items by producer for marketplace organization
  const groupedItems = React.useMemo(() => {
    const groups: { [key: string]: typeof cart.items } = {};
    
    cart.items.forEach(item => {
      const producerName = (item as any).producer || 'Άγνωστος Παραγωγός';
      if (!groups[producerName]) {
        groups[producerName] = [];
      }
      groups[producerName].push(item);
    });
    
    return groups;
  }, [cart.items]);

  const producerNames = Object.keys(groupedItems);
  const totalProducers = producerNames.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/products" 
            className="inline-flex items-center text-green-100 hover:text-white font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Συνέχεια αγορών
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="inline-flex items-center bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-4 py-2 rounded-full text-sm font-medium">
                  <Leaf className="mr-2 h-4 w-4" />
                  Από τον Αγρό στο Τραπέζι σας
                </div>
                {totalProducers > 1 && (
                  <div className="inline-flex items-center bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-100 px-4 py-2 rounded-full text-sm font-medium">
                    <Users className="mr-2 h-4 w-4" />
                    {totalProducers} Παραγωγοί
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-bold">Το Καλάθι σας</h1>
              <p className="text-green-100 mt-2">
                {cart.itemCount} {cart.itemCount === 1 ? 'προϊόν' : 'προϊόντα'} 
                {totalProducers > 1 && ` από ${totalProducers} διαφορετικούς παραγωγούς`}
              </p>
            </div>
            
            <button
              onClick={handleClearCart}
              className="inline-flex items-center bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Άδειασμα καλαθιού
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">{/* Content continues below */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Cart Items with Producer Organization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Multi-Producer Summary */}
            {totalProducers > 1 && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Marketplace Καλάθι</h3>
                    <p className="text-sm text-gray-600">Προϊόντα από {totalProducers} διαφορετικούς παραγωγούς</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {producerNames.slice(0, 4).map((producerName, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-sm font-medium text-gray-900 truncate">{producerName}</div>
                      <div className="text-xs text-gray-600">{groupedItems[producerName].length} προϊόν{groupedItems[producerName].length !== 1 ? 'α' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Producer Sections */}
            {producerNames.map((producerName, producerIndex) => {
              const producerItems = groupedItems[producerName];
              const producerTotal = producerItems.reduce((sum, item) => sum + item.subtotal, 0);
              
              return (
                <motion.div
                  key={producerName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: producerIndex * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                >
                  {/* Producer Header */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-bold text-lg">
                            {producerName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{producerName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4 text-green-500" />
                              Κρήτη, Ελλάδα
                            </div>
                            <div className="flex items-center">
                              <Award className="mr-1 h-4 w-4 text-amber-500" />
                              Πιστοποιημένος
                            </div>
                            <div className="flex items-center">
                              <Star className="mr-1 h-4 w-4 text-yellow-500 fill-current" />
                              4.9
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          €{producerTotal.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {producerItems.length} προϊόν{producerItems.length !== 1 ? 'α' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Producer Story Snippet */}
                    <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700 italic">
                        "Καλλιεργούμε βιολογικά προϊόντα εδώ και τρεις γενιές, 
                        χρησιμοποιώντας παραδοσιακές μεθόδους για την καλύτερη ποιότητα."
                      </p>
                    </div>
                  </div>

                  {/* Producer Items */}
                  <div className="divide-y divide-gray-100">
                    {producerItems.map((item) => (
                      <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-4">
                          {/* Enhanced Product Image */}
                          <div className="flex-shrink-0 relative">
                            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.productName}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=96&h=96&fit=crop';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-2xl">🥗</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Organic Badge */}
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <Leaf className="h-3 w-3 text-white" />
                            </div>
                          </div>

                          {/* Enhanced Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {item.productName}
                            </h4>
                            
                            {/* Product Features */}
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Βιολογικό
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                Φρέσκο
                              </span>
                            </div>
                            
                            {/* Transparent Pricing */}
                            <div className="mb-3">
                              <div className="text-lg font-bold text-green-600">
                                €{((item as any).unitPrice || item.price).toFixed(2)}/κιλό
                              </div>
                              <div className="text-xs text-gray-600">
                                Παραγωγός λαμβάνει: €{(((item as any).unitPrice || item.price) * 0.75).toFixed(2)}
                              </div>
                            </div>

                            {/* Freshness Indicator */}
                            <div className="flex items-center text-xs text-green-600">
                              <Clock className="mr-1 h-3 w-3" />
                              Συλλέχθηκε εχθές
                            </div>
                          </div>

                          {/* Enhanced Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
                              <button
                                onClick={() => handleQuantityChange(String(item.id), item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                                disabled={isLoading}
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="px-4 py-2 font-bold text-gray-900 min-w-[3rem] text-center bg-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(String(item.id), item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                                disabled={isLoading}
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            {/* Enhanced Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(String(item.id))}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-sm border border-red-200"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Enhanced Item Total */}
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900 mb-1">
                              €{item.subtotal.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.quantity} × €{((item as any).unitPrice || item.price).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Producer Actions */}
                  <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <Link
                      href={`/producers/${producerName.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      <Users className="mr-1 h-4 w-4" />
                      Δείτε άλλα προϊόντα από {producerName}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Enhanced Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Σύνοψη Παραγγελίας</h2>
              </div>
              
              {/* Producer Breakdown */}
              {totalProducers > 1 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="mr-2 h-4 w-4 text-blue-600" />
                    Ανάλυση ανά Παραγωγό
                  </h3>
                  <div className="space-y-2">
                    {producerNames.map((producerName) => {
                      const producerTotal = groupedItems[producerName].reduce((sum, item) => sum + item.subtotal, 0);
                      return (
                        <div key={producerName} className="flex justify-between text-sm">
                          <span className="text-gray-700 truncate mr-2">{producerName}</span>
                          <span className="font-medium text-gray-900">€{producerTotal.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Υποσύνολο Προϊόντων</span>
                  <span className="font-medium">€{cart.subtotal.toFixed(2)}</span>
                </div>
                
                {/* Producer Revenue Transparency */}
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex justify-between text-sm text-green-800">
                    <span>Έσοδα Παραγωγών</span>
                    <span className="font-bold">€{(cart.subtotal * 0.75).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    75% πηγαίνει απευθείας στους παραγωγούς
                  </div>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center">
                    <Truck className="mr-1 h-4 w-4 text-green-500" />
                    <span>Μεταφορικά</span>
                  </div>
                  <span className="font-medium text-green-600">Δωρεάν</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Σύνολο</span>
                    <span className="text-lg font-bold text-green-600">
                      €{cart.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {cart.itemCount} προϊόν{cart.itemCount !== 1 ? 'α' : ''} από {totalProducers} παραγωγ{totalProducers > 1 ? 'ούς' : 'ό'}
                  </div>
                </div>
              </div>

              {/* Enhanced Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-lg transition-all duration-200 font-bold flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Προχώρηση στην Πληρωμή
                <span className="ml-2">→</span>
              </Link>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Συνέχεια Αγορών
              </Link>
            </div>

            {/* Farm-to-Table Promise */}
            <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TreePine className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900">Αυθεντική Ελληνική Εμπειρία</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-green-700">
                  <Leaf className="mr-3 h-4 w-4 text-green-500" />
                  <span>100% βιολογικά προϊόντα</span>
                </div>
                <div className="flex items-center text-blue-700">
                  <Clock className="mr-3 h-4 w-4 text-blue-500" />
                  <span>Παράδοση εντός 24 ωρών</span>
                </div>
                <div className="flex items-center text-amber-700">
                  <Award className="mr-3 h-4 w-4 text-amber-500" />
                  <span>Πιστοποιημένοι παραγωγοί</span>
                </div>
                <div className="flex items-center text-purple-700">
                  <Heart className="mr-3 h-4 w-4 text-purple-500" />
                  <span>Υποστήριξη τοπικών κοινοτήτων</span>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TreePine className="mr-2 h-4 w-4 text-green-700" />
                    <span className="text-sm font-medium text-green-900">Περιβαλλοντικό Αποτύπωμα</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-700">-60% CO₂</div>
                    <div className="text-xs text-green-600">vs μέσος όρος</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Trust */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-green-600" />
                Εγγυήσεις & Ασφάλεια
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Ασφαλής πληρωμή SSL</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Εγγύηση επιστροφής χρημάτων</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Εγγύηση φρεσκάδας</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Υποστήριξη 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}