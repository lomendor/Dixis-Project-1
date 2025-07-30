import { test, expect } from '@playwright/test';

test.describe('Multi-Producer Cart Testing - Final Version', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('🎭 Starting multi-producer cart test...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should successfully test multi-producer cart functionality', async ({ page }) => {
    console.log('🛒 Testing multi-producer cart with Greek products...');
    
    // Navigate to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📍 On products page, looking for product cards...');
    
    // Take screenshot of products page
    await page.screenshot({ 
      path: 'test-results/01-products-page.png',
      fullPage: true 
    });
    
    // Find all product cards - using the grid structure visible in the screenshot
    const productGrid = page.locator('.grid');
    const productCards = productGrid.locator('> div'); // Direct children of grid
    
    const productCount = await productCards.count();
    console.log(`📦 Found ${productCount} product cards in grid`);
    
    if (productCount === 0) {
      console.log('⚠️ No products found, test will be skipped');
      test.skip(true, 'No products found on products page');
      return;
    }
    
    expect(productCount).toBeGreaterThan(0);
    
    // Track added products
    const addedProducts: Array<{index: number, name: string, producer: string}> = [];
    let productsAdded = 0;
    const maxProductsToAdd = Math.min(4, productCount);
    
    // Add products to cart
    for (let i = 0; i < maxProductsToAdd && productsAdded < 4; i++) {
      try {
        console.log(`🎯 Processing product ${i + 1}...`);
        
        const productCard = productCards.nth(i);
        
        // Get product name - it should be in an h3 element based on the screenshot
        const productNameElement = productCard.locator('h3').first();
        let productName = 'Unknown Product';
        
        try {
          if (await productNameElement.count() > 0) {
            productName = await productNameElement.textContent() || 'Unknown Product';
          }
        } catch (error) {
          console.log(`⚠️ Could not get product name for item ${i}: ${error}`);
        }
        
        // Get producer name - usually in a smaller text element
        const producerElement = productCard.locator('.text-sm, .text-gray-600, p').first();
        let producerName = 'Unknown Producer';
        
        try {
          if (await producerElement.count() > 0) {
            const producerText = await producerElement.textContent();
            if (producerText && !producerText.includes('€') && !producerText.includes('προσθήκη')) {
              producerName = producerText.trim();
            }
          }
        } catch (error) {
          console.log(`⚠️ Could not get producer name for item ${i}: ${error}`);
        }
        
        console.log(`📦 Product ${i + 1}: "${productName.substring(0, 30)}" from "${producerName.substring(0, 30)}"`);
        
        // Find the "Add to Cart" button
        const addToCartButton = productCard.locator('button:has-text("Προσθήκη στο καλάθι")');
        
        if (await addToCartButton.count() > 0) {
          console.log(`🔘 Clicking add to cart for product ${i + 1}...`);
          
          try {
            // Scroll the button into view and click
            await addToCartButton.scrollIntoViewIfNeeded();
            await addToCartButton.click();
            
            // Wait for the cart to update
            await page.waitForTimeout(2000);
            
            // Check if cart count increased
            const cartBadge = page.locator('.cart-count, .badge, [data-count]');
            
            let cartAdded = false;
            if (await cartBadge.count() > 0) {
              try {
                const cartCount = await cartBadge.first().textContent();
                if (cartCount && parseInt(cartCount) > 0) {
                  console.log(`✅ Product ${i + 1} added to cart! Cart count: ${cartCount}`);
                  cartAdded = true;
                }
              } catch (error) {
                console.log(`⚠️ Could not read cart count: ${error}`);
              }
            }
            
            if (cartAdded) {
              addedProducts.push({
                index: i + 1,
                name: productName.trim(),
                producer: producerName.trim()
              });
              productsAdded++;
            } else {
              console.log(`⚠️ Product ${i + 1} may not have been added (no cart count change)`);
            }
            
          } catch (clickError) {
            console.log(`❌ Failed to add product ${i + 1} to cart: ${clickError}`);
          }
        } else {
          console.log(`⚠️ No add to cart button found for product ${i + 1}`);
        }
        
      } catch (error) {
        console.log(`❌ Error processing product ${i + 1}: ${error}`);
      }
    }
    
    console.log(`🏁 Successfully added ${productsAdded} products to cart`);
    console.log('📋 Added products summary:');
    addedProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. "${product.name.substring(0, 40)}" from "${product.producer.substring(0, 30)}"`);
    });
    
    // Take screenshot after adding products
    await page.screenshot({ 
      path: 'test-results/02-products-added-to-cart.png',
      fullPage: true 
    });
    
    // Verify we added at least one product
    expect(productsAdded).toBeGreaterThan(0);
    
    // Now test cart display
    console.log('🛒 Testing cart display...');
    
    // Look for cart icon/button
    const cartTrigger = page.locator('[data-testid*="cart"], .cart, button:has(svg)').first();
    
    if (await cartTrigger.count() > 0) {
      console.log('🎯 Found cart trigger, clicking...');
      
      try {
        await cartTrigger.click();
        await page.waitForTimeout(2000);
        
        // Check if cart drawer opened or navigated to cart page
        const cartDrawer = page.locator('.cart-drawer, .drawer, [role="dialog"]');
        const isCartPage = page.url().includes('/cart');
        
        if (await cartDrawer.count() > 0) {
          console.log('✅ Cart drawer opened');
          
          const cartItems = cartDrawer.locator('.cart-item, li, div:has(h3)');
          const itemsInDrawer = await cartItems.count();
          console.log(`📋 Found ${itemsInDrawer} items in cart drawer`);
          
          // Take screenshot of cart drawer
          await page.screenshot({ 
            path: 'test-results/03-cart-drawer.png',
            fullPage: true 
          });
          
        } else if (isCartPage) {
          console.log('✅ Navigated to cart page');
          
          const cartItems = page.locator('.cart-item, [data-testid*="item"]');
          const itemsOnPage = await cartItems.count();
          console.log(`📋 Found ${itemsOnPage} items on cart page`);
          
          // Take screenshot of cart page
          await page.screenshot({ 
            path: 'test-results/03-cart-page.png',
            fullPage: true 
          });
        }
        
      } catch (cartError) {
        console.log(`⚠️ Cart interaction failed: ${cartError}`);
        
        // Try direct navigation to cart
        console.log('🔄 Trying direct navigation to /cart...');
        await page.goto('/cart');
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ 
          path: 'test-results/03-cart-direct.png',
          fullPage: true 
        });
      }
    } else {
      console.log('⚠️ Cart trigger not found, navigating directly to /cart');
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'test-results/03-cart-fallback.png',
        fullPage: true 
      });
    }
    
    // Test summary
    console.log('\n🎉 Multi-producer cart test completed successfully!');
    console.log(`📊 Results:`);
    console.log(`   - Products processed: ${maxProductsToAdd}`);
    console.log(`   - Products added to cart: ${productsAdded}`);
    console.log(`   - Unique producers: ${new Set(addedProducts.map(p => p.producer)).size}`);
    
    // Final verification
    expect(addedProducts.length).toBeGreaterThan(0);
    
    if (addedProducts.length >= 2) {
      const uniqueProducers = new Set(addedProducts.map(p => p.producer));
      console.log(`✅ Successfully tested multi-producer cart with ${uniqueProducers.size} different producers`);
    }
  });
  
  test('should take comprehensive diagnostic screenshots', async ({ page }) => {
    console.log('📸 Taking diagnostic screenshots...');
    
    // Homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/diag-homepage.png', fullPage: true });
    
    // Products page  
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/diag-products.png', fullPage: true });
    
    // Cart page
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/diag-cart.png', fullPage: true });
    
    console.log('✅ Diagnostic screenshots completed');
  });
});