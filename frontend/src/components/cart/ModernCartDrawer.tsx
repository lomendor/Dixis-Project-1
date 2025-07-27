'use client'

import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  SparklesIcon,
  MapPinIcon,
  StarIcon,
  CreditCardIcon,
  TruckIcon,
  ClockIcon,
  UserGroupIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import { useCartStore, useCartDrawer, useCartSummary, useCartActions } from '@/stores/cartStore'
import { Cart } from '@/lib/api/models/cart/types'
import { idToString } from '@/lib/api/client/apiTypes'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { logger } from '@/lib/logging/productionLogger'
import { errorToContext, toError } from '@/lib/utils/errorUtils'

export default function ModernCartDrawer() {
  const cartStore = useCartStore()
  const cart: Cart | null = cartStore.cart
  const isLoading = cartStore.isLoading
  const lastAddedItem = cartStore.lastAddedItem

  const { isOpen, close } = useCartDrawer()
  const { itemCount, subtotal, total, currency } = useCartSummary()
  const { updateQuantity, removeFromCart, clearCart } = useCartActions()

  // Debug cart drawer mounting and state
  useEffect(() => {
    console.log('🛒 ModernCartDrawer mounted');
    return () => console.log('🛒 ModernCartDrawer unmounted');
  }, [])

  useEffect(() => {
    console.log('🛒 Cart drawer state changed:', { isOpen });
  }, [isOpen])


  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle swipe to close on mobile
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    setDragOffset(0)

    // Close drawer if swiped right more than 100px or with sufficient velocity
    if (info.offset.x > 100 || info.velocity.x > 500) {
      close()
    }
  }

  const handleDrag = (event: any, info: PanInfo) => {
    setIsDragging(true)
    // Only allow dragging to the right (positive x)
    const offset = Math.max(0, info.offset.x)
    setDragOffset(offset)
  }

  // Debug logging
  React.useEffect(() => {
    console.log('🎭 ModernCartDrawer state changed:', {
      isOpen,
      itemCount,
      cartItems: cart?.items?.length || 0,
      isMobile
    })
    logger.info('🎭 ModernCartDrawer render:', {
      cart,
      itemCount,
      isOpen,
      cartItems: cart?.items?.length || 0,
      isMobile
    })
  }, [cart, itemCount, isOpen, isMobile])

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity)
    } catch (error) {
      logger.error('Error updating quantity', toError(error), errorToContext(error))
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId)
    } catch (error) {
      logger.error('Error removing item', toError(error), errorToContext(error))
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
    } catch (error) {
      logger.error('Error clearing cart', toError(error), errorToContext(error))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  // Group items by producer for marketplace organization
  const groupedItems = React.useMemo(() => {
    if (!cart?.items) return {}
    
    const groups: { [key: string]: typeof cart.items } = {}
    
    cart.items.forEach(item => {
      const producerName = (item as any).producer || 'Άγνωστος Παραγωγός'
      if (!groups[producerName]) {
        groups[producerName] = []
      }
      groups[producerName].push(item)
    })
    
    return groups
  }, [cart?.items])

  const producerNames = Object.keys(groupedItems)
  const totalProducers = producerNames.length

  return (
    <>
      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-drawer {
          touch-action: pan-y;
        }

        .mobile-modal {
          overscroll-behavior: contain;
        }

        @media (max-width: 768px) {
          .touch-manipulation {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          .mobile-drawer {
            max-width: 100vw !important;
            width: 100vw !important;
          }

          .mobile-modal {
            border-radius: 16px 0 0 0;
          }
        }
      `}</style>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className={`pointer-events-none fixed inset-y-0 right-0 flex max-w-full ${isMobile ? 'pl-4' : 'pl-10'}`}>
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <motion.div
                  className="pointer-events-auto w-screen max-w-md sm:max-w-lg mobile-drawer"
                  drag={isMobile ? "x" : false}
                  dragConstraints={{ left: 0, right: 300 }}
                  dragElastic={0.2}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  style={{
                    x: dragOffset,
                    opacity: isDragging ? Math.max(0.5, 1 - dragOffset / 200) : 1
                  }}
                >
                  <Dialog.Panel className="h-full">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl mobile-modal">
                    {/* Mobile drag indicator */}
                    {isMobile && (
                      <div className="flex justify-center py-2 bg-gray-50">
                        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                      </div>
                    )}

                    {/* Enhanced Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              <SparklesIcon className="mr-1 h-3 w-3" />
                              Από τον Αγρό
                            </div>
                            {totalProducers > 1 && (
                              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                <UserGroupIcon className="mr-1 h-3 w-3" />
                                {totalProducers} Παραγωγοί
                              </div>
                            )}
                          </div>
                          <Dialog.Title className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-lg'}`}>
                            Καλάθι Αγορών
                          </Dialog.Title>
                          {cart && cart.items && cart.items.length > 0 && (
                            <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                              {itemCount} {itemCount === 1 ? 'προϊόν' : 'προϊόντα'}
                              {totalProducers > 1 && ` από ${totalProducers} παραγωγούς`}
                            </p>
                          )}
                        </div>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className={`relative text-gray-400 hover:text-gray-500 touch-manipulation ${
                              isMobile ? '-m-1 p-3' : '-m-2 p-2'
                            }`}
                            onClick={close}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Κλείσιμο panel</span>
                            <XMarkIcon className={`${isMobile ? 'h-7 w-7' : 'h-6 w-6'}`} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Cart Items */}
                      <div className="mt-6">
                        <div className="flow-root">
                          {!cart || !cart.items || cart.items.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                                <ShoppingBagIcon className="h-8 w-8 text-green-600" />
                              </div>
                              <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-base'}`}>
                                Το καλάθι περιμένει φρεσκάδα!
                              </h3>
                              <p className={`mt-1 text-gray-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                                Ανακαλύψτε αυθεντικά ελληνικά προϊόντα
                              </p>
                              <div className="mt-4">
                                <Link
                                  href="/products"
                                  onClick={close}
                                  className={`inline-flex items-center rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm hover:from-green-700 hover:to-green-800 transition-all touch-manipulation ${
                                    isMobile
                                      ? 'px-6 py-3 text-base font-semibold'
                                      : 'px-4 py-2 text-sm font-semibold'
                                  }`}
                                >
                                  <SparklesIcon className={`mr-2 ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                  Εξερεύνηση Προϊόντων
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Multi-Producer Badge */}
                              {totalProducers > 1 && (
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 border border-blue-200">
                                  <div className="flex items-center space-x-2">
                                    <UserGroupIcon className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                      Marketplace Καλάθι - {totalProducers} Παραγωγοί
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Producer Groups */}
                              <AnimatePresence>
                                {producerNames.map((producerName) => {
                                  const producerItems = groupedItems[producerName]
                                  const producerTotal = producerItems.reduce((sum, item) => sum + item.subtotal, 0)

                                  return (
                                    <motion.div
                                      key={producerName}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                                    >
                                      {/* Producer Header */}
                                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                                              <span className="text-green-700 font-bold text-sm">
                                                {producerName.charAt(0)}
                                              </span>
                                            </div>
                                            <div>
                                              <h4 className={`font-bold text-gray-900 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                                                {producerName}
                                              </h4>
                                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                                <div className="flex items-center">
                                                  <MapPinIcon className="mr-1 h-3 w-3 text-green-500" />
                                                  Κρήτη
                                                </div>
                                                <div className="flex items-center">
                                                  <StarIcon className="mr-1 h-3 w-3 text-yellow-500 fill-current" />
                                                  4.9
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className={`font-bold text-green-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                                              {formatPrice(producerTotal)}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              {producerItems.length} προϊόν{producerItems.length !== 1 ? 'α' : ''}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Producer Items */}
                                      <div className="divide-y divide-gray-100">
                                        {producerItems.map((item) => (
                                          <div key={item.id} className="p-3">
                                            <div className="flex items-start space-x-3">
                                              {/* Product Image */}
                                              <div className={`flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 relative ${
                                                isMobile ? 'h-16 w-16' : 'h-20 w-20'
                                              }`}>
                                                {item.image ? (
                                                  <Image
                                                    src={item.image}
                                                    alt={item.productName}
                                                    width={isMobile ? 64 : 80}
                                                    height={isMobile ? 64 : 80}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                      const target = e.target as HTMLImageElement;
                                                      target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop';
                                                    }}
                                                  />
                                                ) : (
                                                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-lg">🥗</span>
                                                  </div>
                                                )}
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
                                                  <SparklesIcon className="h-2 w-2 text-white" />
                                                </div>
                                              </div>

                                              {/* Product Info */}
                                              <div className="flex-1 min-w-0">
                                                <h4 className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                                                  <Link
                                                    href={`/products/${item.slug}`}
                                                    onClick={close}
                                                    className="hover:text-green-600 transition-colors"
                                                  >
                                                    {item.productName}
                                                  </Link>
                                                </h4>
                                                
                                                <div className="flex items-center space-x-1 mt-1">
                                                  <span className={`bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                                    Βιολογικό
                                                  </span>
                                                  <span className={`bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                                    Φρέσκο
                                                  </span>
                                                </div>

                                                {/* Transparent Pricing */}
                                                <div className="mt-2">
                                                  <div className={`font-bold text-green-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                                                    {formatPrice(((item as any).unitPrice || item.price))}/κιλό
                                                  </div>
                                                  <div className="text-xs text-gray-600">
                                                    Παραγωγός: {formatPrice(((item as any).unitPrice || item.price) * 0.75)}
                                                  </div>
                                                </div>

                                                <div className="flex items-center text-xs text-green-600 mt-1">
                                                  <ClockIcon className="mr-1 h-3 w-3" />
                                                  Συλλέχθηκε εχθές
                                                </div>
                                              </div>

                                              {/* Quantity Controls */}
                                              <div className="flex flex-col items-end space-y-2">
                                                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg">
                                                  <button
                                                    onClick={() => handleUpdateQuantity(idToString(item.id), item.quantity - 1)}
                                                    disabled={isLoading}
                                                    className={`p-1 hover:bg-gray-100 transition-colors rounded-l-lg touch-manipulation ${
                                                      isMobile ? 'w-8 h-8' : 'w-6 h-6'
                                                    }`}
                                                  >
                                                    <MinusIcon className="h-3 w-3 text-gray-600" />
                                                  </button>
                                                  <span className={`px-2 py-1 font-medium text-gray-900 text-center bg-white ${
                                                    isMobile ? 'min-w-[2rem] text-sm' : 'min-w-[1.5rem] text-xs'
                                                  }`}>
                                                    {item.quantity}
                                                  </span>
                                                  <button
                                                    onClick={() => handleUpdateQuantity(idToString(item.id), item.quantity + 1)}
                                                    disabled={isLoading}
                                                    className={`p-1 hover:bg-gray-100 transition-colors rounded-r-lg touch-manipulation ${
                                                      isMobile ? 'w-8 h-8' : 'w-6 h-6'
                                                    }`}
                                                  >
                                                    <PlusIcon className="h-3 w-3 text-gray-600" />
                                                  </button>
                                                </div>

                                                <button
                                                  onClick={() => handleRemoveItem(idToString(item.id))}
                                                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all touch-manipulation"
                                                  disabled={isLoading}
                                                >
                                                  <TrashIcon className="h-4 w-4" />
                                                </button>

                                                <div className="text-right">
                                                  <div className={`font-bold text-gray-900 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                                                    {formatPrice(item.subtotal)}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )
                                })}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Footer */}
                    {cart && cart.items && cart.items.length > 0 && (
                      <div className={`border-t border-gray-200 bg-gray-50 ${isMobile ? 'px-4 py-4' : 'px-4 py-6 sm:px-6'}`}>
                        {/* Producer Revenue Transparency */}
                        {totalProducers > 1 && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 text-sm mb-2 flex items-center">
                              <UserGroupIcon className="mr-1 h-4 w-4" />
                              Ανάλυση ανά Παραγωγό
                            </h4>
                            <div className="space-y-1">
                              {producerNames.map((producerName) => {
                                const producerTotal = groupedItems[producerName].reduce((sum, item) => sum + item.subtotal, 0)
                                return (
                                  <div key={producerName} className="flex justify-between text-xs">
                                    <span className="text-blue-700 truncate mr-2">{producerName}</span>
                                    <span className="font-medium text-blue-900">{formatPrice(producerTotal)}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Enhanced Pricing Breakdown */}
                        <div className={`space-y-3 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                          <div className={`flex justify-between text-gray-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                            <span>Υποσύνολο ({itemCount} προϊόντα)</span>
                            <span className="font-medium">{formatPrice(subtotal)}</span>
                          </div>
                          
                          {/* Producer Revenue Transparency */}
                          <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                            <div className={`flex justify-between text-green-800 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                              <span className="flex items-center">
                                <SparklesIcon className="mr-1 h-3 w-3" />
                                Έσοδα Παραγωγών
                              </span>
                              <span className="font-bold">{formatPrice(subtotal * 0.75)}</span>
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              75% πηγαίνει απευθείας στους παραγωγούς
                            </div>
                          </div>
                          
                          <div className={`flex justify-between text-gray-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                            <div className="flex items-center">
                              <TruckIcon className="mr-1 h-3 w-3 text-green-500" />
                              <span>Μεταφορικά</span>
                            </div>
                            <span className="font-medium text-green-600">Δωρεάν</span>
                          </div>
                          
                          <div className="border-t border-gray-200 pt-3">
                            <div className={`flex justify-between font-bold ${
                              isMobile ? 'text-lg' : 'text-base'
                            }`}>
                              <span className="text-gray-900">Σύνολο</span>
                              <span className="text-green-600">{formatPrice(total)}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              από {totalProducers} παραγωγ{totalProducers > 1 ? 'ούς' : 'ό'}
                            </div>
                          </div>
                        </div>

                        {/* Farm-to-Table Promise */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CheckBadgeIcon className="mr-2 h-4 w-4 text-green-600" />
                              <div>
                                <div className={`font-medium text-green-900 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                                  Αυθεντική Ελληνική Εμπειρία
                                </div>
                                <div className="text-xs text-green-700">
                                  100% βιολογικά, παράδοση 24h
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-green-700">-60% CO₂</div>
                              <div className="text-xs text-green-600">vs μέσος όρος</div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className={`${isMobile ? 'space-y-3' : 'space-y-3'}`}>
                          <Link
                            href="/checkout"
                            onClick={close}
                            className={`flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:from-green-700 hover:to-green-800 transition-all touch-manipulation transform hover:scale-105 ${
                              isMobile
                                ? 'px-6 py-4 text-lg font-bold'
                                : 'px-6 py-3 text-base font-semibold'
                            }`}
                          >
                            <CreditCardIcon className={`mr-2 ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                            Προχώρηση στην Πληρωμή
                            <span className="ml-2">→</span>
                          </Link>
                          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
                            <Link
                              href="/cart"
                              onClick={close}
                              className={`flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors touch-manipulation ${
                                isMobile
                                  ? 'w-full px-6 py-3 text-base font-medium'
                                  : 'flex-1 px-6 py-2 text-sm font-medium'
                              }`}
                            >
                              <ShoppingBagIcon className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                              Προβολή Καλαθιού
                            </Link>
                            <button
                              type="button"
                              onClick={close}
                              className={`flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors touch-manipulation ${
                                isMobile
                                  ? 'w-full px-6 py-3 text-base font-medium'
                                  : 'flex-1 px-6 py-2 text-sm font-medium'
                              }`}
                            >
                              <SparklesIcon className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                              Συνέχεια Αγορών
                            </button>
                          </div>
                        </div>

                        {/* Clear cart button */}
                        <div className="flex justify-center mt-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={handleClearCart}
                            disabled={isLoading}
                            className={`text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors touch-manipulation ${
                              isMobile ? 'text-sm p-2' : 'text-xs'
                            }`}
                          >
                            Άδειασμα καλαθιού
                          </button>
                        </div>
                      </div>
                    )}
                    </div>
                  </Dialog.Panel>
                </motion.div>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
    </>
  )
}
