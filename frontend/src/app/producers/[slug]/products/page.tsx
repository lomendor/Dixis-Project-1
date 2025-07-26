// Server-side producer products page using real Laravel API data
import Link from 'next/link';
import { buildApiUrl } from '@/lib/api/config/unified';

interface Producer {
  id: number;
  business_name: string;
  slug: string;
  bio: string;
  location: string;
  profile_image: string;
  verification_status: string;
  rating: number;
  review_count: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  description: string;
}

interface ProducerProductsPageProps {
  params: { slug: string };
}

export default async function ProducerProductsPage({ params }: ProducerProductsPageProps) {
  const { slug } = params;
  let producer: Producer | null = null;
  let products: Product[] = [];
  let error = null;
  
  try {
    // Fetch producer data first
    const producerResponse = await fetch(buildApiUrl(`producers/slug/${slug}`), {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (producerResponse.ok) {
      const producerData = await producerResponse.json();
      producer = producerData.data || producerData;
      
      // Now fetch products for this producer using the real producer ID
      if (producer) {
        const productsResponse = await fetch(buildApiUrl(`producers/${producer.id}/products`), {
          next: { revalidate: 60 },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          // Use the products array from the producer detail response if available
          products = producer.products || productsData.data || [];
        }
      }
    } else {
      error = `Backend returned status ${producerResponse.status}`;
    }
  } catch (err) {
    error = `Failed to fetch data: ${err}`;
    console.error('Producer products fetch error:', err);
  }

  if (error || !producer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Σφάλμα φόρτωσης</h2>
            <p className="text-red-600 mb-4">{error || 'Ο παραγωγός δεν βρέθηκε'}</p>
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
          <li className="text-gray-900">Προϊόντα από {producer.business_name}</li>
        </ol>
      </nav>

      {/* Producer Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          {producer.profile_image && (
            <div className="md:w-48 h-48 bg-gray-200 relative">
              <img
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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {products?.length ? `${products.length} Προϊόντα` : 'Προϊόντα'}
        </h2>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <Link href={`/products/${product.slug}`}>
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden bg-gray-200">
                  <img
                    src="/placeholder-product.jpg"
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Pricing */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      {product.discount_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            €{product.discount_price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            €{product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-green-600">
                          €{product.price.toFixed(2)}
                        </span>
                      )}
                      <div className="text-xs text-gray-500">(τελική τιμή)</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Προσθήκη στο Καλάθι
                  </button>
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