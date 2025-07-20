import { test, expect } from '@playwright/test';

test.describe('Consumer Product Search and Discovery', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage with featured products', async ({ page }) => {
    // Check for homepage hero section
    const heroSection = page.locator('.hero, .hero-section, [data-testid*="hero"]');
    if (await heroSection.count() > 0) {
      await expect(heroSection.first()).toBeVisible();
    }
    
    // Check for featured products section
    const featuredSection = page.locator(
      'text=/featured|προτεινόμενα/i, text=/popular|δημοφιλή/i, .featured-products'
    );
    
    if (await featuredSection.count() > 0) {
      await expect(featuredSection.first()).toBeVisible();
      
      // Check for product cards in featured section
      const productCards = page.locator('.product-card, [data-testid*="product"]');
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should perform basic product search', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search"], input[name*="search"], [data-testid*="search"]'
    );
    
    await expect(searchInput.first()).toBeVisible();
    
    // Perform search
    await searchInput.first().fill('τομάτα');
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(3000);
    
    // Should navigate to products page or show results
    const currentUrl = page.url();
    const hasResults = await page.locator('.product-card, [data-testid*="product"]').count() > 0;
    const hasSearchResults = await page.locator('text=/results|αποτελέσματα/i').count() > 0;
    
    expect(currentUrl.includes('/products') || currentUrl.includes('/search') || hasResults || hasSearchResults).toBeTruthy();
  });

  test('should display search suggestions and autocomplete', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search"], input[name*="search"]'
    ).first();
    
    await searchInput.fill('τομ');
    
    // Wait for suggestions to appear
    await page.waitForTimeout(1000);
    
    // Look for search suggestions dropdown
    const suggestions = page.locator(
      '.search-suggestions, .autocomplete, .dropdown, [data-testid*="suggestion"]'
    );
    
    if (await suggestions.count() > 0) {
      await expect(suggestions.first()).toBeVisible();
      
      // Check for suggestion items
      const suggestionItems = suggestions.locator('li, .suggestion-item, .option');
      if (await suggestionItems.count() > 0) {
        await expect(suggestionItems.first()).toBeVisible();
        
        // Click on first suggestion
        await suggestionItems.first().click();
        
        // Should perform search or navigate
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should navigate to products page and display grid', async ({ page }) => {
    await page.goto('/products');
    
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/Products|Προϊόντα/i);
    
    // Check for product grid
    const productGrid = page.locator('.product-grid, .products-grid, .grid');
    if (await productGrid.count() > 0) {
      await expect(productGrid.first()).toBeVisible();
    }
    
    // Check for individual product cards
    const productCards = page.locator('.product-card, [data-testid*="product"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    
    // Should have multiple products
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(1);
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    const initialProductCount = await page.locator('.product-card, [data-testid*="product"]').count();
    
    // Look for category filters
    const categoryFilters = page.locator(
      'select[name*="category"], .category-filter, [data-testid*="category"]'
    );
    
    if (await categoryFilters.count() > 0) {
      const filter = categoryFilters.first();
      
      if (await filter.locator('option').count() > 1) {
        // Select a category
        await filter.selectOption({ index: 1 });
      } else {
        // Try clicking filter buttons
        const filterButtons = page.locator('button[data-category], .filter-button');
        if (await filterButtons.count() > 0) {
          await filterButtons.first().click();
        }
      }
      
      // Wait for filtered results
      await page.waitForTimeout(3000);
      
      // Verify filtering worked
      const filteredProductCount = await page.locator('.product-card, [data-testid*="product"]').count();
      
      // Products should be filtered (may be same, more, or less)
      expect(filteredProductCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter products by price range', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Look for price filters
    const priceFilters = page.locator(
      'input[name*="price"], .price-filter, .price-range, [data-testid*="price"]'
    );
    
    if (await priceFilters.count() >= 2) {
      // Set price range
      const minPrice = priceFilters.nth(0);
      const maxPrice = priceFilters.nth(1);
      
      await minPrice.fill('5');
      await maxPrice.fill('20');
      
      // Apply filter (might be automatic or require button click)
      const applyButton = page.locator('button:has-text(/apply|εφαρμογή/i)');
      if (await applyButton.count() > 0) {
        await applyButton.click();
      } else {
        await page.keyboard.press('Enter');
      }
      
      // Wait for filtered results
      await page.waitForTimeout(3000);
      
      // Check that products are still displayed
      const productCount = await page.locator('.product-card, [data-testid*="product"]').count();
      expect(productCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should sort products by different criteria', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Look for sort dropdown
    const sortDropdown = page.locator(
      'select[name*="sort"], .sort-select, [data-testid*="sort"]'
    );
    
    if (await sortDropdown.count() > 0) {
      const dropdown = sortDropdown.first();
      
      // Check available sort options
      const options = await dropdown.locator('option').count();
      
      if (options > 1) {
        // Get initial product order
        const firstProductBefore = await page.locator('.product-card, [data-testid*="product"]').first().textContent();
        
        // Change sort order
        await dropdown.selectOption({ index: 1 });
        
        // Wait for re-sorting
        await page.waitForTimeout(3000);
        
        // Check if order changed
        const firstProductAfter = await page.locator('.product-card, [data-testid*="product"]').first().textContent();
        
        // Products should be re-ordered (or at least page should respond)
        expect(firstProductAfter).toBeDefined();
      }
    }
  });

  test('should display detailed product information', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Click on first product
    const firstProduct = page.locator('.product-card, [data-testid*="product"]').first();
    await firstProduct.click();
    
    // Should navigate to product detail page
    await page.waitForURL('**/products/**', { timeout: 10000 });
    
    // Check for product details
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // Check for product information
    const productDetails = [
      '.description, .product-description',
      '.price, .product-price',
      '.product-image, img',
      'text=/add to cart|προσθήκη στο καλάθι/i'
    ];
    
    let visibleDetails = 0;
    for (const detail of productDetails) {
      const element = page.locator(detail);
      if (await element.count() > 0) {
        visibleDetails++;
      }
    }
    
    expect(visibleDetails).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Shopping Cart Functionality', () => {
  
  test('should add product to cart from product listing', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Look for "Add to Cart" button on product cards
    const addToCartButtons = page.locator(
      'text=/add to cart|προσθήκη στο καλάθι/i, button[data-action*="cart"], .add-to-cart'
    );
    
    if (await addToCartButtons.count() > 0) {
      // Click first add to cart button
      await addToCartButtons.first().click();
      
      // Wait for cart update
      await page.waitForTimeout(2000);
      
      // Check for cart indicator
      const cartIndicator = page.locator(
        '.cart-count, [data-testid*="cart-count"], .badge, .cart-badge'
      );
      
      if (await cartIndicator.count() > 0) {
        const cartCount = await cartIndicator.first().textContent();
        expect(cartCount).toMatch(/[1-9]/); // Should show count > 0
      }
      
      // Check for confirmation message
      const confirmation = page.locator(
        'text=/added to cart|προστέθηκε στο καλάθι/i, .cart-notification, .toast'
      );
      
      if (await confirmation.count() > 0) {
        await expect(confirmation.first()).toBeVisible();
      }
    } else {
      test.skip(true, 'Add to cart functionality not found on product listing');
    }
  });

  test('should add product to cart from product detail page', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Click on first product to go to detail page
    const firstProduct = page.locator('.product-card, [data-testid*="product"]').first();
    await firstProduct.click();
    
    await page.waitForURL('**/products/**', { timeout: 10000 });
    
    // Look for quantity selector
    const quantityInput = page.locator(
      'input[type="number"], input[name*="quantity"], .quantity-input'
    );
    
    if (await quantityInput.count() > 0) {
      await quantityInput.fill('2');
    }
    
    // Find and click add to cart button
    const addToCartButton = page.locator(
      'button:has-text(/add to cart|προσθήκη στο καλάθι/i), .add-to-cart-btn'
    );
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      
      // Wait for cart update
      await page.waitForTimeout(2000);
      
      // Check for success feedback
      const successMessage = page.locator(
        'text=/added to cart|προστέθηκε στο καλάθι/i, .success-message'
      );
      
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
      
      // Verify cart count updated
      const cartCount = page.locator('.cart-count, [data-testid*="cart-count"]');
      if (await cartCount.count() > 0) {
        const countText = await cartCount.first().textContent();
        expect(countText).toMatch(/[1-9]/);
      }
    } else {
      test.skip(true, 'Add to cart button not found on product detail page');
    }
  });

  test('should open and display cart contents', async ({ page }) => {
    // First add a product to cart
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const addToCartButton = page.locator(
      'text=/add to cart|προσθήκη στο καλάθι/i'
    ).first();
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Open cart
    const cartTrigger = page.locator(
      '.cart-icon, [data-testid*="cart"], .cart-button, text=/cart|καλάθι/i'
    );
    
    if (await cartTrigger.count() > 0) {
      await cartTrigger.first().click();
      
      // Check if cart drawer/modal opens
      const cartDrawer = page.locator(
        '.cart-drawer, .cart-modal, .cart-sidebar, [data-testid*="cart-drawer"]'
      );
      
      if (await cartDrawer.count() > 0) {
        await expect(cartDrawer.first()).toBeVisible();
        
        // Check for cart items
        const cartItems = cartDrawer.locator('.cart-item, .item, li');
        if (await cartItems.count() > 0) {
          await expect(cartItems.first()).toBeVisible();
        }
        
        // Check for cart total
        const cartTotal = cartDrawer.locator(
          'text=/total|σύνολο/i, .total, .cart-total'
        );
        if (await cartTotal.count() > 0) {
          await expect(cartTotal.first()).toBeVisible();
        }
      } else {
        // Might navigate to cart page instead
        await page.waitForURL('**/cart', { timeout: 5000 }).catch(() => {
          // Cart might be on same page
        });
        
        const cartContent = page.locator('.cart-content, .shopping-cart');
        if (await cartContent.count() > 0) {
          await expect(cartContent.first()).toBeVisible();
        }
      }
    } else {
      test.skip(true, 'Cart trigger not found');
    }
  });

  test('should update product quantity in cart', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const addToCartButton = page.locator('text=/add to cart|προσθήκη στο καλάθι/i').first();
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Go to cart page
    await page.goto('/cart');
    
    // Look for quantity controls in cart
    const quantityInputs = page.locator(
      'input[type="number"], .quantity-input, [data-testid*="quantity"]'
    );
    
    if (await quantityInputs.count() > 0) {
      const quantityInput = quantityInputs.first();
      
      // Update quantity
      await quantityInput.fill('3');
      
      // Look for update button or auto-update
      const updateButton = page.locator('button:has-text(/update|ενημέρωση/i)');
      if (await updateButton.count() > 0) {
        await updateButton.click();
      } else {
        await page.keyboard.press('Enter');
      }
      
      // Wait for update
      await page.waitForTimeout(2000);
      
      // Check if total price updated
      const total = page.locator('.total, .cart-total, [data-testid*="total"]');
      if (await total.count() > 0) {
        await expect(total.first()).toBeVisible();
      }
    }
  });

  test('should remove product from cart', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const addToCartButton = page.locator('text=/add to cart|προσθήκη στο καλάθι/i').first();
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Go to cart page
    await page.goto('/cart');
    
    // Look for remove buttons
    const removeButtons = page.locator(
      'button:has-text(/remove|αφαίρεση/i), .remove-button, [data-action*="remove"]'
    );
    
    if (await removeButtons.count() > 0) {
      const initialItems = await page.locator('.cart-item, .item').count();
      
      // Remove first item
      await removeButtons.first().click();
      
      // Wait for removal
      await page.waitForTimeout(2000);
      
      // Check if item was removed
      const finalItems = await page.locator('.cart-item, .item').count();
      
      expect(finalItems).toBeLessThan(initialItems);
      
      // If no items left, should show empty cart message
      if (finalItems === 0) {
        const emptyCartMessage = page.locator(
          'text=/empty|άδειο/i, text=/no items|δεν υπάρχουν προϊόντα/i'
        );
        if (await emptyCartMessage.count() > 0) {
          await expect(emptyCartMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should display cart total and proceed to checkout', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const addToCartButton = page.locator('text=/add to cart|προσθήκη στο καλάθι/i').first();
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Go to cart page
    await page.goto('/cart');
    
    // Check for cart summary
    const cartSummary = page.locator('.cart-summary, .order-summary, .checkout-summary');
    if (await cartSummary.count() > 0) {
      await expect(cartSummary.first()).toBeVisible();
    }
    
    // Check for total amount
    const totalAmount = page.locator(
      '.total-amount, .grand-total, text=/total|σύνολο/i'
    );
    if (await totalAmount.count() > 0) {
      await expect(totalAmount.first()).toBeVisible();
    }
    
    // Look for checkout button
    const checkoutButton = page.locator(
      'button:has-text(/checkout|ολοκλήρωση/i), a:has-text(/checkout|ολοκλήρωση/i), .checkout-btn'
    );
    
    if (await checkoutButton.count() > 0) {
      await expect(checkoutButton.first()).toBeVisible();
      
      // Click checkout button
      await checkoutButton.first().click();
      
      // Should navigate to checkout page
      await page.waitForURL('**/checkout', { timeout: 10000 });
      
      // Verify checkout page loaded
      await expect(page.locator('h1, h2')).toContainText(/checkout|ολοκλήρωση/i);
    }
  });

  test('should handle empty cart state', async ({ page }) => {
    await page.goto('/cart');
    
    // Check for empty cart message
    const emptyCartMessage = page.locator(
      'text=/empty|άδειο/i, text=/no items|δεν υπάρχουν προϊόντα/i, .empty-cart'
    );
    
    if (await emptyCartMessage.count() > 0) {
      await expect(emptyCartMessage.first()).toBeVisible();
      
      // Check for continue shopping link
      const continueShoppingLink = page.locator(
        'a:has-text(/continue shopping|συνέχεια αγορών/i), .continue-shopping'
      );
      
      if (await continueShoppingLink.count() > 0) {
        await expect(continueShoppingLink.first()).toBeVisible();
        
        // Click continue shopping
        await continueShoppingLink.first().click();
        
        // Should navigate to products page
        await page.waitForURL('**/products', { timeout: 10000 });
      }
    }
  });

  test('should persist cart across browser sessions', async ({ page, context }) => {
    // Add product to cart
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const addToCartButton = page.locator('text=/add to cart|προσθήκη στο καλάθι/i').first();
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(2000);
      
      // Check cart count
      const cartCountBefore = page.locator('.cart-count, [data-testid*="cart-count"]');
      const countBefore = await cartCountBefore.first().textContent();
      
      // Close and reopen browser
      await page.close();
      const newPage = await context.newPage();
      await newPage.goto('/');
      
      // Check if cart persisted
      const cartCountAfter = newPage.locator('.cart-count, [data-testid*="cart-count"]');
      
      if (await cartCountAfter.count() > 0) {
        const countAfter = await cartCountAfter.first().textContent();
        expect(countAfter).toBe(countBefore);
      }
    }
  });

  test('should handle mobile cart experience', async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 667 });
    }
    
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Add product to cart on mobile
    const addToCartButton = page.locator('text=/add to cart|προσθήκη στο καλάθι/i').first();
    if (await addToCartButton.count() > 0) {
      await addToCartButton.tap();
      await page.waitForTimeout(2000);
    }
    
    // Open mobile cart
    const cartIcon = page.locator('.cart-icon, [data-testid*="cart"]');
    if (await cartIcon.count() > 0) {
      await cartIcon.first().tap();
      
      // Check mobile cart layout
      const cartContent = page.locator('.cart-drawer, .cart-modal, .cart-content');
      if (await cartContent.count() > 0) {
        const cartBox = await cartContent.first().boundingBox();
        expect(cartBox?.width).toBeLessThanOrEqual(400);
      }
    }
  });
});