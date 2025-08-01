'use client'

import { useEffect } from 'react'
import { useCartStore, useCartStoreBase } from '@/stores/cartStore'
import { cartApi } from '@/lib/api/services/cart/cartApi'
import { logger } from '@/lib/logging/productionLogger'
import { errorToContext, toError } from '@/lib/utils/errorUtils'

/**
 * CartProvider - Simplified provider without duplicate hydration
 * Hydration is now handled by useCartStore hook with proper guards
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run on client side to prevent SSR/CSR mismatches
    if (typeof window === 'undefined') {
      return
    }

    // Optional: Create guest cart if needed (after hydration completes)
    const ensureGuestCart = async () => {
      // Wait a bit for hydration to complete from useCartStore
      setTimeout(async () => {
        const currentState = useCartStoreBase.getState()
        
        if (!currentState.cart) {
          logger.info('🛒 CartProvider: Creating guest cart after hydration...')
          try {
            const guestCart = await cartApi.createGuestCart()
            currentState.setCart(guestCart)
            logger.info('🛒 CartProvider: Guest cart created:', guestCart)
          } catch (createError) {
            logger.error('🛒 CartProvider: Failed to create guest cart', toError(createError), errorToContext(createError))
          }
        }
      }, 100) // Small delay to allow useCartStore hydration to complete first
    }

    ensureGuestCart()
  }, []) // Only run once

  return <>{children}</>
}
