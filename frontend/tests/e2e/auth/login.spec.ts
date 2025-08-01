import { test, expect } from '@playwright/test';

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible();
    
    // Check for email input
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    
    // Check for password input
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    
    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Wait for validation errors
    await page.waitForTimeout(1000);
    
    // Check for error messages (adjust selectors based on your implementation)
    const errorMessages = page.locator('[role="alert"], .error, .text-red-500');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill invalid email
    await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Check for email validation error
    const emailError = page.locator('text=/email/i').or(page.locator('text=/ηλεκτρονικό/i'));
    await expect(emailError.first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill invalid credentials
    await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for API response
    await page.waitForTimeout(2000);
    
    // Check for authentication error
    const authError = page.locator('text=/invalid/i, text=/incorrect/i, text=/λάθος/i, text=/άκυρα/i');
    await expect(authError.first()).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Use test credentials
    const testEmail = process.env.TEST_USER_EMAIL || 'test@dixis.io';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';
    
    // Fill valid credentials
    await page.fill('input[type="email"], input[name="email"]', testEmail);
    await page.fill('input[type="password"], input[name="password"]', testPassword);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(async () => {
      // If no dashboard, wait for any navigation away from login
      await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
    });
    
    // Verify successful login by checking for user-specific elements
    const userIndicator = page.locator('[data-testid="user-menu"], .user-avatar, text=/dashboard/i, text=/πίνακας/i');
    await expect(userIndicator.first()).toBeVisible({ timeout: 5000 });
  });

  test('should remember login state after page refresh', async ({ page }) => {
    // Login first
    const testEmail = process.env.TEST_USER_EMAIL || 'test@dixis.io';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';
    
    await page.fill('input[type="email"], input[name="email"]', testEmail);
    await page.fill('input[type="password"], input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Wait for successful login
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
    
    // Refresh the page
    await page.reload();
    
    // Verify still logged in
    const userIndicator = page.locator('[data-testid="user-menu"], .user-avatar, text=/dashboard/i');
    await expect(userIndicator.first()).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected page first
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*login.*/);
    
    // Login
    const testEmail = process.env.TEST_USER_EMAIL || 'test@dixis.io';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';
    
    await page.fill('input[type="email"], input[name="email"]', testEmail);
    await page.fill('input[type="password"], input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Should be redirected back to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should handle password visibility toggle', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const toggleButton = page.locator('[data-testid="password-toggle"], button:near(input[type="password"])');
    
    // Fill password
    await passwordInput.fill('testpassword');
    
    // Check if toggle button exists
    if (await toggleButton.isVisible()) {
      // Click toggle to show password
      await toggleButton.click();
      
      // Password should now be visible (type="text")
      await expect(page.locator('input[type="text"][name="password"]')).toBeVisible();
      
      // Click toggle again to hide password
      await toggleButton.click();
      
      // Password should be hidden again (type="password")
      await expect(passwordInput).toBeVisible();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
    
    // Submit with Enter key
    await page.keyboard.press('Enter');
    
    // Should trigger form submission
    await page.waitForTimeout(1000);
  });

  test('should work on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip(!isMobile, 'This test is only for mobile devices');
    }
    
    // Check mobile-specific elements
    await expect(page.locator('form')).toBeVisible();
    
    // Check if form is properly sized for mobile
    const form = page.locator('form');
    const boundingBox = await form.boundingBox();
    
    expect(boundingBox?.width).toBeLessThanOrEqual(400); // Mobile width
    
    // Test touch interactions
    await page.tap('input[type="email"], input[name="email"]');
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    
    await page.tap('input[type="password"], input[name="password"]');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    
    await page.tap('button[type="submit"]');
  });
});
