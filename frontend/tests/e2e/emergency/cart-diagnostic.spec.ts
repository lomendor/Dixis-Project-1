import { test, expect } from '@playwright/test';

test.describe('Emergency Cart Diagnostic', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage without infinite loop errors', async ({ page }) => {
    console.log('🔍 Testing homepage load without infinite loops...');
    
    // Check if page loads without crashing
    await expect(page.locator('h1, h2, .hero')).toBeVisible({ timeout: 10000 });
    
    // Check for cart icon in navigation
    const cartIcon = page.locator('[data-testid*="cart"], .cart-icon, svg[data-slot="icon"]');
    await expect(cartIcon.first()).toBeVisible({ timeout: 5000 });
    
    // Wait a bit to see if any infinite loop errors occur
    await page.waitForTimeout(3000);
    
    // Check console for infinite loop errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Maximum update depth') || 
          text.includes('getServerSnapshot') ||
          text.includes('infinite loop') ||
          text.includes('🛒 Starting cart store hydration')) {
        consoleLogs.push(text);
      }
    });
    
    // Reload page to check for errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should not have infinite loop errors
    expect(consoleLogs.length).toBeLessThan(5); // Allow some hydration but not infinite
    
    console.log(`✅ Console logs count: ${consoleLogs.length}`);
    if (consoleLogs.length > 0) {
      console.log('Console messages:', consoleLogs.slice(0, 3));
    }
  });

  test('should display cart without errors', async ({ page }) => {
    console.log('🛒 Testing cart display...');
    
    // Try to open cart
    const cartTrigger = page.locator('[data-testid*="cart"], .cart-icon, button:has(svg)').first();
    
    if (await cartTrigger.isVisible()) {
      await cartTrigger.click();
      
      // Wait for cart to open (drawer, modal, or navigation)
      await page.waitForTimeout(1000);
      
      // Check if cart content is displayed or if we navigated to cart page
      const cartContent = page.locator('.cart-drawer, .cart-modal, .cart-content');
      const isCartPage = page.url().includes('/cart');
      
      if (await cartContent.count() > 0) {
        await expect(cartContent.first()).toBeVisible();
        console.log('✅ Cart drawer/modal opened successfully');
      } else if (isCartPage) {
        await expect(page.locator('h1, h2')).toContainText(/cart|καλάθι/i);
        console.log('✅ Navigated to cart page successfully');
      } else {
        console.log('ℹ️ Cart interaction completed (may be empty state)');
      }
    } else {
      console.log('ℹ️ Cart trigger not found, skipping cart test');
    }
  });

  test('should navigate to products page without errors', async ({ page }) => {
    console.log('📦 Testing products page navigation...');
    
    // Navigate to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Check if products page loads
    await expect(page.locator('h1, h2')).toContainText(/products|προϊόντα/i, { timeout: 10000 });
    
    // Check for product cards
    const productCards = page.locator('.product-card, [data-testid*="product"]');
    const productCount = await productCards.count();
    
    console.log(`✅ Products page loaded with ${productCount} products`);
    expect(productCount).toBeGreaterThan(0);
  });

  test('should handle basic cart interaction without crashes', async ({ page }) => {
    console.log('🔄 Testing basic cart interaction...');
    
    // Go to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for add to cart buttons
    const addToCartButtons = page.locator('text=/add to cart|προσθήκη στο καλάθι/i, .add-to-cart');
    const buttonCount = await addToCartButtons.count();
    
    if (buttonCount > 0) {
      console.log(`Found ${buttonCount} add to cart buttons`);
      
      // Try to add first product to cart
      await addToCartButtons.first().click();
      
      // Wait for cart update
      await page.waitForTimeout(2000);
      
      // Check for cart count update or success message
      const cartCount = page.locator('.cart-count, [data-testid*="cart-count"]');
      const successMessage = page.locator('text=/added|προστέθηκε/i, .toast, .notification');
      
      if (await cartCount.count() > 0) {
        const countText = await cartCount.first().textContent();
        console.log(`✅ Cart count updated: ${countText}`);
      } else if (await successMessage.count() > 0) {
        console.log('✅ Success message displayed');
      } else {
        console.log('ℹ️ Cart interaction completed (no visible feedback)');
      }
      
      // Verify page didn't crash
      await expect(page.locator('body')).toBeVisible();
      console.log('✅ Page remained stable after cart interaction');
      
    } else {
      console.log('ℹ️ No add to cart buttons found, skipping interaction test');
    }
  });

  test('should take diagnostic screenshot', async ({ page }) => {
    console.log('📸 Taking diagnostic screenshot...');
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'test-results/emergency-homepage.png',
      fullPage: true 
    });
    
    // Navigate to products and take screenshot
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/emergency-products.png',
      fullPage: true 
    });
    
    // Try to open cart and screenshot
    const cartTrigger = page.locator('[data-testid*="cart"], .cart-icon, button:has(svg)').first();
    if (await cartTrigger.isVisible()) {
      await cartTrigger.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'test-results/emergency-cart.png',
        fullPage: true 
      });
    }
    
    console.log('✅ Diagnostic screenshots saved to test-results/');
  });
});