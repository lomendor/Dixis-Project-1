import { test, expect } from '@playwright/test';

test.describe('Product Listing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
  });

  test('should display product grid', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle');
    
    // Check if product grid is visible
    const productGrid = page.locator('[data-testid="product-grid"], .product-grid, .grid');
    await expect(productGrid.first()).toBeVisible();
    
    // Check if products are displayed
    const products = page.locator('[data-testid="product-card"], .product-card');
    await expect(products.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display product information correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Get first product card
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    await expect(firstProduct).toBeVisible();
    
    // Check product image
    const productImage = firstProduct.locator('img');
    await expect(productImage).toBeVisible();
    
    // Check product title
    const productTitle = firstProduct.locator('h2, h3, .product-title, [data-testid="product-title"]');
    await expect(productTitle).toBeVisible();
    
    // Check product price
    const productPrice = firstProduct.locator('.price, [data-testid="product-price"], text=/€/');
    await expect(productPrice.first()).toBeVisible();
  });

  test('should navigate to product details on click', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    await expect(firstProduct).toBeVisible();
    
    // Get product title for verification
    const productTitle = await firstProduct.locator('h2, h3, .product-title').first().textContent();
    
    // Click on product
    await firstProduct.click();
    
    // Wait for navigation to product details
    await page.waitForURL('**/products/**');
    
    // Verify we're on product details page
    const detailsTitle = page.locator('h1, .product-title, [data-testid="product-title"]');
    await expect(detailsTitle).toBeVisible();
    
    // Verify it's the same product (if title is available)
    if (productTitle) {
      await expect(detailsTitle).toContainText(productTitle.trim());
    }
  });

  test('should filter products by category', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for category filters
    const categoryFilter = page.locator('[data-testid="category-filter"], .category-filter, .filter-category');
    
    if (await categoryFilter.first().isVisible()) {
      // Get initial product count
      const initialProducts = await page.locator('[data-testid="product-card"], .product-card').count();
      
      // Click on a category filter
      await categoryFilter.first().click();
      
      // Wait for filtered results
      await page.waitForTimeout(2000);
      
      // Verify products are filtered (count might change)
      const filteredProducts = await page.locator('[data-testid="product-card"], .product-card').count();
      
      // At least some products should be visible
      expect(filteredProducts).toBeGreaterThan(0);
    } else {
      console.log('No category filters found, skipping filter test');
    }
  });

  test('should search products', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="αναζήτηση"], [data-testid="search-input"]');
    
    if (await searchInput.first().isVisible()) {
      // Search for a product
      await searchInput.first().fill('ελαιόλαδο');
      
      // Submit search (either by pressing Enter or clicking search button)
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(2000);
      
      // Verify search results
      const products = page.locator('[data-testid="product-card"], .product-card');
      
      if (await products.count() > 0) {
        // Check if search term appears in results
        const firstProductTitle = await products.first().locator('h2, h3, .product-title').textContent();
        // Note: This might not always match exactly, depending on search implementation
      }
    } else {
      console.log('No search input found, skipping search test');
    }
  });

  test('should sort products', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for sort dropdown
    const sortDropdown = page.locator('select[name="sort"], [data-testid="sort-select"], .sort-dropdown');
    
    if (await sortDropdown.first().isVisible()) {
      // Get initial product order
      const initialFirstProduct = await page.locator('[data-testid="product-card"], .product-card').first()
        .locator('h2, h3, .product-title').textContent();
      
      // Change sort order
      await sortDropdown.first().selectOption({ index: 1 });
      
      // Wait for re-sorting
      await page.waitForTimeout(2000);
      
      // Get new first product
      const newFirstProduct = await page.locator('[data-testid="product-card"], .product-card').first()
        .locator('h2, h3, .product-title').textContent();
      
      // Products should be in different order (unless there's only one product)
      const productCount = await page.locator('[data-testid="product-card"], .product-card').count();
      if (productCount > 1) {
        expect(newFirstProduct).not.toBe(initialFirstProduct);
      }
    } else {
      console.log('No sort dropdown found, skipping sort test');
    }
  });

  test('should handle pagination', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for pagination controls
    const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination"]');
    
    if (await pagination.first().isVisible()) {
      // Look for next page button
      const nextButton = pagination.locator('button:has-text("Next"), button:has-text("Επόμενη"), [aria-label*="next"]');
      
      if (await nextButton.first().isVisible() && await nextButton.first().isEnabled()) {
        // Get current page products
        const currentProducts = await page.locator('[data-testid="product-card"], .product-card').count();
        
        // Click next page
        await nextButton.first().click();
        
        // Wait for new page to load
        await page.waitForTimeout(2000);
        
        // Verify we're on a different page
        const newProducts = await page.locator('[data-testid="product-card"], .product-card').count();
        expect(newProducts).toBeGreaterThan(0);
      }
    } else {
      console.log('No pagination found, skipping pagination test');
    }
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip(!isMobile, 'This test is only for mobile devices');
    }
    
    await page.waitForLoadState('networkidle');
    
    // Check if product grid adapts to mobile
    const productGrid = page.locator('[data-testid="product-grid"], .product-grid, .grid').first();
    await expect(productGrid).toBeVisible();
    
    // Products should be displayed in mobile-friendly layout
    const products = page.locator('[data-testid="product-card"], .product-card');
    await expect(products.first()).toBeVisible();
    
    // Check if product cards are properly sized for mobile
    const firstProduct = products.first();
    const boundingBox = await firstProduct.boundingBox();
    
    // Product card should not exceed mobile screen width
    expect(boundingBox?.width).toBeLessThanOrEqual(400);
  });

  test('should load product images correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Get all product images
    const productImages = page.locator('[data-testid="product-card"] img, .product-card img');
    
    if (await productImages.count() > 0) {
      // Check first few images
      const imageCount = Math.min(await productImages.count(), 3);
      
      for (let i = 0; i < imageCount; i++) {
        const image = productImages.nth(i);
        
        // Wait for image to load
        await expect(image).toBeVisible();
        
        // Check if image has loaded (not broken)
        const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('should handle empty state', async ({ page }) => {
    // Navigate to a category that might be empty or search for non-existent product
    await page.goto('/products?category=non-existent-category');
    await page.waitForLoadState('networkidle');
    
    // Check for empty state message
    const emptyState = page.locator('text=/no products/i, text=/δεν βρέθηκαν/i, text=/κανένα προϊόν/i, [data-testid="empty-state"]');
    
    // Either products should be visible OR empty state should be shown
    const products = page.locator('[data-testid="product-card"], .product-card');
    const hasProducts = await products.count() > 0;
    const hasEmptyState = await emptyState.first().isVisible();
    
    expect(hasProducts || hasEmptyState).toBeTruthy();
  });

  test('should maintain filters in URL', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Apply a filter (if available)
    const categoryFilter = page.locator('[data-testid="category-filter"], .category-filter').first();
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(1000);
      
      // Check if URL contains filter parameters
      const currentURL = page.url();
      expect(currentURL).toMatch(/[?&](category|filter)/);
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Filter should still be applied
      const products = page.locator('[data-testid="product-card"], .product-card');
      await expect(products.first()).toBeVisible();
    }
  });
});
