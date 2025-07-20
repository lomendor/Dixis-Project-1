// Simple test page to verify data flow
import { buildApiUrl } from '@/lib/utils/apiUrls';

export default async function SimpleProductsPage() {
  let products = [];
  
  try {
    // Try to fetch directly from Laravel backend
    const response = await fetch(buildApiUrl('products?per_page=10'), {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      products = data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">Simple Products Test</h1>
      
      <div className="mb-4">
        <p>Products found: {products.length}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">{product.producer?.business_name}</p>
            <p className="text-green-600 font-bold">€{product.price}</p>
            <p className="text-sm text-gray-500 mt-2">{product.short_description}</p>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found. Check backend connection.</p>
        </div>
      )}
    </div>
  );
}