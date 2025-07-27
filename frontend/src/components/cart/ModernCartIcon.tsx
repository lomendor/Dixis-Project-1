'use client'

import React from 'react'
import { ShoppingCartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCartSummary, useCartDrawer } from '@/stores/cartStore'
import { motion, AnimatePresence } from 'framer-motion'

interface ModernCartIconProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'cart' | 'bag'
  showBadge?: boolean
  showTotal?: boolean
  className?: string
  onClick?: () => void
}

export default function ModernCartIcon({
  size = 'md',
  variant = 'cart',
  showBadge = true,
  showTotal = false,
  className = '',
  onClick,
}: ModernCartIconProps) {
  const { itemCount, total, currency } = useCartSummary()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm',
  }

  const Icon = variant === 'cart' ? ShoppingCartIcon : ShoppingBagIcon

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`
        relative p-2 text-gray-600 hover:text-gray-900
        transition-colors duration-200 rounded-lg hover:bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        min-h-[44px] min-w-[44px] touch-manipulation
        cursor-pointer select-none
        ${className}
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Icon className={sizeClasses[size]} />

      {/* Badge */}
      <AnimatePresence>
        {showBadge && itemCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`
              absolute -top-1 -right-1
              ${badgeSizeClasses[size]}
              bg-red-500 text-white rounded-full
              flex items-center justify-center font-medium
              min-w-0
            `}
          >
            <motion.span
              key={itemCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="leading-none"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total price (optional) */}
      {showTotal && total > 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {formatPrice(total)}
          </div>
        </div>
      )}
    </motion.button>
  )
}

// Compact variant for mobile/small spaces
export function CompactCartIcon({
  className = '',
  ...props
}: Omit<ModernCartIconProps, 'size' | 'showTotal'>) {
  return (
    <ModernCartIcon
      {...props}
      size="sm"
      showTotal={false}
      className={`!p-1 ${className}`}
    />
  )
}

// Header variant with total
export function HeaderCartIcon({
  className = '',
  onClick,
  ...props
}: ModernCartIconProps) {
  const { itemCount } = useCartSummary()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <ModernCartIcon {...props} onClick={onClick} showTotal={false} />
      {itemCount > 0 && (
        <div className="hidden sm:block">
          <div className="text-sm text-gray-600">
            {itemCount} {itemCount === 1 ? 'προϊόν' : 'προϊόντα'}
          </div>
        </div>
      )}
    </div>
  )
}

// Floating action button variant
export function FloatingCartIcon({
  className = '',
  ...props
}: Omit<ModernCartIconProps, 'size'>) {
  const { itemCount } = useCartSummary()

  if (itemCount === 0) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-40 ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
      >
        <ModernCartIcon
          {...props}
          size="lg"
          className="!p-0 !text-white !hover:text-white"
        />
      </motion.div>
    </motion.div>
  )
}

// Cart icon with preview on hover
export function CartIconWithPreview({
  className = '',
  ...props
}: ModernCartIconProps) {
  const { itemCount, total, currency } = useCartSummary()
  const [showPreview, setShowPreview] = React.useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <ModernCartIcon {...props} />

      {/* Preview tooltip */}
      <AnimatePresence>
        {showPreview && itemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50"
          >
            <div className="text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Καλάθι</span>
                <span className="text-gray-500">{itemCount} προϊόντα</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Σύνολο:</span>
                <span className="font-medium text-gray-900">{formatPrice(total)}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 text-center">
                  Κλικ για προβολή καλαθιού
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
