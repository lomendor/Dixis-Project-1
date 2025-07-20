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
  TagIcon,
  CurrencyEuroIcon,
  TruckIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { useCartStore, useCartDrawer, useCartSummary, useCartActions } from '@/stores/cartStore'
import { Cart, isB2BCart } from '@/lib/api/models/cart/types'
import { idToString } from '@/lib/api/client/apiTypes'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { logger } from '@/lib/logging/productionLogger'
import { errorToContext, toError } from '@/lib/utils/errorUtils'

export default function B2BCartDrawer() {
  const cartStore = useCartStore()
  const cart: Cart | null = cartStore.cart
  const isLoading = cartStore.isLoading
  const lastAddedItem = cartStore.lastAddedItem

  const { isOpen, close } = useCartDrawer()
  const { itemCount, subtotal, total, currency } = useCartSummary()
  const { updateQuantity, removeFromCart, clearCart } = useCartActions()

  // B2B specific data
  const cartSummary = cartStore.getCartSummaryWithDiscounts()
  const volumeDiscountSavings = cartStore.getVolumeDiscountSavings()
  const totalBulkDiscount = cartStore.getTotalBulkDiscount()
  const nextDiscountThreshold = cartStore.calculateNextDiscountThreshold()
  const minimumOrderCheck = cartStore.checkMinimumOrderRequirements()

  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [bulkQuantityInputs, setBulkQuantityInputs] = useState<Record<string, string>>({})

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

    if (info.offset.x > 100 || info.velocity.x > 500) {
      close()
    }
  }

  const handleDrag = (event: any, info: PanInfo) => {
    setIsDragging(true)
    const offset = Math.max(0, info.offset.x)
    setDragOffset(offset)
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity)
    } catch (error) {
      logger.error('Error updating quantity', toError(error), errorToContext(error))
    }
  }

  const handleUpdateBulkQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity)
      // Clear the input after successful update
      setBulkQuantityInputs(prev => ({
        ...prev,
        [itemId]: ''
      }))
    } catch (error) {
      logger.error('Error updating bulk quantity', toError(error), errorToContext(error))
    }
  }

  const handleBulkQuantityInputChange = (itemId: string, value: string) => {
    setBulkQuantityInputs(prev => ({
      ...prev,
      [itemId]: value
    }))
  }

  const handleBulkQuantitySubmit = (itemId: string) => {
    const input = bulkQuantityInputs[itemId]
    if (input) {
      const quantity = parseInt(input, 10)
      if (!isNaN(quantity) && quantity > 0) {
        handleUpdateBulkQuantity(itemId, quantity)
      }
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

  const isB2B = cart && isB2BCart(cart)

  return (
    <>
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

                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <Dialog.Title className={`font-medium text-gray-900 ${isMobile ? 'text-xl' : 'text-lg'}`}>
                            {isB2B ? 'Καλάθι B2B' : 'Καλάθι Αγορών'}
                          </Dialog.Title>
                          {isB2B && (
                            <p className="text-sm text-blue-600 mt-1">
                              Χονδρικές τιμές & Εκπτώσεις όγκου
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

                      {/* B2B Discount Information */}
                      {isB2B && (volumeDiscountSavings > 0 || nextDiscountThreshold) && (
                        <div className="mt-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                          {volumeDiscountSavings > 0 && (
                            <div className="flex items-center mb-2">
                              <TagIcon className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-sm font-medium text-green-800">
                                Εξοικονόμηση όγκου: {formatPrice(volumeDiscountSavings)}
                              </span>
                            </div>
                          )}
                          
                          {nextDiscountThreshold && (
                            <div className="flex items-center text-sm text-blue-700">
                              <SparklesIcon className="h-4 w-4 mr-2" />
                              <span>
                                Προσθέστε {nextDiscountThreshold.quantity - itemCount} προϊόντα για {nextDiscountThreshold.discount}% έκπτωση
                                (εκτιμώμενη εξοικονόμηση: {formatPrice(nextDiscountThreshold.savings)})
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Minimum Order Warning */}
                      {isB2B && !minimumOrderCheck.meets && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <CurrencyEuroIcon className="h-5 w-5 text-amber-600 mr-2" />
                            <span className="text-sm text-amber-800">
                              Ελάχιστη παραγγελία: {formatPrice(minimumOrderCheck.missing)} ακόμα
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Cart items */}
                      <div className="mt-8">
                        <div className="flow-root">
                          {!cart || !cart.items || cart.items.length === 0 ? (
                            <div className="text-center py-12">
                              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">
                                Το καλάθι σας είναι άδειο
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {isB2B ? 'Ξεκινήστε να προσθέτετε προϊόντα χονδρικής!' : 'Ξεκινήστε να προσθέτετε προϊόντα!'}
                              </p>
                              <div className="mt-6">
                                <Link
                                  href={isB2B ? "/b2b/products" : "/products"}
                                  onClick={close}
                                  className={`inline-flex items-center rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 touch-manipulation ${
                                    isMobile
                                      ? 'px-6 py-4 text-base font-semibold'
                                      : 'px-3 py-2 text-sm font-semibold'
                                  }`}
                                >
                                  <SparklesIcon className={`mr-1.5 ${isMobile ? 'h-6 w-6 -ml-1' : 'h-5 w-5 -ml-0.5'}`} aria-hidden="true" />
                                  Περιήγηση Προϊόντων
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              <AnimatePresence>
                                {cart.items.map((item) => (
                                  <motion.li
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex py-6"
                                  >
                                    <div className={`flex-shrink-0 overflow-hidden rounded-md border border-gray-200 ${
                                      isMobile ? 'h-20 w-20' : 'h-24 w-24'
                                    }`}>
                                      {item.image ? (
                                        <Image
                                          src={item.image}
                                          alt={item.productName}
                                          width={isMobile ? 80 : 96}
                                          height={isMobile ? 80 : 96}
                                          className="h-full w-full object-cover object-center"
                                        />
                                      ) : (
                                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                          <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                    </div>

                                    <div className={`flex flex-1 flex-col ${isMobile ? 'ml-3' : 'ml-4'}`}>
                                      <div>
                                        <div className={`flex justify-between font-medium text-gray-900 ${
                                          isMobile ? 'text-sm' : 'text-base'
                                        }`}>
                                          <h3 className="flex-1 pr-2">
                                            <Link
                                              href={`${isB2B ? '/b2b' : ''}/products/${item.slug}`}
                                              onClick={close}
                                              className="hover:text-blue-600 transition-colors touch-manipulation"
                                            >
                                              {item.productName}
                                            </Link>
                                          </h3>
                                          <div className="text-right">
                                            <p>{formatPrice(item.subtotal)}</p>
                                            {item?.attributes?.bulkDiscount && item.attributes.bulkDiscount > 0 && (
                                              <p className="text-xs text-green-600">
                                                -{item.attributes.bulkDiscount}%
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="mt-1 flex items-center space-x-2">
                                          <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                            {formatPrice(item.price)} / τεμάχιο
                                          </p>
                                          {item?.attributes?.isB2BPricing && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                              B2B
                                            </span>
                                          )}
                                        </div>
                                        {item.producer && (
                                          <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                            από {item.producer}
                                          </p>
                                        )}
                                      </div>
                                      
                                      <div className={`flex flex-1 items-end justify-between ${isMobile ? 'mt-3' : 'text-sm'}`}>
                                        {/* Regular quantity controls */}
                                        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-1'}`}>
                                          <button
                                            onClick={() => handleUpdateQuantity(idToString(item.id), item.quantity - 1)}
                                            disabled={isLoading}
                                            className={`flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50 touch-manipulation ${
                                              isMobile ? 'w-8 h-8' : 'w-6 h-6'
                                            }`}
                                          >
                                            <MinusIcon className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                                          </button>
                                          <span className={`text-gray-700 font-medium text-center ${
                                            isMobile ? 'min-w-[2.5rem] text-sm' : 'min-w-[2rem] text-xs'
                                          }`}>
                                            {item.quantity}
                                          </span>
                                          <button
                                            onClick={() => handleUpdateQuantity(idToString(item.id), item.quantity + 1)}
                                            disabled={isLoading}
                                            className={`flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 touch-manipulation ${
                                              isMobile ? 'w-8 h-8' : 'w-6 h-6'
                                            }`}
                                          >
                                            <PlusIcon className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                                          </button>
                                        </div>

                                        {/* B2B Bulk quantity input */}
                                        {isB2B && (
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="number"
                                              min="1"
                                              max="1000"
                                              placeholder="Bulk"
                                              value={bulkQuantityInputs[idToString(item.id)] || ''}
                                              onChange={(e) => handleBulkQuantityInputChange(idToString(item.id), e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  handleBulkQuantitySubmit(idToString(item.id))
                                                }
                                              }}
                                              className={`border border-gray-300 rounded text-center ${
                                                isMobile ? 'w-16 h-8 text-xs' : 'w-12 h-6 text-xs'
                                              }`}
                                            />
                                            <button
                                              onClick={() => handleBulkQuantitySubmit(idToString(item.id))}
                                              disabled={isLoading || !bulkQuantityInputs[idToString(item.id)]}
                                              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-xs"
                                            >
                                              ✓
                                            </button>
                                          </div>
                                        )}

                                        <div className="flex">
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveItem(idToString(item.id))}
                                            disabled={isLoading}
                                            className={`font-medium text-red-600 hover:text-red-500 disabled:opacity-50 touch-manipulation ${
                                              isMobile ? 'p-2' : ''
                                            }`}
                                          >
                                            <TrashIcon className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.li>
                                ))}
                              </AnimatePresence>
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    {cart && cart.items && cart.items.length > 0 && (
                      <div className={`border-t border-gray-200 ${isMobile ? 'px-4 py-4' : 'px-4 py-6 sm:px-6'}`}>
                        {/* Clear cart button */}
                        <div className="flex justify-center mb-4">
                          <button
                            onClick={handleClearCart}
                            disabled={isLoading}
                            className={`text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors touch-manipulation ${
                              isMobile ? 'text-base p-2' : 'text-sm'
                            }`}
                          >
                            Άδειασμα καλαθιού
                          </button>
                        </div>

                        {/* Totals */}
                        <div className={`space-y-2 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                          <div className={`flex justify-between text-gray-600 ${isMobile ? 'text-base' : 'text-sm'}`}>
                            <p>Υποσύνολο ({itemCount} προϊόντα)</p>
                            <p>{formatPrice(subtotal)}</p>
                          </div>
                          
                          {/* B2B specific discounts */}
                          {isB2B && volumeDiscountSavings > 0 && (
                            <div className={`flex justify-between text-green-600 ${isMobile ? 'text-base' : 'text-sm'}`}>
                              <p>Έκπτωση όγκου</p>
                              <p>-{formatPrice(volumeDiscountSavings)}</p>
                            </div>
                          )}
                          
                          {isB2B && totalBulkDiscount > 0 && (
                            <div className={`flex justify-between text-green-600 ${isMobile ? 'text-base' : 'text-sm'}`}>
                              <p>Έκπτωση χονδρικής</p>
                              <p>-{formatPrice(totalBulkDiscount)}</p>
                            </div>
                          )}
                          
                          <div className={`flex justify-between font-medium text-gray-900 border-t pt-2 ${
                            isMobile ? 'text-lg' : 'text-base'
                          }`}>
                            <p>Σύνολο</p>
                            <p>{formatPrice(total)}</p>
                          </div>
                          
                          <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                            {isB2B ? 'Πιστωτικοί όροι & έξοδα αποστολής υπολογίζονται στο checkout.' : 'Τα έξοδα αποστολής υπολογίζονται στο checkout.'}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className={`${isMobile ? 'space-y-4' : 'space-y-3'}`}>
                          <Link
                            href={isB2B ? "/b2b/checkout" : "/checkout"}
                            onClick={close}
                            className={`flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors touch-manipulation ${
                              isMobile
                                ? 'px-6 py-4 text-lg font-semibold'
                                : 'px-6 py-3 text-base font-medium'
                            }`}
                          >
                            {isB2B ? 'Checkout B2B' : 'Checkout'}
                          </Link>
                          
                          {/* B2B specific actions */}
                          {isB2B && (
                            <div className={`grid ${isMobile ? 'grid-cols-1 space-y-3' : 'grid-cols-2 gap-3'}`}>
                              <Link
                                href="/b2b/quote-request"
                                onClick={close}
                                className={`flex items-center justify-center rounded-md border border-blue-300 bg-blue-50 text-blue-700 shadow-sm hover:bg-blue-100 transition-colors touch-manipulation ${
                                  isMobile
                                    ? 'px-6 py-3 text-base font-medium'
                                    : 'px-4 py-2 text-sm font-medium'
                                }`}
                              >
                                <CalendarDaysIcon className="mr-1.5 h-4 w-4" />
                                Αίτημα Προσφοράς
                              </Link>
                              <Link
                                href="/b2b/bulk-upload"
                                onClick={close}
                                className={`flex items-center justify-center rounded-md border border-green-300 bg-green-50 text-green-700 shadow-sm hover:bg-green-100 transition-colors touch-manipulation ${
                                  isMobile
                                    ? 'px-6 py-3 text-base font-medium'
                                    : 'px-4 py-2 text-sm font-medium'
                                }`}
                              >
                                <TruckIcon className="mr-1.5 h-4 w-4" />
                                Bulk Upload
                              </Link>
                            </div>
                          )}
                          
                          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'space-x-3'}`}>
                            <Link
                              href={isB2B ? "/b2b/cart" : "/cart"}
                              onClick={close}
                              className={`flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors touch-manipulation ${
                                isMobile
                                  ? 'w-full px-6 py-3 text-base font-medium'
                                  : 'flex-1 px-6 py-3 text-base font-medium'
                              }`}
                            >
                              Προβολή Καλαθιού
                            </Link>
                            <button
                              type="button"
                              onClick={close}
                              className={`flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors touch-manipulation ${
                                isMobile
                                  ? 'w-full px-6 py-3 text-base font-medium'
                                  : 'flex-1 px-6 py-3 text-base font-medium'
                              }`}
                            >
                              Συνέχεια Αγορών
                            </button>
                          </div>
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