/**
 * 🛒 Cart Store Debugging Utilities
 * 
 * Χρήση στο browser console:
 * window.cartDebugger.inspectStore()
 * window.cartDebugger.logCartHistory()
 */

import { useCartStoreBase } from '@/stores/cartStore'

class CartDebugger {
  private history: Array<{ timestamp: Date; action: string; state: any }> = []

  constructor() {
    if (typeof window !== 'undefined') {
      // Make available globally for console debugging
      (window as any).cartDebugger = this
    }
  }

  /**
   * Inspect current cart store state
   */
  inspectStore() {
    const store = useCartStoreBase.getState()
    console.group('🛒 Cart Store State')
    console.log('Cart:', store.cart)
    console.log('Item Count:', store.itemCount)
    console.log('Subtotal:', store.subtotal)
    console.log('Total:', store.total)
    console.log('Currency:', store.currency)
    console.log('Is Loading:', store.isLoading)
    console.log('Error:', store.error)
    console.log('Drawer Open:', store.isDrawerOpen)
    console.log('Last Added Item:', store.lastAddedItem)
    console.groupEnd()
    return store
  }

  /**
   * Test cart functionality
   */
  async testCart() {
    console.group('🛒 Testing Cart Functionality')
    
    try {
      // Test cart state
      console.log('Testing cart state...')
      this.inspectStore()
      
      // Test localStorage
      console.log('Testing localStorage...')
      const stored = localStorage.getItem('dixis-cart-storage')
      console.log('Stored cart data:', stored ? JSON.parse(stored) : 'No data')
      
      console.log('✅ Cart test completed')
    } catch (error) {
      console.error('❌ Cart test failed:', error)
    }
    
    console.groupEnd()
  }
}

// Create singleton instance
export const cartDebugger = new CartDebugger()

// Development-only console helpers
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('🛒 Cart Debugger loaded!')
}