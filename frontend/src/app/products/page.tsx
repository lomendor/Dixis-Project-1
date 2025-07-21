// Working server-side products page
import Link from 'next/link';
import ServerProductCartButton from '@/components/products/ServerProductCartButton';
import { buildApiUrl } from '@/lib/api/core/config';

interface Product {
  id: number;
  name: string;
  price: number;
  discount_price?: number;
  main_image?: string;
  stock: number;
  producer?: {
    business_name: string;
    city?: string;
  };
  slug: string;
  short_description?: string;
  is_featured?: boolean;
  is_organic?: boolean;
  category?: {
    name: string;
  };
}

export default async function ServerProductsPage() {
  let products: Product[] = [];
  let error = null;
  
  try {
    // Fetch directly from Laravel backend with longer timeout
    const response = await fetch(buildApiUrl('api/v1/products?per_page=100'), {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      products = data.data || [];
    } else {
      error = `Backend returned status ${response.status}`;
    }
  } catch (err) {
    error = `Failed to fetch products: ${err}`;
    console.error('Products fetch error:', err);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Αυθεντικά Ελληνικά Προϊόντα
            </h1>
            <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
              Ανακαλύψτε τα καλύτερα προϊόντα από επιλεγμένους παραγωγούς σε όλη την Ελλάδα
            </p>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 inline-block">
              <p className="text-lg">
                <span className="font-bold">{products.length}</span> προϊόντα διαθέσιμα
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p><strong>Σφάλμα:</strong> {error}</p>
            <p className="text-sm mt-2">Παρακαλούμε ελέγξτε ότι το Laravel backend τρέχει στο port 8000.</p>
          </div>
        )}

        {products.length > 0 ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{products.length}</div>
                <div className="text-gray-600">Συνολικά Προϊόντα</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {products.filter(p => p.is_organic).length}
                </div>
                <div className="text-gray-600">Βιολογικά</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {products.filter(p => p.is_featured).length}
                </div>
                <div className="text-gray-600">Επιλεγμένα</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {new Set(products.map(p => p.producer?.business_name).filter(Boolean)).size}
                </div>
                <div className="text-gray-600">Παραγωγοί</div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    {product.main_image ? (
                      <img 
                        src={product.main_image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">
                        {product.category?.name?.includes('Ελαιόλαδο') ? '🫒' :
                         product.category?.name?.includes('Μέλι') ? '🍯' :
                         product.category?.name?.includes('Τυρί') ? '🧀' :
                         product.category?.name?.includes('Φρούτα') ? '🍊' : '🥬'}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">
                        {product.name}
                      </h3>
                      {product.is_organic && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                          BIO
                        </span>
                      )}
                    </div>

                    {product.producer && (
                      <p className="text-sm text-gray-600 mb-2">
                        {product.producer.business_name}
                        {product.producer.city && ` • ${product.producer.city}`}
                      </p>
                    )}

                    {product.short_description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {product.short_description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {product.discount_price ? (
                          <div>
                            <span className="text-xl font-bold text-green-600">
                              €{product.discount_price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              €{product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-green-600">
                            €{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? 'Διαθέσιμο' : 'Εξαντλημένο'}
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="space-y-2">
                      <Link 
                        href={`/products/${product.slug}`}
                        className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center block"
                      >
                        Προβολή Προϊόντος
                      </Link>
                      {product.stock > 0 && (
                        <ServerProductCartButton
                          productId={product.id}
                          productName={product.name}
                          price={product.discount_price || product.price}
                          maxQuantity={product.stock}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ψάχνετε για κάτι συγκεκριμένο;
                </h3>
                <p className="text-gray-600 mb-6">
                  Επικοινωνήστε μαζί μας και θα σας βοηθήσουμε να βρείτε ακριβώς αυτό που χρειάζεστε.
                </p>
                <Link 
                  href="/contact"
                  className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Επικοινωνία
                </Link>
              </div>
            </div>
          </>
        ) : !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Δεν βρέθηκαν προϊόντα
            </h3>
            <p className="text-gray-600">
              Δοκιμάστε να ελέγξετε τη σύνδεση με τον διακομιστή.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}