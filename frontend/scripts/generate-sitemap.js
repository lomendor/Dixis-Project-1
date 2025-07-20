const fs = require('fs');
const path = require('path');

/**
 * Generate XML sitemap for Greek SEO
 */
async function generateSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dixis.gr';
  
  // Static pages with Greek content
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/products', priority: 0.9, changefreq: 'daily' },
    { url: '/producers', priority: 0.9, changefreq: 'daily' },
    { url: '/about', priority: 0.7, changefreq: 'weekly' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly' },
    { url: '/subscription', priority: 0.8, changefreq: 'weekly' },
    { url: '/b2b/login', priority: 0.6, changefreq: 'monthly' },
    { url: '/become-producer', priority: 0.7, changefreq: 'monthly' },
  ];
  
  // Fetch dynamic pages from API
  const dynamicPages = [];
  
  try {
    // Fetch products
    const productsResponse = await fetch('http://localhost:8080/api/products?per_page=100');
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      productsData.data?.forEach(product => {
        dynamicPages.push({
          url: `/products/${product.slug}`,
          priority: 0.8,
          changefreq: 'weekly',
          lastmod: product.updated_at
        });
      });
    }
    
    // Fetch producers
    const producersResponse = await fetch('http://localhost:8080/api/producers?per_page=100');
    if (producersResponse.ok) {
      const producersData = await producersResponse.json();
      producersData.data?.forEach(producer => {
        dynamicPages.push({
          url: `/producers/${producer.slug || producer.id}`,
          priority: 0.8,
          changefreq: 'weekly',
          lastmod: producer.updated_at
        });
      });
    }
    
    // Fetch categories
    const categoriesResponse = await fetch('http://localhost:8080/api/categories');
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      categoriesData.data?.forEach(category => {
        dynamicPages.push({
          url: `/products?category=${category.slug}`,
          priority: 0.7,
          changefreq: 'weekly'
        });
      });
    }
  } catch (error) {
    console.error('Error fetching dynamic pages:', error);
  }
  
  // Combine all pages
  const allPages = [...staticPages, ...dynamicPages];
  
  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="el" href="${baseUrl}${page.url}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${page.url}"/>
  </url>`).join('\n')}
</urlset>`;
  
  // Write sitemap
  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml);
  console.log('✅ Sitemap generated successfully');
  
  // Generate robots.txt
  const robots = `# Dixis Fresh Robots.txt
# https://dixis.gr

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /b2b/dashboard/
Disallow: /b2b/orders/
Disallow: /b2b/invoices/
Disallow: /producer/dashboard/
Disallow: /checkout/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Greek search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /`;
  
  fs.writeFileSync(path.join(__dirname, '../public/robots.txt'), robots);
  console.log('✅ Robots.txt generated successfully');
}

// Run if called directly
if (require.main === module) {
  generateSitemap().catch(console.error);
}

module.exports = { generateSitemap };