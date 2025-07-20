'use client'

import { useEffect } from 'react'
import { useCartStore, useCartStoreBase } from '@/stores/cartStore'
import { cartApi } from '@/lib/api/services/cart/cartApi'
import { logger } from '@/lib/logging/productionLogger'
import { errorToContext, toError } from '@/lib/utils/errorUtils'

/**
 * CartProvider - Ensures cart is initialized on app startup
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { cart, setCart, hydrate } = useCartStore()

  useEffect(() => {
    const initializeCart = async () => {
      try {
        // First try to hydrate from localStorage
        hydrate()

        // Wait a bit for hydration to complete, then check if cart exists
        setTimeout(async () => {
          const currentCart = useCartStoreBase.getState().cart

          if (!currentCart) {
            logger.info('🛒 No cart found after hydration, creating guest cart...')
            try {
              const guestCart = await cartApi.createGuestCart()
              setCart(guestCart)
              logger.info('🛒 Guest cart created:', guestCart)
            } catch (createError) {
              logger.error('🛒 Failed to create guest cart', toError(createError), errorToContext(createError))
            }
          } else {
            logger.info('🛒 Cart loaded from localStorage:', currentCart)
          }
        }, 100)

      } catch (error) {
        logger.error('🛒 Failed to initialize cart', toError(error), errorToContext(error))
        // Create fallback guest cart
        try {
          const fallbackCart = await cartApi.createGuestCart()
          setCart(fallbackCart)
          logger.info('🛒 Fallback guest cart created:', fallbackCart)
        } catch (fallbackError) {
          logger.error('🛒 Failed to create fallback cart', toError(fallbackError), errorToContext(fallbackError))
        }
      }
    }

    // Only initialize on client side
    if (typeof window !== 'undefined') {
      initializeCart()
    }
  }, [hydrate, setCart]) // Include dependencies

  return <>{children}</>
}
