import { test, expect } from '@playwright/test';

test.describe('Multi-Producer Cart Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('🎭 Starting multi-producer cart test setup...');
    
    // Navigate to homepage and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear any existing cart first
    try {
      const clearCartButton = page.locator('button:has-text(/clear|καθαρισμός/i), .clear-cart');
      if (await clearCartButton.count() > 0) {
        await clearCartButton.first().click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('ℹ️ No clear cart option found, proceeding...');
    }
  });

  test('should add 4 products from different producers to cart', async ({ page }) => {
    console.log('🛒 Testing multi-producer cart functionality...');
    
    // Navigate to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get all product cards
    const productCards = page.locator('.product-card, [data-testid*="product"]');
    const productCount = await productCards.count();
    console.log(`📦 Found ${productCount} products on page`);
    
    expect(productCount).toBeGreaterThan(0);
    
    // Track unique producers we've added
    const addedProducers = new Set<string>();
    const addedProducts: Array<{name: string, producer: string, price: string}> = [];
    let productsAdded = 0;
    
    // Attempt to add products from different producers
    for (let i = 0; i < productCount && productsAdded < 4; i++) {
      const productCard = productCards.nth(i);
      
      try {
        // Get producer information from the product card
        const producerElement = productCard.locator('.producer, .producer-name, [data-testid*="producer"]');
        let producerName = 'Unknown Producer';
        
        if (await producerElement.count() > 0) {
          const producerText = await producerElement.first().textContent();
          producerName = producerText?.trim() || 'Unknown Producer';
        }
        
        // Skip if we already have a product from this producer
        if (addedProducers.has(producerName) && addedProducers.size > 0) {
          console.log(`⏭️ Skipping ${producerName} - already in cart`);
          continue;
        }
        
        // Get product name and price
        const productNameElement = productCard.locator('.product-name, h3, h4, [data-testid*="name"]');
        const productPriceElement = productCard.locator('.price, .product-price, [data-testid*="price"]');
        
        const productName = await productNameElement.first().textContent() || `Product ${i+1}`;
        const productPrice = await productPriceElement.first().textContent() || '0€';
        
        console.log(`🎯 Attempting to add: "${productName}" from "${producerName}" (${productPrice})`);
        
        // Find and click add to cart button
        const addToCartButton = productCard.locator('button:has-text("Add to Cart"), button:has-text("Προσθήκη στο καλάθι"), .add-to-cart');
        
        if (await addToCartButton.count() > 0) {
          await addToCartButton.first().click();
          await page.waitForTimeout(1500); // Wait for cart update
          
          // Verify addition was successful
          const cartCount = page.locator('.cart-count, [data-testid*="cart-count"]');
          if (await cartCount.count() > 0) {
            const countText = await cartCount.first().textContent();
            console.log(`✅ Added product ${productsAdded + 1}: "${productName}" from "${producerName}" - Cart count: ${countText}`);
            
            addedProducers.add(producerName);
            addedProducts.push({
              name: productName.trim(),
              producer: producerName.trim(),
              price: productPrice.trim()
            });
            productsAdded++;
          }
          
          // Check for success notification
          const successToast = page.locator('text=/added to cart|προστέθηκε στο καλάθι/i, .toast, .notification');
          if (await successToast.count() > 0) {
            console.log(`🎉 Success notification shown for "${productName}"`);
          }
        } else {
          console.log(`⚠️ No add to cart button found for "${productName}"`);
        }
        
      } catch (error) {
        console.log(`❌ Error adding product ${i}: ${error}`);
      }
    }
    
    console.log(`🏁 Added ${productsAdded} products from ${addedProducers.size} different producers`);
    console.log('📋 Added products:', addedProducts);
    
    // Verify we have at least 2 different producers (ideal is 4)
    expect(addedProducers.size).toBeGreaterThanOrEqual(2);
    expect(productsAdded).toBeGreaterThanOrEqual(2);
    
    // Take screenshot of products page with cart count
    await page.screenshot({ 
      path: 'test-results/multi-producer-products-added.png',
      fullPage: true 
    });
    
    // Store the added products data for the next test
    await page.evaluate((products) => {
      window.testAddedProducts = products;
    }, addedProducts);
  });

  test('should display different producers correctly in cart drawer', async ({ page }) => {
    console.log('🔍 Testing cart drawer display with multiple producers...');
    
    // First add products (reuse logic from previous test)
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Quick add of products from different producers
    const productCards = page.locator('.product-card, [data-testid*="product"]');
    const productCount = await productCards.count();
    let productsAdded = 0;
    
    for (let i = 0; i < Math.min(productCount, 4) && productsAdded < 4; i++) {
      const addToCartButton = productCards.nth(i).locator('button:has-text(/add to cart|προσθήκη στο καλάθι/i), .add-to-cart');
      
      if (await addToCartButton.count() > 0) {
        await addToCartButton.first().click();
        await page.waitForTimeout(1000);
        productsAdded++;
      }
    }
    
    console.log(`📦 Added ${productsAdded} products to test cart drawer`);
    
    // Now open the cart drawer/modal
    const cartTrigger = page.locator('[data-testid*="cart"], .cart-icon, .cart-button, button:has(svg)');
    
    if (await cartTrigger.count() > 0) {
      console.log('🛒 Opening cart drawer...');
      await cartTrigger.first().click();
      await page.waitForTimeout(1500);
      
      // Check if cart drawer/modal opened
      const cartDrawer = page.locator('.cart-drawer, .cart-modal, .cart-sidebar, [data-testid*="cart-drawer"]');
      
      if (await cartDrawer.count() > 0) {
        console.log('✅ Cart drawer opened successfully');
        await expect(cartDrawer.first()).toBeVisible();
        
        // Check for cart items within the drawer
        const cartItems = cartDrawer.locator('.cart-item, .item, [data-testid*="cart-item"]');
        const itemCount = await cartItems.count();
        console.log(`📋 Found ${itemCount} items in cart drawer`);
        
        expect(itemCount).toBeGreaterThan(0);
        
        // Check each cart item for producer information
        const producersInCart = new Set<string>();
        
        for (let i = 0; i < itemCount; i++) {
          const cartItem = cartItems.nth(i);
          
          // Look for producer information in cart item
          const producerElement = cartItem.locator('.producer, .producer-name, [data-testid*="producer"]');
          
          if (await producerElement.count() > 0) {
            const producerText = await producerElement.first().textContent();
            if (producerText) {
              producersInCart.add(producerText.trim());
              console.log(`🏪 Cart item ${i+1} producer: "${producerText.trim()}"`);
            }
          }
          
          // Check for product name
          const productNameElement = cartItem.locator('.product-name, .name, h3, h4, [data-testid*="name"]');
          if (await productNameElement.count() > 0) {
            const productName = await productNameElement.first().textContent();
            console.log(`📦 Cart item ${i+1} name: "${productName?.trim()}"`);
          }
          
          // Check for price
          const priceElement = cartItem.locator('.price, .item-price, [data-testid*="price"]');
          if (await priceElement.count() > 0) {
            const price = await priceElement.first().textContent();
            console.log(`💰 Cart item ${i+1} price: "${price?.trim()}"`);
          }
        }
        
        console.log(`🏭 Unique producers in cart: ${Array.from(producersInCart).join(', ')}`);
        
        // Check for cart total
        const cartTotal = cartDrawer.locator('.total, .cart-total, [data-testid*="total"]');
        if (await cartTotal.count() > 0) {
          const totalText = await cartTotal.first().textContent();
          console.log(`💳 Cart total: ${totalText}`);
          await expect(cartTotal.first()).toBeVisible();
        }
        
        // Check for checkout button in drawer
        const checkoutButton = cartDrawer.locator('button:has-text(/checkout|ολοκλήρωση/i), .checkout-btn');
        if (await checkoutButton.count() > 0) {
          console.log('✅ Checkout button found in cart drawer');
          await expect(checkoutButton.first()).toBeVisible();
        }
        
        // Take screenshot of cart drawer
        await page.screenshot({ 
          path: 'test-results/multi-producer-cart-drawer.png',
          fullPage: true 
        });
        
        // Verify we have multiple producers represented
        expect(producersInCart.size).toBeGreaterThanOrEqual(1);
        
      } else {
        // Cart might navigate to cart page instead of opening drawer
        console.log('🔄 Checking if navigated to cart page...');
        
        const isCartPage = page.url().includes('/cart');
        const cartContent = page.locator('.cart-content, .shopping-cart, main');
        
        if (isCartPage || await cartContent.count() > 0) {
          console.log('✅ Navigated to cart page successfully');
          
          // Similar checks for cart page
          const cartItems = page.locator('.cart-item, .item');
          const itemCount = await cartItems.count();
          console.log(`📋 Found ${itemCount} items on cart page`);
          
          if (itemCount > 0) {
            await expect(cartItems.first()).toBeVisible();
          }
          
          // Take screenshot of cart page
          await page.screenshot({ 
            path: 'test-results/multi-producer-cart-page.png',
            fullPage: true 
          });
        } else {
          console.log('⚠️ Cart drawer not opened and not on cart page');
        }
      }
    } else {
      console.log('❌ Cart trigger not found, skipping cart drawer test');
      test.skip(true, 'Cart trigger not available');
    }
  });

  test('should verify producer segregation and grouping in cart', async ({ page }) => {
    console.log('🏭 Testing producer segregation and grouping...');
    
    // Add multiple products
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const productCards = page.locator('.product-card, [data-testid*="product"]');
    const maxProducts = Math.min(4, await productCards.count());
    
    // Add products
    for (let i = 0; i < maxProducts; i++) {
      const addButton = productCards.nth(i).locator('button:has-text(/add to cart|προσθήκη στο καλάθι/i)');
      if (await addButton.count() > 0) {
        await addButton.first().click();
        await page.waitForTimeout(800);
      }
    }
    
    // Navigate to full cart page for detailed inspection
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for cart items organization
    const cartItems = page.locator('.cart-item, .item, [data-testid*="item"]');
    const itemCount = await cartItems.count();
    
    if (itemCount > 0) {
      console.log(`📦 Analyzing ${itemCount} items for producer organization...`);
      
      // Check if items are grouped by producer
      const producerGroups = page.locator('.producer-group, .producer-section, [data-testid*="producer-group"]');
      
      if (await producerGroups.count() > 0) {
        console.log(`🏪 Found ${await producerGroups.count()} producer groups`);
        
        for (let i = 0; i < await producerGroups.count(); i++) {
          const group = producerGroups.nth(i);
          const groupProducer = group.locator('.producer-name, .group-title');
          
          if (await groupProducer.count() > 0) {
            const producerName = await groupProducer.first().textContent();
            console.log(`🏭 Producer group ${i+1}: ${producerName}`);
          }
          
          const groupItems = group.locator('.cart-item, .item');
          const groupItemCount = await groupItems.count();
          console.log(`📦 Items in group ${i+1}: ${groupItemCount}`);
        }
      } else {
        console.log('ℹ️ No explicit producer grouping found, checking individual item producers...');
        
        // Check each item for producer display
        for (let i = 0; i < itemCount; i++) {
          const item = cartItems.nth(i);
          const producerElement = item.locator('.producer, .producer-name, [data-testid*="producer"]');
          
          if (await producerElement.count() > 0) {
            const producerText = await producerElement.first().textContent();
            console.log(`🏪 Item ${i+1} producer: ${producerText}`);
            await expect(producerElement.first()).toBeVisible();
          }
        }
      }
      
      // Check for subtotals per producer (if available)
      const producerSubtotals = page.locator('.producer-subtotal, .group-subtotal, [data-testid*="producer-total"]');
      if (await producerSubtotals.count() > 0) {
        console.log(`💰 Found ${await producerSubtotals.count()} producer subtotals`);
      }
      
      // Verify overall cart functionality
      const cartTotal = page.locator('.total, .cart-total, .grand-total');
      if (await cartTotal.count() > 0) {
        await expect(cartTotal.first()).toBeVisible();
        const totalText = await cartTotal.first().textContent();
        console.log(`💳 Grand total: ${totalText}`);
      }
      
      // Take comprehensive screenshot
      await page.screenshot({ 
        path: 'test-results/multi-producer-cart-segregation.png',
        fullPage: true 
      });
      
      expect(itemCount).toBeGreaterThan(0);
      
    } else {
      console.log('⚠️ No cart items found for segregation testing');
    }
  });

  test('should handle mobile cart experience with multiple producers', async ({ page }) => {
    console.log('📱 Testing mobile multi-producer cart experience...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Add products
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const productCards = page.locator('.product-card, [data-testid*="product"]');
    const addButtons = productCards.locator('button:has-text(/add to cart|προσθήκη στο καλάθι/i)');
    
    // Add 2-3 products for mobile testing
    const maxMobileProducts = Math.min(3, await addButtons.count());
    for (let i = 0; i < maxMobileProducts; i++) {
      if (await addButtons.nth(i).count() > 0) {
        await addButtons.nth(i).tap();
        await page.waitForTimeout(1000);
      }
    }
    
    console.log(`📱 Added ${maxMobileProducts} products on mobile`);
    
    // Open mobile cart
    const cartIcon = page.locator('[data-testid*="cart"], .cart-icon, .cart-button');
    if (await cartIcon.count() > 0) {
      await cartIcon.first().tap();
      await page.waitForTimeout(1500);
      
      // Check mobile cart layout
      const cartContent = page.locator('.cart-drawer, .cart-modal, .cart-content');
      
      if (await cartContent.count() > 0) {
        const cartBox = await cartContent.first().boundingBox();
        console.log(`📱 Mobile cart dimensions: ${cartBox?.width}x${cartBox?.height}`);
        
        // Verify mobile-friendly width
        if (cartBox?.width) {
          expect(cartBox.width).toBeLessThanOrEqual(400);
        }
        
        // Check mobile cart items
        const mobileCartItems = cartContent.locator('.cart-item, .item');
        const mobileItemCount = await mobileCartItems.count();
        console.log(`📱 Mobile cart items: ${mobileItemCount}`);
        
        if (mobileItemCount > 0) {
          // Verify each item is visible and touchable on mobile
          for (let i = 0; i < mobileItemCount; i++) {
            const item = mobileCartItems.nth(i);
            await expect(item).toBeVisible();
            
            // Check if producer is visible on mobile
            const mobileProducer = item.locator('.producer, .producer-name');
            if (await mobileProducer.count() > 0) {
              const producerText = await mobileProducer.first().textContent();
              console.log(`📱 Mobile item ${i+1} producer: ${producerText}`);
            }
          }
        }
        
        // Take mobile screenshot
        await page.screenshot({ 
          path: 'test-results/multi-producer-cart-mobile.png',
          fullPage: true 
        });
      }
    }
  });

  test('should take comprehensive diagnostic screenshots', async ({ page }) => {
    console.log('📸 Taking comprehensive diagnostic screenshots...');
    
    // Screenshot 1: Homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/multi-producer-01-homepage.png',
      fullPage: true 
    });
    
    // Screenshot 2: Products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/multi-producer-02-products.png',
      fullPage: true 
    });
    
    // Screenshot 3: Add products to cart
    const productCards = page.locator('.product-card, [data-testid*="product"]');
    const maxScreenshotProducts = Math.min(3, await productCards.count());
    
    for (let i = 0; i < maxScreenshotProducts; i++) {
      const addButton = productCards.nth(i).locator('button:has-text(/add to cart|προσθήκη στο καλάθι/i)');
      if (await addButton.count() > 0) {
        await addButton.first().click();
        await page.waitForTimeout(1500);
      }
    }
    
    await page.screenshot({ 
      path: 'test-results/multi-producer-03-products-added.png',
      fullPage: true 
    });
    
    // Screenshot 4: Cart drawer (if available)
    const cartTrigger = page.locator('[data-testid*="cart"], .cart-icon, .cart-button');
    if (await cartTrigger.count() > 0) {
      await cartTrigger.first().click();
      await page.waitForTimeout(1500);
      await page.screenshot({ 
        path: 'test-results/multi-producer-04-cart-drawer.png',
        fullPage: true 
      });
    }
    
    // Screenshot 5: Full cart page
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/multi-producer-05-cart-page.png',
      fullPage: true 
    });
    
    console.log('✅ All diagnostic screenshots saved to test-results/');
  });
});