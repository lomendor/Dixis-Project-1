import Head from 'next/head';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  price?: {
    amount: string;
    currency: string;
  };
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
}

const DEFAULT_META = {
  title: 'Dixis - Αυθεντικά Ελληνικά Προϊόντα',
  description: 'Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από τον παραγωγό. Ελαιόλαδο, μέλι, τυριά, κρασιά και πολλά άλλα παραδοσιακά προϊόντα.',
  keywords: 'ελληνικά προϊόντα, παραδοσιακά, ελαιόλαδο, μέλι, τυριά, κρασιά, παραγωγός, αυθεντικά',
  image: '/og-image.jpg',
  siteName: 'Dixis',
  locale: 'el_GR',
  type: 'website' as const,
};

export default function MetaTags({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = DEFAULT_META.siteName,
  locale = DEFAULT_META.locale,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  price,
  availability,
  brand,
  category,
}: MetaTagsProps) {
  const metaTitle = title ? `${title} | ${DEFAULT_META.siteName}` : DEFAULT_META.title;
  const metaDescription = description || DEFAULT_META.description;
  const metaKeywords = keywords || DEFAULT_META.keywords;
  const metaImage = image || DEFAULT_META.image;
  const metaUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={author || 'Dixis'} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Greek" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Product specific meta tags */}
      {type === 'product' && (
        <>
          {price && (
            <>
              <meta property="product:price:amount" content={price.amount} />
              <meta property="product:price:currency" content={price.currency} />
            </>
          )}
          {availability && <meta property="product:availability" content={availability} />}
          {brand && <meta property="product:brand" content={brand} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Structured Data for Products */}
      {type === 'product' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": title,
              "description": metaDescription,
              "image": metaImage,
              "brand": {
                "@type": "Brand",
                "name": brand || "Dixis"
              },
              ...(price && {
                "offers": {
                  "@type": "Offer",
                  "price": price.amount,
                  "priceCurrency": price.currency,
                  "availability": availability === 'in stock' 
                    ? "https://schema.org/InStock" 
                    : "https://schema.org/OutOfStock"
                }
              }),
              ...(category && { "category": category })
            })
          }}
        />
      )}

      {/* Structured Data for Organization */}
      {type === 'website' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Dixis",
              "description": "Αυθεντικά Ελληνικά Προϊόντα απευθείας από τον παραγωγό",
              "url": metaUrl,
              "logo": `${metaUrl}/logo.png`,
              "sameAs": [
                "https://www.facebook.com/dixis",
                "https://www.instagram.com/dixis",
                "https://twitter.com/dixis"
              ]
            })
          }}
        />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />

      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Theme Color */}
      <meta name="theme-color" content="#16a34a" />
      <meta name="msapplication-TileColor" content="#16a34a" />
    </Head>
  );
}

// Helper function to generate meta tags for products
export function generateProductMeta(product: {
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  producer?: string;
  inStock?: boolean;
}) {
  return {
    title: product.name,
    description: product.description,
    keywords: `${product.name}, ${product.category}, ${product.producer}, ελληνικά προϊόντα`,
    image: product.image,
    type: 'product' as const,
    price: {
      amount: product.price.toString(),
      currency: 'EUR'
    },
    availability: product.inStock ? 'in stock' as const : 'out of stock' as const,
    brand: product.producer,
    category: product.category,
  };
}

// Helper function to generate meta tags for producers
export function generateProducerMeta(producer: {
  name: string;
  description: string;
  image?: string;
  location?: string;
}) {
  return {
    title: `${producer.name} - Παραγωγός`,
    description: producer.description,
    keywords: `${producer.name}, παραγωγός, ${producer.location}, ελληνικά προϊόντα`,
    image: producer.image,
    type: 'article' as const,
    author: producer.name,
    section: 'Παραγωγοί',
  };
}
