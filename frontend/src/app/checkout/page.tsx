'use client';

import React from 'react';
import { useCartStore, useCartSummary } from '@/stores/cartStore';
import Link from 'next/link';
import CheckoutProcess from '@/components/checkout/CheckoutProcess';

export default function CheckoutPage() {
  const cart = useCartStore().cart;
  const { itemCount } = useCartSummary();

  // Redirect if cart is empty
  if (!cart || itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Το καλάθι σας είναι άδειο</h1>
          <Link href="/products" className="text-green-600 hover:text-green-700">
            Συνεχίστε τις αγορές
          </Link>
        </div>
      </div>
    );
  }

  return <CheckoutProcess />;
}