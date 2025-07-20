import { Metadata } from 'next';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  price?: number;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  brand?: string;
  category?: string;
}

const defaultConfig = {
  siteName: 'Dixis - Αυθεντικά Ελληνικά Προϊόντα',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr',
  defaultTitle: 'Dixis - Αυθεντικά Ελληνικά Προϊόντα',
  defaultDescription: 'Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από τον παραγωγό. Βιολογικά τρόφιμα, παραδοσιακές γεύσεις και τοπικές λιχουδιές με την εγγύηση της ποιότητας.',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@dixis_gr',
  locale: 'el_GR',
  alternateLocales: ['en_US'],
};

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title,
    description = defaultConfig.defaultDescription,
    keywords = [],
    image = defaultConfig.defaultImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    price,
    currency = 'EUR',
    availability,
    brand,
    category,
  } = config;

  const fullTitle = title 
    ? `${title} | ${defaultConfig.siteName}`
    : defaultConfig.defaultTitle;

  const fullUrl = url 
    ? `${defaultConfig.siteUrl}${url}`
    : defaultConfig.siteUrl;

  const fullImage = image.startsWith('http') 
    ? image 
    : `${defaultConfig.siteUrl}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    
    // Basic meta tags
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
    
    // Open Graph
    openGraph: {
      type: type === 'product' ? 'website' : type,
      locale: defaultConfig.locale,
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || defaultConfig.defaultTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      site: defaultConfig.twitterHandle,
      creator: defaultConfig.twitterHandle,
      title: fullTitle,
      description,
      images: [fullImage],
    },
    
    // Additional meta tags
    alternates: {
      canonical: fullUrl,
      languages: {
        'el-GR': fullUrl,
        'en-US': `${fullUrl}?lang=en`,
      },
    },
    
    // Verification tags (add your verification codes)
    verification: {
      google: process.env.GOOGLE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
  };

  // Add product-specific metadata
  if (type === 'product' && price) {
    metadata.other = {
      'product:price:amount': price.toString(),
      'product:price:currency': currency,
      ...(availability && { 'product:availability': availability }),
      ...(brand && { 'product:brand': brand }),
      ...(category && { 'product:category': category }),
    };
  }

  return metadata;
}

// Predefined SEO configs for common pages
export const seoConfigs = {
  home: (): Metadata => generateMetadata({
    title: 'Αρχική',
    description: 'Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από τον παραγωγό. Βιολογικά τρόφιμα, παραδοσιακές γεύσεις και τοπικές λιχουδιές.',
    keywords: ['ελληνικά προϊόντα', 'βιολογικά τρόφιμα', 'παραδοσιακές γεύσεις', 'τοπικοί παραγωγοί'],
    url: '/',
  }),

  products: (): Metadata => generateMetadata({
    title: 'Προϊόντα',
    description: 'Περιηγηθείτε στη συλλογή μας από αυθεντικά ελληνικά προϊόντα. Βρείτε βιολογικά τρόφιμα, παραδοσιακές γεύσεις και τοπικές λιχουδιές.',
    keywords: ['ελληνικά προϊόντα', 'βιολογικά τρόφιμα', 'ελαιόλαδο', 'μέλι', 'τυρί', 'κρασί'],
    url: '/products',
  }),

  producers: (): Metadata => generateMetadata({
    title: 'Παραγωγοί',
    description: 'Γνωρίστε τους Έλληνες παραγωγούς που δημιουργούν αυθεντικά προϊόντα με αγάπη και παράδοση.',
    keywords: ['έλληνες παραγωγοί', 'τοπικοί παραγωγοί', 'βιολογική καλλιέργεια', 'παραδοσιακές μέθοδοι'],
    url: '/producers',
  }),

  search: (query?: string): Metadata => generateMetadata({
    title: query ? `Αναζήτηση: ${query}` : 'Αναζήτηση',
    description: query 
      ? `Αποτελέσματα αναζήτησης για "${query}". Βρείτε προϊόντα και παραγωγούς που ταιριάζουν στην αναζήτησή σας.`
      : 'Αναζητήστε ελληνικά προϊόντα και παραγωγούς. Χρησιμοποιήστε φίλτρα για να βρείτε ακριβώς αυτό που ψάχνετε.',
    keywords: ['αναζήτηση προϊόντων', 'εύρεση παραγωγών', 'φίλτρα αναζήτησης'],
    url: query ? `/search?q=${encodeURIComponent(query)}` : '/search',
  }),

  product: (product: { name: string; description?: string; price?: number; image?: string; category?: string; producer?: string }): Metadata => generateMetadata({
    title: product.name,
    description: product.description || `Αγοράστε ${product.name} απευθείας από τον παραγωγό. Αυθεντικό ελληνικό προϊόν με εγγύηση ποιότητας.`,
    keywords: [product.name, 'ελληνικό προϊόν', product.category, product.producer].filter((k): k is string => Boolean(k)),
    image: product.image,
    type: 'product',
    price: product.price,
    availability: 'in_stock',
    category: product.category,
    brand: product.producer,
    url: `/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`,
  }),

  producer: (producer: { name: string; description?: string; location?: string; image?: string }): Metadata => generateMetadata({
    title: producer.name,
    description: producer.description || `Γνωρίστε τον παραγωγό ${producer.name}${producer.location ? ` από ${producer.location}` : ''}. Αυθεντικά ελληνικά προϊόντα με παράδοση και ποιότητα.`,
    keywords: [producer.name, 'έλληνας παραγωγός', producer.location, 'βιολογικά προϊόντα'].filter((k): k is string => Boolean(k)),
    image: producer.image,
    type: 'article',
    author: producer.name,
    url: `/producers/${producer.name.toLowerCase().replace(/\s+/g, '-')}`,
  }),
};

// Structured data generators
export function generateProductStructuredData(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product?.producer?.business_name || 'Dixis',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product?.producer?.business_name || 'Dixis',
      },
    },
    aggregateRating: product.rating && {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
    },
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dixis',
    url: defaultConfig.siteUrl,
    logo: `${defaultConfig.siteUrl}/logo.png`,
    description: defaultConfig.defaultDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+30-210-1234567',
      contactType: 'customer service',
      availableLanguage: ['Greek', 'English'],
    },
    sameAs: [
      'https://www.facebook.com/dixis.gr',
      'https://www.instagram.com/dixis.gr',
      'https://twitter.com/dixis_gr',
    ],
  };
}
