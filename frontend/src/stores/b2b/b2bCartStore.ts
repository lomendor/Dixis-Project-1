import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface B2BCartItem {
  id: string;
  name: string;
  wholesale_price: number;
  retail_price: number;
  quantity: number;
  min_order_quantity: number;
  bulk_discount_threshold: number;
  bulk_discount_percentage: number;
  image: string;
  producer: {
    business_name: string;
    city: string;
  };
  category: {
    name: string;
  };
}

interface B2BCartStore {
  items: B2BCartItem[];
  creditLimit: number;
  usedCredit: number;
  
  // Actions
  addItem: (product: any, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  
  // Calculations
  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getTotal: () => number;
  getAvailableCredit: () => number;
  canAffordOrder: () => boolean;
}export const useB2BCartStore = create<B2BCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      creditLimit: 5000, // Default credit limit
      usedCredit: 1200, // Currently used credit
      
      addItem: (product, quantity) => {
        const existingItem = get().items.find(item => item.id === product.id);
        
        if (existingItem) {
          set(state => ({
            items: state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }));
        } else {
          const newItem: B2BCartItem = {
            id: product.id,
            name: product.name,
            wholesale_price: product.wholesale_price,
            retail_price: product.price,
            quantity,
            min_order_quantity: product.min_order_quantity || 1,
            bulk_discount_threshold: product.bulk_discount_threshold || 50,
            bulk_discount_percentage: product.bulk_discount_percentage || 5,
            image: product.main_image,
            producer: product.producer,
            category: product.category,
          };
          
          set(state => ({
            items: [...state.items, newItem]
          }));
        }
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set(state => ({
          items: state.items.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          )
        }));
      },
      
      removeItem: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.id !== productId)
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.wholesale_price * item.quantity);
        }, 0);
      },
      
      getTotalDiscount: () => {
        return get().items.reduce((total, item) => {
          const retailTotal = item.retail_price * item.quantity;
          const wholesaleTotal = item.wholesale_price * item.quantity;
          
          // Additional bulk discount if threshold met
          let bulkDiscount = 0;
          if (item.quantity >= item.bulk_discount_threshold) {
            bulkDiscount = wholesaleTotal * (item.bulk_discount_percentage / 100);
          }
          
          return total + (retailTotal - wholesaleTotal) + bulkDiscount;
        }, 0);
      },
      
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const bulkDiscounts = get().items.reduce((total, item) => {
          if (item.quantity >= item.bulk_discount_threshold) {
            return total + (item.wholesale_price * item.quantity * item.bulk_discount_percentage / 100);
          }
          return total;
        }, 0);
        
        return subtotal - bulkDiscounts;
      },
      
      getAvailableCredit: () => {
        return get().creditLimit - get().usedCredit;
      },
      
      canAffordOrder: () => {
        return get().getTotal() <= get().getAvailableCredit();
      },
    }),
    {
      name: 'b2b-cart-storage',
    }
  )
);