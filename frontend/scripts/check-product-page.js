const puppeteer = require('puppeteer');

async function checkProductPage() {
  console.log('🧪 Testing Product Detail Page...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Go to products page first
    console.log('📍 Navigating to products page...');
    await page.goto('http://localhost:3002/products', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Check if products are loaded
    const productsCount = await page.$$eval('.product-card', elements => elements.length);
    console.log(`✅ Found ${productsCount} products on the page`);
    
    // Click on the first product
    if (productsCount > 0) {
      console.log('\n📍 Clicking on first product...');
      
      // Get the href of the first product link
      const firstProductLink = await page.$eval('.product-card a', el => el.href);
      console.log(`   Product URL: ${firstProductLink}`);
      
      // Navigate to the product page
      await page.goto(firstProductLink, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for product title
      await page.waitForSelector('h1', { timeout: 5000 });
      
      // Get product details
      const productName = await page.$eval('h1', el => el.textContent);
      console.log(`✅ Product page loaded: ${productName}`);
      
      // Check for key elements
      const hasPrice = await page.$('.text-green-600') !== null;
      const hasAddToCart = await page.$('button') !== null;
      const hasProducer = await page.$eval('body', body => body.textContent.includes('Παραγωγός'));
      
      console.log('\n📋 Page elements check:');
      console.log(`   ✅ Product name: ${productName}`);
      console.log(`   ${hasPrice ? '✅' : '❌'} Price displayed`);
      console.log(`   ${hasAddToCart ? '✅' : '❌'} Add to cart button`);
      console.log(`   ${hasProducer ? '✅' : '❌'} Producer info`);
      
      // Check for any error messages
      const errorMessage = await page.$eval('body', body => {
        if (body.textContent.includes('Κάτι πήγε στραβά')) return 'Error boundary triggered';
        if (body.textContent.includes('Προϊόν δεν βρέθηκε')) return 'Product not found';
        return null;
      });
      
      if (errorMessage) {
        console.log(`\n❌ Error found: ${errorMessage}`);
      } else {
        console.log('\n✅ No errors detected on product page!');
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: 'scripts/screenshots/product-page-test.png',
        fullPage: true 
      });
      console.log('\n📸 Screenshot saved to: scripts/screenshots/product-page-test.png');
      
    } else {
      console.log('❌ No products found to test');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
    console.log('\n✨ Test completed!');
  }
}

// Run the test
checkProductPage().catch(console.error);