'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// import { InlineCurrencySelector } from '@/components/ui/CurrencySelector'; // Temporarily disabled
import ModernCartDrawer from '@/components/cart/ModernCartDrawer';
import { useCartSummary, useCartDrawer } from '@/stores/cartStore';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import Navbar from '@/components/Navbar';
import { DixisLogoCustom } from '@/components/ui/DixisLogo';
import MobileCartIndicator from '@/components/MobileCartIndicator';

// Client-only cart component
function CartButton() {
  const [mounted, setMounted] = useState(false);
  
  // These are now safe thanks to our null checks
  const { itemCount } = useCartSummary();
  const { open } = useCartDrawer();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
        <ShoppingCartIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <button
      onClick={open}
      className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
    >
      <ShoppingCartIcon className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Professional Navbar with Custom Logo */}
      <Navbar />

      <main>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-white px-6 py-3 rounded-lg">
              <DixisLogoCustom size="lg" animated={false} clickable={false} />
            </div>
          </div>
          <p className="text-gray-300">&copy; 2024 Dixis. Όλα τα δικαιώματα διατηρούνται.</p>
        </div>
      </footer>

      {/* Mobile Cart Indicator - Bottom Sticky */}
      <MobileCartIndicator />
    </>
  );
}