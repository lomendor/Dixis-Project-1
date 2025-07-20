'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  category: string;
  b2b_available: boolean;
}

// Get current season
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'Άνοιξη';
  if (month >= 6 && month <= 8) return 'Καλοκαίρι';
  if (month >= 9 && month <= 11) return 'Φθινόπωρο';
  return 'Χειμώνας';
};

// Get seasonal emoji
const getSeasonalEmoji = (season: string) => {
  switch (season) {
    case 'Άνοιξη': return '🌸';
    case 'Καλοκαίρι': return '☀️';
    case 'Φθινόπωρο': return '🍂';
    default: return '❄️';
  }
};

export default function SeasonalHighlights() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const currentSeason = getCurrentSeason();
  const seasonEmoji = getSeasonalEmoji(currentSeason);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('🔄 Fetching products...');
        const response = await fetch('/api/products?per_page=6');
        console.log('📡 Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Products data received:', data);

          // Ensure we have the right data structure
          if (data && Array.isArray(data.data)) {
            console.log('✅ Setting products:', data.data.length, 'items');
            setProducts(data.data);
          } else {
            console.warn('⚠️ Unexpected data structure, using fallback');
            setProducts([
              { id: 1, name: 'Πορτοκάλια Άργους', price: 2.80, category: 'Φρούτα', b2b_available: true },
              { id: 2, name: 'Ελαιόλαδο Κρήτης', price: 12.50, category: 'Λάδια', b2b_available: true },
              { id: 3, name: 'Φέτα Τρικάλων', price: 8.90, category: 'Γαλακτοκομικά', b2b_available: true },
              { id: 4, name: 'Μέλι Θυμαρίσιο', price: 9.20, category: 'Γλυκά', b2b_available: true },
              { id: 5, name: 'Ντομάτες Σαντορίνης', price: 4.50, category: 'Λαχανικά', b2b_available: true },
              { id: 6, name: 'Καρύδια Πηλίου', price: 14.90, category: 'Ξηροί Καρποί', b2b_available: true }
            ]);
          }
        } else {
          console.error('❌ Response not ok:', response.status);
          setProducts([
            { id: 1, name: 'Πορτοκάλια Άργους', price: 2.80, category: 'Φρούτα', b2b_available: true },
            { id: 2, name: 'Ελαιόλαδο Κρήτης', price: 12.50, category: 'Λάδια', b2b_available: true },
            { id: 3, name: 'Φέτα Τρικάλων', price: 8.90, category: 'Γαλακτοκομικά', b2b_available: true },
            { id: 4, name: 'Μέλι Θυμαρίσιο', price: 9.20, category: 'Γλυκά', b2b_available: true },
            { id: 5, name: 'Ντομάτες Σαντορίνης', price: 4.50, category: 'Λαχανικά', b2b_available: true },
            { id: 6, name: 'Καρύδια Πηλίου', price: 14.90, category: 'Ξηροί Καρποί', b2b_available: true }
          ]);
        }
      } catch (error) {
        console.error('💥 Error fetching products:', error);
        setProducts([
          { id: 1, name: 'Πορτοκάλια Άργους', price: 2.80, category: 'Φρούτα', b2b_available: true },
          { id: 2, name: 'Ελαιόλαδο Κρήτης', price: 12.50, category: 'Λάδια', b2b_available: true },
          { id: 3, name: 'Φέτα Τρικάλων', price: 8.90, category: 'Γαλακτοκομικά', b2b_available: true },
          { id: 4, name: 'Μέλι Θυμαρίσιο', price: 9.20, category: 'Γλυκά', b2b_available: true },
          { id: 5, name: 'Ντομάτες Σαντορίνης', price: 4.50, category: 'Λαχανικά', b2b_available: true },
          { id: 6, name: 'Καρύδια Πηλίου', price: 14.90, category: 'Ξηροί Καρποί', b2b_available: true }
        ]);
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Product emoji mapping
  const getProductEmoji = (name: string) => {
    if (name.includes('Πορτοκάλι')) return '🍊';
    if (name.includes('Ελαιόλαδο')) return '🫒';
    if (name.includes('Φέτα')) return '🧀';
    if (name.includes('Μέλι')) return '🍯';
    if (name.includes('Ντομάτα')) return '🍅';
    if (name.includes('Καρύδια')) return '🥜';
    return '🥗';
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-full h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-orange-100 rounded-full px-6 py-3 mb-6">
            <span className="text-orange-600 text-lg">{seasonEmoji}</span>
            <span className="text-orange-700 font-semibold">Εποχιακά προϊόντα</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Τα καλύτερα του {currentSeason.toLowerCase()}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ανακαλύψτε τα φρεσκότερα εποχιακά προϊόντα από τους Έλληνες παραγωγούς μας
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
            >
              {/* Product Image/Icon */}
              <div className="h-48 bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center group-hover:from-green-200 group-hover:to-yellow-200 transition-colors duration-300">
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {getProductEmoji(product.name)}
                  </div>
                  <div className="text-xs text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                    Φρέσκο {currentSeason.toLowerCase()}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    {typeof product.category === 'string' ? product.category : 'Κατηγορία'}
                  </span>
                  {product.b2b_available && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      B2B ✓
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 mb-4 text-lg group-hover:text-orange-600 transition-colors duration-300">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">/ κιλό</span>
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    📦 Διαθέσιμο
                  </div>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
                >
                  <span>🛒</span>
                  <span>Προσθήκη στο καλάθι</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-4xl mb-6">{seasonEmoji}📧</div>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Εγγραφείτε για εποχιακές ενημερώσεις
            </h3>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Μάθετε πρώτοι για τα νέα εποχιακά προϊόντα, τις καλύτερες προσφορές και τις συνταγές της εποχής
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products"
                className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
              >
                <span>🔍</span>
                <span>Δείτε όλα τα προϊόντα</span>
              </Link>
              
              <Link 
                href="/subscription/premium"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
              >
                <span>⭐</span>
                <span>Εγγραφή συνδρομής</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}