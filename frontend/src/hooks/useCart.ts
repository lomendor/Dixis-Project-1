import { useCartStore } from '@/stores/cartStore';

export const useCart = () => {
  const cartStore = useCartStore();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount } = cartStore;
  
  return {
    items: cart?.items || [],
    addItem: addToCart,
    removeItem: removeFromCart, 
    updateQuantity,
    clearCart,
    total,
    itemCount
  };
};
