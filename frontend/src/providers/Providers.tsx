'use client';

import { ReactNode } from 'react';
import { SimpleQueryProvider } from './SimpleQueryProvider';
import { CartProvider } from '@/components/cart/CartProvider';

interface ProvidersProps {
  children: ReactNode;
}

// Main providers wrapper - simplified without dynamic import
export function Providers({ children }: ProvidersProps) {
  return (
    <SimpleQueryProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SimpleQueryProvider>
  );
}

// Default export for convenience
export default Providers;