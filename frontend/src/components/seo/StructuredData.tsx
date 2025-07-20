'use client';

import { useEffect } from 'react';

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    areaServed: string;
    availableLanguage: string[];
  };
  sameAs: string[];
}

export interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image: string[];
  brand: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
    seller: {
      '@type': 'Organization';
      name: string;
    };
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  category: string;
  gtin?: string;
  mpn?: string;
  sku: string;
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  potentialAction: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  description: string;
  url: string;
  telephone: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHours: string[];
  priceRange: string;
  servedCuisine?: string[];
  acceptsReservations?: boolean;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export interface FAQSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

type StructuredDataType = 
  | OrganizationSchema 
  | ProductSchema 
  | WebSiteSchema 
  | LocalBusinessSchema 
  | BreadcrumbSchema 
  | FAQSchema;

interface StructuredDataProps {
  data: StructuredDataType | StructuredDataType[];
  id?: string;
}

export default function StructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data script if it exists
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.innerHTML = JSON.stringify(data, null, 2);
    
    // Add to document head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data, id]);

  return null; // This component doesn't render anything visible
}

// Helper functions to generate common schemas
export const generateOrganizationSchema = (): OrganizationSchema => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dixis Fresh',
  url: 'https://dixis.gr',
  logo: 'https://dixis.gr/logo.png',
  description: 'Ελληνική πλατφόρμα για φρέσκα προϊόντα από τοπικούς παραγωγούς. Χονδρικές και λιανικές πωλήσεις με εγγυημένη ποιότητα.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Πανεπιστημίου 25',
    addressLocality: 'Αθήνα',
    addressRegion: 'Αττική',
    postalCode: '10679',
    addressCountry: 'GR'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+30-210-1234567',
    contactType: 'customer service',
    areaServed: 'GR',
    availableLanguage: ['Greek', 'English']
  },
  sameAs: [
    'https://www.facebook.com/dixisfresh',
    'https://www.instagram.com/dixisfresh',
    'https://www.linkedin.com/company/dixisfresh'
  ]
});

export const generateWebSiteSchema = (): WebSiteSchema => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dixis Fresh',
  url: 'https://dixis.gr',
  description: 'Ελληνική πλατφόρμα για φρέσκα προϊόντα από τοπικούς παραγωγούς',
  inLanguage: 'el-GR',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://dixis.gr/products?search={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
});

export const generateProductSchema = (product: {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  brand?: string;
  availability: boolean;
  rating?: { value: number; count: number };
  sku?: string;
  gtin?: string;
}): ProductSchema => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.images.map(img => img.startsWith('http') ? img : `https://dixis.gr${img}`),
  brand: {
    '@type': 'Brand',
    name: product.brand || 'Dixis Fresh'
  },
  offers: {
    '@type': 'Offer',
    price: product.price.toString(),
    priceCurrency: product.currency,
    availability: product.availability 
      ? 'https://schema.org/InStock' 
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'Dixis Fresh'
    }
  },
  category: product.category,
  sku: product.sku || product.id,
  ...(product.gtin && { gtin: product.gtin }),
  ...(product.rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      reviewCount: product.rating.count
    }
  })
});

export const generateBreadcrumbSchema = (breadcrumbs: Array<{
  name: string;
  url: string;
}>): BreadcrumbSchema => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url.startsWith('http') ? crumb.url : `https://dixis.gr${crumb.url}`
  }))
});

export const generateLocalBusinessSchema = (): LocalBusinessSchema => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Dixis Fresh',
  description: 'Ελληνική πλατφόρμα για φρέσκα προϊόντα από τοπικούς παραγωγούς',
  url: 'https://dixis.gr',
  telephone: '+30-210-1234567',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Πανεπιστημίου 25',
    addressLocality: 'Αθήνα',
    addressRegion: 'Αττική',
    postalCode: '10679',
    addressCountry: 'GR'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.9838,
    longitude: 23.7275
  },
  openingHours: [
    'Mo-Fr 09:00-18:00',
    'Sa 09:00-15:00'
  ],
  priceRange: '€€',
  servedCuisine: ['Greek', 'Mediterranean', 'Organic'],
  acceptsReservations: false
});

export const generateFAQSchema = (faqs: Array<{
  question: string;
  answer: string;
}>): FAQSchema => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});