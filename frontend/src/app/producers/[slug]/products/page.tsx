'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEnhancedProducer } from '@/lib/api/services/producer/useProducersEnhanced';
import { useEnhancedProducts } from '@/lib/api/services/product/useProductsEnhanced';
import { ProductImage, ProducerImage } from '@/components/ui/OptimizedImage';
import { ProductPriceCard } from '@/components/pricing/TransparentPricing';
import ModernCartButton from '@/components/cart/ModernCartButton';
import { ProductsGridLoading, ProducerProfileLoading } from '@/components/ui/LoadingStates';
import { useState } from 'react';

export default function ProducerProductsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('newest');
  
  // Extract ID from slug (format: business-name-id)
  const producerId = parseInt(slug?.split('-').pop() || '0');
  
  const {
    producer,
    isLoading: producerLoading,
    isError: producerError,
    error: producerErrorMsg,
  } = useEnhancedProducer(producerId);

  const {
    products,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorMsg,
    refetch
  } = useEnhancedProducts({ producer_id: producerId });

  if (producerLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProducerProfileLoading />
      </div>
    );
  }

  if (producerError || !producer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Σφάλμα φόρτωσης</h2>
            <p className="text-red-600 mb-4">{producerErrorMsg?.message || 'Ο παραγωγός δεν βρέθηκε'}</p>
            <Link
              href="/producers"
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Επιστροφή στους Παραγωγούς
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sort products
  const sortedProducts = products ? [...products].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.producer_price - b.producer_price;
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  }) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Αρχική
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/producers" className="text-gray-500 hover:text-gray-700">
              Παραγωγοί
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href={`/producers/${slug}`} className="text-gray-500 hover:text-gray-700">
              {producer.business_name}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">Προϊόντα</li>
        </ol>
      </nav>

      {/* Producer Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          {producer.profile_image && (
            <div className="md:w-48 h-48 bg-gray-200 relative">
              <ProducerImage
                src={producer.profile_image}
                alt={producer.business_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6 flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Προϊόντα από {producer.business_name}
                </h1>
                {producer.location && (
                  <p className="text-gray-600 flex items-center mb-2">
                    <span className="mr-2">📍</span>
                    {producer.location}
                  </p>
                )}
                {producer.bio && (
                  <p className="text-gray-700 text-sm">{producer.bio}</p>
                )}
              </div>
              
              {producer.verification_status === 'verified' && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Επιβεβαιωμένος
                </div>
              )}
            </div>

            {/* Producer Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{products?.length || 0}</p>
                <p className="text-gray-600 text-xs">Προϊόντα</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">
                  {producer.rating || 0}
                  <span className="text-sm">⭐</span>
                </p>
                <p className="text-gray-600 text-xs">Βαθμολογία</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{producer.review_count || 0}</p>
                <p className="text-gray-600 text-xs">Κριτικές</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {products?.length ? `${products.length} Προϊόντα` : 'Προϊόντα'}
        </h2>
        
        {products && products.length > 0 && (
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600">Ταξινόμηση:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Νεότερα πρώτα</option>
              <option value="name">Αλφαβητικά</option>
              <option value="price">Τιμή (χαμηλή πρώτα)</option>
            </select>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <ProductsGridLoading />
      ) : productsError ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Σφάλμα φόρτωσης προϊόντων</h3>
            <p className="text-red-600 mb-4">{productsErrorMsg?.message || 'Αποτυχία φόρτωσης προϊόντων'}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Δοκιμή ξανά
            </button>
          </div>
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <Link href={`/products/${product.slug}`}>
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden">
                  <ProductImage
                    src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.is_organic && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ΒΙΟ
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                
                {product.shortDescription && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}

                {/* Pricing */}
                <div className="mb-3">
                  <ProductPriceCard product={product} />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <ModernCartButton
                    productId={product.id}
                    productName={product.name}
                    price={product.price}
                    variant="primary"
                    size="sm"
                    className="w-full"
                  />
                  <Link
                    href={`/products/${product.slug}`}
                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Περισσότερα
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Δεν υπάρχουν προϊόντα</h3>
            <p className="mb-4">Ο παραγωγός δεν έχει προσθέσει προϊόντα ακόμα.</p>
            <Link
              href="/products"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Δείτε άλλα προϊόντα
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}