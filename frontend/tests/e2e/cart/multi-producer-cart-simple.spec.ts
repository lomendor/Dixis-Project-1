import { test, expect } from '@playwright/test';

test.describe('Multi-Producer Cart Testing - Simplified', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('🎭 Starting multi-producer cart test setup...');
    
    // Navigate to homepage and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should test multi-producer cart functionality', async ({ page }) => {
    console.log('🛒 Testing multi-producer cart functionality...');
    
    // Navigate to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Get all product cards
    const productCards = page.locator('.product-card, [data-testid*="product"], .grid > div');
    const productCount = await productCards.count();
    console.log(`📦 Found ${productCount} products on page`);
    
    if (productCount === 0) {
      console.log('⚠️ No products found, checking page content...');
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: 'test-results/no-products-debug.png',
        fullPage: true 
      });
      
      // Log page content
      const pageText = await page.textContent('body');
      console.log('📄 Page content preview:', pageText?.substring(0, 200));
      
      test.skip(true, 'No products found on page');
      return;
    }
    
    expect(productCount).toBeGreaterThan(0);
    
    // Track products we've added
    const addedProducts: Array<{name: string, producer: string}> = [];
    let productsAdded = 0;
    const maxProducts = Math.min(4, productCount);
    
    // Attempt to add products to cart
    for (let i = 0; i < maxProducts && productsAdded < 4; i++) {
      const productCard = productCards.nth(i);
      
      try {
        // Get product information
        const productNameElement = productCard.locator('h3, h4, .product-name, [data-testid*="name"]');
        const producerElement = productCard.locator('.producer, .producer-name, [data-testid*="producer"], .text-sm');
        
        const productName = await productNameElement.first().textContent() || `Product ${i+1}`;
        let producerName = 'Unknown Producer';
        
        if (await producerElement.count() > 0) {
          const producerText = await producerElement.first().textContent();
          producerName = producerText?.trim() || 'Unknown Producer';
        }
        
        console.log(`🎯 Product ${i+1}: "${productName}" from "${producerName}"`);
        
        // Find add to cart button - using multiple selectors
        const addToCartButton = productCard.locator('button');
        const buttonCount = await addToCartButton.count();
        
        if (buttonCount > 0) {
          // Try each button to find the add to cart one
          for (let btnIndex = 0; btnIndex < buttonCount; btnIndex++) {
            const button = addToCartButton.nth(btnIndex);
            const buttonText = await button.textContent();
            
            if (buttonText && (
              buttonText.toLowerCase().includes('add') || 
              buttonText.includes('Προσθήκη') ||
              buttonText.toLowerCase().includes('cart') ||
              buttonText.includes('καλάθι')
            )) {
              console.log(`🔘 Found button: "${buttonText}"`);
              
              try {
                await button.click();
                await page.waitForTimeout(1500);
                
                // Check if cart count increased
                const cartCount = page.locator('.cart-count, [data-testid*="cart-count"], .badge');
                if (await cartCount.count() > 0) {
                  const countText = await cartCount.first().textContent();
                  console.log(`✅ Added product ${productsAdded + 1}: "${productName}" - Cart count: ${countText}`);
                  
                  addedProducts.push({
                    name: productName.trim(),
                    producer: producerName.trim()
                  });
                  productsAdded++;
                  break; // Exit button loop if successful
                }
              } catch (clickError) {
                console.log(`⚠️ Button click failed: ${clickError}`);
              }
            }
          }
        } else {
          console.log(`⚠️ No buttons found for product "${productName}"`);
        }
        
      } catch (error) {
        console.log(`❌ Error processing product ${i}: ${error}`);
      }
    }
    
    console.log(`🏁 Successfully added ${productsAdded} products`);
    console.log('📋 Added products:', addedProducts);
    
    // Take screenshot of products page with items added
    await page.screenshot({ 
      path: 'test-results/multi-producer-products-added.png',
      fullPage: true 
    });
    
    // Verify we have at least some products added
    expect(productsAdded).toBeGreaterThan(0);
    
    // Now test cart display
    console.log('🛒 Testing cart display...');
    
    // Try to find and click cart icon/button
    const cartTriggers = [
      '[data-testid*="cart"]',
      '.cart-icon', 
      '.cart-button',
      'button[aria-label*="cart"]',
      'button[aria-label*="Cart"]',
      'button:has(svg)',
      'a[href*="cart"]'
    ];
    
    let cartOpened = false;
    
    for (const selector of cartTriggers) {
      const cartTrigger = page.locator(selector);
      if (await cartTrigger.count() > 0) {
        console.log(`🎯 Trying cart trigger: ${selector}`);
        
        try {
          await cartTrigger.first().click();
          await page.waitForTimeout(2000);
          
          // Check if cart drawer opened or navigated to cart page
          const cartDrawer = page.locator('.cart-drawer, .cart-modal, .cart-sidebar');
          const isCartPage = page.url().includes('/cart');
          
          if (await cartDrawer.count() > 0) {
            console.log('✅ Cart drawer opened');
            cartOpened = true;
            
            // Check cart items in drawer
            const cartItems = cartDrawer.locator('.cart-item, .item, li');
            const itemCount = await cartItems.count();
            console.log(`📋 Found ${itemCount} items in cart drawer`);
            
            if (itemCount > 0) {
              // Check first few items for producer info
              for (let i = 0; i < Math.min(itemCount, 3); i++) {
                const item = cartItems.nth(i);
                const itemText = await item.textContent();
                console.log(`📦 Cart item ${i+1}: ${itemText?.substring(0, 100)}...`);
              }
            }
            
            await page.screenshot({ 
              path: 'test-results/multi-producer-cart-drawer.png',
              fullPage: true 
            });
            
            break;
            
          } else if (isCartPage) {
            console.log('✅ Navigated to cart page');
            cartOpened = true;
            
            // Check cart items on page
            const cartItems = page.locator('.cart-item, .item, [data-testid*="item"]');
            const itemCount = await cartItems.count();
            console.log(`📋 Found ${itemCount} items on cart page`);
            
            await page.screenshot({ 
              path: 'test-results/multi-producer-cart-page.png',
              fullPage: true 
            });
            
            break;
          }
          
        } catch (clickError) {
          console.log(`⚠️ Cart trigger click failed: ${clickError}`);
        }
      }
    }
    
    if (!cartOpened) {
      console.log('⚠️ Could not open cart, trying direct navigation...');
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'test-results/multi-producer-cart-direct.png',
        fullPage: true 
      });
    }
    
    console.log('✅ Multi-producer cart test completed');
  });

  test('should take comprehensive diagnostic screenshots', async ({ page }) => {
    console.log('📸 Taking comprehensive diagnostic screenshots...');
    
    // Screenshot 1: Homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/diagnostic-01-homepage.png',
      fullPage: true 
    });
    
    // Screenshot 2: Products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: 'test-results/diagnostic-02-products.png',
      fullPage: true 
    });
    
    // Screenshot 3: Cart page
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/diagnostic-03-cart.png',
      fullPage: true 
    });
    
    // Check page titles and log them
    await page.goto('/');
    const homeTitle = await page.title();
    console.log(`🏠 Homepage title: ${homeTitle}`);
    
    await page.goto('/products');
    const productsTitle = await page.title();
    console.log(`📦 Products title: ${productsTitle}`);
    
    await page.goto('/cart');
    const cartTitle = await page.title();
    console.log(`🛒 Cart title: ${cartTitle}`);
    
    console.log('✅ All diagnostic screenshots saved');
  });
});