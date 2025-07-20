import Head from 'next/head';
import { usePathname } from 'next/navigation';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  siteName?: string;
  locale?: string;
  alternateLocales?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
  tags?: string[];
  price?: {
    amount: number;
    currency: string;
  };
  availability?: 'in stock' | 'out of stock' | 'preorder';
  rating?: {
    value: number;
    scale: number;
    count: number;
  };
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  hreflang?: Array<{
    lang: string;
    url: string;
  }>;
}

interface SEOHeadProps extends SEOProps {
  children?: React.ReactNode;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  siteName = 'Dixis Fresh',
  locale = 'el_GR',
  alternateLocales = ['en_US'],
  publishedTime,
  modifiedTime,
  author,
  category,
  tags = [],
  price,
  availability,
  rating,
  noindex = false,
  nofollow = false,
  canonical,
  hreflang = [],
  children
}: SEOHeadProps) {
  const pathname = usePathname();
  
  // Default values
  const defaultTitle = 'Dixis Fresh - Φρέσκα Προϊόντα από Ελληνικούς Παραγωγούς';
  const defaultDescription = 'Ανακαλύψτε φρέσκα, ποιοτικά προϊόντα από τοπικούς Έλληνες παραγωγούς. Χονδρικές και λιανικές πωλήσεις με εγγυημένη ποιότητα και γρήγορη παράδοση.';
  const defaultImage = 'https://dixis.gr/images/og-image.jpg';
  const baseUrl = 'https://dixis.gr';
  
  // Build final values
  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalUrl = url || `${baseUrl}${pathname}`;
  const finalImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : defaultImage;
  const finalCanonical = canonical || finalUrl;
  
  // Build keywords string
  const allKeywords = [
    ...keywords,
    'dixis',
    'fresh',
    'φρέσκα προϊόντα',
    'ελληνικοί παραγωγοί',
    'τοπικά προϊόντα',
    'χονδρική',
    'λιανική',
    'βιολογικά',
    'organic',
    'marketplace',
    'Ελλάδα'
  ];
  
  // Build robots content
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="robots" content={robotsContent.join(', ')} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Greek" />
      <meta name="geo.region" content="GR" />
      <meta name="geo.placename" content="Greece" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />
      
      {/* Hreflang Tags */}
      {hreflang.map((lang) => (
        <link
          key={lang.lang}
          rel="alternate"
          hrefLang={lang.lang}
          href={lang.url}
        />
      ))}
      <link rel="alternate" hrefLang="el" href={finalUrl} />
      <link rel="alternate" hrefLang="x-default" href={finalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:locale" content={locale} />
      {alternateLocales.map((altLocale) => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}
      
      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {category && <meta property="article:section" content={category} />}
          {tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Product-specific Open Graph tags */}
      {type === 'product' && (
        <>
          {price && (
            <>
              <meta property="product:price:amount" content={price.amount.toString()} />
              <meta property="product:price:currency" content={price.currency} />
            </>
          )}
          {availability && <meta property="product:availability" content={availability} />}
          {rating && (
            <>
              <meta property="product:rating:value" content={rating.value.toString()} />
              <meta property="product:rating:scale" content={rating.scale.toString()} />
              <meta property="product:rating:count" content={rating.count.toString()} />
            </>
          )}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@dixisfresh" />
      <meta name="twitter:creator" content="@dixisfresh" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={finalTitle} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#10b981" />
      <meta name="msapplication-TileColor" content="#10b981" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* Business Information */}
      <meta name="author" content="Dixis Fresh" />
      <meta name="copyright" content="© 2024 Dixis Fresh. Όλα τα δικαιώματα διατηρούνται." />
      <meta name="publisher" content="Dixis Fresh" />
      <meta name="contact" content="info@dixis.gr" />
      <meta name="reply-to" content="info@dixis.gr" />
      
      {/* Additional children */}
      {children}
    </Head>
  );
}

// Helper function to generate SEO props for different page types
export const generatePageSEO = {
  homepage: (): SEOProps => ({
    title: 'Αρχική Σελίδα',
    description: 'Ανακαλύψτε φρέσκα, ποιοτικά προϊόντα από τοπικούς Έλληνες παραγωγούς. Χονδρικές και λιανικές πωλήσεις με εγγυημένη ποιότητα.',
    keywords: ['φρέσκα προϊόντα', 'ελληνικοί παραγωγοί', 'τοπικά προϊόντα', 'marketplace', 'Ελλάδα'],
    type: 'website'
  }),

  products: (category?: string): SEOProps => ({
    title: category ? `${category} - Προϊόντα` : 'Προϊόντα',
    description: `Περιηγηθείτε στη μεγάλη συλλογή ${category ? `προϊόντων ${category}` : 'προϊόντων'} από Έλληνες παραγωγούς. Φρέσκα, ποιοτικά και προσιτά.`,
    keywords: ['προϊόντα', 'φρέσκα', 'ελληνικά', category].filter(Boolean),
    type: 'website'
  }),

  product: (product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    category: string;
    availability: boolean;
    rating?: { value: number; count: number };
  }): SEOProps => ({
    title: product.name,
    description: product.description,
    keywords: [product.name, product.category, 'φρέσκο', 'ελληνικό', 'προϊόν'],
    image: product.images[0],
    type: 'product',
    price: {
      amount: product.price,
      currency: product.currency
    },
    availability: product.availability ? 'in stock' : 'out of stock',
    ...(product.rating && {
      rating: {
        value: product.rating.value,
        scale: 5,
        count: product.rating.count
      }
    })
  }),

  producer: (producer: {
    name: string;
    description: string;
    location: string;
    image?: string;
  }): SEOProps => ({
    title: `${producer.name} - Παραγωγός`,
    description: `Γνωρίστε τον παραγωγό ${producer.name} από ${producer.location}. ${producer.description}`,
    keywords: [producer.name, producer.location, 'παραγωγός', 'ελληνικός', 'τοπικός'],
    image: producer.image,
    type: 'profile'
  }),

  b2b: (): SEOProps => ({
    title: 'B2B Portal - Χονδρικές Πωλήσεις',
    description: 'Εξειδικευμένες λύσεις για επιχειρήσεις. Χονδρικές τιμές, μαζικές παραγγελίες και προσωπικό service για το B2B.',
    keywords: ['B2B', 'χονδρική', 'επιχειρήσεις', 'μαζικές παραγγελίες', 'wholesale'],
    type: 'website'
  }),

  about: (): SEOProps => ({
    title: 'Σχετικά με εμάς',
    description: 'Μάθετε περισσότερα για τη Dixis Fresh και την αποστολή μας να συνδέσουμε τους Έλληνες παραγωγούς με τους καταναλωτές.',
    keywords: ['σχετικά', 'εταιρεία', 'αποστολή', 'όραμα', 'ελληνικοί παραγωγοί'],
    type: 'website'
  }),

  contact: (): SEOProps => ({
    title: 'Επικοινωνία',
    description: 'Επικοινωνήστε μαζί μας για οποιαδήποτε ερώτηση ή πληροφορία. Στοιχεία επικοινωνίας και φόρμα επικοινωνίας.',
    keywords: ['επικοινωνία', 'στοιχεία', 'τηλέφωνο', 'email', 'διεύθυνση'],
    type: 'website'
  })
};