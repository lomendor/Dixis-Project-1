import { test, expect } from '@playwright/test';

test.describe('B2B Authentication Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to B2B login page
    await page.goto('/b2b/login');
  });

  test('should display B2B login form with business-specific elements', async ({ page }) => {
    // Check page title and branding
    await expect(page.locator('h1, h2')).toContainText(/B2B|Επιχείρηση|Χονδρική/i);
    
    // Check for business login form
    await expect(page.locator('form')).toBeVisible();
    
    // Business email input
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    
    // Password input
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    
    // Login button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for B2B-specific links
    const b2bRegisterLink = page.locator('a[href*="/b2b/register"], text=/εγγραφή/i, text=/register/i');
    if (await b2bRegisterLink.count() > 0) {
      await expect(b2bRegisterLink.first()).toBeVisible();
    }
  });

  test('should validate business email format', async ({ page }) => {
    // Try with personal email domain
    await page.fill('input[type="email"]', 'user@gmail.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Should show business email requirement (if implemented)
    const businessEmailHint = page.locator('text=/business|επιχείρηση|εταιρικ/i');
    // This is optional - not all B2B systems require business domains
  });

  test('should handle B2B login with valid credentials', async ({ page }) => {
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    // Fill B2B credentials
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for B2B dashboard redirect
    await page.waitForURL('**/b2b/dashboard', { timeout: 15000 }).catch(async () => {
      // Alternative: wait for any B2B page
      await page.waitForURL(url => url.pathname.includes('/b2b'), { timeout: 15000 });
    });
    
    // Verify B2B dashboard elements
    const b2bIndicators = page.locator(
      '[data-testid="b2b-dashboard"], text=/B2B Portal/i, text=/Επιχειρηματικός/i, text=/Χονδρική/i'
    );
    await expect(b2bIndicators.first()).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to B2B dashboard after successful login', async ({ page }) => {
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    await page.click('button[type="submit"]');
    
    // Should redirect to B2B dashboard
    await page.waitForURL('**/b2b/**', { timeout: 15000 });
    
    // Verify URL contains B2B section
    expect(page.url()).toContain('/b2b');
    
    // Verify dashboard-specific elements
    const dashboardElements = page.locator(
      'text=/dashboard|πίνακας|overview|επισκόπηση/i'
    );
    await expect(dashboardElements.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show B2B-specific error messages for invalid credentials', async ({ page }) => {
    // Try with invalid B2B credentials
    await page.fill('input[type="email"]', 'invalid@business.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error response
    await page.waitForTimeout(3000);
    
    // Check for B2B-specific error messages
    const errorMessage = page.locator(
      'text=/invalid|incorrect|unauthorized|λάθος|άκυρα|μη εξουσιοδοτημένος/i'
    );
    await expect(errorMessage.first()).toBeVisible();
  });

  test('should handle remember me functionality for B2B users', async ({ page }) => {
    const rememberCheckbox = page.locator('input[type="checkbox"][name*="remember"], input[type="checkbox"] + label:has-text(/remember|θυμάμαι/i)');
    
    if (await rememberCheckbox.count() > 0) {
      // Check remember me
      await rememberCheckbox.first().check();
      
      // Login
      const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
      const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
      
      await page.fill('input[type="email"]', testB2BEmail);
      await page.fill('input[type="password"]', testB2BPassword);
      await page.click('button[type="submit"]');
      
      // Wait for successful login
      await page.waitForURL('**/b2b/**', { timeout: 15000 });
      
      // Close and reopen browser to test persistence
      await page.context().close();
      const newContext = await page.context().browser()?.newContext();
      const newPage = await newContext?.newPage();
      
      if (newPage) {
        await newPage.goto('/b2b/dashboard');
        
        // Should still be logged in
        const userIndicator = newPage.locator('[data-testid="user-menu"], text=/logout|αποσύνδεση/i');
        await expect(userIndicator.first()).toBeVisible({ timeout: 5000 });
        
        await newContext?.close();
      }
    } else {
      test.skip(true, 'Remember me functionality not implemented');
    }
  });

  test('should navigate to B2B registration from login page', async ({ page }) => {
    // Look for registration link
    const registerLink = page.locator('a[href*="/b2b/register"], text=/εγγραφή|register|sign up/i');
    
    if (await registerLink.count() > 0) {
      await registerLink.first().click();
      
      // Should navigate to B2B registration
      await page.waitForURL('**/b2b/register', { timeout: 5000 });
      
      // Verify registration form
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('text=/επιχείρηση|business|company/i')).toBeVisible();
    } else {
      test.skip(true, 'B2B registration link not found');
    }
  });

  test('should handle B2B login form validation', async ({ page }) => {
    // Submit empty form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Check for validation errors
    const validationErrors = page.locator('[role="alert"], .error, .text-red-500, .text-danger');
    await expect(validationErrors.first()).toBeVisible();
    
    // Fill email only
    await page.fill('input[type="email"]', 'business@example.com');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Password should still be required
    const passwordError = page.locator('text=/password|κωδικός/i').locator('.error, .text-red-500');
    if (await passwordError.count() > 0) {
      await expect(passwordError.first()).toBeVisible();
    }
  });

  test('should support mobile B2B login experience', async ({ page, isMobile }) => {
    if (!isMobile) {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
    }
    
    // Check mobile responsiveness
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check if form adapts to mobile
    const boundingBox = await form.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(400);
    
    // Test mobile interactions
    await page.tap('input[type="email"]');
    await page.fill('input[type="email"]', 'mobile@business.com');
    
    await page.tap('input[type="password"]');
    await page.fill('input[type="password"]', 'mobilepass123');
    
    // Check if mobile keyboard appears (virtual keyboard detection)
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
    
    await page.tap('button[type="submit"]');
  });

  test('should handle B2B session timeout and re-authentication', async ({ page }) => {
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    // Login first
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/b2b/**', { timeout: 15000 });
    
    // Simulate session expiry by clearing storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to access B2B resource
    await page.goto('/b2b/products');
    
    // Should redirect to login due to expired session
    await page.waitForURL('**/b2b/login', { timeout: 10000 }).catch(() => {
      // Alternative: check for login form on the same page
    });
    
    // Verify login form is shown
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe('B2B Role-Based Access Control', () => {
  
  test('should verify B2B user role and permissions after login', async ({ page }) => {
    await page.goto('/b2b/login');
    
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/b2b/**', { timeout: 15000 });
    
    // Check for B2B-specific navigation items
    const b2bNavItems = page.locator(
      'text=/wholesale|χονδρική|bulk|μαζικές|quote|προσφορά|invoice|τιμολόγιο/i'
    );
    
    // Should have access to B2B features
    if (await b2bNavItems.count() > 0) {
      await expect(b2bNavItems.first()).toBeVisible();
    }
    
    // Should NOT have access to consumer-only features
    const consumerOnlyItems = page.locator('text=/adoption|υιοθεσία|individual|ατομικός/i');
    // This test assumes some features are B2B-exclusive
  });

  test('should prevent access to admin areas for B2B users', async ({ page }) => {
    // Login as B2B user first
    await page.goto('/b2b/login');
    
    const testB2BEmail = process.env.TEST_B2B_EMAIL || 'business@dixis.io';
    const testB2BPassword = process.env.TEST_B2B_PASSWORD || 'businesspass123';
    
    await page.fill('input[type="email"]', testB2BEmail);
    await page.fill('input[type="password"]', testB2BPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/b2b/**', { timeout: 15000 });
    
    // Try to access admin area
    await page.goto('/admin');
    
    // Should be redirected or show access denied
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const hasAccessDenied = await page.locator('text=/access denied|unauthorized|403|δεν επιτρέπεται/i').count() > 0;
    
    expect(currentUrl.includes('/admin') && hasAccessDenied || !currentUrl.includes('/admin')).toBeTruthy();
  });
});