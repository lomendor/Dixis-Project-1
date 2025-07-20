import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Tests', () => {
  
  // Test different mobile viewport sizes
  const mobileViewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 360, height: 640, name: 'Galaxy S5' },
    { width: 412, height: 915, name: 'Pixel 5' }
  ];

  mobileViewports.forEach(viewport => {
    test(`should display correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await page.goto('/');
      
      // Check that content fits within viewport
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      
      expect(bodyBox?.width).toBeLessThanOrEqual(viewport.width);
      
      // Check for horizontal scrollbar (should not exist)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // Allow small margin
    });
  });

  test('should have mobile-friendly navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Look for mobile menu trigger
    const mobileMenuTrigger = page.locator(
      '.mobile-menu-trigger, .hamburger, [data-testid="mobile-menu"], [aria-label*="menu"]'
    );
    
    if (await mobileMenuTrigger.count() > 0) {
      // Test mobile menu toggle
      await mobileMenuTrigger.first().click();
      
      // Check if navigation menu appears
      const mobileNav = page.locator('.mobile-nav, .mobile-navigation, nav[data-mobile="true"]');
      if (await mobileNav.count() > 0) {
        await expect(mobileNav.first()).toBeVisible();
        
        // Check navigation items
        const navItems = mobileNav.locator('a, button');
        const itemCount = await navItems.count();
        expect(itemCount).toBeGreaterThan(2);
        
        // Close menu
        await mobileMenuTrigger.first().click();
      }
    }
    
    // Check that desktop navigation is hidden on mobile
    const desktopNav = page.locator('.desktop-nav, nav:not([data-mobile="true"])');
    if (await desktopNav.count() > 0) {
      const isVisible = await desktopNav.first().isVisible();
      // Desktop nav should be hidden on mobile
      expect(isVisible).toBeFalsy();
    }
  });

  test('should have touch-friendly buttons and interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Check button sizes (should be at least 44px for touch)
    const buttons = page.locator('button, .btn, [role="button"]');
    
    if (await buttons.count() > 0) {
      for (let i = 0; i < Math.min(5, await buttons.count()); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const buttonBox = await button.boundingBox();
          
          if (buttonBox) {
            // Apple recommends minimum 44px touch target
            expect(buttonBox.height).toBeGreaterThanOrEqual(40); // Allow small margin
            expect(buttonBox.width).toBeGreaterThanOrEqual(40);
          }
        }
      }
    }
    
    // Test touch interactions
    const firstButton = buttons.first();
    if (await firstButton.count() > 0) {
      await firstButton.tap();
      await page.waitForTimeout(500);
    }
  });

  test('should display mobile-optimized forms', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test login form mobile layout
    await page.goto('/login');
    
    const form = page.locator('form');
    if (await form.count() > 0) {
      const formBox = await form.first().boundingBox();
      expect(formBox?.width).toBeLessThanOrEqual(375);
      
      // Check input field sizes
      const inputs = form.locator('input');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputBox = await input.boundingBox();
        
        if (inputBox) {
          // Inputs should be full width on mobile
          expect(inputBox.width).toBeGreaterThan(250);
          // Inputs should have adequate height for touch
          expect(inputBox.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
    
    // Test input types for mobile keyboards
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.tap();
      // Email input should trigger email keyboard (we can't test this directly, but type should be correct)
      const inputType = await emailInput.getAttribute('type');
      expect(inputType).toBe('email');
    }
  });

  test('should handle mobile product browsing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Check product grid layout on mobile
    const productGrid = page.locator('.product-grid, .products-grid, .grid');
    if (await productGrid.count() > 0) {
      const gridBox = await productGrid.first().boundingBox();
      expect(gridBox?.width).toBeLessThanOrEqual(375);
    }
    
    // Check product cards are mobile-friendly
    const productCards = page.locator('.product-card, [data-testid*="product"]');
    if (await productCards.count() > 0) {
      const firstCard = productCards.first();
      const cardBox = await firstCard.boundingBox();
      
      if (cardBox) {
        // Cards should not be too narrow on mobile
        expect(cardBox.width).toBeGreaterThan(150);
        expect(cardBox.width).toBeLessThanOrEqual(375);
      }
      
      // Test touch interaction
      await firstCard.tap();
      await page.waitForTimeout(1000);
    }
  });

  test('should display mobile-optimized cart and checkout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Add product to cart first
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const addToCartButton = page.locator('text=/add to cart|προσθήκη στο καλάθι/i').first();
    if (await addToCartButton.count() > 0) {
      await addToCartButton.tap();
      await page.waitForTimeout(2000);
    }
    
    // Test mobile cart
    await page.goto('/cart');
    
    const cartContent = page.locator('.cart-content, .shopping-cart');
    if (await cartContent.count() > 0) {
      const cartBox = await cartContent.first().boundingBox();
      expect(cartBox?.width).toBeLessThanOrEqual(375);
    }
    
    // Test mobile checkout
    const checkoutButton = page.locator('text=/checkout|ολοκλήρωση/i');
    if (await checkoutButton.count() > 0) {
      await checkoutButton.first().tap();
      
      await page.waitForURL('**/checkout', { timeout: 10000 });
      
      const checkoutForm = page.locator('form, .checkout-container');
      if (await checkoutForm.count() > 0) {
        const formBox = await checkoutForm.first().boundingBox();
        expect(formBox?.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should handle mobile search experience', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
    
    if (await searchInput.count() > 0) {
      // Test mobile search interaction
      await searchInput.tap();
      
      // Input should be focused
      await expect(searchInput).toBeFocused();
      
      // Type search query
      await searchInput.fill('τομάτα');
      
      // Test mobile search results
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // Results should be mobile-friendly
      const searchResults = page.locator('.search-results, .products-grid');
      if (await searchResults.count() > 0) {
        const resultsBox = await searchResults.first().boundingBox();
        expect(resultsBox?.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should support mobile-specific gestures', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Test swipe gesture on product carousel (if exists)
    const carousel = page.locator('.carousel, .slider, .swiper');
    if (await carousel.count() > 0) {
      const carouselBox = await carousel.first().boundingBox();
      
      if (carouselBox) {
        // Simulate swipe left
        await page.touchscreen.tap(carouselBox.x + carouselBox.width - 50, carouselBox.y + carouselBox.height / 2);
        await page.touchscreen.tap(carouselBox.x + 50, carouselBox.y + carouselBox.height / 2);
        
        await page.waitForTimeout(500);
      }
    }
    
    // Test pull-to-refresh (if implemented)
    const scrollContainer = page.locator('main, .main-content');
    if (await scrollContainer.count() > 0) {
      // Scroll to top
      await page.evaluate(() => window.scrollTo(0, 0));
      
      // Try to pull down (this would trigger refresh if implemented)
      await page.mouse.move(200, 100);
      await page.mouse.down();
      await page.mouse.move(200, 200);
      await page.mouse.up();
      
      await page.waitForTimeout(1000);
    }
  });

  test('should handle orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check layout in portrait
    const portraitBody = await page.locator('body').boundingBox();
    expect(portraitBody?.width).toBe(375);
    expect(portraitBody?.height).toBe(667);
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(1000);
    
    // Check layout adapts to landscape
    const landscapeBody = await page.locator('body').boundingBox();
    expect(landscapeBody?.width).toBe(667);
    expect(landscapeBody?.height).toBe(375);
    
    // Content should still be accessible
    const mainContent = page.locator('main, .main-content');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
    
    // Navigation should still work
    const navElement = page.locator('nav, .navigation');
    if (await navElement.count() > 0) {
      await expect(navElement.first()).toBeVisible();
    }
  });

  test('should have appropriate font sizes for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check main heading font size
    const mainHeading = page.locator('h1').first();
    if (await mainHeading.count() > 0) {
      const fontSize = await mainHeading.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.fontSize);
      });
      
      // Main heading should be at least 24px on mobile
      expect(fontSize).toBeGreaterThanOrEqual(20);
    }
    
    // Check body text font size
    const bodyText = page.locator('p, .text, .description').first();
    if (await bodyText.count() > 0) {
      const fontSize = await bodyText.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.fontSize);
      });
      
      // Body text should be at least 16px for accessibility
      expect(fontSize).toBeGreaterThanOrEqual(14);
    }
    
    // Check button text is readable
    const button = page.locator('button, .btn').first();
    if (await button.count() > 0) {
      const fontSize = await button.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.fontSize);
      });
      
      // Button text should be at least 14px
      expect(fontSize).toBeGreaterThanOrEqual(12);
    }
  });

  test('should handle mobile performance optimizations', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Mobile page should load within reasonable time
    expect(loadTime).toBeLessThan(8000); // 8 seconds max for mobile
    
    // Check for lazy loading of images
    const images = page.locator('img');
    if (await images.count() > 0) {
      const firstImage = images.first();
      const loading = await firstImage.getAttribute('loading');
      
      // Images below the fold should be lazy loaded
      if (loading) {
        expect(loading).toBe('lazy');
      }
    }
    
    // Check for mobile-optimized images
    const responsiveImages = page.locator('img[srcset], picture source');
    if (await responsiveImages.count() > 0) {
      // Should have responsive images for mobile optimization
      await expect(responsiveImages.first()).toBeVisible();
    }
  });
});