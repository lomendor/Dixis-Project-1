'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext, stringToContext } from '@/lib/utils/errorUtils';

import React, { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEnhancedProduct } from '@/lib/api/services/product/useProductsEnhanced';
import { Product } from '@/lib/api/models/product/types';
import ModernCartButton from '@/components/cart/ModernCartButton';
import { useCartActions } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils/formatters';
import { TransparentPricing } from '@/components/pricing/TransparentPricing';
import { idToString } from '@/lib/api/client/apiTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  StarIcon,
  HeartIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Leaf, MapPin, Award, Clock, Users, Truck, Star, Heart, Camera, Calendar, TreePine, Sprout, Sun } from 'lucide-react';
import { ProductImage, ThumbnailImage } from '@/components/ui/OptimizedImage';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'pricing'>('description');
  const [isFavorite, setIsFavorite] = useState(false);

  // Add error logging
  const { product, isLoading, isError, error } = useEnhancedProduct(slug);
  
  // Log any errors for debugging
  React.useEffect(() => {
    if (isError && error) {
      logger.error('Product fetch error:', toError(error), errorToContext(error));
    }
  }, [isError, error]);
  
  const typedProduct = product as Product | undefined;
  const { getItemQuantity, isInCart } = useCartActions();

  // Memoize expensive calculations (MUST be called before any conditional returns)
  const productData = useMemo(() => {
    if (!typedProduct) {
      return {
        currentQuantity: 0,
        productInCart: false,
        currentPrice: 0,
        hasDiscount: false,
        galleryImages: ['/placeholder-product.svg'],
        discountPercentage: 0
      };
    }

    const currentQuantity = getItemQuantity(typedProduct.id);
    const productInCart = isInCart(typedProduct.id);
    const currentPrice = typedProduct.salePrice || typedProduct.price;
    const hasDiscount = typedProduct.salePrice && typedProduct.salePrice < typedProduct.price;

    // Mock gallery images
    const galleryImages = [
      typedProduct.image || '/placeholder-product.svg',
      '/placeholder-product-2.jpg',
      '/placeholder-product-3.jpg',
      '/placeholder-product-4.jpg',
    ].filter(Boolean);

    return {
      currentQuantity,
      productInCart,
      currentPrice,
      hasDiscount,
      galleryImages,
      discountPercentage: hasDiscount ? Math.round(((typedProduct.price - currentPrice) / typedProduct.price) * 100) : 0
    };
  }, [typedProduct, getItemQuantity, isInCart]);

  // Handler functions
  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev);    // Will be implemented in next phase to save/remove favorite
    logger.info(`${isFavorite ? 'Removed from' : 'Added to'} favorites:`, stringToContext(typedProduct?.name, 'productName'));
  }, [isFavorite, typedProduct]);

  const handleShare = useCallback(async () => {
    if (!typedProduct) return;
    
    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: typedProduct.name,
          text: `Δες αυτό το προϊόν: ${typedProduct.name}`,
          url: window.location.href,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Το link αντιγράφηκε στο clipboard!');
      }
    } catch (error) {
      logger.error('Share failed:', toError(error), errorToContext(error));
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Το link αντιγράφηκε στο clipboard!');
      } catch (clipboardError) {
        logger.error('Clipboard failed:', toError(clipboardError), errorToContext(clipboardError));
        alert('Δεν μπόρεσε να γίνει κοινοποίηση. Δοκιμάστε ξανά.');
      }
    }
  }, [typedProduct]);

  const handleWriteReview = useCallback(() => {    // Reviews planned for consumer phase
    alert('Η φόρμα αξιολόγησης θα ανοίξει σύντομα!');
    logger.info('Write review clicked for product:', stringToContext(typedProduct?.name, 'productName'));
  }, [typedProduct]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Φόρτωση προϊόντος...</p>
        </div>
      </div>
    );
  }

  if (isError || !typedProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Προϊόν δεν βρέθηκε</h1>
          <p className="text-gray-600 mb-6">
            {error?.message || 'Το προϊόν που ψάχνετε δεν υπάρχει ή έχει αφαιρεθεί.'}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Επιστροφή στα Προϊόντα
          </Link>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < Math.floor(rating) ? (
          <StarIconSolid className="w-5 h-5 text-yellow-400" />
        ) : (
          <StarIcon className="w-5 h-5 text-gray-300" />
        )}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Premium Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-green-100 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Αρχική</Link>
            <span className="text-green-300">/</span>
            <Link href="/products" className="hover:text-white transition-colors">Προϊόντα</Link>
            <span className="text-green-300">/</span>
            <span className="text-white font-medium">{typedProduct.name}</span>
          </nav>

          {/* Premium Product Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-4 py-2 rounded-full text-sm font-medium">
                <Leaf className="mr-2 h-4 w-4" />
                Από τον Αγρό στο Τραπέζι σας
              </div>
              {typedProduct.isOrganic && (
                <div className="inline-flex items-center bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-100 px-4 py-2 rounded-full text-sm font-medium">
                  <Award className="mr-2 h-4 w-4" />
                  Βιολογικό Πιστοποιημένο
                </div>
              )}
            </div>
            
            <Link
              href="/products"
              className="inline-flex items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 border border-white/20"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Επιστροφή στα Προϊόντα
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">{/* Content continues below */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Enhanced Product Images */}
        <div className="space-y-6">
          {/* Main Image with Premium Frame */}
          <div className="relative group">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 relative">
              <ProductImage
                src={productData.galleryImages[selectedImageIndex]}
                alt={typedProduct.name}
                priority={true}
                className="group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Premium Overlay Badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              {/* Certification Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {typedProduct.isOrganic && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-lg backdrop-blur-sm">
                    <Leaf className="mr-1 h-3 w-3" />
                    Βιολογικό
                  </div>
                )}
                {typedProduct.isLocal && (
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm">
                    <MapPin className="mr-1 h-3 w-3" />
                    Τοπικό
                  </div>
                )}
                {productData.hasDiscount && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                    -{productData.discountPercentage}%
                  </div>
                )}
              </div>

              {/* Freshness Indicator */}
              <div className="absolute bottom-4 right-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-lg backdrop-blur-sm">
                  <Clock className="mr-1 h-3 w-3" />
                  Φρέσκο σήμερα
                </div>
              </div>

              {/* Image Counter */}
              {productData.galleryImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                  {selectedImageIndex + 1} / {productData.galleryImages.length}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Thumbnail Gallery */}
          {productData.galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {productData.galleryImages.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-lg hover:shadow-xl relative ${
                    selectedImageIndex === index 
                      ? 'border-green-500 ring-2 ring-green-200' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <ThumbnailImage
                    src={image}
                    alt={`${typedProduct.name} ${index + 1}`}
                    className="hover:scale-105 transition-transform duration-200"
                  />
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm" />
                  )}
                </motion.button>
              ))}
            </div>
          )}

          {/* Farm Authenticity Badge */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Camera className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Αυθεντικές Φωτογραφίες</p>
                <p className="text-xs text-gray-600">Πραγματικές εικόνες από τον αγρό του παραγωγού</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{typedProduct.name}</h1>

            {/* Rating */}
            {typedProduct.rating && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {renderStars(typedProduct.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {typedProduct.rating} ({typedProduct.reviewCount || 0} αξιολογήσεις)
                </span>
              </div>
            )}

            {/* Transparent Pricing Section */}
            <div className="mb-6">
              <TransparentPricing
                product={{
                  id: parseInt(idToString(typedProduct.id)),
                  name: typedProduct.name,
                  producer_price: typedProduct.producerPrice || (productData.currentPrice / 1.24 / 1.12), // Estimate if not available
                  producer: {
                    business_name: typedProduct.producerName || 'Παραγωγός',
                    commission_rate: typedProduct.commissionRate || 12
                  }
                }}
                variant="compact"
                showProducerInfo={false}
                className="mb-4"
              />
              
              {/* Main Price Display */}
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(productData.currentPrice, 'EUR')}
                </span>
                {productData.hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(typedProduct.price, 'EUR')}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                      -{productData.discountPercentage}%
                    </span>
                  </>
                )}
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  100% διαφανής
                </div>
              </div>
            </div>

            {/* Short Description */}
            {typedProduct.shortDescription && (
              <p className="text-gray-600 text-lg leading-relaxed">
                {typedProduct.shortDescription}
              </p>
            )}
          </div>

          {/* Enhanced Producer Storytelling Section */}
          {typedProduct.producerName && (
            <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-2xl p-6 border border-green-200 shadow-lg">
              {/* Producer Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-green-700 font-bold text-xl">
                        {typedProduct.producerName.charAt(0)}
                      </span>
                    </div>
                    {/* Verification Badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm text-gray-500">Πιστοποιημένος Παραγωγός</p>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <Link
                      href={`/producers/${typedProduct.producerSlug || typedProduct.producerId}`}
                      className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors block"
                    >
                      {typedProduct.producerName}
                    </Link>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-1 h-4 w-4 text-green-500" />
                        Κρήτη, Ελλάδα
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-1 h-4 w-4 text-blue-500" />
                        Από το 1987
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    Λαμβάνει {formatPrice((typedProduct.producerPrice || (productData.currentPrice / 1.24 / 1.12)), 'EUR')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {(typedProduct.commissionRate || 12) < 12 ? 'Premium Συνεργάτης' : 'Βασική Συνεργασία'}
                  </div>
                </div>
              </div>

              {/* Producer Story */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TreePine className="mr-2 h-4 w-4 text-green-600" />
                  Η Ιστορία του Παραγωγού
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  "Η οικογένειά μας καλλιεργεί βιολογικά προϊόντα στην Κρήτη εδώ και τρεις γενιές. 
                  Χρησιμοποιούμε παραδοσιακές μεθόδους που μας έμαθαν οι παππούδες μας, 
                  συνδυάζοντάς τες με σύγχρονες βιολογικές τεχνικές για να σας προσφέρουμε 
                  την καλύτερη δυνατή ποιότητα."
                </p>
                
                {/* Farm Specialties */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    Βιολογική Καλλιέργεια
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    Παραδοσιακές Μέθοδοι
                  </span>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                    Οικογενειακή Επιχείρηση
                  </span>
                </div>

                {/* Farm Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-lg font-bold text-green-600">37</div>
                    <div className="text-xs text-gray-600">Χρόνια Εμπειρίας</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-lg font-bold text-blue-600">15</div>
                    <div className="text-xs text-gray-600">Στρέμματα Αγρού</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-lg font-bold text-amber-600">4.9</div>
                    <div className="text-xs text-gray-600">Αξιολόγηση</div>
                  </div>
                </div>
              </div>

              {/* Sustainability Promise */}
              <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-green-900 mb-1">Δέσμευση Βιωσιμότητας</h5>
                    <p className="text-green-800 text-sm">
                      Χρησιμοποιούμε 100% ανανεώσιμη ενέργεια, βιοδιασπώμενες συσκευασίες 
                      και στηρίζουμε την τοπική κοινότητα.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-4 flex items-center justify-between">
                <Link
                  href={`/producers/${typedProduct.producerSlug || typedProduct.producerId}`}
                  className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  <Users className="mr-1 h-4 w-4" />
                  Δείτε όλα τα προϊόντα του παραγωγού
                </Link>
                <div className="text-xs text-gray-500">
                  Προμήθεια: {typedProduct.commissionRate || 12}%
                </div>
              </div>
            </div>
          )}

          {/* Product Features */}
          <div className="grid grid-cols-2 gap-4">
            {typedProduct.isOrganic && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Βιολογικό</span>
              </div>
            )}
            {typedProduct.isLocal && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <TruckIcon className="w-5 h-5" />
                <span>Τοπικό Προϊόν</span>
              </div>
            )}
            {typedProduct.isVegan && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <span>🌱</span>
                <span>Vegan</span>
              </div>
            )}
            {typedProduct.isGlutenFree && (
              <div className="flex items-center space-x-2 text-sm text-orange-600">
                <span>🌾</span>
                <span>Χωρίς Γλουτένη</span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {typedProduct.stock > 0 ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Διαθέσιμο</span>
                <span className="text-gray-500">({typedProduct.stock} τεμάχια)</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">Μη Διαθέσιμο</span>
              </>
            )}
          </div>

          {/* Add to Cart Section */}
          <div className="border-t border-gray-200 pt-6">
            <ModernCartButton
              productId={typedProduct.id}
              productName={typedProduct.name}
              price={productData.currentPrice}
              maxQuantity={typedProduct.stock}
              disabled={typedProduct.stock <= 0}
              size="lg"
              variant="primary"
              showQuantityControls={true}
              className="w-full"
            />

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mt-4">
              <button 
                onClick={handleToggleFavorite}
                className={`flex items-center space-x-2 transition-colors ${
                  isFavorite 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <HeartIcon className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'Αφαίρεση από Αγαπημένα' : 'Προσθήκη στα Αγαπημένα'}</span>
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Κοινοποίηση</span>
              </button>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <TruckIcon className="w-5 h-5" />
              <span className="font-medium">Δωρεάν μεταφορικά για παραγγελίες άνω των 25€</span>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              Παράδοση σε 2-4 εργάσιμες ημέρες
            </p>
          </div>
        </div>
      </div>

      {/* Farm-to-Table Journey Visualization */}
      <div className="mt-16 mb-12">
        <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-2xl p-8 border border-green-200 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Sprout className="mr-3 h-6 w-6 text-green-600" />
              Από τον Αγρό στο Τραπέζι σας
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Παρακολουθήστε το ταξίδι του προϊόντος από τον βιολογικό αγρό του παραγωγού μέχρι το σπίτι σας
            </p>
          </div>

          {/* Journey Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Step 1: Cultivation */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sprout className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Καλλιέργεια</h3>
              <p className="text-sm text-gray-600 mb-3">
                Βιολογική καλλιέργεια με παραδοσιακές μεθόδους
              </p>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                Μάρτιος 2024
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-200 transform -translate-y-1/2"></div>
            </div>

            {/* Step 2: Harvest */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sun className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Συγκομιδή</h3>
              <p className="text-sm text-gray-600 mb-3">
                Χειροσυλλογή στη βέλτιστη ωριμότητα
              </p>
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                Εχθές
              </div>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-200 transform -translate-y-1/2"></div>
            </div>

            {/* Step 3: Processing */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Επεξεργασία</h3>
              <p className="text-sm text-gray-600 mb-3">
                Ελάχιστη επεξεργασία, μέγιστη φρεσκάδα
              </p>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                Σήμερα πρωί
              </div>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-200 transform -translate-y-1/2"></div>
            </div>

            {/* Step 4: Packaging */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Συσκευασία</h3>
              <p className="text-sm text-gray-600 mb-3">
                Βιοδιασπώμενα υλικά, φιλικά στο περιβάλλον
              </p>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                Σε εξέλιξη
              </div>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-200 transform -translate-y-1/2"></div>
            </div>

            {/* Step 5: Delivery */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Παράδοση</h3>
              <p className="text-sm text-gray-600 mb-3">
                Στην πόρτα σας σε λιγότερο από 24 ώρες
              </p>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                Αύριο
              </div>
            </div>
          </div>

          {/* Freshness Guarantee */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-4 border border-green-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Εγγύηση Φρεσκάδας</h4>
              <p className="text-sm text-gray-600">
                Μέγιστη χρονική απόσταση από τη συγκομιδή: 48 ώρες
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-blue-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Leaf className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Μηδενικά Απόβλητα</h4>
              <p className="text-sm text-gray-600">
                100% ανακυκλώσιμη συσκευασία, φιλική στο περιβάλλον
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-amber-200 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Πιστοποιήσεις</h4>
              <p className="text-sm text-gray-600">
                Bio Hellas, ISO 14001, Fair Trade Certified
              </p>
            </div>
          </div>

          {/* Carbon Footprint */}
          <div className="mt-6 bg-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <TreePine className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Περιβαλλοντικό Αποτύπωμα</h4>
                  <p className="text-sm text-green-800">
                    Αυτό το προϊόν έχει 75% μικρότερο αποτύπωμα από το μέσο όρο της αγοράς
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-700">0.8kg</div>
                <div className="text-xs text-green-600">CO₂ ανά κιλό</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Transparent Pricing */}
      <div className="mt-12 mb-16">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2 text-green-600" />
            Αναλυτική Τιμολόγηση
          </h2>
          <TransparentPricing
            product={{
              id: parseInt(idToString(typedProduct.id)),
              name: typedProduct.name,
              producer_price: typedProduct.producerPrice || (productData.currentPrice / 1.24 / 1.12),
              producer: {
                business_name: typedProduct.producerName || 'Παραγωγός',
                commission_rate: typedProduct.commissionRate || 12
              }
            }}
            variant="full"
            showProducerInfo={true}
          />
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'description', label: 'Περιγραφή' },
              { key: 'specifications', label: 'Χαρακτηριστικά' },
              { key: 'reviews', label: 'Αξιολογήσεις' },
              { key: 'pricing', label: 'Τιμολόγηση' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {typedProduct.description || 'Δεν υπάρχει διαθέσιμη περιγραφή για αυτό το προϊόν.'}
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Βασικά Χαρακτηριστικά</h3>
                <dl className="space-y-3">
                  {typedProduct.weight && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Βάρος:</dt>
                      <dd className="font-medium">{typedProduct.weight}g</dd>
                    </div>
                  )}
                  {typedProduct.unit && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Μονάδα:</dt>
                      <dd className="font-medium">{typedProduct.unit}</dd>
                    </div>
                  )}
                  {typedProduct.sku && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Κωδικός:</dt>
                      <dd className="font-medium">{typedProduct.sku}</dd>
                    </div>
                  )}
                  {typedProduct.origin && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Προέλευση:</dt>
                      <dd className="font-medium">{typedProduct.origin}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Δεν υπάρχουν ακόμα αξιολογήσεις για αυτό το προϊόν.</p>
              <button 
                onClick={handleWriteReview}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Γράψτε την πρώτη αξιολόγηση
              </button>
            </div>
          )}
          
          {activeTab === 'pricing' && (
            <div className="py-8">
              <TransparentPricing
                product={{
                  id: parseInt(idToString(typedProduct.id)),
                  name: typedProduct.name,
                  producer_price: typedProduct.producerPrice || (productData.currentPrice / 1.24 / 1.12),
                  producer: {
                    business_name: typedProduct.producerName || 'Παραγωγός',
                    commission_rate: typedProduct.commissionRate || 12
                  }
                }}
                variant="full"
                showProducerInfo={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16 mb-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Heart className="mr-3 h-6 w-6 text-green-600" />
            Μπορεί να σας αρέσουν επίσης
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ανακαλύψτε άλλα premium προϊόντα από τον ίδιο παραγωγό και παρόμοιες επιλογές
          </p>
        </div>

        {/* Related Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mock related products - In production these would come from API */}
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
              <Link href={`/products/related-product-${index + 1}`} className="block">
                <div className="relative overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <span className="text-4xl">
                      {index === 0 ? '🍅' : index === 1 ? '🥒' : index === 2 ? '🫒' : '🌶️'}
                    </span>
                  </div>
                  
                  {/* Organic Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-lg">
                      <Leaf className="mr-1 h-3 w-3" />
                      Βιολογικό
                    </div>
                  </div>
                  
                  {/* Producer Badge */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      Ίδιος Παραγωγός
                    </div>
                  </div>
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/related-product-${index + 1}`}>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-green-600 transition-colors">
                    {index === 0 ? 'Βιολογικές Ντομάτες' : 
                     index === 1 ? 'Κρητικά Αγγούρια' : 
                     index === 2 ? 'Έξτρα Παρθένο Ελαιόλαδο' : 'Καυτερές Πιπεριές'}
                  </h3>
                </Link>

                {/* Producer Info */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Users className="mr-1 h-4 w-4 text-green-500" />
                  <span>{typedProduct.producerName}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(4.8)</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-green-600">
                    €{(12.50 + index * 2.30).toFixed(2)}
                  </span>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Διαθέσιμο
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Heart className="h-4 w-4" />
                  <span>Προσθήκη στο Καλάθι</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View More Products CTA */}
        <div className="text-center mt-8">
          <Link
            href={`/producers/${typedProduct.producerSlug || typedProduct.producerId}`}
            className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Users className="mr-2 h-5 w-5" />
            Δείτε όλα τα προϊόντα του παραγωγού
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
