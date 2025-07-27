'use client'

import React, { useState } from 'react'
import { logger } from '@/lib/logging/productionLogger'
import { errorToContext, toError } from '@/lib/utils/errorUtils'
import { useCartStore, useCartActions } from '@/stores/cartStore'
import { ID } from '@/lib/api/client/apiTypes'
import { CartItemAttributes, isProductCartItem } from '@/lib/api/models/cart/types'
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface ModernCartButtonProps {
  productId: ID
  productName?: string
  price?: number
  maxQuantity?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  showQuantityControls?: boolean
  attributes?: CartItemAttributes
  className?: string
  children?: React.ReactNode
  onAddSuccess?: () => void
  onAddError?: (error: Error) => void
}

export default function ModernCartButton({
  productId,
  productName,
  price,
  maxQuantity = 99,
  disabled = false,
  size = 'md',
  variant = 'primary',
  showQuantityControls = true,
  attributes,
  className = '',
  children,
  onAddSuccess,
  onAddError,
}: ModernCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydration safety
  React.useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Zustand store hooks with safety checks
  const store = useCartStore()
  const { addToCart, updateQuantity, removeFromCart } = useCartActions()

  // Safe access to store properties with fallbacks
  const currentQuantity = store?.getItemQuantity?.(productId) ?? 0
  const itemInCart = store?.isInCart?.(productId) ?? false
  const isLoading = store?.isLoading ?? false

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
    outline: 'bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
  }

  const handleAddToCart = async () => {
    if (disabled || isLoading || !addToCart) return

    setIsAdding(true)

    try {
      await addToCart(productId, 1, attributes)

      // Show success animation
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)

      onAddSuccess?.()
    } catch (error) {
      logger.error('Error adding to cart', toError(error), errorToContext(error))
      onAddError?.(error instanceof Error ? error : new Error('Failed to add to cart'))
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (disabled || isLoading || !updateQuantity || !removeFromCart) return

    try {
      // Find the actual cart item for this product
      const cartItem = store?.cart?.items?.find(item => 
        isProductCartItem(item) && item.productId === productId.toString()
      )
      if (!cartItem) return

      if (newQuantity <= 0) {
        await removeFromCart(cartItem.id)
      } else {
        await updateQuantity(cartItem.id, newQuantity)
      }
    } catch (error) {
      logger.error('Error updating quantity', toError(error), errorToContext(error))
      onAddError?.(error instanceof Error ? error : new Error('Failed to update quantity'))
    }
  }

  const baseClasses = `
    relative inline-flex items-center justify-center
    font-medium rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `

  // If item is in cart and we want to show quantity controls
  if (itemInCart && showQuantityControls && currentQuantity > 0) {
    return (
      <div className="flex items-center space-x-2">
        {/* Decrease button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleUpdateQuantity(currentQuantity - 1)}
          disabled={disabled || isLoading}
          className={`
            p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50
            text-gray-600 hover:text-gray-800 transition-colors touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            min-h-[44px] min-w-[44px] flex items-center justify-center
          `}
        >
          <MinusIcon className="w-4 h-4" />
        </motion.button>

        {/* Quantity display */}
        <div className="flex items-center justify-center min-w-[3rem] px-3 py-2 bg-gray-100 rounded-lg">
          <span className="font-medium text-gray-900">{currentQuantity}</span>
        </div>

        {/* Increase button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleUpdateQuantity(currentQuantity + 1)}
          disabled={disabled || isLoading || currentQuantity >= maxQuantity}
          className={`
            p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50
            text-gray-600 hover:text-gray-800 transition-colors touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            min-h-[44px] min-w-[44px] flex items-center justify-center
          `}
        >
          <PlusIcon className="w-4 h-4" />
        </motion.button>
      </div>
    )
  }

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <button
        disabled={true}
        className={`${baseClasses} opacity-75 cursor-not-allowed`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Φόρτωση...</span>
        </div>
      </button>
    )
  }

  // Regular add to cart button
  return (
    <motion.button
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
      }}
      whileTap={{ scale: 0.98 }}
      animate={showSuccess ? {
        backgroundColor: ["rgb(59, 130, 246)", "rgb(34, 197, 94)", "rgb(59, 130, 246)"],
        scale: [1, 1.05, 1]
      } : {}}
      transition={showSuccess ? {
        backgroundColor: { duration: 0.6, ease: "easeInOut" },
        scale: { duration: 0.3, ease: "easeInOut" }
      } : { duration: 0.2 }}
      onClick={handleAddToCart}
      disabled={disabled || isLoading || isAdding || !addToCart}
      className={baseClasses}
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              opacity: 1, 
              y: 0 
            }}
            exit={{ scale: 0, opacity: 0, y: -10 }}
            transition={{
              scale: { duration: 0.5, ease: "easeOut" },
              opacity: { duration: 0.3 },
              y: { duration: 0.3 }
            }}
            className="flex items-center space-x-2"
          >
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
            >
              <CheckIcon className="w-5 h-5 text-white" />
            </motion.div>
            <span>Προστέθηκε!</span>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute inset-0 border-2 border-green-400 rounded-lg"
            />
          </motion.div>
        ) : isAdding || isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            />
            <span>Προσθήκη...</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
            >
              <ShoppingCartIcon className="w-5 h-5" />
            </motion.div>
            <span>
              {itemInCart ? 'Στο Καλάθι' : 'Προσθήκη στο Καλάθι'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// Quick add button variant for product grids
export function QuickAddButton({
  productId,
  size = 'sm',
  className = '',
  ...props
}: Omit<ModernCartButtonProps, 'showQuantityControls'>) {
  return (
    <ModernCartButton
      {...props}
      productId={productId}
      size={size}
      variant="outline"
      showQuantityControls={false}
      className={`${className} !p-2`}
    >
      <PlusIcon className="w-4 h-4" />
    </ModernCartButton>
  )
}

// Floating action button variant
export function FloatingCartButton({
  productId,
  className = '',
  ...props
}: Omit<ModernCartButtonProps, 'size' | 'variant'>) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-50 ${className}`}
    >
      <ModernCartButton
        {...props}
        productId={productId}
        size="lg"
        variant="primary"
        className="!rounded-full !p-4 shadow-lg"
      >
        <ShoppingCartIcon className="w-6 h-6" />
      </ModernCartButton>
    </motion.div>
  )
}
