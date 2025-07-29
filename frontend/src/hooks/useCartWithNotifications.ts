'use client';

import { useCallback } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/contexts/ToastContext';
import { ID, CartItemAttributes } from '@/lib/api/client/apiTypes';
import { logger } from '@/lib/logging/productionLogger';
import { toError } from '@/lib/utils/errorUtils';

/**
 * Enhanced cart hook that provides cart functionality with toast notifications
 * This wraps the base cart store to provide user feedback via toast notifications
 */
export function useCartWithNotifications() {
  const cartStore = useCartStore();
  const { showSuccess, showError, showInfo } = useToast();

  // Enhanced addToCart with notifications
  const addToCart = useCallback(async (
    productId: ID, 
    quantity: number = 1, 
    attributes?: CartItemAttributes
  ) => {
    try {
      const productName = attributes?.productName || `Προϊόν ${productId}`;
      
      // Call the original cart store method
      await cartStore.addToCart(productId, quantity, attributes);
      
      // Show success notification
      showSuccess(
        'Προστέθηκε στο καλάθι!',
        `${productName} x${quantity} προστέθηκε με επιτυχία`,
        5000,
        {
          label: 'Δες καλάθι',
          onClick: () => {
            // Navigate to cart - could be enhanced to open cart sidebar
            window.location.href = '/cart';
          }
        }
      );
      
      logger.info('Cart notification: Product added successfully', {
        productId,
        quantity,
        productName
      });
      
    } catch (error) {
      logger.error('Cart notification: Failed to add product', toError(error));
      
      // Show error notification
      showError(
        'Σφάλμα προσθήκης',
        'Δεν ήταν δυνατή η προσθήκη του προϊόντος στο καλάθι. Παρακαλώ δοκιμάστε ξανά.',
        7000
      );
    }
  }, [cartStore, showSuccess, showError]);

  // Enhanced removeFromCart with notifications
  const removeFromCart = useCallback(async (itemId: ID) => {
    try {
      // Get item name before removing for notification
      const item = cartStore.cart?.items.find(item => item.id === itemId.toString());
      const itemName = item?.productName || 'Προϊόν';
      
      await cartStore.removeFromCart(itemId);
      
      showInfo(
        'Αφαιρέθηκε από το καλάθι',
        `${itemName} αφαιρέθηκε από το καλάθι σας`
      );
      
    } catch (error) {
      logger.error('Cart notification: Failed to remove item', toError(error));
      showError(
        'Σφάλμα αφαίρεσης',
        'Δεν ήταν δυνατή η αφαίρεση του προϊόντος. Παρακαλώ δοκιμάστε ξανά.'
      );
    }
  }, [cartStore, showInfo, showError]);

  // Enhanced updateQuantity with notifications
  const updateQuantity = useCallback(async (itemId: ID, quantity: number) => {
    try {
      const item = cartStore.cart?.items.find(item => item.id === itemId.toString());
      const itemName = item?.productName || 'Προϊόν';
      
      await cartStore.updateQuantity(itemId, quantity);
      
      if (quantity === 0) {
        showInfo(
          'Αφαιρέθηκε από το καλάθι',
          `${itemName} αφαιρέθηκε από το καλάθι σας`
        );
      } else {
        showSuccess(
          'Ενημερώθηκε η ποσότητα',
          `${itemName}: νέα ποσότητα ${quantity}`
        );
      }
      
    } catch (error) {
      logger.error('Cart notification: Failed to update quantity', toError(error));
      showError(
        'Σφάλμα ενημέρωσης',
        'Δεν ήταν δυνατή η ενημέρωση της ποσότητας. Παρακαλώ δοκιμάστε ξανά.'
      );
    }
  }, [cartStore, showSuccess, showInfo, showError]);

  // Enhanced clearCart with notifications
  const clearCart = useCallback(async () => {
    try {
      await cartStore.clearCart();
      
      showInfo(
        'Καλάθι αδειάστηκε',
        'Όλα τα προϊόντα αφαιρέθηκαν από το καλάθι σας'
      );
      
    } catch (error) {
      logger.error('Cart notification: Failed to clear cart', toError(error));
      showError(
        'Σφάλμα εκκαθάρισης',
        'Δεν ήταν δυνατή η εκκαθάριση του καλαθιού. Παρακαλώ δοκιμάστε ξανά.'
      );
    }
  }, [cartStore, showInfo, showError]);

  // Enhanced addBulkItems with notifications
  const addBulkItems = useCallback(async (
    items: { productId: ID; quantity: number; attributes?: CartItemAttributes }[]
  ) => {
    try {
      await cartStore.addBulkItems(items);
      
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      
      showSuccess(
        'Προϊόντα προστέθηκαν χονδρικώς!',
        `${totalItems} προϊόντα προστέθηκαν στο καλάθι σας`,
        6000,
        {
          label: 'Δες καλάθι',
          onClick: () => {
            window.location.href = '/cart';
          }
        }
      );
      
    } catch (error) {
      logger.error('Cart notification: Failed to add bulk items', toError(error));
      showError(
        'Σφάλμα χονδρικής προσθήκης',
        'Δεν ήταν δυνατή η προσθήκη των προϊόντων. Παρακαλώ δοκιμάστε ξανά.'
      );
    }
  }, [cartStore, showSuccess, showError]);

  // Return enhanced cart store with notification methods
  return {
    // Enhanced methods with notifications
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addBulkItems,
    
    // Pass through other cart store methods and properties
    cart: cartStore.cart,
    isLoading: cartStore.isLoading,
    error: cartStore.error,
    itemCount: cartStore.itemCount,
    subtotal: cartStore.subtotal,
    total: cartStore.total,
    currency: cartStore.currency,
    lastAddedItem: cartStore.lastAddedItem,
    
    // Utility methods (pass through - no notifications needed)
    getProductQuantity: cartStore.getProductQuantity,
    getAdoptionQuantity: cartStore.getAdoptionQuantity,
    isProductInCart: cartStore.isProductInCart,
    isAdoptionInCart: cartStore.isAdoptionInCart,
    refreshCart: cartStore.refreshCart,
    getProductItems: cartStore.getProductItems,
    getAdoptionItems: cartStore.getAdoptionItems,
    getTotalProductValue: cartStore.getTotalProductValue,
    getTotalAdoptionValue: cartStore.getTotalAdoptionValue,
    
    // B2B methods (pass through - could be enhanced with notifications later)
    updateBulkQuantity: cartStore.updateBulkQuantity,
    getVolumeDiscountSavings: cartStore.getVolumeDiscountSavings,
    getTotalBulkDiscount: cartStore.getTotalBulkDiscount,
    getCartSummaryWithDiscounts: cartStore.getCartSummaryWithDiscounts,
    checkMinimumOrderRequirements: cartStore.checkMinimumOrderRequirements,
    calculateNextDiscountThreshold: cartStore.calculateNextDiscountThreshold,
    migrateGuestCartToBusinessUser: cartStore.migrateGuestCartToBusinessUser,
    
    // Legacy support
    getItemQuantity: cartStore.getItemQuantity,
    isInCart: cartStore.isInCart,
    
    // Internal setters (pass through)
    setCart: cartStore.setCart,
    setLoading: cartStore.setLoading,
    setError: cartStore.setError,
    setLastAddedItem: cartStore.setLastAddedItem,
    hydrate: cartStore.hydrate
  };
}

// Convenience hook for just the enhanced actions
export function useCartActions() {
  const { 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    addBulkItems,
    getItemQuantity,
    isInCart,
    refreshCart
  } = useCartWithNotifications();
  
  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addBulkItems,
    getItemQuantity,
    isInCart,
    refreshCart
  };
}