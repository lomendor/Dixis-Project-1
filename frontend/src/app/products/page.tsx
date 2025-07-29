// Enhanced server-side products page with EnhancedProductCard integration
import Link from 'next/link';
import ClientProductGrid from '@/components/products/ClientProductGrid';
import { UNIFIED_ENDPOINTS } from '@/lib/api/config/unified';

interface Producer {
  id?: number;
  business_name: string;
  slug?: string;
  city?: string;
  location?: string;
  avatar_url?: string;
  rating?: number;
  verified?: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  producer_price?: number;
  discount_price?: number;
  main_image?: string;
  short_description?: string;
  description?: string;
  stock: number;
  producer?: Producer;
  rating?: number;
  reviews_count?: number;
  category?: {
    name: string;
  };
  unit?: string;
  is_featured?: boolean;
  is_organic?: boolean;
  
  // Enhanced fields (may not be present in current data)
  pdo_certification?: string;
  pgi_certification?: string;
  tsg_certification?: string;
  organic_certification_body?: string;
  quality_grade?: string;
  batch_number?: string;
  harvest_date?: string;
  processing_method?: string;
  production_facility?: string;
  expiry_date?: string;
  carbon_footprint?: number;
  water_usage?: number;
  pesticide_free_days?: number;
  soil_health_score?: number;
  renewable_energy_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export default async function ServerProductsPage() {
  let products: Product[] = [];
  let error = null;
  
  try {
    // Fetch directly from Laravel backend with longer timeout
    const response = await fetch(UNIFIED_ENDPOINTS.PRODUCTS.LIST() + '?per_page=100', {
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
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30,15 Q35,20 30,25 Q25,20 30,15 M20,30 Q25,35 20,40 Q15,35 20,30 M40,30 Q45,35 40,40 Q35,35 40,30'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center">
            {/* Heritage Badge */}
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-green-100 px-6 py-3 rounded-full text-sm font-bold mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
              Πιστοποιημένη Ελληνική Ποιότητα
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Αυθεντικά Ελληνικά <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
                Προϊόντα
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Ανακαλύψτε τα καλύτερα προϊόντα με πιστοποιήσεις ΠΟΠ, ΠΓΕ και βιολογικές καλλιέργειες 
              από επιλεγμένους παραγωγούς σε όλη την Ελλάδα
            </p>
            
            {/* Enhanced Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 min-w-[140px]">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{products.length}</div>
                <div className="text-green-100 text-sm">Προϊόντα</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 min-w-[140px]">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {products.filter(p => p.is_organic).length}
                </div>
                <div className="text-green-100 text-sm">Βιολογικά</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 min-w-[140px]">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {new Set(products.map(p => p.producer?.business_name).filter(Boolean)).size}
                </div>
                <div className="text-green-100 text-sm">Παραγωγοί</div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#products" className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                Δείτε τα Προϊόντα
              </a>
              <Link href="/producers" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                Γνωρίστε τους Παραγωγούς
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8" id="products">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p><strong>Σφάλμα:</strong> {error}</p>
            <p className="text-sm mt-2">Παρακαλούμε ελέγξτε ότι το Laravel backend τρέχει στο port 8000.</p>
          </div>
        )}

        {products.length > 0 ? (
          <>
            {/* Enhanced Stats with Certifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">{products.length}</div>
                <div className="text-gray-600 text-sm md:text-base">Συνολικά Προϊόντα</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-emerald-600 mb-2">
                  {products.filter(p => p.is_organic).length}
                </div>
                <div className="text-gray-600 text-sm md:text-base">Βιολογικά</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">
                  {products.filter(p => p.is_featured).length}
                </div>
                <div className="text-gray-600 text-sm md:text-base">Επιλεγμένα</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">
                  {new Set(products.map(p => p.producer?.business_name).filter(Boolean)).size}
                </div>
                <div className="text-gray-600 text-sm md:text-base">Παραγωγοί</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                  {products.filter(p => p.producer?.verified).length}
                </div>
                <div className="text-gray-600 text-sm md:text-base">Επιβεβαιωμένοι</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-teal-600 mb-2">
                  {products.filter(p => 
                    p.producer?.rating && 
                    typeof p.producer.rating === 'string' && 
                    parseFloat(p.producer.rating) > 4.0
                  ).length}
                </div>
                <div className="text-gray-600 text-sm md:text-base">Υψηλή Αξιολόγηση</div>
              </div>
            </div>

            {/* Enhanced Products Grid */}
            <ClientProductGrid products={products} />

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