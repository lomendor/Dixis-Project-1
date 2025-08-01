// Demo API Wrapper
// Provides realistic demo data when demo mode is enabled

import { 
  isDemoMode, 
  getDemoProducts, 
  getDemoProducers, 
  getDemoOrders,
  demoAnalytics,
  type DemoProduct,
  type DemoProducer,
  type DemoOrder
} from './demoData';
import { logger } from '@/lib/logging/productionLogger';

// Enhanced fetch wrapper that serves demo data in demo mode
export async function demoFetch(url: string, options?: RequestInit): Promise<Response> {
  if (!isDemoMode()) {
    // Normal API call when not in demo mode
    return fetch(url, options);
  }

  logger.info('Demo mode: Intercepting API call', { url });

  // Parse URL to determine what demo data to serve
  const urlObj = new URL(url, window.location.origin);
  const path = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

  let demoData: any = null;
  let status = 200;

  try {
    // Route demo responses based on API endpoint
    if (path.includes('/api/products')) {
      const b2bAvailable = searchParams.get('b2b_available') === '1';
      const perPage = parseInt(searchParams.get('per_page') || '20');
      
      let products = getDemoProducts();
      
      // Filter for B2B if requested
      if (b2bAvailable) {
        products = products.filter(p => p.wholesale_price > 0);
      }
      
      // Apply pagination
      const limitedProducts = products.slice(0, perPage);
      
      demoData = {
        data: limitedProducts.map(transformProductForAPI),
        meta: {
          current_page: 1,
          last_page: Math.ceil(products.length / perPage),
          per_page: perPage,
          total: products.length
        }
      };
    }
    
    else if (path.includes('/api/producers')) {
      const perPage = parseInt(searchParams.get('per_page') || '20');
      const producers = getDemoProducers().slice(0, perPage);
      
      demoData = {
        data: producers.map(transformProducerForAPI),
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: producers.length
        }
      };
    }
    
    else if (path.includes('/api/orders')) {
      const orders = getDemoOrders();
      demoData = {
        data: orders.map(transformOrderForAPI),
        meta: {
          total: orders.length
        }
      };
    }
    
    else if (path.includes('/api/business/dashboard/stats')) {
      demoData = {
        total_orders: 256,
        total_revenue: 89420.50,
        pending_orders: 12,
        active_products: 6,
        monthly_growth: 18.5,
        top_products: demoAnalytics.topProducts,
        recent_orders: getDemoOrders(5)
      };
    }
    
    else if (path.includes('/api/analytics')) {
      demoData = demoAnalytics;
    }
    
    else if (path.includes('/api/auth/me')) {
      demoData = {
        id: 1,
        name: 'Demo Business User',
        email: 'demo@dixis.io',
        business_name: 'Demo Επιχείρηση Α.Ε.',
        role: 'business',
        verified: true,
        credit_limit: 10000,
        used_credit: 2350.75
      };
    }
    
    else if (path.includes('/api/categories')) {
      demoData = {
        data: [
          { id: 1, name: 'Ελαιόλαδο', slug: 'olive-oil' },
          { id: 2, name: 'Γαλακτοκομικά', slug: 'dairy' },
          { id: 3, name: 'Μέλι & Προϊόντα Κυψέλης', slug: 'honey' },
          { id: 4, name: 'Λαχανικά', slug: 'vegetables' },
          { id: 5, name: 'Κρασιά', slug: 'wines' },
          { id: 6, name: 'Παραδοσιακά Προϊόντα', slug: 'traditional' }
        ]
      };
    }
    
    else if (path.includes('/api/health')) {
      demoData = {
        status: 'ok',
        message: 'Demo API is healthy',
        timestamp: new Date().toISOString(),
        demo_mode: true
      };
    }
    
    else {
      // Default fallback for unknown endpoints
      demoData = {
        message: 'Demo mode: endpoint not implemented',
        available_endpoints: [
          '/api/products',
          '/api/producers', 
          '/api/orders',
          '/api/business/dashboard/stats',
          '/api/analytics',
          '/api/auth/me',
          '/api/categories',
          '/api/health'
        ]
      };
      status = 404;
    }
    
  } catch (error) {
    logger.error('Demo mode: Error generating demo response', { url, error });
    demoData = {
      error: 'Demo mode error',
      message: 'Failed to generate demo data'
    };
    status = 500;
  }

  // Create mock Response object
  const response = new Response(JSON.stringify(demoData), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Mode': 'true',
      'X-Demo-Timestamp': new Date().toISOString()
    }
  });

  logger.debug('Demo mode: Serving demo response', { 
    url, 
    status, 
    dataSize: JSON.stringify(demoData).length 
  });

  return response;
}

// Transform demo product to match API format
function transformProductForAPI(product: DemoProduct) {
  return {
    id: parseInt(product.id),
    name: product.name,
    description: product.description,
    short_description: product.description.substring(0, 100) + '...',
    price: product.price,
    wholesale_price: product.wholesale_price,
    main_image: product.main_image,
    stock_quantity: product.stock,
    stock: product.stock,
    min_order_quantity: product.min_order_quantity,
    bulk_discount_threshold: product.bulk_discount_threshold,
    bulk_discount_percentage: product.bulk_discount_percentage,
    is_active: true,
    is_featured: Math.random() > 0.7, // Random featured status
    slug: product.name.toLowerCase()
      .replace(/[ά-ώ]/g, char => {
        const map: { [key: string]: string } = {
          'ά': 'a', 'έ': 'e', 'ή': 'i', 'ί': 'i', 'ό': 'o', 'ύ': 'y', 'ώ': 'o'
        };
        return map[char] || char;
      })
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, ''),
    producer: {
      id: parseInt(product.producer.business_name.length.toString()),
      business_name: product.producer.business_name,
      city: product.producer.city
    },
    category: {
      id: product.category.name.length,
      name: product.category.name
    },
    origin: product.origin,
    certifications: product.certifications,
    harvest_date: product.harvest_date,
    shelf_life: product.shelf_life
  };
}

// Transform demo producer to match API format
function transformProducerForAPI(producer: DemoProducer) {
  return {
    id: parseInt(producer.id),
    business_name: producer.business_name,
    contact_person: producer.contact_person,
    email: producer.email,
    phone: producer.phone,
    city: producer.city,
    region: producer.region,
    specialty: producer.specialty,
    description: producer.description,
    certifications: producer.certifications,
    established_year: producer.established_year,
    total_products: producer.total_products,
    rating: producer.rating,
    image: producer.image,
    verified: true,
    b2b_available: true
  };
}

// Transform demo order to match API format
function transformOrderForAPI(order: DemoOrder) {
  return {
    id: parseInt(order.id),
    order_number: order.order_number,
    customer_name: order.customer_name,
    total_amount: order.total_amount,
    status: order.status,
    order_date: order.order_date,
    delivery_date: order.delivery_date,
    products: order.products,
    created_at: order.order_date,
    updated_at: order.delivery_date || order.order_date
  };
}

// Custom hook for demo-aware API calls
export function useDemoApi() {
  const fetchWithDemo = async (url: string, options?: RequestInit) => {
    return demoFetch(url, options);
  };

  const isDemo = isDemoMode();

  return {
    fetch: fetchWithDemo,
    isDemo,
    demoIndicator: isDemo ? '🎭' : null
  };
}