import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';
  const currentDate = new Date();
  
  // Static pages with comprehensive coverage
  const staticPages = [
    // Homepage - Highest priority
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    
    // Main product pages
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    
    // Producer listings
    {
      url: `${baseUrl}/producers`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    
    // About and contact pages
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    
    // B2B Portal
    {
      url: `${baseUrl}/b2b`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/b2b/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/b2b/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    
    // Subscription pages
    {
      url: `${baseUrl}/subscription`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscription/business`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscription/producers`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    
    // Adoption system
    {
      url: `${baseUrl}/adoptions`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    
    // Producer registration
    {
      url: `${baseUrl}/become-producer`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    
    // Search functionality
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    
    // Authentication pages
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    
    // Cart and checkout
    {
      url: `${baseUrl}/cart`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ];

  // Category pages (common Greek product categories)
  const categoryPages = [
    'φρούτα', 'λαχανικά', 'κρέας', 'ψάρι', 'γαλακτοκομικά', 
    'τυριά', 'αλλαντικά', 'ελαιόλαδο', 'μέλι', 'όσπρια',
    'δημητριακά', 'κρασιά', 'τσίπουρο', 'βότανα', 'βιολογικά'
  ].map(category => ({
    url: `${baseUrl}/products?category=${encodeURIComponent(category)}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Regional producer pages
  const regionPages = [
    'Αττική', 'Θεσσαλονίκη', 'Κρήτη', 'Πελοπόννησος', 'Μακεδονία',
    'Θράκη', 'Ήπειρος', 'Θεσσαλία', 'Στερεά Ελλάδα', 'Νησιά Αιγαίου',
    'Νησιά Ιονίου'
  ].map(region => ({
    url: `${baseUrl}/producers?region=${encodeURIComponent(region)}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  try {
    // Dynamic product pages (if API is available)
    let productPages: MetadataRoute.Sitemap = [];
    let producerPages: MetadataRoute.Sitemap = [];
    
    // Try to fetch products from Laravel API directly
    const apiUrl = 'http://localhost:8000';
    
    try {
      const productsResponse = await fetch(`${apiUrl}/api/v1/products?per_page=100`, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const products = productsData.data || [];
        
        productPages = products.map((product: any) => ({
          url: `${baseUrl}/products/${product.slug || product.id}`,
          lastModified: new Date(product.updated_at || product.created_at || currentDate),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    } catch (error) {
      logger.warn('Could not fetch products for sitemap:', errorToContext(error));
    }

    try {
      const producersResponse = await fetch(`http://localhost:8000/api/v1/producers?per_page=100`, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (producersResponse.ok) {
        const producersData = await producersResponse.json();
        const producers = producersData.data || [];
        
        producerPages = producers.map((producer: any) => ({
          url: `${baseUrl}/producers/${producer.slug || producer.id}`,
          lastModified: new Date(producer.updated_at || producer.created_at || currentDate),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }));
      }
    } catch (error) {
      logger.warn('Could not fetch producers for sitemap:', errorToContext(error));
    }

    return [
      ...staticPages,
      ...categoryPages,
      ...regionPages,
      ...productPages,
      ...producerPages,
    ];
    
  } catch (error) {
    logger.error('Error generating sitemap:', toError(error), errorToContext(error));
    
    // Return static pages only if API is not available
    return [
      ...staticPages,
      ...categoryPages,
      ...regionPages,
    ];
  }
}
