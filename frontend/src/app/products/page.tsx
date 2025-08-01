// Revolutionary AI-powered products page with advanced filtering and smart search
import Link from 'next/link';
import RevolutionaryProductsPage from '@/components/products/RevolutionaryProductsPage';
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

  // Handle errors and loading states
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Σφάλμα Φόρτωσης</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Παρακαλούμε ελέγξτε ότι το Laravel backend τρέχει στο port 8000.</p>
        </div>
      </div>
    );
  }

  return (
    <RevolutionaryProductsPage 
      products={products}
      className="revolutionary-products-page"
    />
  );
}