'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  producer?: string;
}

interface MobileCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

export default function MobileCartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem 
}: MobileCartDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (startY === null || currentY === null) return;
    
    const deltaY = currentY - startY;
    if (deltaY > 50) { // Swipe down threshold
      onClose();
    }
    
    setStartY(null);
    setCurrentY(null);
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle Bar */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-neutral-200">
          <div className="flex items-center">
            <ShoppingBag className="w-6 h-6 text-primary-700 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Το Καλάθι σας</h3>
              <p className="text-sm text-neutral-500">{itemCount} προϊόντα</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 200px)' }}>
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 mb-2">Το καλάθι σας είναι άδειο</p>
              <p className="text-sm text-neutral-400">Προσθέστε προϊόντα για να ξεκινήσετε</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center bg-neutral-50 rounded-2xl p-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-2xl">🥗</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900 truncate">{item.name}</h4>
                    {item.producer && (
                      <p className="text-xs text-neutral-500 truncate">{item.producer}</p>
                    )}
                    <p className="text-sm font-bold text-primary-700">€{item.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-neutral-600" />
                    </button>
                    
                    <span className="w-8 text-center font-semibold text-neutral-900">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center hover:bg-primary-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-white">
            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-neutral-900">Σύνολο:</span>
              <span className="text-2xl font-bold text-primary-700">€{total.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <button className="w-full bg-gradient-to-r from-primary-700 to-primary-800 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
              Ολοκλήρωση Παραγγελίας
            </button>
            
            {/* Continue Shopping */}
            <button 
              onClick={onClose}
              className="w-full mt-3 text-primary-700 py-2 text-sm font-medium hover:text-primary-800 transition-colors"
            >
              Συνεχίστε τις Αγορές
            </button>
          </div>
        )}
      </div>
    </div>
  );
}