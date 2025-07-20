'use client';

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import AdvancedBulkOrderCart from '@/components/b2b/cart/AdvancedBulkOrderCart';
import { BusinessTier } from '@/components/b2b/pricing/AdvancedWholesalePricing';
import { useB2BCartStore } from '@/stores/b2b/b2bCartStore';
import { SkeletonCard } from '@/components/mobile/ProgressiveLoading';
import Link from 'next/link';
import { ArrowLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

// Interface matching the AdvancedBulkOrderCart requirements
interface BulkCartItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  unitPrice: number;
  quantity: number;
  minimumQuantity: number;
  subtotal: number;
  tier: BusinessTier;
  producer: string;
  sku?: string;
}

interface BulkOrderSummary {
  subtotal: number;
  tierDiscount: number;
  volumeDiscount: number;
  shippingCost: number;
  vatAmount: number;
  total: number;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
}

export default function B2BCartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTier, setCurrentTier] = useState<BusinessTier>(BusinessTier.BRONZE);
  
  // Using the existing B2B cart store
  const {
    items: storeItems,
    updateQuantity: storeUpdateQuantity,
    removeItem: storeRemoveItem,
    getSubtotal,
    getTotalDiscount,
    getTotal,
    getAvailableCredit,
    creditLimit,
  } = useB2BCartStore();

  // Transform store items to match AdvancedBulkOrderCart interface
  const [cartItems, setCartItems] = useState<BulkCartItem[]>([]);
  const [orderSummary, setOrderSummary] = useState<BulkOrderSummary>({
    subtotal: 0,
    tierDiscount: 0,
    volumeDiscount: 0,
    shippingCost: 0,
    vatAmount: 0,
    total: 0,
    creditLimit: 5000,
    creditUsed: 1200,
    creditAvailable: 3800
  });

  useEffect(() => {
    // Simulate loading and transform data
    setIsLoading(true);
    
    // Transform store items to match the expected interface
    const transformedItems: BulkCartItem[] = storeItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.name,
      image: item.image || '/images/placeholder-product.jpg',
      unitPrice: item.wholesalePrice || item.price,
      quantity: item.quantity,
      minimumQuantity: item.minOrderQuantity || 1,
      subtotal: (item.wholesalePrice || item.price) * item.quantity,
      tier: currentTier,
      producer: item.producer || 'Unknown Producer',
      sku: item.sku
    }));

    setCartItems(transformedItems);

    // Calculate order summary
    const subtotal = getSubtotal();
    const discount = getTotalDiscount();
    const total = getTotal();
    const shippingCost = calculateShipping(transformedItems, currentTier);
    const vatAmount = total * 0.24; // Greek VAT rate

    setOrderSummary({
      subtotal,
      tierDiscount: discount,
      volumeDiscount: calculateVolumeDiscount(transformedItems),
      shippingCost,
      vatAmount,
      total: total + shippingCost + vatAmount,
      creditLimit: creditLimit || 5000,
      creditUsed: (creditLimit || 5000) - (getAvailableCredit() || 0),
      creditAvailable: getAvailableCredit() || 0
    });

    setIsLoading(false);
  }, [storeItems, currentTier, getSubtotal, getTotalDiscount, getTotal, getAvailableCredit, creditLimit]);

  const calculateShipping = (items: BulkCartItem[], tier: BusinessTier): number => {
    // Free shipping for Silver, Gold, Platinum tiers
    if ([BusinessTier.SILVER, BusinessTier.GOLD, BusinessTier.PLATINUM].includes(tier)) {
      return 0;
    }
    
    // Calculate shipping based on total quantity
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 100) return 0; // Free shipping for large orders
    if (totalQuantity > 50) return 15;
    return 25;
  };

  const calculateVolumeDiscount = (items: BulkCartItem[]): number => {
    // Simple volume discount calculation
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    if (totalQuantity >= 500) return subtotal * 0.18;
    if (totalQuantity >= 200) return subtotal * 0.12;
    if (totalQuantity >= 100) return subtotal * 0.08;
    if (totalQuantity >= 50) return subtotal * 0.05;
    
    return 0;
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const storeItem = storeItems.find(item => item.id === itemId);
    if (storeItem) {
      storeUpdateQuantity(storeItem.productId, quantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const storeItem = storeItems.find(item => item.id === itemId);
    if (storeItem) {
      storeRemoveItem(storeItem.productId);
    }
  };

  const handleAddNote = (note: string) => {
    console.log('Order note added:', note);
    // In real implementation, this would update the order in the store
  };

  const handleSetPONumber = (poNumber: string) => {
    console.log('PO number set:', poNumber);
    // In real implementation, this would update the order in the store
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate order submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the API to submit the order
      console.log('Order submitted:', {
        items: cartItems,
        summary: orderSummary,
        tier: currentTier
      });
      
      // Redirect to order confirmation or clear cart
      alert('Order submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <SkeletonCard className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} className="h-24" />
              ))}
            </div>
            <SkeletonCard className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link
              href="/b2b/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Products
            </Link>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started with your bulk order.</p>
            <Link
              href="/b2b/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link
            href="/b2b/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <ErrorBoundary fallback={
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Cart Error</h2>
            <p className="text-red-600">Unable to load cart. Please try refreshing the page.</p>
          </div>
        }>
          <AdvancedBulkOrderCart
            items={cartItems}
            summary={orderSummary}
            currentTier={currentTier}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onAddNote={handleAddNote}
            onSetPONumber={handleSetPONumber}
            onSubmitOrder={handleSubmitOrder}
            isLoading={isSubmitting}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}