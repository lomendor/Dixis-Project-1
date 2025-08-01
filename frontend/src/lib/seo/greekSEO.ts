/**
 * Greek SEO optimization utilities
 */

import { Metadata } from 'next';

interface GreekSEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  price?: number;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
}

/**
 * Generate Greek-optimized metadata
 */
export function generateGreekMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  price,
  availability,
  brand,
  category
}: GreekSEOProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dixis.io';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  
  // Default Greek keywords for marketplace
  const defaultKeywords = [
    'ελληνικά προϊόντα',
    'τοπικά προϊόντα',
    'παραγωγοί',
    'marketplace',
    'αγορά',
    'φρέσκα προϊόντα',
    'βιολογικά',
    'παραδοσιακά'
  ];
  
  const allKeywords = [...defaultKeywords, ...keywords].join(', ');
  
  const metadata: Metadata = {
    title: `${title} | Dixis - Ελληνικά Προϊόντα`,
    description,
    keywords: allKeywords,
    authors: [{ name: 'Dixis Fresh' }],
    creator: 'Dixis Fresh',
    publisher: 'Dixis Fresh',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Dixis Fresh',
      locale: 'el_GR',
      alternateLocale: 'en_US',
      type: type as any,
      images: image ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
      creator: '@dixisfresh',
      site: '@dixisfresh',
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        'el': fullUrl,
        'en': `${baseUrl}/en${url || ''}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
  
  // Add product-specific metadata
  if (type === 'product' && price) {
    metadata.other = {
      'product:price:amount': price.toString(),
      'product:price:currency': 'EUR',
      'product:availability': availability || 'in stock',
      'product:brand': brand || 'Dixis Fresh',
      'product:category': category || 'Ελληνικά Προϊόντα',
    };
  }
  
  return metadata;
}

/**
 * Generate structured data for Greek content
 */
export function generateGreekStructuredData(type: string, data: any): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
    inLanguage: 'el-GR',
  };
  
  return JSON.stringify(structuredData);
}

/**
 * Generate product structured data
 */
export function generateProductStructuredData(product: any): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.main_image,
    brand: {
      '@type': 'Brand',
      name: product?.producer?.business_name || 'Dixis Fresh',
    },
    offers: {
      '@type': 'Offer',
      url: `https://dixis.io/products/${product.slug}`,
      priceCurrency: 'EUR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product?.producer?.business_name || 'Dixis Fresh',
      },
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count || 1,
    } : undefined,
  };
}

/**
 * Generate local business structured data
 */
export function generateLocalBusinessStructuredData(producer: any): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: producer.business_name,
    description: producer.description,
    image: producer.logo,
    address: {
      '@type': 'PostalAddress',
      addressLocality: producer.city,
      addressRegion: producer.region,
      addressCountry: 'GR',
    },
    geo: producer.latitude && producer.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: producer.latitude,
      longitude: producer.longitude,
    } : undefined,
    url: `https://dixis.io/producers/${producer.slug}`,
    telephone: producer.phone,
    priceRange: '€€',
    servesCuisine: 'Greek',
    aggregateRating: producer.rating ? {
      '@type': 'AggregateRating',
      ratingValue: producer.rating,
      reviewCount: producer.review_count || 1,
    } : undefined,
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://dixis.io${item.url}`,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Greek-specific URL slug generation
 */
export function generateGreekSlug(text: string): string {
  const greekToLatin: { [key: string]: string } = {
    'α': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z',
    'η': 'i', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm',
    'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's',
    'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
    'ά': 'a', 'έ': 'e', 'ή': 'i', 'ί': 'i', 'ό': 'o', 'ύ': 'y', 'ώ': 'o',
    'Α': 'A', 'Β': 'V', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z',
    'Η': 'I', 'Θ': 'TH', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M',
    'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S',
    'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'CH', 'Ψ': 'PS', 'Ω': 'O',
    'Ά': 'A', 'Έ': 'E', 'Ή': 'I', 'Ί': 'I', 'Ό': 'O', 'Ύ': 'Y', 'Ώ': 'O'
  };
  
  let slug = text;
  
  // Replace Greek characters
  Object.entries(greekToLatin).forEach(([greek, latin]) => {
    slug = slug.replace(new RegExp(greek, 'g'), latin);
  });
  
  // Convert to lowercase and replace spaces/special chars
  slug = slug
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return slug;
}