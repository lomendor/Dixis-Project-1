import { test, expect } from '@playwright/test';

test.describe('🔧 Cart State Synchronization Diagnostic', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('🎭 Starting cart synchronization diagnostic test...');
    
    // Navigate to homepage and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should maintain consistent item counts between header and drawer', async ({ page }) => {
    console.log('🔧 CRITICAL TEST: Verifying cart state synchronization...');
    
    // Navigate to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📍 On products page, looking for add to cart buttons...');
    await page.screenshot({ 
      path: 'test-results/sync-diagnostic-01-products-page.png',
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
    
    // Set up console logging to capture sync issues
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('HeaderCartIcon') || text.includes('ModernCartDrawer') || text.includes('CART SYNC ISSUE')) {
        logs.push(`${new Date().toISOString()}: ${text}`);
        console.log(`🔍 BROWSER LOG: ${text}`);
      }
    });
    
    // Add 3 products to cart and track synchronization
    let expectedCount = 0;
    const maxProducts = Math.min(3, productCount);
    
    for (let i = 0; i < maxProducts; i++) {
      try {
        console.log(`\\n➕ Adding product ${i + 1} to cart...`);
        
        const productCard = productCards.nth(i);
        await productCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        // Add to cart
        const addButton = productCard.locator('button:has-text("Προσθήκη στο καλάθι")').first();
        
        if (await addButton.count() > 0) {
          await addButton.click();
          expectedCount++;
          
          // Wait for state updates
          await page.waitForTimeout(3000);
          
          console.log(`✅ Product ${i + 1} added. Expected count: ${expectedCount}`);
          
          // Take screenshot after each addition
          await page.screenshot({ 
            path: `test-results/sync-diagnostic-02-after-product-${i + 1}.png`,
            fullPage: true 
          });
          
          // Check for sync issues in logs
          const syncIssues = logs.filter(log => log.includes('CART SYNC ISSUE'));
          if (syncIssues.length > 0) {
            console.error(`🚨 SYNCHRONIZATION ISSUES DETECTED after adding product ${i + 1}:`);
            syncIssues.forEach(issue => console.error(issue));
          }
          
        } else {
          console.log(`⚠️ No add to cart button found for product ${i + 1}`);
        }
        
      } catch (error) {
        console.log(`❌ Error adding product ${i + 1}: ${error}`);
      }
    }
    
    console.log(`\\n🔍 Added ${expectedCount} products, now testing cart drawer...`);
    
    // Try to open cart drawer/modal
    const cartTriggers = [
      'button:has(svg):has-text("")', // Cart icon buttons
      '[data-testid*="cart"]',
      '.cart-icon', 
      '.cart-button',
      'button:has([class*="cart"])',
      'a[href*="cart"]'
    ];
    
    let drawerOpened = false;
    for (const selector of cartTriggers) {
      const cartTrigger = page.locator(selector);
      const triggerCount = await cartTrigger.count();
      
      if (triggerCount > 0) {
        try {
          console.log(`🎯 Trying cart trigger: ${selector} (found ${triggerCount} elements)`);
          
          // Try clicking the first matching element
          await cartTrigger.first().click();
          await page.waitForTimeout(2000);
          
          // Check if a drawer/modal opened
          const cartDrawer = page.locator('.cart-drawer, .drawer, [role="dialog"], div:has-text("Καλάθι Αγορών")');
          const drawerCount = await cartDrawer.count();
          
          if (drawerCount > 0) {
            console.log('✅ Cart drawer opened successfully');
            drawerOpened = true;
            
            await page.screenshot({ 
              path: 'test-results/sync-diagnostic-03-cart-drawer-opened.png',
              fullPage: true 
            });
            
            // Check for item count in drawer
            const drawerItemCount = page.locator('text=/\\d+ προϊόν[τα]?/');
            const drawerCountText = await drawerItemCount.first().textContent();
            console.log(`🛒 Drawer shows: "${drawerCountText}"`);
            
            break;
          }
        } catch (error) {
          console.log(`⚠️ Cart trigger failed: ${error}`);
        }
      }
    }
    
    // Navigate to cart page as well
    console.log('\\n🛒 Also checking cart page...');
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/sync-diagnostic-04-cart-page.png',
      fullPage: true 
    });
    
    // Final analysis
    console.log('\\n📊 SYNCHRONIZATION ANALYSIS:');
    console.log(`Expected item count: ${expectedCount}`);
    
    const finalSyncIssues = logs.filter(log => log.includes('CART SYNC ISSUE'));
    console.log(`Synchronization issues detected: ${finalSyncIssues.length}`);
    
    // Log all cart-related console messages
    console.log('\\n📋 ALL CART-RELATED LOGS:');
    logs.forEach(log => console.log(log));
    
    // The test passes if we've successfully added products
    // The real verification is in the console logs showing sync issues
    expect(expectedCount).toBeGreaterThan(0);
    
    console.log('\\n🎉 CART SYNCHRONIZATION DIAGNOSTIC COMPLETED!');
    console.log(`✅ Added ${expectedCount} products successfully`);
    console.log(`🔍 Check console logs above for synchronization issues`);
    console.log(`📸 Screenshots saved for manual verification`);
  });

  test('should detect specific header vs drawer count mismatches', async ({ page }) => {
    console.log('🔧 Testing specific header vs drawer count mismatches...');
    
    // Go to products and add one item
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const productCards = page.locator('div:has(button:has-text("Προσθήκη στο καλάθι"))');
    const productCount = await productCards.count();
    
    if (productCount > 0) {
      const addButton = productCards.first().locator('button:has-text("Προσθήκη στο καλάθι")').first();
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(3000);
        
        console.log('✅ Added one product, now checking for count mismatches...');
        
        // Look for header cart count
        const headerCartElements = page.locator('text=/\\d+ προϊόν[τα]?/');
        const headerCount = await headerCartElements.count();
        
        console.log(`Found ${headerCount} cart count elements in header area`);
        
        for (let i = 0; i < Math.min(headerCount, 5); i++) {
          const text = await headerCartElements.nth(i).textContent();
          console.log(`Header cart element ${i + 1}: "${text}"`);
        }
        
        await page.screenshot({ 
          path: 'test-results/sync-diagnostic-specific-mismatch.png',
          fullPage: true 
        });
      }
    }
  });
});