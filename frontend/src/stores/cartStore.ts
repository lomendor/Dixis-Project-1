'use client'

import { create } from 'zustand'
import { Cart, CartItem, CartItemAttributes, ProductCartItem, AdoptionCartItem, isProductCartItem } from '@/lib/api/models/cart/types'
import { idToString, ID } from '@/lib/api/client/apiTypes'
import React, { useEffect, useState } from 'react'
import { cartApi } from '@/lib/api/services/cart/cartApi'
import { logger } from '@/lib/logging/productionLogger'
import { toError, getErrorMessage, errorToContext, stringToContext } from '@/lib/utils/errorUtils'

// Development logging helper
const devLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.info(message, data);
  }
};

// Cart Store State Interface
interface CartState {
  // Cart data
  cart: Cart | null
  isLoading: boolean
  error: string | null
  
  lastAddedItem: CartItem | null
  
  // Computed values
  itemCount: number
  subtotal: number
  total: number
  currency: string
}

// Cart Store Actions Interface with Adoption Support
interface CartActions {
  // Product cart operations
  addToCart: (productId: ID, quantity?: number, attributes?: CartItemAttributes) => Promise<void>
  
  // Adoption cart operations
  addAdoptionToCart: (adoptableItemId: ID, adoptionPlanId: ID, attributes?: CartItemAttributes) => Promise<void>
  
  // Common cart operations
  removeFromCart: (itemId: ID) => Promise<void>
  updateQuantity: (itemId: ID, quantity: number) => Promise<void>
  updateBulkQuantity: (itemId: ID, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  
  
  // Utility actions - enhanced for both types
  getProductQuantity: (productId: ID) => number
  getAdoptionQuantity: (adoptableItemId: ID, adoptionPlanId: ID) => number
  isProductInCart: (productId: ID) => boolean
  isAdoptionInCart: (adoptableItemId: ID, adoptionPlanId: ID) => boolean
  refreshCart: () => Promise<void>
  
  // Type-specific getters
  getProductItems: () => ProductCartItem[]
  getAdoptionItems: () => AdoptionCartItem[]
  getTotalProductValue: () => number
  getTotalAdoptionValue: () => number
  
  // B2B specific methods
  addBulkItems: (items: { productId: ID; quantity: number; attributes?: CartItemAttributes }[]) => Promise<void>
  getVolumeDiscountSavings: () => number
  getTotalBulkDiscount: () => number
  getCartSummaryWithDiscounts: () => { itemCount: number; subtotal: number; total: number; volumeDiscount: number; bulkSavings: number }
  checkMinimumOrderRequirements: () => { meets: boolean; missing: number }
  calculateNextDiscountThreshold: () => { quantity: number; discount: number; savings: number } | null
  migrateGuestCartToBusinessUser: (businessUserId: ID) => Promise<void>
  
  // Legacy support (deprecated but maintained for compatibility)
  getItemQuantity: (productId: ID) => number
  isInCart: (productId: ID) => boolean
  
  // Internal state setters
  setCart: (cart: Cart | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastAddedItem: (item: CartItem | null) => void
  
  // Hydration
  hydrate: () => void
}

// Combined Cart Store Type
type CartStore = CartState & CartActions

// Default cart state
const defaultCartState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  lastAddedItem: null,
  itemCount: 0,
  subtotal: 0,
  total: 0,
  currency: 'EUR',
}

// Create the Zustand cart store WITHOUT persistence for SSR compatibility
export const useCartStoreBase = create<CartStore>((set, get) => ({
  // Initial state
  ...defaultCartState,
  
  // Cart operations
  addToCart: async (productId: ID, quantity = 1, attributes?: CartItemAttributes) => {
    console.log('🏪 CartStore: addToCart called', { productId, quantity, attributes })
    const state = get()
    console.log('🏪 CartStore: Current state', { hasCart: !!state.cart, cartId: state.cart?.id })
    set({ isLoading: true, error: null })
    
    try {
      // Validation
      if (!productId) {
        console.error('🏪 CartStore: Product ID is required')
        throw new Error('Product ID is required')
      }
      
      if (quantity <= 0) {
        console.error('🏪 CartStore: Quantity must be greater than 0')
        throw new Error('Quantity must be greater than 0')
      }
      
      // Get or create cart
      let currentCart = state.cart;
      
      if (!currentCart) {
        console.log('🏪 CartStore: Creating guest cart...')
        // Create a guest cart first
        currentCart = await cartApi.createGuestCart();
        console.log('🏪 CartStore: Guest cart created:', currentCart)
        set({ cart: currentCart });
      }
      
      console.log('🏪 CartStore: Adding item to cart via API...', { cartId: currentCart.id, productId, quantity, attributes })
      // Add item to cart via API
      const addedItem = await cartApi.addItem(idToString(currentCart.id), productId, quantity, attributes);
      console.log('🏪 CartStore: Item added:', addedItem)
      
      // Refresh cart to get updated totals
      const updatedCart = await cartApi.getCart(idToString(currentCart.id));
      
      if (process.env.NODE_ENV === 'development') {
        logger.info('🛒 Cart updated via API:', {
          cart: updatedCart,
          itemCount: updatedCart.itemCount,
          items: updatedCart.items
        });
      }

      console.log('🏪 CartStore: API success - updating state', { updatedCart, addedItem })
      
      set({
        cart: updatedCart,
        lastAddedItem: addedItem,
        itemCount: updatedCart.itemCount,
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        isLoading: false
      });
      
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        console.log('🏪 CartStore: Saving to localStorage...')
        localStorage.setItem('dixis-cart-storage', JSON.stringify({
          state: { cart: updatedCart, lastAddedItem: addedItem },
          version: 0
        }));
        console.log('🏪 CartStore: Saved to localStorage successfully')
      }
      
    } catch (error) {
      console.log('🏪 CartStore: API failed, using fallback', error)
      logger.error('Error adding to cart via API, trying local fallback:', toError(error));

      // Fallback to local storage cart when API is not available
      try {
        console.log('🏪 CartStore: Starting fallback implementation...')
        const state = get();
        const localCart: Cart = state.cart || {
          id: 'local-cart',
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
          currency: 'EUR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Create a local cart item
        const localItem: ProductCartItem = {
          id: `local-${Date.now()}`,
          cartId: 'local-cart',
          type: 'product',
          productId: productId.toString(),
          productName: attributes?.productName || `Product ${productId}`,
          quantity: quantity,
          price: attributes?.price || 0,
          unitPrice: attributes?.price || 0,
          subtotal: (attributes?.price || 0) * quantity,
          image: attributes?.image || '/images/placeholder-product.svg',
          producer: attributes?.producer || 'Unknown Producer',
          attributes,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Check if item already exists
        const existingItemIndex = localCart.items.findIndex(
          item => isProductCartItem(item) && item.productId === productId.toString()
        );

        if (existingItemIndex >= 0) {
          // Update existing item (we know it's a ProductCartItem from the findIndex)
          const existingItem = localCart.items[existingItemIndex] as ProductCartItem;
          existingItem.quantity += quantity;
          existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
          existingItem.updatedAt = new Date().toISOString();
        } else {
          // Add new item
          localCart.items.push(localItem);
        }

        // Recalculate totals
        localCart.itemCount = localCart.items.reduce((sum, item) => sum + item.quantity, 0);
        localCart.subtotal = localCart.items.reduce((sum, item) => sum + item.subtotal, 0);
        localCart.total = localCart.subtotal;

        devLog('🛒 Item added to local cart (API fallback):', {
          productId,
          quantity,
          cart: localCart
        });

        set({
          cart: localCart,
          lastAddedItem: localItem,
          itemCount: localCart.itemCount,
          subtotal: localCart.subtotal,
          total: localCart.total,
          isLoading: false,
          error: null
        });

        // Save to localStorage
        if (typeof window !== 'undefined') {
          console.log('🏪 CartStore: Fallback - saving to localStorage...')
          localStorage.setItem('dixis-cart-storage', JSON.stringify({
            state: { cart: localCart, lastAddedItem: localItem },
            version: 0
          }));
          console.log('🏪 CartStore: Fallback - saved to localStorage successfully')
        }

      } catch (fallbackError) {
        logger.error('Local cart fallback also failed:', toError(fallbackError));
        set({
          error: 'Failed to add item to cart. Please try again.',
          isLoading: false
        });
      }
    }
  },
  
  // Adoption cart operations
  addAdoptionToCart: async (adoptableItemId: ID, adoptionPlanId: ID, attributes?: CartItemAttributes) => {
    const state = get()
    set({ isLoading: true, error: null })
    
    try {
      // Validation
      if (!adoptableItemId || !adoptionPlanId) {
        throw new Error('Adoption item ID and plan ID are required')
      }
      
      // Get or create cart
      let currentCart = state.cart;
      
      if (!currentCart) {
        // Create a guest cart first
        currentCart = await cartApi.createGuestCart();
        set({ cart: currentCart });
      }
      
      // For now, create a mock adoption cart item (will be replaced with API call)
      const adoptionItem: AdoptionCartItem = {
        id: `adoption-${Date.now()}`,
        cartId: currentCart.id,
        type: 'adoption',
        adoptableItemId,
        adoptionPlanId,
        quantity: 1, // Adoptions are typically quantity 1
        price: attributes?.price || 0,
        subtotal: attributes?.price || 0,
        productName: attributes?.productName || `Adoption ${adoptableItemId}`,
        image: attributes?.image || '/images/placeholder-adoption.svg',
        slug: attributes?.slug || '',
        producer: attributes?.producer || 'Unknown Producer',
        duration: attributes?.duration || 12,
        isRecurring: attributes?.isRecurring || false,
        attributes,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Update cart with adoption item
      const updatedCart = {
        ...currentCart,
        items: [...(currentCart.items || []), adoptionItem],
        itemCount: (currentCart.itemCount || 0) + 1,
        subtotal: (currentCart.subtotal || 0) + adoptionItem.subtotal,
        total: (currentCart.total || 0) + adoptionItem.subtotal
      };
      
      logger.info('🌿 Adoption added to cart:', {
        adoptionItem,
        updatedCart
      });
      
      set({
        cart: updatedCart,
        lastAddedItem: adoptionItem,
        itemCount: updatedCart.itemCount,
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        isLoading: false
      });
      
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('dixis-cart-storage', JSON.stringify({
          state: { cart: updatedCart, lastAddedItem: adoptionItem },
          version: 0
        }));
      }
      
    } catch (error) {
      logger.error('Error adding adoption to cart:', toError(error));
      set({
        error: 'Failed to add adoption to cart. Please try again.',
        isLoading: false
      });
    }
  },
  
  removeFromCart: async (itemId: ID) => {
    const state = get()
    set({ isLoading: true, error: null })

    try {
      if (!state.cart) {
        logger.info('🛒 No cart exists, nothing to remove');
        set({ isLoading: false });
        return;
      }

      // Check if item exists in cart before trying to remove
      const itemExists = state.cart.items.some(item => item.id === itemId.toString());
      if (!itemExists) {
        logger.info('🛒 Item not found in cart, nothing to remove');
        set({ isLoading: false });
        return;
      }

      // Remove item via API
      await cartApi.removeItem(idToString(state.cart.id), itemId);

      // Refresh cart to get updated totals
      const updatedCart = await cartApi.getCart(idToString(state.cart.id));

      logger.info('🛒 Item removed from cart via API:', {
        removedItemId: itemId,
        cart: updatedCart
      });

      set({
        cart: updatedCart,
        itemCount: updatedCart.itemCount,
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        isLoading: false
      });

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('dixis-cart-storage', JSON.stringify({
          state: { cart: updatedCart, lastAddedItem: null },
          version: 0
        }));
      }

    } catch (error) {
      logger.error('Error removing from cart:', toError(error));

      // If cart not found, create a new one
      if (error instanceof Error && error.message.includes('Cart not found')) {
        try {
          logger.info('🛒 Cart not found, creating new cart...');
          const newCart = await cartApi.createGuestCart();
          set({ cart: newCart, isLoading: false, error: null });
          return;
        } catch (createError) {
          logger.error('Error creating new cart:', toError(createError));
        }
      }

      // For other errors, just log and continue
      logger.warn('🛒 Cart operation failed, continuing with local state');
      set({ isLoading: false, error: null });
    }
  },
  
  updateQuantity: async (itemId: ID, quantity: number) => {
    const state = get()
    set({ isLoading: true, error: null })
    
    try {
      if (quantity <= 0) {
        await get().removeFromCart(itemId)
        return
      }
      
      if (!state.cart) {
        // Create a guest cart first
        const newCart = await cartApi.createGuestCart();
        set({ cart: newCart });
        // No items to update in a new cart
        set({ isLoading: false });
        return;
      }
      
      // Update item quantity via API
      await cartApi.updateItem(idToString(state.cart.id), itemId, quantity);
      
      // Refresh cart to get updated totals
      const updatedCart = await cartApi.getCart(idToString(state.cart.id));
      
      logger.info('🛒 Item quantity updated via API:', {
        itemId,
        newQuantity: quantity,
        cart: updatedCart
      });
      
      set({ 
        cart: updatedCart,
        itemCount: updatedCart.itemCount,
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        isLoading: false 
      });
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('dixis-cart-storage', JSON.stringify({
          state: { cart: updatedCart, lastAddedItem: null },
          version: 0
        }));
      }
      
    } catch (error) {
      logger.error('Error updating quantity:', toError(error));

      // If cart not found, create a new one and retry
      if (error instanceof Error && error.message.includes('Cart not found')) {
        try {
          logger.info('🛒 Cart not found, creating new cart...');
          const newCart = await cartApi.createGuestCart();
          set({ cart: newCart, isLoading: false, error: null });
          return;
        } catch (createError) {
          logger.error('Error creating new cart:', toError(createError));
        }
      }

      set({
        error: error instanceof Error ? error.message : 'Failed to update item quantity',
        isLoading: false
      });
    }
  },
  
  clearCart: async () => {
    const state = get()
    set({ isLoading: true, error: null })
    
    try {
      if (state.cart) {
        // Clear cart via API
        await cartApi.clearCart(idToString(state.cart.id));
        
        logger.info('🛒 Cart cleared via API');
      }
      
      set({ 
        cart: null,
        itemCount: 0,
        subtotal: 0,
        total: 0,
        lastAddedItem: null,
        isLoading: false 
      });
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dixis-cart-storage');
      }
      
    } catch (error) {
      logger.error('Error clearing cart:', toError(error));
      set({ 
        error: error instanceof Error ? error.message : 'Failed to clear cart',
        isLoading: false 
      });
    }
  },
  
  // Enhanced utility actions for both types
  getProductQuantity: (productId: ID) => {
    const state = get()
    if (!state.cart) return 0
    
    const item = state.cart.items.find(item => 
      item.type === 'product' && (item as ProductCartItem).productId === productId.toString()
    )
    return item ? item.quantity : 0
  },
  
  getAdoptionQuantity: (adoptableItemId: ID, adoptionPlanId: ID) => {
    const state = get()
    if (!state.cart) return 0
    
    const item = state.cart.items.find(item => 
      item.type === 'adoption' && 
      (item as AdoptionCartItem).adoptableItemId === adoptableItemId.toString() &&
      (item as AdoptionCartItem).adoptionPlanId === adoptionPlanId.toString()
    )
    return item ? item.quantity : 0
  },
  
  isProductInCart: (productId: ID) => {
    const state = get()
    if (!state.cart) return false
    
    return state.cart.items.some(item => 
      item.type === 'product' && (item as ProductCartItem).productId === productId.toString()
    )
  },
  
  isAdoptionInCart: (adoptableItemId: ID, adoptionPlanId: ID) => {
    const state = get()
    if (!state.cart) return false
    
    return state.cart.items.some(item => 
      item.type === 'adoption' && 
      (item as AdoptionCartItem).adoptableItemId === adoptableItemId.toString() &&
      (item as AdoptionCartItem).adoptionPlanId === adoptionPlanId.toString()
    )
  },
  
  // Type-specific getters
  getProductItems: () => {
    const state = get()
    if (!state.cart) return []
    
    return state.cart.items.filter(item => item.type === 'product') as ProductCartItem[]
  },
  
  getAdoptionItems: () => {
    const state = get()
    if (!state.cart) return []
    
    return state.cart.items.filter(item => item.type === 'adoption') as AdoptionCartItem[]
  },
  
  getTotalProductValue: () => {
    const state = get()
    if (!state.cart) return 0
    
    return state.cart.items
      .filter(item => item.type === 'product')
      .reduce((total, item) => total + item.subtotal, 0)
  },
  
  getTotalAdoptionValue: () => {
    const state = get()
    if (!state.cart) return 0
    
    return state.cart.items
      .filter(item => item.type === 'adoption')
      .reduce((total, item) => total + item.subtotal, 0)
  },
  
  // B2B specific implementations
  updateBulkQuantity: async (itemId: ID, quantity: number) => {
    const state = get()
    set({ isLoading: true, error: null })
    
    try {
      // Validate bulk quantity (minimum and maximum limits)
      if (quantity < 1) {
        throw new Error('Η ποσότητα πρέπει να είναι τουλάχιστον 1')
      }
      
      if (quantity > 1000) {
        throw new Error('Η μέγιστη ποσότητα χονδρικής είναι 1000 τεμάχια')
      }
      
      if (!state.cart) {
        const newCart = await cartApi.createGuestCart();
        set({ cart: newCart });
        set({ isLoading: false });
        return;
      }
      
      // Update item quantity via API with bulk recalculation
      await cartApi.updateItem(idToString(state.cart.id), itemId, quantity);
      
      // Refresh cart to get updated volume discounts
      const updatedCart = await cartApi.getCart(idToString(state.cart.id));
      
      logger.info('🛒 Bulk quantity updated:', {
        itemId,
        newQuantity: quantity,
        cart: updatedCart,
        volumeDiscounts: updatedCart.appliedVolumeDiscounts
      });
      
      set({ 
        cart: updatedCart,
        itemCount: updatedCart.itemCount,
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        isLoading: false 
      });
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('dixis-cart-storage', JSON.stringify({
          state: { cart: updatedCart, lastAddedItem: null },
          version: 0
        }));
      }
      
    } catch (error) {
      logger.error('Error updating bulk quantity:', toError(error));
      set({
        error: error instanceof Error ? error.message : 'Σφάλμα κατά την ενημέρωση ποσότητας',
        isLoading: false
      });
    }
  },

  addBulkItems: async (items: { productId: ID; quantity: number; attributes?: CartItemAttributes }[]) => {
    const state = get()
    set({ isLoading: true, error: null })
    
    try {
      if (items.length === 0) {
        throw new Error('Δεν υπάρχουν προϊόντα για προσθήκη')
      }
      
      // Get or create cart
      let currentCart = state.cart;
      if (!currentCart) {
        currentCart = await cartApi.createGuestCart();
        set({ cart: currentCart });
      }
      
      // Add items one by one (for now, can be optimized with a bulk API later)
      for (const item of items) {
        await cartApi.addItem(
          idToString(currentCart.id), 
          item.productId, 
          item.quantity, 
          item.attributes
        );
      }
      
      // Refresh cart to get final totals with volume discounts
      const updatedCart = await cartApi.getCart(idToString(currentCart.id));
      
      logger.info('🛒 Bulk items added:', {
        itemsCount: items.length,
        cart: updatedCart,
        totalVolumeSavings: updatedCart.totalBulkSavings
      });
      
      set({
        cart: updatedCart,
        itemCount: updatedCart.itemCount,
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        isLoading: false
      });
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('dixis-cart-storage', JSON.stringify({
          state: { cart: updatedCart, lastAddedItem: null },
          version: 0
        }));
      }
      
    } catch (error) {
      logger.error('Error adding bulk items:', toError(error));
      set({
        error: error instanceof Error ? error.message : 'Σφάλμα κατά την προσθήκη προϊόντων',
        isLoading: false
      });
    }
  },
  
  getVolumeDiscountSavings: () => {
    const state = get()
    return state?.cart?.totalVolumeDiscount || 0
  },
  
  getTotalBulkDiscount: () => {
    const state = get()
    return state?.cart?.totalBulkSavings || 0
  },
  
  getCartSummaryWithDiscounts: () => {
    const state = get()
    const cart = state.cart
    
    return {
      itemCount: cart?.itemCount || 0,
      subtotal: cart?.subtotal || 0,
      total: cart?.total || 0,
      volumeDiscount: cart?.totalVolumeDiscount || 0,
      bulkSavings: cart?.totalBulkSavings || 0
    }
  },
  
  checkMinimumOrderRequirements: () => {
    const state = get()
    const cart = state.cart
    const minimum = cart?.orderMinimum || 0
    const current = cart?.total || 0
    
    return {
      meets: current >= minimum,
      missing: Math.max(0, minimum - current)
    }
  },
  
  calculateNextDiscountThreshold: () => {
    const state = get()
    const cart = state.cart
    
    if (!cart || !cart.items.length) return null
    
    // Mock calculation - in real implementation, this would come from the backend
    const currentQuantity = cart.itemCount
    const thresholds = [10, 25, 50, 100, 250, 500]
    
    const nextThreshold = thresholds.find(threshold => threshold > currentQuantity)
    
    if (!nextThreshold) return null
    
    const discountPercentage = nextThreshold >= 100 ? 20 : nextThreshold >= 50 ? 15 : 10
    const averageItemPrice = cart.subtotal / currentQuantity
    const additionalQuantity = nextThreshold - currentQuantity
    const estimatedSavings = (nextThreshold * averageItemPrice * discountPercentage) / 100
    
    return {
      quantity: nextThreshold,
      discount: discountPercentage,
      savings: estimatedSavings
    }
  },

  migrateGuestCartToBusinessUser: async (businessUserId: ID) => {
    const state = get()
    set({ isLoading: true, error: null })
    
    try {
      if (!state.cart || state.cart.id === 'local-cart') {
        logger.info('🔄 No guest cart to migrate or already local')
        set({ isLoading: false })
        return
      }
      
      // Call the merge API to migrate guest cart to business user
      const mergedCart = await cartApi.mergeGuestCart(idToString(state.cart.id))
      
      // Update the cart with the merged data and mark it as B2B cart
      const updatedCart: Cart = {
        ...mergedCart,
        isB2BCart: true,
        businessUserId: businessUserId
      }
      
      logger.info('🔄 Guest cart migrated to business user:', {
        previousCartId: state.cart.id,
        newCartId: updatedCart.id,
        businessUserId,
        itemCount: updatedCart.itemCount
      })
      
      set({
        cart: updatedCart,
        itemCount: updatedCart.itemCount,
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        isLoading: false
      })
      
      // Update localStorage with the new cart
      if (typeof window !== 'undefined') {
        localStorage.setItem('dixis-cart-storage', JSON.stringify({
          state: { cart: updatedCart, lastAddedItem: null },
          version: 0
        }))
      }
      
    } catch (error) {
      logger.error('Error migrating guest cart:', toError(error))
      // In case of error, we can still continue with an empty B2B cart
      try {
        const newB2BCart = await cartApi.createGuestCart()
        const b2bCart: Cart = {
          ...newB2BCart,
          isB2BCart: true,
          businessUserId: businessUserId
        }
        
        set({
          cart: b2bCart,
          itemCount: 0,
          subtotal: 0,
          total: 0,
          isLoading: false,
          error: null
        })
        
        logger.info('🔄 Created new B2B cart after migration failure:', b2bCart)
      } catch (fallbackError) {
        logger.error('Failed to create fallback B2B cart:', toError(fallbackError))
        set({
          error: 'Σφάλμα κατά τη μετάβαση στο B2B καλάθι',
          isLoading: false
        })
      }
    }
  },

  // Legacy support (deprecated but maintained for compatibility)
  getItemQuantity: (productId: ID) => {
    return get().getProductQuantity(productId)
  },
  
  isInCart: (productId: ID) => {
    return get().isProductInCart(productId)
  },
  
  refreshCart: async () => {
    const state = get()
    set({ isLoading: true, error: null })
    
    try {
      if (state.cart) {
        // Refresh cart via API
        const updatedCart = await cartApi.getCart(idToString(state.cart.id));
        
        logger.info('🛒 Cart refreshed via API:', updatedCart);
        
        set({
          cart: updatedCart,
          itemCount: updatedCart.itemCount,
          subtotal: updatedCart.subtotal,
          total: updatedCart.total,
          isLoading: false
        });
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('dixis-cart-storage', JSON.stringify({
            state: { cart: updatedCart, lastAddedItem: null },
            version: 0
          }));
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      logger.error('Error refreshing cart:', toError(error));

      // If cart not found, create a new one
      if (error instanceof Error && error.message.includes('Cart not found')) {
        try {
          logger.info('🛒 Cart not found during refresh, creating new cart...');
          const newCart = await cartApi.createGuestCart();
          set({ cart: newCart, isLoading: false, error: null });
          return;
        } catch (createError) {
          logger.error('Error creating new cart during refresh:', toError(createError));
        }
      }

      set({
        error: error instanceof Error ? error.message : 'Failed to refresh cart',
        isLoading: false
      });
    }
  },
  
  // Internal state setters
  setCart: (cart: Cart | null) => {
    const itemCount = cart?.itemCount || 0
    const subtotal = cart?.subtotal || 0
    const total = cart?.total || 0
    const currency = cart?.currency || 'EUR'
    
    set({ cart, itemCount, subtotal, total, currency })
  },
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setLastAddedItem: (lastAddedItem: CartItem | null) => set({ lastAddedItem }),
  
  // Simplified hydration from localStorage
  hydrate: () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('dixis-cart-storage')
      
      if (stored) {
        const parsed = JSON.parse(stored)
        const state = parsed.state || parsed
        
        if (state?.cart && state.cart.id && Array.isArray(state.cart.items)) {
          // Safe cart restoration
          const cart = state.cart
          
          console.log('🔍 Cart hydration - restoring cart:', {
            id: cart.id,
            itemCount: cart.itemCount || 0,
            items: cart.items?.length || 0
          })
          
          set({
            cart,
            itemCount: cart.itemCount || 0,
            subtotal: cart.subtotal || 0,
            total: cart.total || 0,
            currency: cart.currency || 'EUR',
            lastAddedItem: state.lastAddedItem || null
          })
        }
      }
    } catch (error) {
      console.warn('Cart hydration failed:', error)
      // Clear corrupted data safely
      try {
        localStorage.removeItem('dixis-cart-storage')
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}))

// Simplified SSR-safe hooks
let hydrationCompleted = false; // Guard to prevent multiple hydrations

export const useCartStore = () => {
  const store = useCartStoreBase()
  
  // Expose store to window for debugging in development
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).useCartStore = useCartStoreBase;
      console.log('🛒 Cart store exposed to window.useCartStore');
    }
  }, [])
  
  useEffect(() => {
    // Hydrate on mount - simplified approach
    if (typeof window !== 'undefined') {
      console.log('🛒 Starting cart store hydration...')
      try {
        store.hydrate()
        console.log('🛒 Cart store hydrated successfully')
      } catch (error) {
        console.warn('Failed to hydrate cart store:', error)
      }
    }
  }, []) // Only run once on mount
  
  // Always return the store - no hydration blocking
  return store
}

// Individual hooks for better performance
export const useCartData = () => {
  const store = useCartStore()
  return store.cart
}

export const useCartLoading = () => {
  const store = useCartStore()
  return store?.isLoading || false
}

export const useCartError = () => {
  const store = useCartStore()
  return store?.error || null
}


export const useCartSummary = () => {
  const store = useCartStore()
  return {
    itemCount: store?.itemCount || 0,
    subtotal: store?.subtotal || 0,
    total: store?.total || 0,
    currency: store?.currency || 'EUR',
  }
}

export const useCartActions = () => {
  const store = useCartStore()
  // useCartStore already handles hydration state and returns safe defaults
  // when not hydrated, so we can safely destructure
  return {
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    getItemQuantity: store.getItemQuantity,
    isInCart: store.isInCart,
    refreshCart: store.refreshCart,
  }
}
