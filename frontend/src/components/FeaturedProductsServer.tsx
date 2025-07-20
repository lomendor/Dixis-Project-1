interface Product {
  id: number;
  name: string;
  price: number;
  main_image?: string;
  producer?: {
    business_name: string;
  };
  stock_quantity?: number;
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${apiUrl}/api/v1/products?is_featured=1&per_page=3`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes instead of no-store
    });
    
    if (!response.ok) {
      console.error('Failed to fetch products:', response.status);
      return getStaticProducts();
    }
    
    const data = await response.json();
    return data.data || getStaticProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
    return getStaticProducts();
  }
}

function getStaticProducts(): Product[] {
  return [
    {
      id: 1,
      name: "Πορτοκάλια Άργους",
      price: 2.80,
      main_image: "",
      producer: { business_name: "Οικογένεια Παπαδόπουλου" },
      stock_quantity: 100
    },
    {
      id: 2,
      name: "Ελαιόλαδο Κρήτης",
      price: 12.50,
      main_image: "",
      producer: { business_name: "Ελαιώνες Μεσσαράς" },
      stock_quantity: 100
    },
    {
      id: 3,
      name: "Μέλι Θυμαρίσιο",
      price: 9.20,
      main_image: "",
      producer: { business_name: "Μελισσοκομία Κρήτης" },
      stock_quantity: 100
    }
  ];
}

function getProductEmoji(name: string): string {
  if (name.toLowerCase().includes('πορτοκάλ')) return '🍊';
  if (name.toLowerCase().includes('ελαιόλαδο') || name.toLowerCase().includes('λάδι')) return '🫒';
  if (name.toLowerCase().includes('μέλι')) return '🍯';
  if (name.toLowerCase().includes('ντομάτ')) return '🍅';
  if (name.toLowerCase().includes('φέτα') || name.toLowerCase().includes('τυρ')) return '🧀';
  if (name.toLowerCase().includes('ελι')) return '🫒';
  return '🥗';
}

export default async function FeaturedProductsServer() {
  const products = await getFeaturedProducts();
  const displayProducts = products.slice(0, 3);

  return (
    <div className="relative">
      {/* CLEAN PRODUCT GRID */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-8 pb-4 px-4 md:px-0" style={{ scrollSnapType: 'x mandatory' }}>
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-80 md:w-96 bg-white rounded-3xl border-2 border-gray-200 group hover:border-black hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* CLEAN PRODUCT IMAGE */}
              <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                {/* Product Visual */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {product.main_image ? (
                    <img
                      src={product.main_image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-8xl transform group-hover:scale-110 transition-transform duration-500">
                      {getProductEmoji(product.name)}
                    </div>
                  )}
                </div>

                {/* CLEAN BADGES */}
                <div className="absolute top-4 left-4">
                  <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold">
                    PREMIUM
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <div className={`w-4 h-4 rounded-full ${product.stock_quantity && product.stock_quantity > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                </div>
              </div>
              
              {/* CLEAN CONTENT */}
              <div className="p-8">
                {/* Producer Info */}
                {product.producer && (
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black font-black text-sm">
                        {product.producer.business_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black">
                        {product.producer.business_name}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">ΠΙΣΤΟΠΟΙΗΜΕΝΟΣ ΠΑΡΑΓΩΓΟΣ</div>
                    </div>
                  </div>
                )}

                {/* Product Name */}
                <h3 className="text-2xl font-black text-black mb-6 leading-tight">
                  {product.name}
                </h3>

                {/* Price Section */}
                <div className="mb-8">
                  <div className="text-3xl font-black text-black">
                    €{Number(product.price).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">/κιλό</div>
                </div>

                {/* CLEAN ACTIONS */}
                <div className="space-y-4">
                  <button className="w-full bg-black text-white py-4 text-lg rounded-full hover:bg-gray-900 transition-all duration-300 font-bold">
                    ΠΡΟΣΘΗΚΗ ΣΤΟ ΚΑΛΑΘΙ
                  </button>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-gray-100 text-black py-3 px-4 rounded-full hover:bg-gray-200 transition-all duration-200 text-sm font-bold">
                      ♡ ΑΓΑΠΗΜΕΝΑ
                    </button>
                    <button className="flex-1 bg-gray-100 text-black py-3 px-4 rounded-full hover:bg-gray-200 transition-all duration-200 text-sm font-bold">
                      👁 ΛΕΠΤΟΜΕΡΕΙΕΣ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicators για Mobile */}
      <div className="flex justify-center mt-6 md:hidden">
        <div className="flex space-x-2">
          {displayProducts.map((_, index) => (
            <div key={index} className="w-2 h-2 bg-primary-300 rounded-full"></div>
          ))}
        </div>
      </div>

    </div>
  );
}