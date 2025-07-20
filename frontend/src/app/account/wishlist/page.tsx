'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HeartIcon, 
  ShoppingCartIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '@/stores/cartStore';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';
import OptimizedImage from '@/components/performance/OptimizedImage';

interface WishlistItem {
  id: string;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price?: number;
    main_image: string;
    stock: number;
    rating?: number;
    review_count?: number;
    producer: {
      business_name: string;
      city?: string;
    };
  };
  dateAdded: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/account/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.data || []);
      } else {
        // Mock data for development
        const mockWishlist: WishlistItem[] = [
          {
            id: '1',
            product: {
              id: 1,
              name: 'Βιολογικό Έξτρα Παρθένο Ελαιόλαδο',
              slug: 'viologiko-extra-partheno-elaiolado',
              price: 15.90,
              discount_price: 12.90,
              main_image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop',
              stock: 25,
              rating: 4.8,
              review_count: 127,
              producer: {
                business_name: 'Ελαιώνες Καλαμάτας',
                city: 'Καλαμάτα'
              }
            },
            dateAdded: '2024-01-15'
          },
          {
            id: '2',
            product: {
              id: 2,
              name: 'Μέλι Θυμαρίσιο από Κρήτη',
              slug: 'meli-thymarisio-kriti',
              price: 18.50,
              main_image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop',
              stock: 12,
              rating: 4.9,
              review_count: 89,
              producer: {
                business_name: 'Μελισσοκομείο Κρήτης',
                city: 'Χανιά'
              }
            },
            dateAdded: '2024-01-18'
          },
          {
            id: '3',
            product: {
              id: 3,
              name: 'Φέτα ΠΟΠ Παραδοσιακή',
              slug: 'feta-pop-paradosiaki',
              price: 12.40,
              main_image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop',
              stock: 0, // Out of stock
              rating: 4.7,
              review_count: 156,
              producer: {
                business_name: 'Τυροκομείο Δωδώνης',
                city: 'Ιωάννινα'
              }
            },
            dateAdded: '2024-01-20'
          }
        ];
        setWishlistItems(mockWishlist);
      }
    } catch (error) {
      logger.error('Failed to fetch wishlist', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const response = await fetch(`/api/account/wishlist/${itemId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setWishlistItems(items => items.filter(item => item.id !== itemId));
      }
    } catch (error) {
      logger.error('Failed to remove from wishlist', toError(error), errorToContext(error));
    }
  };

  const handleAddToCart = async (product: WishlistItem['product']) => {
    if (product.stock > 0) {
      try {
        await addToCart(product.id, 1);
      } catch (error) {
        logger.error('Failed to add product to cart', toError(error), errorToContext(error));
      }
    }
  };

  const clearWishlist = async () => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να καθαρίσετε όλα τα αγαπημένα σας;')) {
      try {
        const response = await fetch('/api/account/wishlist', {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setWishlistItems([]);
        }
      } catch (error) {
        logger.error('Failed to clear wishlist', toError(error), errorToContext(error));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <HeartSolidIcon className="h-8 w-8 text-red-500 mr-3" />
          Τα Αγαπημένα μου ({wishlistItems.length})
        </h1>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Καθαρισμός όλων
          </button>
        )}
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const { product } = item;
            const discount = product.discount_price ? 
              Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                <div className="relative">
                  <Link href={`/products/${product.slug}`}>
                    <OptimizedImage
                      src={product.main_image}
                      alt={product.name}
                      className="w-full h-48"
                      type="product"
                    />
                  </Link>
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        Μόνο {product.stock} διαθέσιμα
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Εξαντλημένο
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Remove from wishlist */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Αφαίρεση από αγαπημένα"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {/* Producer */}
                  <p className="text-sm text-gray-600 mb-2">
                    {product.producer.business_name}
                    {product.producer.city && ` • ${product.producer.city}`}
                  </p>
                  
                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {product.rating.toFixed(1)} ({product.review_count || 0})
                      </span>
                    </div>
                  )}
                  
                  {/* Price */}
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      {product.discount_price ? (
                        <>
                          <span className="text-lg font-bold text-green-600">
                            €{product.discount_price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            €{product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          €{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date added */}
                  <p className="text-xs text-gray-500 mb-3">
                    Προστέθηκε στις {new Date(item.dateAdded).toLocaleDateString('el-GR')}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                        product.stock > 0
                          ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      {product.stock > 0 ? 'Προσθήκη' : 'Εξαντλημένο'}
                    </button>
                    
                    <Link
                      href={`/products/${product.slug}`}
                      className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      title="Προβολή προϊόντος"
                    >
                      👁️
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Δεν έχετε αγαπημένα προϊόντα
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Ξεκινήστε να προσθέτετε προϊόντα στα αγαπημένα σας για εύκολη πρόσβαση!
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <HeartIcon className="h-4 w-4 mr-2" />
              Περιηγηθείτε στα προϊόντα
            </Link>
          </div>
        </div>
      )}

      {/* Tips */}
      {wishlistItems.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Συμβουλές:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Τα αγαπημένα σας αποθηκεύονται στον λογαριασμό σας</li>
            <li>• Θα λαμβάνετε ειδοποιήσεις όταν προϊόντα είναι σε προσφορά</li>
            <li>• Μπορείτε να προσθέσετε όλα τα αγαπημένα στο καλάθι με ένα κλικ</li>
          </ul>
        </div>
      )}
    </div>
  );
}