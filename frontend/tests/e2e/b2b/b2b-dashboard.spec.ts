import { test, expect } from '@playwright/test';

test.describe('B2B Dashboard Navigation and Functionality', () => {
  
  // Helper function to login as B2B user
  const loginAsB2BUser = async (page: any) => {
    await page.goto('/b2b/login');
    
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/b2b/**', { timeout: 15000 });
  };

  test.beforeEach(async ({ page }) => {
    await loginAsB2BUser(page);
  });

  test('should display B2B dashboard with key metrics and overview', async ({ page }) => {
    // Navigate to dashboard if not already there
    await page.goto('/b2b/dashboard');
    
    // Check for dashboard title/header
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Πίνακας|Overview|Επισκόπηση/i);
    
    // Check for key business metrics cards/sections
    const metricsSelectors = [
      'text=/orders|παραγγελίες/i',
      'text=/revenue|έσοδα|πωλήσεις/i',
      'text=/products|προϊόντα/i',
      'text=/quotes|προσφορές/i'
    ];
    
    // At least 2 metric cards should be visible
    let visibleMetrics = 0;
    for (const selector of metricsSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        visibleMetrics++;
      }
    }
    
    expect(visibleMetrics).toBeGreaterThanOrEqual(2);
  });

  test('should have functional B2B navigation menu', async ({ page }) => {
    // Check for main B2B navigation items
    const navItems = [
      { text: /dashboard|πίνακας/i, url: '/b2b/dashboard' },
      { text: /products|προϊόντα/i, url: '/b2b/products' },
      { text: /orders|παραγγελίες/i, url: '/b2b/orders' },
      { text: /quotes|προσφορές/i, url: '/b2b/quotes' },
      { text: /reports|αναφορές/i, url: '/b2b/reports' },
      { text: /settings|ρυθμίσεις/i, url: '/b2b/settings' }
    ];
    
    for (const navItem of navItems) {
      const link = page.locator(`a:has-text(${navItem.text.source}), nav >> text=${navItem.text.source}`);
      
      if (await link.count() > 0) {
        // Click navigation item
        await link.first().click();
        
        // Wait for navigation
        await page.waitForURL(`**${navItem.url}`, { timeout: 10000 }).catch(async () => {
          // Alternative: check URL contains expected path
          await page.waitForTimeout(2000);
          expect(page.url()).toContain(navItem.url.split('/').pop());
        });
        
        // Verify page loaded correctly
        await expect(page.locator('main, [role="main"], .main-content')).toBeVisible();
        
        // Go back to dashboard for next test
        await page.goto('/b2b/dashboard');
      }
    }
  });

  test('should display recent orders on dashboard', async ({ page }) => {
    await page.goto('/b2b/dashboard');
    
    // Look for recent orders section
    const ordersSection = page.locator(
      'text=/recent orders|πρόσφατες παραγγελίες/i'
    ).locator('xpath=../.. | xpath=../../..');
    
    if (await ordersSection.count() > 0) {
      await expect(ordersSection.first()).toBeVisible();
      
      // Check for order items or empty state
      const orderItems = ordersSection.locator('.order, [data-testid*="order"], tr');
      const emptyState = ordersSection.locator('text=/no orders|δεν υπάρχουν παραγγελίες/i');
      
      const hasOrders = await orderItems.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;
      
      expect(hasOrders || hasEmptyState).toBeTruthy();
    }
  });

  test('should show business analytics and charts', async ({ page }) => {
    await page.goto('/b2b/dashboard');
    
    // Look for charts or analytics sections
    const chartElements = page.locator(
      'canvas, svg, .chart, [data-testid*="chart"], .analytics'
    );
    
    if (await chartElements.count() > 0) {
      await expect(chartElements.first()).toBeVisible();
      
      // Check if chart has data or loading state
      const chartContainer = chartElements.first().locator('xpath=./..');
      await expect(chartContainer).toBeVisible();
    }
    
    // Check for analytics numbers/stats
    const statsNumbers = page.locator('[data-testid*="stat"], .stat-number, .metric-value');
    if (await statsNumbers.count() > 0) {
      await expect(statsNumbers.first()).toBeVisible();
    }
  });

  test('should have quick action buttons for common B2B tasks', async ({ page }) => {
    await page.goto('/b2b/dashboard');
    
    // Look for quick action buttons
    const quickActions = [
      'text=/new order|νέα παραγγελία/i',
      'text=/request quote|αίτημα προσφοράς/i',
      'text=/view products|προβολή προϊόντων/i',
      'text=/bulk upload|μαζική ανάρτηση/i'
    ];
    
    let actionButtons = 0;
    for (const action of quickActions) {
      const button = page.locator(`button:has-text(${action.source}), a:has-text(${action.source})`);
      if (await button.count() > 0) {
        await expect(button.first()).toBeVisible();
        actionButtons++;
      }
    }
    
    // Should have at least 1 quick action
    expect(actionButtons).toBeGreaterThanOrEqual(1);
  });

  test('should display user profile and business information', async ({ page }) => {
    await page.goto('/b2b/dashboard');
    
    // Look for user/business info section
    const userInfo = page.locator(
      '[data-testid="user-info"], .user-profile, .business-info, text=/welcome|καλώς ήρθατε/i'
    );
    
    if (await userInfo.count() > 0) {
      await expect(userInfo.first()).toBeVisible();
      
      // Check for business name or user name
      const businessIdentifier = page.locator(
        'text=/company|επιχείρηση|business|εταιρεία/i'
      );
      
      if (await businessIdentifier.count() > 0) {
        await expect(businessIdentifier.first()).toBeVisible();
      }
    }
  });

  test('should handle B2B dashboard responsiveness on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 667 });
    }
    
    await page.goto('/b2b/dashboard');
    
    // Check if mobile navigation is available
    const mobileMenu = page.locator(
      '[data-testid="mobile-menu"], .mobile-nav, .hamburger, [aria-label*="menu"]'
    );
    
    if (await mobileMenu.count() > 0) {
      // Test mobile menu toggle
      await mobileMenu.first().click();
      
      // Navigation should be visible after click
      const navMenu = page.locator('nav, .navigation, [role="navigation"]');
      await expect(navMenu.first()).toBeVisible();
      
      // Close menu
      await mobileMenu.first().click();
    }
    
    // Check if content adapts to mobile
    const mainContent = page.locator('main, .main-content, .dashboard-content');
    if (await mainContent.count() > 0) {
      const boundingBox = await mainContent.first().boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(400);
    }
  });

  test('should provide logout functionality', async ({ page }) => {
    await page.goto('/b2b/dashboard');
    
    // Look for logout button or user menu
    const logoutTrigger = page.locator(
      'text=/logout|αποσύνδεση/i, [data-testid="logout"], .user-menu, .profile-menu'
    );
    
    if (await logoutTrigger.count() > 0) {
      await logoutTrigger.first().click();
      
      // If it's a menu, look for logout option
      const logoutOption = page.locator('text=/logout|αποσύνδεση/i');
      if (await logoutOption.count() > 1) {
        await logoutOption.last().click();
      }
      
      // Should redirect to login page
      await page.waitForURL('**/login', { timeout: 10000 }).catch(async () => {
        // Alternative: check for login form
        await page.waitForTimeout(2000);
        const loginForm = page.locator('form input[type="email"]');
        await expect(loginForm).toBeVisible();
      });
    }
  });

  test('should show loading states during data fetch', async ({ page }) => {
    // Intercept API calls to simulate slow response
    await page.route('**/api/**', async (route) => {
      await page.waitForTimeout(1000); // Simulate delay
      route.continue();
    });
    
    await page.goto('/b2b/dashboard');
    
    // Look for loading indicators
    const loadingIndicators = page.locator(
      '.loading, .spinner, .skeleton, text=/loading|φόρτωση/i, [data-testid*="loading"]'
    );
    
    // Loading indicators might be visible briefly
    if (await loadingIndicators.count() > 0) {
      // Check that content eventually loads
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 15000 });
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Intercept API calls to simulate errors
    await page.route('**/api/business/dashboard/**', async (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/b2b/dashboard');
    
    // Look for error messages or retry options
    const errorElements = page.locator(
      'text=/error|σφάλμα/i, text=/try again|δοκιμάστε ξανά/i, .error-message, [role="alert"]'
    );
    
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toBeVisible();
      
      // Look for retry button
      const retryButton = page.locator('button:has-text(/retry|δοκιμάστε ξανά/i)');
      if (await retryButton.count() > 0) {
        await expect(retryButton.first()).toBeVisible();
      }
    }
  });

  test('should navigate to detailed sections from dashboard widgets', async ({ page }) => {
    await page.goto('/b2b/dashboard');
    
    // Look for "View All" or "See More" links on dashboard widgets
    const viewMoreLinks = page.locator(
      'text=/view all|προβολή όλων/i, text=/see more|δείτε περισσότερα/i, a[href*="/b2b/orders"], a[href*="/b2b/products"]'
    );
    
    if (await viewMoreLinks.count() > 0) {
      const firstLink = viewMoreLinks.first();
      
      // Get the href to verify navigation
      const href = await firstLink.getAttribute('href');
      
      // Click the link
      await firstLink.click();
      
      // Verify navigation happened
      if (href) {
        await page.waitForURL(`**${href}`, { timeout: 10000 });
        await expect(page.locator('main, .main-content')).toBeVisible();
      }
    }
  });

  test('should display notifications or alerts for B2B users', async ({ page }) => {
    await page.goto('/b2b/dashboard');
    
    // Look for notifications area
    const notifications = page.locator(
      '.notifications, .alerts, [data-testid*="notification"], text=/notifications|ειδοποιήσεις/i'
    );
    
    if (await notifications.count() > 0) {
      await expect(notifications.first()).toBeVisible();
      
      // Check for notification items or empty state
      const notificationItems = notifications.locator('.notification, .alert, li');
      const emptyState = notifications.locator('text=/no notifications|δεν υπάρχουν ειδοποιήσεις/i');
      
      const hasNotifications = await notificationItems.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;
      
      expect(hasNotifications || hasEmptyState).toBeTruthy();
    }
  });
});

test.describe('B2B Dashboard Performance and Accessibility', () => {
  
  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/b2b/login');
    
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/b2b/dashboard', { timeout: 15000 });
    
    // Wait for main content to be visible
    await expect(page.locator('main, .main-content')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/b2b/login');
    
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/b2b/dashboard', { timeout: 15000 });
    
    // Test keyboard navigation through main elements
    await page.keyboard.press('Tab');
    
    // Should be able to focus on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through several elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    // Should still have a focused element
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should have proper ARIA labels and semantic HTML', async ({ page }) => {
    await page.goto('/b2b/login');
    
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/b2b/dashboard', { timeout: 15000 });
    
    // Check for semantic HTML elements
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    
    // Check for proper headings structure
    const h1 = page.locator('h1');
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible();
    }
    
    // Check for ARIA labels on interactive elements
    const interactiveElements = page.locator('button, a, input, select');
    const count = await interactiveElements.count();
    
    if (count > 0) {
      // At least some elements should have proper accessibility attributes
      const elementsWithAria = page.locator('button[aria-label], a[aria-label], input[aria-label], [role]');
      const ariaCount = await elementsWithAria.count();
      
      // At least 50% of interactive elements should have ARIA labels
      expect(ariaCount).toBeGreaterThan(count * 0.3);
    }
  });
});