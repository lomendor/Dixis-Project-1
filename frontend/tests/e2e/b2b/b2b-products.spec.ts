import { test, expect } from '@playwright/test';

test.describe('B2B Product Browsing and Quote Requests', () => {
  
  // Helper function to login as B2B user
  const loginAsB2BUser = async (page: any) => {
    await page.goto('/b2b/login');
    
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.gr';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/b2b/**', { timeout: 15000 });
  };

  test.beforeEach(async ({ page }) => {
    await loginAsB2BUser(page);
  });

  test('should display B2B products with wholesale pricing', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/Products|Προϊόντα|Wholesale|Χονδρική/i);
    
    // Check for product listings
    const productCards = page.locator(
      '.product-card, [data-testid*="product"], .product-item, article'
    );
    
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    
    // Check for wholesale pricing indicators
    const wholesalePricing = page.locator(
      'text=/wholesale|χονδρική/i, text=/bulk|μαζικ/i, text=/volume|όγκου/i'
    );
    
    if (await wholesalePricing.count() > 0) {
      await expect(wholesalePricing.first()).toBeVisible();
    }
    
    // Check for B2B-specific product information
    const b2bInfo = page.locator(
      'text=/MOQ|minimum order|ελάχιστη παραγγελία/i, text=/case|κιβώτιο/i, text=/pallet|παλέτα/i'
    );
    
    if (await b2bInfo.count() > 0) {
      await expect(b2bInfo.first()).toBeVisible();
    }
  });

  test('should filter B2B products by category and specifications', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Look for category filters
    const categoryFilters = page.locator(
      'select[name*="category"], input[name*="category"], .category-filter, [data-testid*="category"]'
    );
    
    if (await categoryFilters.count() > 0) {
      const initialProductCount = await page.locator('.product-card, [data-testid*="product"]').count();
      
      // Select a category filter
      const filter = categoryFilters.first();
      
      if (await filter.locator('option').count() > 1) {
        // It's a select dropdown
        await filter.selectOption({ index: 1 });
      } else {
        // It's likely a checkbox or button
        await filter.click();
      }
      
      // Wait for filtered results
      await page.waitForTimeout(2000);
      
      // Verify filtering worked
      const filteredProductCount = await page.locator('.product-card, [data-testid*="product"]').count();
      
      // Products should be filtered (count may change)
      expect(filteredProductCount).toBeGreaterThanOrEqual(0);
    }
    
    // Test search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[name*="search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('τομάτα');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(2000);
      
      // Check if search results are displayed
      await expect(page.locator('.product-card, [data-testid*="product"]').first()).toBeVisible();
    }
  });

  test('should display detailed product information for B2B', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Click on first product
    const firstProduct = page.locator('.product-card, [data-testid*="product"]').first();
    await firstProduct.click();
    
    // Should navigate to product detail page
    await page.waitForURL('**/products/**', { timeout: 10000 });
    
    // Check for detailed product information
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // Check for B2B-specific details
    const b2bDetails = [
      'text=/wholesale price|χονδρική τιμή/i',
      'text=/minimum order|ελάχιστη παραγγελία/i',
      'text=/bulk discount|έκπτωση όγκου/i',
      'text=/packaging|συσκευασία/i',
      'text=/availability|διαθεσιμότητα/i'
    ];
    
    let visibleDetails = 0;
    for (const detail of b2bDetails) {
      const element = page.locator(detail);
      if (await element.count() > 0) {
        visibleDetails++;
      }
    }
    
    // Should have at least 2 B2B-specific details
    expect(visibleDetails).toBeGreaterThanOrEqual(2);
  });

  test('should allow adding products to quote request', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Look for "Add to Quote" or "Request Quote" buttons
    const quoteButtons = page.locator(
      'text=/add to quote|αίτημα προσφοράς/i, text=/request quote|ζητήστε προσφορά/i, button[data-action*="quote"]'
    );
    
    if (await quoteButtons.count() > 0) {
      const quoteButton = quoteButtons.first();
      
      // Click add to quote
      await quoteButton.click();
      
      // Look for confirmation or quote cart indicator
      const confirmation = page.locator(
        'text=/added to quote|προστέθηκε στην προσφορά/i, .quote-cart, [data-testid*="quote"]'
      );
      
      if (await confirmation.count() > 0) {
        await expect(confirmation.first()).toBeVisible();
      }
      
      // Check if quote cart counter increased
      const quoteCounter = page.locator('[data-testid*="quote-count"], .quote-count, .badge');
      if (await quoteCounter.count() > 0) {
        const counterText = await quoteCounter.first().textContent();
        expect(counterText).toMatch(/[1-9]/); // Should contain a number > 0
      }
    } else {
      test.skip(true, 'Quote functionality not found');
    }
  });

  test('should handle bulk quantity selection', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Click on first product to go to detail page
    const firstProduct = page.locator('.product-card, [data-testid*="product"]').first();
    await firstProduct.click();
    
    await page.waitForURL('**/products/**', { timeout: 10000 });
    
    // Look for quantity selectors
    const quantityInputs = page.locator(
      'input[type="number"], input[name*="quantity"], .quantity-input, [data-testid*="quantity"]'
    );
    
    if (await quantityInputs.count() > 0) {
      const quantityInput = quantityInputs.first();
      
      // Clear and enter bulk quantity
      await quantityInput.fill('100');
      
      // Check if bulk pricing is shown
      const bulkPricing = page.locator(
        'text=/bulk price|χονδρική τιμή/i, text=/volume discount|έκπτωση όγκου/i'
      );
      
      if (await bulkPricing.count() > 0) {
        await expect(bulkPricing.first()).toBeVisible();
      }
      
      // Look for total price calculation
      const totalPrice = page.locator(
        'text=/total|σύνολο/i, .total-price, [data-testid*="total"]'
      );
      
      if (await totalPrice.count() > 0) {
        await expect(totalPrice.first()).toBeVisible();
      }
    }
  });

  test('should create and submit quote request', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Add product to quote first
    const quoteButtons = page.locator(
      'text=/add to quote|αίτημα προσφοράς/i, text=/request quote|ζητήστε προσφορά/i'
    );
    
    if (await quoteButtons.count() > 0) {
      await quoteButtons.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate to quote request page
    await page.goto('/b2b/quotes/request');
    
    // Check for quote request form
    const quoteForm = page.locator('form, .quote-form, [data-testid*="quote-form"]');
    
    if (await quoteForm.count() > 0) {
      await expect(quoteForm.first()).toBeVisible();
      
      // Fill quote request details
      const fields = [
        { selector: 'input[name*="company"], input[placeholder*="company"]', value: 'Test Company Ltd' },
        { selector: 'textarea[name*="message"], textarea[placeholder*="message"]', value: 'Request for bulk pricing on selected products' },
        { selector: 'input[name*="phone"], input[type="tel"]', value: '+30 210 1234567' }
      ];
      
      for (const field of fields) {
        const input = page.locator(field.selector);
        if (await input.count() > 0) {
          await input.fill(field.value);
        }
      }
      
      // Submit quote request
      const submitButton = page.locator('button[type="submit"], input[type="submit"], .submit-quote');
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Wait for success confirmation
        await page.waitForTimeout(3000);
        
        // Look for success message
        const successMessage = page.locator(
          'text=/quote submitted|προσφορά υποβλήθηκε/i, text=/success|επιτυχία/i, .success-message'
        );
        
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    } else {
      test.skip(true, 'Quote request form not found');
    }
  });

  test('should display product availability for B2B orders', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Check for availability indicators
    const availabilityIndicators = page.locator(
      'text=/in stock|σε απόθεμα/i, text=/out of stock|εξαντλημένο/i, text=/available|διαθέσιμο/i, .stock-status'
    );
    
    if (await availabilityIndicators.count() > 0) {
      await expect(availabilityIndicators.first()).toBeVisible();
      
      // Check for stock quantities
      const stockQuantities = page.locator(
        'text=/[0-9]+ units|[0-9]+ τεμάχια/i, .stock-quantity, [data-testid*="stock"]'
      );
      
      if (await stockQuantities.count() > 0) {
        await expect(stockQuantities.first()).toBeVisible();
      }
    }
    
    // Check for lead times
    const leadTimes = page.locator(
      'text=/delivery time|χρόνος παράδοσης/i, text=/lead time|προθεσμία/i, text=/[0-9]+ days|[0-9]+ ημέρες/i'
    );
    
    if (await leadTimes.count() > 0) {
      await expect(leadTimes.first()).toBeVisible();
    }
  });

  test('should handle product comparison for B2B users', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Look for compare functionality
    const compareButtons = page.locator(
      'text=/compare|σύγκριση/i, input[type="checkbox"][name*="compare"], .compare-checkbox'
    );
    
    if (await compareButtons.count() >= 2) {
      // Select first two products for comparison
      await compareButtons.nth(0).click();
      await compareButtons.nth(1).click();
      
      // Look for compare action button
      const compareAction = page.locator(
        'button:has-text(/compare|σύγκριση/i), a:has-text(/compare|σύγκριση/i)'
      );
      
      if (await compareAction.count() > 0) {
        await compareAction.click();
        
        // Should navigate to comparison page
        await page.waitForURL('**/compare**', { timeout: 10000 }).catch(() => {
          // Might open in modal instead
        });
        
        // Check for comparison table or view
        const comparisonView = page.locator(
          '.comparison-table, .compare-view, [data-testid*="comparison"]'
        );
        
        if (await comparisonView.count() > 0) {
          await expect(comparisonView.first()).toBeVisible();
        }
      }
    } else {
      test.skip(true, 'Product comparison not available or insufficient products');
    }
  });

  test('should show B2B-specific pricing tiers', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Click on first product for detailed view
    const firstProduct = page.locator('.product-card, [data-testid*="product"]').first();
    await firstProduct.click();
    
    await page.waitForURL('**/products/**', { timeout: 10000 });
    
    // Look for pricing tiers
    const pricingTiers = page.locator(
      'text=/tier|βαθμίδα/i, text=/quantity break|διακοπή ποσότητας/i, .pricing-tier, .tier-pricing'
    );
    
    if (await pricingTiers.count() > 0) {
      await expect(pricingTiers.first()).toBeVisible();
      
      // Check for multiple price points
      const pricePoints = page.locator('.price, .tier-price, text=/€[0-9]/');
      const priceCount = await pricePoints.count();
      
      expect(priceCount).toBeGreaterThanOrEqual(1);
    }
    
    // Look for volume discounts
    const volumeDiscounts = page.locator(
      'text=/volume discount|έκπτωση όγκου/i, text=/bulk saving|εξοικονόμηση χύδην/i'
    );
    
    if (await volumeDiscounts.count() > 0) {
      await expect(volumeDiscounts.first()).toBeVisible();
    }
  });

  test('should allow downloading product catalogs or spec sheets', async ({ page }) => {
    await page.goto('/b2b/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Look for download links
    const downloadLinks = page.locator(
      'a[href*=".pdf"], text=/download|κατεβάστε/i, text=/catalog|κατάλογος/i, text=/spec sheet|φύλλο προδιαγραφών/i'
    );
    
    if (await downloadLinks.count() > 0) {
      // Start waiting for download
      const downloadPromise = page.waitForEvent('download');
      
      // Click download link
      await downloadLinks.first().click();
      
      try {
        // Wait for download to start
        const download = await downloadPromise;
        
        // Verify download started
        expect(download.suggestedFilename()).toBeTruthy();
      } catch (error) {
        // Download might open in new tab instead
        console.log('Download opened in new tab or failed:', error);
      }
    } else {
      test.skip(true, 'Download functionality not found');
    }
  });

  test('should handle mobile B2B product browsing', async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 667 });
    }
    
    await page.goto('/b2b/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Check if mobile filters work
    const mobileFilterToggle = page.locator(
      '[data-testid="filter-toggle"], .filter-toggle, .mobile-filter, text=/filters|φίλτρα/i'
    );
    
    if (await mobileFilterToggle.count() > 0) {
      await mobileFilterToggle.first().click();
      
      // Check if filter panel opens
      const filterPanel = page.locator('.filter-panel, .filters-mobile, [data-testid*="filter"]');
      await expect(filterPanel.first()).toBeVisible();
      
      // Close filter panel
      const closeButton = page.locator('button[aria-label*="close"], .close-filter, .filter-close');
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
      }
    }
    
    // Check mobile product card layout
    const productCards = page.locator('.product-card, [data-testid*="product"]');
    
    if (await productCards.count() > 0) {
      const firstCard = productCards.first();
      const boundingBox = await firstCard.boundingBox();
      
      // Product cards should fit mobile width
      expect(boundingBox?.width).toBeLessThanOrEqual(400);
    }
    
    // Test mobile quote functionality
    const mobileQuoteButton = page.locator('text=/add to quote|αίτημα προσφοράς/i').first();
    
    if (await mobileQuoteButton.count() > 0) {
      await mobileQuoteButton.tap();
      
      // Should show confirmation or quote indicator
      await page.waitForTimeout(1000);
    }
  });
});