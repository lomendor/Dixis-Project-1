'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { apiClient } from '@/lib/api/client/apiClient';
import { Cart, CartItem, CartItemAttributes, BulkOrderRequest, B2BCartSummary } from '@/lib/api/models/cart/types';
import { ID } from '@/lib/api/client/apiTypes';

// Use environment flag to determine if we use real API or fallback
const USE_REAL_CART_API = process.env.NEXT_PUBLIC_USE_REAL_CART === 'true';

// MOCK DATA for development fallback
let mockCart: Cart | null = null;
let mockCartId = 'mock-cart-' + Date.now();

function createMockCart(): Cart {
  return {
    id: mockCartId,
    items: [],
    itemCount: 0,
    subtotal: 0,
    total: 0,
    currency: 'EUR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createMockCartItem(productId: ID, quantity: number, attributes?: CartItemAttributes): CartItem {
  const price = 15.99; // Mock price
  const subtotal = price * quantity;

  return {
    id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    productId: productId.toString(),
    productName: `Mock Product ${productId}`,
    price,
    quantity,
    subtotal,
    attributes: attributes || {},
    image: undefined,
    slug: `mock-product-${productId}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function updateMockCartTotals(cart: Cart): Cart {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal; // No taxes/shipping for now

  return {
    ...cart,
    itemCount,
    subtotal,
    total,
    updatedAt: new Date().toISOString(),
  };
}

export class CartApiService {
  private static instance: CartApiService;

  static getInstance(): CartApiService {
    if (!CartApiService.instance) {
      CartApiService.instance = new CartApiService();
    }
    return CartApiService.instance;
  }

  private async tryApiCall<T>(apiCall: () => Promise<T>, fallback: () => T): Promise<T> {
    try {
      const result = await apiCall();
      logger.info('✅ Cart API call successful');
      return result;
    } catch (error) {
      logger.error('❌ Cart API call failed, using fallback:', toError(error), errorToContext(error));
      try {
        const fallbackResult = fallback();
        logger.info('🔄 Cart fallback successful');
        return fallbackResult;
      } catch (fallbackError) {
        logger.error('❌ Cart fallback also failed:', toError(fallbackError), errorToContext(fallbackError));
        throw error; // Throw original API error
      }
    }
  }

  /**
   * Get user's cart (requires authentication)
   */
  async getUserCart(): Promise<Cart> {
    return this.tryApiCall(
      async () => {
        const response = await apiClient.get('/api/v1/cart');
        return response.data;
      },
      () => {
        if (!mockCart) {
          mockCart = createMockCart();
        }
        return mockCart;
      }
    );
  }

  /**
   * Create a guest cart
   */
  async createGuestCart(): Promise<Cart> {
    return this.tryApiCall(
      async () => {
        // Use Next.js API proxy instead of direct backend call
        const response = await fetch('/api/cart/guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      },
      () => {
        mockCart = createMockCart();
        logger.info('🛒 Created mock guest cart:', mockCart);
        return mockCart;
      }
    );
  }

  /**
   * Get cart by ID
   */
  async getCart(cartId: string): Promise<Cart> {
    return this.tryApiCall(
      async () => {
        // Use Next.js API proxy instead of direct backend call
        const response = await fetch(`/api/cart/${cartId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      },
      () => {
        if (!mockCart || mockCart.id !== cartId) {
          mockCart = createMockCart();
          mockCart.id = cartId;
        }
        logger.info('🛒 Retrieved mock cart:', mockCart);
        return mockCart;
      }
    );
  }

  /**
   * Add item to cart
   */
  async addItem(
    cartId: string,
    productId: ID,
    quantity: number = 1,
    attributes?: CartItemAttributes
  ): Promise<CartItem> {
    return this.tryApiCall(
      async () => {
        // Use Next.js API proxy instead of direct backend call
        const response = await fetch(`/api/cart/${cartId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            quantity,
            attributes: attributes || {}
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      },
      () => {
        // Mock implementation
        if (!mockCart) {
          mockCart = createMockCart();
          mockCart.id = cartId;
        }

        // Check if item already exists
        const existingItemIndex = mockCart.items.findIndex(
          item => item.productId === productId.toString()
        );

        let addedItem: CartItem;

        if (existingItemIndex >= 0) {
          // Update existing item
          const existingItem = mockCart.items[existingItemIndex];
          existingItem.quantity += quantity;
          existingItem.subtotal = existingItem.price * existingItem.quantity;
          existingItem.updatedAt = new Date().toISOString();
          addedItem = existingItem;
        } else {
          // Add new item
          addedItem = createMockCartItem(productId, quantity, attributes);
          mockCart.items.push(addedItem);
        }

        // Update cart totals
        mockCart = updateMockCartTotals(mockCart);

        logger.info('🛒 Added item to mock cart:', { addedItem, cart: mockCart });
        return addedItem;
      }
    );
  }

  /**
   * Update item quantity
   */
  async updateItem(cartId: string, itemId: ID, quantity: number): Promise<CartItem> {
    return this.tryApiCall(
      async () => {
        // Use Next.js API proxy instead of direct backend call
        const response = await fetch(`/api/cart/${cartId}/items`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_id: itemId,
            quantity
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      },
      () => {
        if (!mockCart) {
          throw new Error('Cart not found');
        }

        const itemIndex = mockCart.items.findIndex(item => item.id === itemId.toString());
        if (itemIndex === -1) {
          throw new Error('Item not found in cart');
        }

        const item = mockCart.items[itemIndex];
        item.quantity = quantity;
        item.subtotal = item.price * quantity;
        item.updatedAt = new Date().toISOString();

        mockCart = updateMockCartTotals(mockCart);

        logger.info('🛒 Updated item in mock cart:', { item, cart: mockCart });
        return item;
      }
    );
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, itemId: ID): Promise<void> {
    return this.tryApiCall(
      async () => {
        // Use Next.js API proxy instead of direct backend call
        const response = await fetch(`/api/cart/${cartId}/items?item_id=${itemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      },
      () => {
        if (!mockCart) {
          return;
        }

        const itemIndex = mockCart.items.findIndex(item => item.id === itemId.toString());
        if (itemIndex >= 0) {
          mockCart.items.splice(itemIndex, 1);
          mockCart = updateMockCartTotals(mockCart);
          logger.info('🛒 Removed item from mock cart:', { itemId, cart: mockCart });
        }
      }
    );
  }

  /**
   * Clear entire cart
   */
  async clearCart(cartId: string): Promise<void> {
    return this.tryApiCall(
      async () => {
        // Use Next.js API proxy instead of direct backend call
        const response = await fetch(`/api/cart/${cartId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      },
      () => {
        if (mockCart) {
          mockCart.items = [];
          mockCart = updateMockCartTotals(mockCart);
          logger.info('🛒 Cleared mock cart:', mockCart);
        }
      }
    );
  }

  /**
   * Merge guest cart with user cart (after login)
   */
  async mergeGuestCart(guestCartId: string): Promise<Cart> {
    return this.tryApiCall(
      async () => {
        const response = await apiClient.post(`/api/v1/cart/merge/${guestCartId}`);
        return response.data;
      },
      () => {
        // For mock, just return the current cart
        if (!mockCart) {
          mockCart = createMockCart();
        }
        logger.info('🛒 Mock cart merge (no-op):', mockCart);
        return mockCart;
      }
    );
  }

  /**
   * Create bulk order for B2B customers
   */
  async createBulkOrder(bulkOrderRequest: BulkOrderRequest): Promise<Cart> {
    return this.tryApiCall(
      async () => {
        const response = await apiClient.post('/api/v1/cart/bulk-order', {
          items: bulkOrderRequest.items,
          requested_delivery_date: bulkOrderRequest.requestedDeliveryDate,
          credit_terms: bulkOrderRequest.creditTerms,
          special_instructions: bulkOrderRequest.specialInstructions
        });
        return this.transformCartFromBackend(response.data);
      },
      () => {
        throw new Error('Bulk order is only available with backend integration');
      }
    );
  }

  /**
   * Get B2B cart summary with volume discounts
   */
  async getB2BCartSummary(cartId: string): Promise<B2BCartSummary> {
    return this.tryApiCall(
      async () => {
        const response = await apiClient.get(`/api/v1/cart/${cartId}/b2b-summary`);
        return response.data;
      },
      () => {
        // Mock B2B summary
        return {
          itemCount: mockCart?.itemCount || 0,
          subtotal: mockCart?.subtotal || 0,
          total: mockCart?.total || 0,
          currency: 'EUR',
          totalVolumeDiscount: 0,
          totalBulkSavings: 0,
          estimatedSavings: 0,
          averageDiscount: 0
        };
      }
    );
  }

  /**
   * Transform cart data from Laravel backend format to frontend format
   */
  private transformCartFromBackend(backendCart: any): Cart {
    return {
      id: backendCart.id || backendCart.cart_id,
      userId: backendCart.user_id,
      sessionId: backendCart.session_id,
      items: (backendCart.items || []).map((item: any) => this.transformCartItemFromBackend(item)),
      itemCount: backendCart.item_count || backendCart?.items?.length || 0,
      subtotal: parseFloat(backendCart.subtotal || '0'),
      total: parseFloat(backendCart.total || '0'),
      discount: parseFloat(backendCart.discount || '0'),
      discountAmount: parseFloat(backendCart.discount_amount || '0'),
      shippingCost: parseFloat(backendCart.shipping_cost || '0'),
      taxAmount: parseFloat(backendCart.tax_amount || '0'),
      currency: backendCart.currency || 'EUR',
      expiresAt: backendCart.expires_at,
      createdAt: backendCart.created_at || new Date().toISOString(),
      updatedAt: backendCart.updated_at || new Date().toISOString(),
      
      // B2B specific fields
      isB2BCart: backendCart.is_b2b_cart || false,
      businessUserId: backendCart.business_user_id,
      totalVolumeDiscount: parseFloat(backendCart.total_volume_discount || '0'),
      totalBulkSavings: parseFloat(backendCart.total_bulk_savings || '0'),
      appliedVolumeDiscounts: backendCart.applied_volume_discounts || [],
      creditTerms: backendCart.credit_terms,
      paymentDue: backendCart.payment_due,
      orderMinimum: parseFloat(backendCart.order_minimum || '0'),
      orderMaximum: parseFloat(backendCart.order_maximum || '0')
    };
  }

  /**
   * Transform cart item data from Laravel backend format to frontend format
   */
  private transformCartItemFromBackend(backendItem: any): CartItem {
    const baseItem = {
      id: backendItem.id,
      cartId: backendItem.cart_id,
      type: 'product' as const,
      quantity: parseInt(backendItem.quantity || '1'),
      price: parseFloat(backendItem.price || '0'),
      originalPrice: parseFloat(backendItem.original_price || backendItem.price || '0'),
      productName: backendItem.product_name || backendItem.name || '',
      subtotal: parseFloat(backendItem.subtotal || '0'),
      image: backendItem.image || backendItem?.product?.main_image,
      slug: backendItem.slug || backendItem?.product?.slug,
      producer: backendItem.producer || backendItem?.product?.producer?.business_name,
      attributes: {
        ...backendItem.attributes,
        bulkDiscount: parseFloat(backendItem.bulk_discount || '0'),
        volumeDiscountTier: backendItem.volume_discount_tier,
        wholesalePrice: parseFloat(backendItem.wholesale_price || '0'),
        isB2BPricing: backendItem.is_b2b_pricing || false,
        minOrderQuantity: parseInt(backendItem.min_order_quantity || '1'),
        leadTimeDays: parseInt(backendItem.lead_time_days || '0'),
        customPricing: backendItem.custom_pricing || false,
        creditTerms: backendItem.credit_terms
      },
      addedAt: backendItem.created_at || new Date().toISOString(),
      updatedAt: backendItem.updated_at || new Date().toISOString()
    };

    // Add product-specific fields
    return {
      ...baseItem,
      productId: backendItem.product_id || backendItem.productId,
      product: backendItem.product,
      unitPrice: parseFloat(backendItem.unit_price || backendItem.price || '0')
    };
  }
}

// Export singleton instance
export const cartApi = CartApiService.getInstance();