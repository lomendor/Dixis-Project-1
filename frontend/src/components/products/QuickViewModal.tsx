'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  XMarkIcon, 
  ShoppingCartIcon, 
  HeartIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCartStore } from '@/stores/cartStore';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  main_image: string;
  description: string;
  short_description: string;
  stock: number;
  producer: {
    business_name: string;
    slug: string;
  };
  rating?: number;
  reviews_count?: number;
  images?: string[];
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addToCart } = useCartStore();

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.main_image && product.main_image.trim() !== '' ? product.main_image : '/images/placeholder-product.svg'];

  const finalPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (product.stock < 1) return;
    
    setIsLoading(true);
    
    try {
      await addToCart(product.id, quantity, {
        productName: product.name,
        price: finalPrice,
        image: product.main_image && product.main_image.trim() !== '' ? product.main_image : '/images/placeholder-product.svg',
        producer: product.producer.business_name
      });
      
      // Close modal after successful add
      onClose();
    } catch (error) {
      logger.error('Failed to add product to cart:', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);    // Wishlist feature planned for future release
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: 'Εξαντλημένο', color: 'text-red-600', bgColor: 'bg-red-100', icon: ExclamationTriangleIcon };
    } else if (product.stock <= 5) {
      return { text: `Μόνο ${product.stock} διαθέσιμα`, color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: ExclamationTriangleIcon };
    } else {
      return { text: 'Διαθέσιμο', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Γρήγορη Προβολή
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                  {/* Images */}
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {hasDiscount && (
                        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          -{discountPercentage}%
                        </div>
                      )}
                      <Image
                        src={images[selectedImage]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>

                    {/* Thumbnail Images */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedImage === index 
                                ? 'border-green-500' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-6">
                    {/* Producer */}
                    <div>
                      <p className="text-sm text-gray-500">από</p>
                      <Link 
                        href={`/producers/${product.producer.slug}`}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        {product.producer.business_name}
                      </Link>
                    </div>

                    {/* Product Name */}
                    <h1 className="text-2xl font-bold text-gray-900">
                      {product.name}
                    </h1>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(product.rating!) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.rating.toFixed(1)} ({product.reviews_count || 0} αξιολογήσεις)
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-green-600">
                        €{finalPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xl text-gray-400 line-through">
                          €{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                      <stockStatus.icon className="w-4 h-4" />
                      {stockStatus.text}
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-gray-600 leading-relaxed">
                        {product.short_description}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="space-y-4">
                      {/* Quantity Selector */}
                      {product.stock > 0 && (
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-700">Ποσότητα:</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
                            >
                              -
                            </button>
                            <span className="font-medium min-w-[3rem] text-center">{quantity}</span>
                            <button
                              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddToCart}
                          disabled={product.stock < 1 || isLoading}
                          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                            product.stock < 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                          }`}
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <ShoppingCartIcon className="w-5 h-5" />
                              {product.stock < 1 ? 'Μη Διαθέσιμο' : 'Προσθήκη στο Καλάθι'}
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleWishlistToggle}
                          className="p-3 border border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                        >
                          {isWishlisted ? (
                            <HeartIconSolid className="w-6 h-6 text-red-500" />
                          ) : (
                            <HeartIcon className="w-6 h-6 text-gray-600" />
                          )}
                        </button>
                      </div>

                      {/* View Full Product */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                      >
                        <span>Δες όλες τις λεπτομέρειες</span>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
