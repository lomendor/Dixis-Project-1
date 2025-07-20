import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global E2E test setup...');
  
  // Create auth directory if it doesn't exist
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Create test results directory
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  // Setup browser for authentication
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
    console.log(`📍 Navigating to: ${baseURL}`);
    
    await page.goto(baseURL);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the application is running
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Try to login with test user (if login page exists)
    try {
      // Navigate to login page
      await page.goto(`${baseURL}/login`);
      
      // Check if login form exists
      const loginForm = await page.locator('form').first();
      if (await loginForm.isVisible()) {
        console.log('🔐 Setting up authentication state...');
        
        // Fill login form with test credentials
        const testEmail = process.env.TEST_USER_EMAIL || 'test@dixis.gr';
        const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';
        
        await page.fill('input[type="email"], input[name="email"]', testEmail);
        await page.fill('input[type="password"], input[name="password"]', testPassword);
        
        // Submit form
        await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Σύνδεση")');
        
        // Wait for navigation after login
        await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
          // If dashboard doesn't exist, wait for any navigation
          return page.waitForLoadState('networkidle');
        });
        
        // Save authentication state
        await page.context().storageState({ 
          path: path.join(authDir, 'user.json') 
        });
        
        console.log('✅ Authentication state saved');
      } else {
        console.log('ℹ️ No login form found, creating empty auth state');
        
        // Create empty auth state for tests that don't require authentication
        await page.context().storageState({ 
          path: path.join(authDir, 'user.json') 
        });
      }
    } catch (error) {
      console.log('⚠️ Login setup failed, creating empty auth state:', (error as Error).message);
      
      // Create empty auth state as fallback
      await page.context().storageState({ 
        path: path.join(authDir, 'user.json') 
      });
    }
    
    // Setup test data if needed
    await setupTestData(page);
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any) {
  console.log('📊 Setting up test data...');
  
  try {
    // Check if API is available
    const apiBaseURL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8080';
    
    // Test API health endpoint
    const response = await page.request.get(`${apiBaseURL}/api/health`);
    
    if (response.ok()) {
      console.log('✅ API is available');
      
      // You can add more test data setup here
      // For example:
      // - Create test users
      // - Create test products
      // - Setup test categories
      
    } else {
      console.log('⚠️ API not available, skipping test data setup');
    }
  } catch (error) {
    console.log('⚠️ Test data setup failed:', (error as Error).message);
  }
}

export default globalSetup;
