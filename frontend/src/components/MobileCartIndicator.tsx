'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import MobileCartDrawer from './MobileCartDrawer';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  producer?: string;
}

export default function MobileCartIndicator() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Sample cart data - in real app this would come from state management
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Πορτοκάλια Άργους",
      price: 2.80,
      quantity: 2,
      producer: "Οικογένεια Παπαδόπουλου"
    },
    {
      id: 2,
      name: "Ελαιόλαδο Κρήτης",
      price: 12.50,
      quantity: 1,
      producer: "Ελαιώνες Μεσσαράς"
    }
  ]);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Don't show if cart is empty
  if (itemCount === 0) return null;

  return (
    <>
      {/* Bottom Sticky Cart Indicator */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        {/* Backdrop blur for better visibility */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm border-t border-neutral-200"></div>
        
        <div className="relative px-4 py-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full bg-gradient-to-r from-primary-700 to-primary-800 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden group"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex items-center justify-between px-6 py-4">
              {/* Left: Cart Icon & Count */}
              <div className="flex items-center">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6" />
                  {/* Item count badge */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{itemCount}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-semibold">Προβολή Καλαθιού</div>
                  <div className="text-xs opacity-90">{itemCount} προϊόντα</div>
                </div>
              </div>

              {/* Right: Total Price */}
              <div className="text-right">
                <div className="text-lg font-bold">€{total.toFixed(2)}</div>
                <div className="text-xs opacity-90">σύνολο</div>
              </div>
            </div>

            {/* Loading bar animation on hover */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 to-accent-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      <MobileCartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </>
  );
}