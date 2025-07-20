'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGlobalSearch, SearchFilters } from '@/lib/api/services/search/useGlobalSearch';
import SearchBar from '@/components/SearchBar';
import SearchFiltersComponent from '@/components/SearchFilters';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    sortBy: 'relevance'
  });

  const {
    results,
    isLoading,
    isError,
    error
  } = useGlobalSearch(filters);

  useEffect(() => {
    if (initialQuery && initialQuery !== filters.query) {
      setFilters(prev => ({ ...prev, query: initialQuery }));
    }
  }, [initialQuery]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Σφάλμα αναζήτησης</h2>
            <p className="text-red-600">{error?.message || 'Παρουσιάστηκε σφάλμα κατά την αναζήτηση'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Αναζήτηση</h1>
        <SearchBar
          onSearch={handleSearch}
          showSuggestions={false}
          className="max-w-2xl"
        />
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            facets={results?.facets}
          />
        </div>

        {/* Results Content */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Αναζήτηση...</p>
            </div>
          ) : (
            <>
              {/* Results Summary */}
              {results && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {filters.query ? (
                        <h2 className="text-xl font-semibold text-gray-900">
                          Αποτελέσματα για "{filters.query}"
                        </h2>
                      ) : (
                        <h2 className="text-xl font-semibold text-gray-900">
                          Όλα τα προϊόντα
                        </h2>
                      )}
                      <p className="text-gray-600 mt-1">
                        {results.totalProducts} προϊόντα, {results.totalProducers} παραγωγοί
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Results */}
              {results?.products && results.products.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Προϊόντα ({results.totalProducts})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {results.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group"
                      >
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square bg-gray-200">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                              {product.name}
                            </h4>

                            {product.shortDescription && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {product.shortDescription}
                              </p>
                            )}

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex flex-col">
                                {product.salePrice ? (
                                  <>
                                    <span className="text-lg font-bold text-green-600">
                                      €{product.salePrice}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      €{product.price}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">
                                    €{product.price}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                      } fill-current`}
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">({product.reviewCount})</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{typeof product.category === 'string' ? product.category : product?.category?.name || ''}</span>
                              <span>{product.producerName}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Producers Results */}
              {results?.producers && results.producers.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Παραγωγοί ({results.totalProducers})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.producers.map((producer) => (
                      <Link
                        key={producer.id}
                        href={`/producers/${producer.slug}`}
                        className="group"
                      >
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="h-32 bg-gray-200">
                            <img
                              src={producer.cover_image || producer.profile_image || '/placeholder-producer.jpg'}
                              alt={producer.business_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-producer.jpg';
                              }}
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                              {producer.business_name}
                            </h4>

                            {producer.bio && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {producer.bio}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{producer.location}</span>
                              {producer.specialties && producer.specialties.length > 0 && (
                                <span>{producer.specialties[0]}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results && results.totalProducts === 0 && results.totalProducers === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Δεν βρέθηκαν αποτελέσματα
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {filters.query
                        ? `Δεν βρέθηκαν αποτελέσματα για "${filters.query}"`
                        : 'Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης'
                      }
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>Προτάσεις:</p>
                      <ul className="text-gray-500">
                        <li>• Ελέγξτε την ορθογραφία</li>
                        <li>• Χρησιμοποιήστε πιο γενικούς όρους</li>
                        <li>• Δοκιμάστε διαφορετικές λέξεις-κλειδιά</li>
                        <li>• Αφαιρέστε κάποια φίλτρα</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Φόρτωση αναζήτησης...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
