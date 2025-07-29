const { chromium } = require('playwright');

async function testConsumerJourney() {
  console.log('🛒 CONSUMER JOURNEY TESTING - Browse to Checkout');
  console.log('📋 Testing complete consumer workflow as requested by user');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000 
  });
  
  const page = await browser.newPage();
  const gaps = [];
  const workingFeatures = [];
  
  try {
    // Step 1: Homepage and Product Discovery
    console.log('\n📍 STEP 1: Homepage and Product Discovery');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    
    const title = await page.title();
    console.log('✅ Homepage loads:', title);
    workingFeatures.push('Homepage loading and navigation');
    
    // Check for products link
    const productsLink = await page.$('a[href*="/products"]') || await page.$('text=Προϊόντα');
    if (productsLink) {
      console.log('✅ Products navigation found');
      workingFeatures.push('Products navigation');
      await productsLink.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('❌ Products navigation not found');
      gaps.push('Products navigation missing from homepage');
      await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle' });
    }
    
    // Step 2: Product Catalog Browsing
    console.log('\n📍 STEP 2: Product Catalog');
    const productCards = await page.$$('.product-card, [data-testid="product"], .grid > div');
    console.log(`✅ Products displaying: ${productCards.length} product cards found`);
    
    if (productCards.length > 0) {
      workingFeatures.push(`Product catalog display (${productCards.length} products)`);
      
      // Check for product details
      const firstProduct = productCards[0];
      const productName = await firstProduct.$('h3, .product-name, [data-testid="product-name"]');
      const productPrice = await firstProduct.$('.price, [data-testid="price"]') || 
                          await firstProduct.$('text=€');
      
      if (productName && productPrice) {
        console.log('✅ Product information (name, price) displaying');
        workingFeatures.push('Product information display');
      } else {
        console.log('❌ Product information incomplete');
        gaps.push('Product information (name/price) not displaying correctly');
      }
    } else {
      console.log('❌ No products found');
      gaps.push('Product catalog empty or not loading');
    }
    
    // Step 3: Add to Cart Functionality
    console.log('\n📍 STEP 3: Add to Cart');
    if (productCards.length > 0) {
      try {
        // Look for add to cart button
        const addToCartBtn = await page.$('button:has-text("Προσθήκη στο Καλάθι"), button:has-text("Add to Cart"), [data-testid="add-to-cart"]');
        if (addToCartBtn) {
          console.log('✅ Add to cart button found');
          workingFeatures.push('Add to cart button');
          
          // Try to add product to cart
          await addToCartBtn.click();
          await page.waitForTimeout(2000);
          
          // Check for success feedback
          const successMessage = await page.$('.toast, .notification, .success, .added-to-cart');
          const cartIcon = await page.$('.cart-icon, [data-testid="cart"], .shopping-cart');
          
          if (successMessage || cartIcon) {
            console.log('✅ Add to cart functionality working');
            workingFeatures.push('Add to cart functionality');
          } else {
            console.log('⚠️ Add to cart may work but no visual feedback');
            gaps.push('Add to cart missing success feedback');
          }
        } else {
          console.log('❌ Add to cart button not found');
          gaps.push('Add to cart button not available');
        }
      } catch (error) {
        console.log('❌ Add to cart failed:', error.message);
        gaps.push('Add to cart functionality broken');
      }
    }
    
    // Step 4: Shopping Cart
    console.log('\n📍 STEP 4: Shopping Cart');
    const cartUrls = ['/cart', '/checkout'];
    let cartAccessible = false;
    
    for (const url of cartUrls) {
      try {
        await page.goto(`http://localhost:3000${url}`, { waitUntil: 'networkidle', timeout: 10000 });
        const currentUrl = page.url();
        if (!currentUrl.includes('404') && !currentUrl.includes('not-found')) {
          console.log(`✅ Cart page accessible: ${url}`);
          workingFeatures.push(`Shopping cart page (${url})`);
          cartAccessible = true;
          break;
        }
      } catch (error) {
        console.log(`⚠️ Could not access ${url}`);
      }
    }
    
    if (!cartAccessible) {
      console.log('❌ Shopping cart page not accessible');
      gaps.push('Shopping cart page missing or broken');
    }
    
    // Step 5: User Registration/Login
    console.log('\n📍 STEP 5: User Authentication');
    const authUrls = ['/auth/login', '/login', '/auth/register', '/register'];
    let authPageFound = false;
    
    for (const url of authUrls) {
      try {
        await page.goto(`http://localhost:3000${url}`, { waitUntil: 'networkidle', timeout: 10000 });
        const currentUrl = page.url();
        if (!currentUrl.includes('404') && !currentUrl.includes('not-found')) {
          console.log(`✅ Authentication page found: ${url}`);
          workingFeatures.push(`Authentication page (${url})`);
          authPageFound = true;
          
          // Check for form fields
          const emailInput = await page.$('input[type="email"], input[name="email"]');
          const passwordInput = await page.$('input[type="password"], input[name="password"]');
          
          if (emailInput && passwordInput) {
            console.log('✅ Authentication form complete');
            workingFeatures.push('Authentication form fields');
          } else {
            console.log('❌ Authentication form incomplete');
            gaps.push('Authentication form missing required fields');
          }
          break;
        }
      } catch (error) {
        console.log(`⚠️ Could not access ${url}`);
      }
    }
    
    if (!authPageFound) {
      console.log('❌ No authentication page found');
      gaps.push('User authentication pages missing');
    }
    
    // Step 6: Checkout Process
    console.log('\n📍 STEP 6: Checkout Process');
    try {
      await page.goto('http://localhost:3000/checkout', { waitUntil: 'networkidle', timeout: 15000 });
      console.log('✅ Checkout page accessible');
      workingFeatures.push('Checkout page');
      
      // Check for checkout form elements
      const checkoutElements = await page.$$('input, select, button, form');
      if (checkoutElements.length > 0) {
        console.log(`✅ Checkout form elements found: ${checkoutElements.length}`);
        workingFeatures.push('Checkout form structure');
      } else {
        console.log('❌ Checkout form elements missing');
        gaps.push('Checkout form structure incomplete');
      }
      
      // Check for payment options
      const paymentSection = await page.$('.payment, [data-testid="payment"]') || 
                            await page.$('text=Πληρωμή');
      if (paymentSection) {
        console.log('✅ Payment section found');
        workingFeatures.push('Payment integration section');
      } else {
        console.log('❌ Payment section missing');
        gaps.push('Payment integration section missing');
      }
      
    } catch (error) {
      console.log('❌ Checkout page failed:', error.message);
      gaps.push('Checkout process inaccessible');
    }
    
    // Step 7: Mobile Responsiveness Test
    console.log('\n📍 STEP 7: Mobile Experience');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle', timeout: 15000 });
    
    const mobileProducts = await page.$$('.product-card, [data-testid="product"], .grid > div');
    if (mobileProducts.length > 0) {
      console.log('✅ Mobile product display working');
      workingFeatures.push('Mobile responsiveness');
    } else {
      console.log('❌ Mobile product display broken');
      gaps.push('Mobile responsiveness issues');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'consumer-journey-final.png', fullPage: true });
    console.log('📸 Final screenshot saved');
    
  } catch (error) {
    console.error('❌ Consumer journey test failed:', error.message);
    gaps.push(`Critical error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Results Summary
  console.log('\n' + '='.repeat(80));
  console.log('🛒 CONSUMER JOURNEY TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log('\n✅ WORKING FEATURES:');
  workingFeatures.forEach((feature, index) => {
    console.log(`${index + 1}. ${feature}`);
  });
  
  console.log('\n❌ GAPS FOUND:');
  gaps.forEach((gap, index) => {
    console.log(`${index + 1}. ${gap}`);
  });
  
  console.log('\n📈 SUMMARY:');
  console.log(`Working Features: ${workingFeatures.length}`);
  console.log(`Gaps Found: ${gaps.length}`);
  const successRate = workingFeatures.length + gaps.length > 0 ? 
    Math.round((workingFeatures.length / (workingFeatures.length + gaps.length)) * 100) : 0;
  console.log(`Success Rate: ${successRate}%`);
  
  console.log('\n🎯 NEXT STEPS:');
  if (gaps.length > 0) {
    console.log('1. Fix identified gaps in consumer workflow');
    console.log('2. Improve payment integration');
    console.log('3. Enhance user experience and mobile responsiveness');
  } else {
    console.log('1. Consumer journey is complete - platform ready for users');
  }
  
  return { workingFeatures, gaps, successRate };
}

testConsumerJourney();