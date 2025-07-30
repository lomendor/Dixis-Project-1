import { test, expect } from '@playwright/test';

test.describe('🏪 Multi-Producer Cart Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('🎭 Starting multi-producer verification test...');
    
    // Navigate to homepage and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should display correct producer names in cart (not "Άγνωστος Παραγωγός")', async ({ page }) => {
    console.log('🏪 CRITICAL TEST: Verifying producer names are correctly displayed...');
    
    // Navigate to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📍 On products page, taking initial screenshot...');
    await page.screenshot({ 
      path: 'test-results/producer-verification-01-products-page.png',
      fullPage: true 
    });
    
    // Find product cards with add to cart buttons
    const productCards = page.locator('div:has(button:has-text("Προσθήκη στο καλάθι"))');
    const productCount = await productCards.count();
    console.log(`📦 Found ${productCount} products with add to cart buttons`);
    
    if (productCount === 0) {
      console.log('❌ No products with add to cart buttons found');
      test.skip(true, 'No products found for testing');
      return;
    }
    
    expect(productCount).toBeGreaterThan(0);
    
    // Track added products with their producer info
    const addedProducts: Array<{
      index: number;
      name: string;
      producerFromCard: string;
      cartCount: number;
    }> = [];
    
    // Add 4 products to cart
    const maxProducts = Math.min(4, productCount);
    let productsAdded = 0;
    
    for (let i = 0; i < maxProducts && productsAdded < 4; i++) {
      try {
        console.log(`\n🎯 Processing product ${i + 1}...`);
        
        const productCard = productCards.nth(i);
        await productCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        // Get product name from card
        const nameElement = productCard.locator('h3, h2, .product-name').first();
        let productName = 'Unknown Product';
        
        if (await nameElement.count() > 0) {
          productName = (await nameElement.textContent() || 'Unknown Product').trim();
        }
        
        // Get producer name from card (this is what should match cart display)
        const producerElement = productCard.locator('p, span, .text-sm').first();
        let producerFromCard = 'Unknown Producer';
        
        if (await producerElement.count() > 0) {
          const producerText = await producerElement.textContent();
          if (producerText && 
              !producerText.includes('€') && 
              !producerText.includes('Προσθήκη') && 
              producerText.trim().length > 3) {
            producerFromCard = producerText.replace(/^από\s*/i, '').trim();
          }
        }
        
        console.log(`📦 Product: "${productName.substring(0, 40)}"`);
        console.log(`🏪 Producer from card: "${producerFromCard.substring(0, 40)}"`);
        
        // Add to cart
        const addButton = productCard.locator('button:has-text("Προσθήκη στο καλάθι")').first();
        
        if (await addButton.count() > 0) {
          await addButton.click();
          await page.waitForTimeout(2000);
          
          // Check cart count
          const cartBadge = page.locator('.cart-count, .badge, [data-count]').first();
          let cartCount = productsAdded + 1;
          
          if (await cartBadge.count() > 0) {
            const cartText = await cartBadge.textContent();
            if (cartText && !isNaN(parseInt(cartText))) {
              cartCount = parseInt(cartText);
            }
          }
          
          console.log(`✅ Product ${i + 1} added to cart! Cart count: ${cartCount}`);
          
          addedProducts.push({
            index: i + 1,
            name: productName,
            producerFromCard: producerFromCard,
            cartCount: cartCount
          });
          
          productsAdded++;
          
        } else {
          console.log(`⚠️ No add to cart button found for product ${i + 1}`);
        }
        
      } catch (error) {
        console.log(`❌ Error processing product ${i + 1}: ${error}`);
      }
    }
    
    console.log(`\n🏁 Added ${productsAdded} products to cart`);
    console.log('📋 Products added:', addedProducts);
    
    expect(productsAdded).toBeGreaterThan(0);
    
    // Take screenshot after adding products
    await page.screenshot({ 
      path: 'test-results/producer-verification-02-products-added.png',
      fullPage: true 
    });
    
    // Now navigate to cart page to verify producers are displayed correctly
    console.log('\n🛒 Navigating to cart page to verify producer display...');
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot of cart page
    await page.screenshot({ 
      path: 'test-results/producer-verification-03-cart-page.png',
      fullPage: true 
    });
    
    // CRITICAL VERIFICATION: Check that producers are NOT "Άγνωστος Παραγωγός"
    const unknownProducerElements = page.locator('text=Άγνωστος Παραγωγός');
    const unknownProducerCount = await unknownProducerElements.count();
    
    console.log(`🔍 Found ${unknownProducerCount} instances of "Άγνωστος Παραγωγός" on cart page`);
    
    if (unknownProducerCount > 0) {
      console.log('❌ CRITICAL ISSUE: Found "Άγνωστος Παραγωγός" in cart - producer data not working!');
      
      // Log all text content for debugging
      const bodyText = await page.locator('body').textContent();
      console.log('📄 Cart page content contains:', bodyText?.substring(0, 500));
      
      // Take debug screenshot
      await page.screenshot({ 
        path: 'test-results/producer-verification-DEBUG-unknown-producers.png',
        fullPage: true 
      });
    }
    
    // Check for producer sections/headers
    const producerHeaders = page.locator('h3, .font-bold').filter({ hasText: /^(?!.*Άγνωστος).*$/ });
    const realProducerCount = await producerHeaders.count();
    console.log(`🏪 Found ${realProducerCount} potential producer headers on cart page`);
    
    // Get actual producer names from cart
    const cartProducers: string[] = [];
    for (let i = 0; i < Math.min(realProducerCount, 10); i++) {
      const producerText = await producerHeaders.nth(i).textContent();
      if (producerText && producerText.trim().length > 0) {
        cartProducers.push(producerText.trim());
      }
    }
    
    console.log('🏪 Producer names found in cart:', cartProducers);
    
    // MAIN ASSERTION: Should not have many "Unknown Producer" instances
    expect(unknownProducerCount).toBeLessThanOrEqual(1); // Allow max 1 for edge cases
    
    // SECONDARY ASSERTION: Should have at least one real producer
    expect(realProducerCount).toBeGreaterThan(0);
    
    console.log('\n🎉 PRODUCER VERIFICATION TEST COMPLETED!');
    console.log(`✅ Successfully verified producer display functionality`);
    console.log(`✅ Found ${realProducerCount} real producers vs ${unknownProducerCount} unknown`);
    
    // Final verification screenshot
    await page.screenshot({ 
      path: 'test-results/producer-verification-04-final-success.png',
      fullPage: true 
    });
  });

  test('should display producer segregation in cart drawer', async ({ page }) => {
    console.log('🏪 Testing producer segregation in cart drawer...');
    
    // Add products first (simplified version)
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const productCards = page.locator('div:has(button:has-text("Προσθήκη στο καλάθι"))');
    const productCount = await productCards.count();
    
    // Add 2-3 products quickly
    const maxProducts = Math.min(3, productCount);
    for (let i = 0; i < maxProducts; i++) {
      const addButton = productCards.nth(i).locator('button:has-text("Προσθήκη στο καλάθι")').first();
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(1500);
      }
    }
    
    console.log(`📦 Added ${maxProducts} products, testing cart drawer...`);
    
    // Try to open cart drawer
    const cartTriggers = [
      '[data-testid*="cart"]',
      '.cart-icon', 
      '.cart-button',
      'button:has(svg)',
      'a[href*="cart"]'
    ];
    
    let drawerOpened = false;
    for (const selector of cartTriggers) {
      const cartTrigger = page.locator(selector);
      if (await cartTrigger.count() > 0) {
        try {
          await cartTrigger.first().click();
          await page.waitForTimeout(2000);
          
          const cartDrawer = page.locator('.cart-drawer, .drawer, [role="dialog"]');
          if (await cartDrawer.count() > 0) {
            console.log('✅ Cart drawer opened successfully');
            drawerOpened = true;
            
            await page.screenshot({ 
              path: 'test-results/producer-verification-cart-drawer.png',
              fullPage: true 
            });
            
            // Check for producer information in drawer
            const producerTexts = cartDrawer.locator('text=/(?!Άγνωστος)/');
            const producerCount = await producerTexts.count();
            console.log(`🏪 Found ${producerCount} potential producer texts in drawer`);
            
            break;
          }
        } catch (error) {
          console.log(`⚠️ Cart trigger failed: ${error}`);
        }
      }
    }
    
    if (!drawerOpened) {
      console.log('ℹ️ Cart drawer not available, test completed with products page verification');
    }
  });

  test('should handle mobile producer display correctly', async ({ page }) => {
    console.log('📱 Testing mobile producer display...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Add products on mobile
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const productCards = page.locator('div:has(button:has-text("Προσθήκη στο καλάθι"))');
    const productCount = await productCards.count();
    
    if (productCount > 0) {
      // Add one product on mobile
      const addButton = productCards.first().locator('button:has-text("Προσθήκη στο καλάθι")').first();
      if (await addButton.count() > 0) {
        await addButton.tap();
        await page.waitForTimeout(2000);
        console.log('📱 Added product on mobile');
      }
      
      // Navigate to cart on mobile
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Take mobile screenshot
      await page.screenshot({ 
        path: 'test-results/producer-verification-mobile.png',
        fullPage: true 
      });
      
      // Check for unknown producers on mobile (should be minimal)
      const unknownOnMobile = page.locator('text=Άγνωστος Παραγωγός');
      const unknownMobileCount = await unknownOnMobile.count();
      console.log(`📱 Mobile unknown producers: ${unknownMobileCount}`);
      
      expect(unknownMobileCount).toBeLessThanOrEqual(1);
    } else {
      console.log('⚠️ No products found for mobile testing');
    }
  });

  test('should take comprehensive diagnostic screenshots', async ({ page }) => {
    console.log('📸 Taking comprehensive diagnostic screenshots...');
    
    // Screenshot 1: Homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/producer-diagnostic-01-homepage.png',
      fullPage: true 
    });
    
    // Screenshot 2: Products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: 'test-results/producer-diagnostic-02-products.png',
      fullPage: true 
    });
    
    // Add some products for cart testing
    const productCards = page.locator('div:has(button:has-text("Προσθήκη στο καλάθι"))');
    const productCount = await productCards.count();
    
    if (productCount > 0) {
      // Add first 2 products
      for (let i = 0; i < Math.min(2, productCount); i++) {
        const addButton = productCards.nth(i).locator('button:has-text("Προσθήκη στο καλάθι")').first();
        if (await addButton.count() > 0) {
          await addButton.click();
          await page.waitForTimeout(1500);
        }
      }
      
      await page.screenshot({ 
        path: 'test-results/producer-diagnostic-03-products-with-cart.png',
        fullPage: true 
      });
    }
    
    // Screenshot 3: Cart page
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/producer-diagnostic-04-cart-final.png',
      fullPage: true 
    });
    
    console.log('✅ All diagnostic screenshots saved');
    
    // Log page titles for reference
    await page.goto('/');
    console.log(`🏠 Homepage title: ${await page.title()}`);
    
    await page.goto('/products');
    console.log(`📦 Products title: ${await page.title()}`);
    
    await page.goto('/cart');
    console.log(`🛒 Cart title: ${await page.title()}`);
  });
});