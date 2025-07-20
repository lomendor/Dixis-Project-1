import { ID } from '../../client/apiTypes';
import { Product, SimpleProduct } from '../product/types';
import { AdoptableItem, AdoptionPlan } from '../adoption/types';

/**
 * Cart item type discriminator
 */
export type CartItemType = 'product' | 'adoption';

/**
 * Base cart item interface with common properties
 */
export interface BaseCartItem {
  id: ID;
  cartId: ID;
  type: CartItemType;
  quantity: number;
  price: number; // Price at the time of adding to cart
  originalPrice?: number; // Original price if there's a discount
  productName: string; // Display name - used in checkout
  subtotal: number; // Calculated as price * quantity - used in checkout
  image?: string; // Image URL
  slug?: string; // Slug for navigation
  producer?: string; // Producer name
  attributes?: CartItemAttributes;
  addedAt: string;
  updatedAt: string;
}

/**
 * Product cart item
 */
export interface ProductCartItem extends BaseCartItem {
  type: 'product';
  productId: ID;
  product?: Product | SimpleProduct;
  unitPrice: number; // Unit price for calculations (same as price but explicit for legacy compatibility)
}

/**
 * Adoption cart item with plan details
 */
export interface AdoptionCartItem extends BaseCartItem {
  type: 'adoption';
  adoptableItemId: ID;
  adoptionPlanId: ID;
  adoptableItem?: AdoptableItem;
  adoptionPlan?: AdoptionPlan;
  // Adoption-specific properties
  duration: number; // Duration in months
  benefits?: string[]; // Plan benefits
  isRecurring: boolean; // Whether this is a recurring payment
  recurringInterval?: 'monthly' | 'yearly'; // Recurring interval
}

/**
 * Union type for all cart items
 */
export type CartItem = ProductCartItem | AdoptionCartItem;

/**
 * Cart item attributes for product variations and adoption customizations
 */
export interface CartItemAttributes {
  // Product attributes
  size?: string;
  color?: string;
  weight?: string;
  packaging?: string;
  
  // B2B attributes
  bulkDiscount?: number;
  volumeDiscountTier?: number;
  wholesalePrice?: number;
  isB2BPricing?: boolean;
  minOrderQuantity?: number;
  leadTimeDays?: number;
  customPricing?: boolean;
  creditTerms?: string;
  
  // Adoption attributes
  personalMessage?: string;
  certificateName?: string;
  giftMessage?: string;
  
  // Common attributes
  notes?: string;
  [key: string]: any;
}

/**
 * Cart interface representing the shopping cart
 */
export interface Cart {
  id: ID;
  userId?: ID;
  sessionId?: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  discount?: number;
  discountAmount?: number;
  shippingCost?: number;
  taxAmount?: number;
  currency: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // B2B specific fields
  isB2BCart?: boolean;
  businessUserId?: ID;
  totalVolumeDiscount?: number;
  totalBulkSavings?: number;
  appliedVolumeDiscounts?: VolumeDiscountApplied[];
  creditTerms?: string;
  paymentDue?: string;
  orderMinimum?: number;
  orderMaximum?: number;
}

/**
 * Cart state for the context
 */
export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isOpen: boolean; // For cart drawer
  lastAddedItem: CartItem | null;
}

/**
 * Cart actions interface with adoption support
 */
export interface CartActions {
  // Product cart operations
  addToCart: (productId: ID, quantity?: number, attributes?: CartItemAttributes) => Promise<void>;
  
  // Adoption cart operations
  addAdoptionToCart: (adoptableItemId: ID, adoptionPlanId: ID, attributes?: CartItemAttributes) => Promise<void>;
  
  // Common cart operations
  removeFromCart: (itemId: ID) => Promise<void>;
  updateQuantity: (itemId: ID, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // UI operations
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Utility operations - updated for both types
  getProductQuantity: (productId: ID) => number;
  getAdoptionQuantity: (adoptableItemId: ID, adoptionPlanId: ID) => number;
  isProductInCart: (productId: ID) => boolean;
  isAdoptionInCart: (adoptableItemId: ID, adoptionPlanId: ID) => boolean;
  refreshCart: () => Promise<void>;
  
  // Type-specific getters
  getProductItems: () => ProductCartItem[];
  getAdoptionItems: () => AdoptionCartItem[];
  getTotalProductValue: () => number;
  getTotalAdoptionValue: () => number;
}

/**
 * Add product to cart request payload
 */
export interface AddToCartRequest {
  productId: ID;
  quantity: number;
  attributes?: CartItemAttributes;
}

/**
 * Add adoption to cart request payload
 */
export interface AddAdoptionToCartRequest {
  adoptableItemId: ID;
  adoptionPlanId: ID;
  quantity?: number; // Usually 1 for adoptions
  attributes?: CartItemAttributes;
}

/**
 * Update cart item request payload
 */
export interface UpdateCartItemRequest {
  quantity: number;
  attributes?: CartItemAttributes;
}

/**
 * Cart summary for quick display
 */
export interface CartSummary {
  itemCount: number;
  subtotal: number;
  total: number;
  currency: string;
}

/**
 * Cart validation result
 */
export interface CartValidation {
  isValid: boolean;
  errors: CartValidationError[];
  warnings: CartValidationWarning[];
}

/**
 * Cart validation error
 */
export interface CartValidationError {
  itemId: ID;
  productId: ID;
  type: 'out_of_stock' | 'insufficient_stock' | 'product_unavailable' | 'price_changed';
  message: string;
  currentStock?: number;
  requestedQuantity?: number;
  newPrice?: number;
}

/**
 * Cart validation warning
 */
export interface CartValidationWarning {
  itemId: ID;
  productId: ID;
  type: 'low_stock' | 'price_increase' | 'price_decrease';
  message: string;
  details?: any;
}

/**
 * Cart persistence options
 */
export interface CartPersistenceOptions {
  enableLocalStorage: boolean;
  enableSessionStorage: boolean;
  autoSync: boolean;
  syncInterval: number; // in milliseconds
}

/**
 * Cart configuration
 */
export interface CartConfig {
  maxItems: number;
  maxQuantityPerItem: number;
  enableGuestCart: boolean;
  guestCartExpiration: number; // in days
  persistence: CartPersistenceOptions;
  validation: {
    enableStockValidation: boolean;
    enablePriceValidation: boolean;
    validateOnAdd: boolean;
    validateOnUpdate: boolean;
  };
}

/**
 * B2B Volume Discount Interface
 */
export interface VolumeDiscount {
  minQuantity: number;
  discountPercentage: number;
  discountAmount?: number;
  pricePerUnit: number;
}

/**
 * Applied Volume Discount Interface
 */
export interface VolumeDiscountApplied {
  productId: ID;
  tier: VolumeDiscount;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  quantity: number;
}

/**
 * B2B Cart Configuration
 */
export interface B2BCartConfig {
  enableVolumeDiscounts: boolean;
  enableBulkOrdering: boolean;
  enableCreditTerms: boolean;
  maxBulkQuantity: number;
  volumeDiscountThresholds: number[];
  creditTermsOptions: string[];
}

/**
 * Default cart configuration
 */
export const DEFAULT_CART_CONFIG: CartConfig = {
  maxItems: 50,
  maxQuantityPerItem: 99,
  enableGuestCart: true,
  guestCartExpiration: 30,
  persistence: {
    enableLocalStorage: true,
    enableSessionStorage: false,
    autoSync: true,
    syncInterval: 30000, // 30 seconds
  },
  validation: {
    enableStockValidation: true,
    enablePriceValidation: true,
    validateOnAdd: true,
    validateOnUpdate: true,
  },
};

/**
 * Default B2B cart configuration
 */
export const DEFAULT_B2B_CART_CONFIG: B2BCartConfig = {
  enableVolumeDiscounts: true,
  enableBulkOrdering: true,
  enableCreditTerms: true,
  maxBulkQuantity: 1000,
  volumeDiscountThresholds: [10, 25, 50, 100],
  creditTermsOptions: ['Net 30', 'Net 60', 'Net 90', 'COD'],
};

/**
 * Cart event types for analytics
 */
export enum CartEventType {
  ITEM_ADDED = 'cart_item_added',
  ITEM_REMOVED = 'cart_item_removed',
  ITEM_UPDATED = 'cart_item_updated',
  CART_CLEARED = 'cart_cleared',
  CART_OPENED = 'cart_opened',
  CART_CLOSED = 'cart_closed',
  CHECKOUT_STARTED = 'checkout_started',
}

/**
 * Cart event data for analytics
 */
export interface CartEvent {
  type: CartEventType;
  productId?: ID;
  quantity?: number;
  value?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * B2B Bulk Order Request Interface
 */
export interface BulkOrderRequest {
  items: BulkOrderItem[];
  requestedDeliveryDate?: string;
  creditTerms?: string;
  specialInstructions?: string;
}

/**
 * B2B Bulk Order Item Interface
 */
export interface BulkOrderItem {
  productId: ID;
  quantity: number;
  requestedPrice?: number;
  notes?: string;
}

/**
 * B2B Cart Summary with Volume Discounts
 */
export interface B2BCartSummary extends CartSummary {
  totalVolumeDiscount: number;
  totalBulkSavings: number;
  estimatedSavings: number;
  averageDiscount: number;
  nextDiscountThreshold?: {
    quantity: number;
    discount: number;
    savings: number;
  };
}

/**
 * Type guards for cart item discrimination
 */
export function isProductCartItem(item: CartItem): item is ProductCartItem {
  return item.type === 'product';
}

export function isAdoptionCartItem(item: CartItem): item is AdoptionCartItem {
  return item.type === 'adoption';
}

/**
 * Helper function to check if cart is B2B
 */
export function isB2BCart(cart: Cart): boolean {
  return cart.isB2BCart === true;
}

/**
 * Helper function to calculate volume discount for a product
 */
export function calculateVolumeDiscount(
  quantity: number,
  basePrice: number,
  volumeDiscounts: VolumeDiscount[]
): { discountedPrice: number; savings: number; discountPercentage: number } {
  // Find the highest applicable discount tier
  const applicableTier = volumeDiscounts
    .filter(tier => quantity >= tier.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  if (!applicableTier) {
    return {
      discountedPrice: basePrice,
      savings: 0,
      discountPercentage: 0
    };
  }

  const discountedPrice = applicableTier.pricePerUnit;
  const savings = (basePrice - discountedPrice) * quantity;
  const discountPercentage = applicableTier.discountPercentage;

  return {
    discountedPrice,
    savings,
    discountPercentage
  };
}
