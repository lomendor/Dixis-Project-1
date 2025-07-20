#!/usr/bin/env node

/**
 * Comprehensive Testing Script for Dixis Fresh
 * Tests all critical user flows and features
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', `test-${Date.now()}`);

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Utility functions
const log = (status, message, details = null) => {
  const symbols = {
    PASS: '✅',
    FAIL: '❌',
    WARN: '⚠️',
    INFO: 'ℹ️',
    START: '🚀',
    COMPLETE: '🎉'
  };
  
  const colors = {
    PASS: '\x1b[32m',
    FAIL: '\x1b[31m',
    WARN: '\x1b[33m',
    INFO: '\x1b[34m',
    reset: '\x1b[0m'
  };
  
  const symbol = symbols[status] || '•';
  const color = colors[status] || colors.reset;
  
  console.log(`${symbol} ${color}${message}${colors.reset}`);
  if (details) {
    console.log(`   ${JSON.stringify(details, null, 2)}`);
  }
  
  // Store result
  if (status !== 'INFO' && status !== 'START' && status !== 'COMPLETE') {
    testResults.tests.push({
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

const takeScreenshot = async (page, name) => {
  const screenshotPath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
};

const waitAndClick = async (page, selector, timeout = 5000) => {
  await page.waitForSelector(selector, { timeout });
  await page.click(selector);
};

const checkElementExists = async (page, selector, timeout = 5000) => {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
};

// Main test suite
async function runComprehensiveTests() {
  console.log('🧪 DIXIS FRESH COMPREHENSIVE TESTING SUITE');
  console.log('=========================================\n');
  
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // Set up console and error logging
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });
    
    // Track API calls
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiCalls.push({
          url,
          status: response.status(),
          ok: response.ok()
        });
      }
    });
    
    // PHASE 1: CRITICAL PATH TESTING
    log('START', 'Phase 1: Critical Path Testing');
    
    // Test 1: Homepage Load
    log('INFO', 'Testing homepage...');
    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      await takeScreenshot(page, '01-homepage');
      
      // Check critical elements
      const hasHero = await checkElementExists(page, 'h1');
      const hasNavigation = await checkElementExists(page, 'nav');
      const hasFeaturedProducts = await checkElementExists(page, '[class*="featured"]', 3000);
      
      if (hasHero && hasNavigation) {
        log('PASS', 'Homepage loaded successfully', {
          hero: hasHero,
          navigation: hasNavigation,
          featuredProducts: hasFeaturedProducts
        });
      } else {
        log('FAIL', 'Homepage missing critical elements');
      }
    } catch (error) {
      log('FAIL', 'Homepage failed to load', { error: error.message });
    }
    
    // Test 2: Navigate to Products
    log('INFO', 'Testing products page...');
    try {
      await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000); // Wait for products to load
      await takeScreenshot(page, '02-products-page');
      
      // Check for products
      const productCards = await page.$$('[class*="product"]');
      const addToCartButtons = await page.$$('button:has-text("Προσθήκη στο Καλάθι")');
      
      if (productCards.length > 0) {
        log('PASS', `Products page loaded with ${productCards.length} products`);
        
        // Check if add to cart buttons exist
        if (addToCartButtons.length > 0) {
          log('PASS', `Found ${addToCartButtons.length} Add to Cart buttons`);
        } else {
          // Try alternative selector
          const modernCartButtons = await page.$$('[class*="ModernCartButton"]');
          if (modernCartButtons.length > 0) {
            log('PASS', `Found ${modernCartButtons.length} ModernCartButton components`);
          } else {
            log('WARN', 'Add to Cart buttons may not be properly rendered');
          }
        }
      } else {
        log('FAIL', 'No products found on products page');
      }
    } catch (error) {
      log('FAIL', 'Products page failed to load', { error: error.message });
    }
    
    // Test 3: Add to Cart Functionality
    log('INFO', 'Testing cart functionality...');
    try {
      // Find and click first add to cart button
      const addToCartButton = await page.$('button');
      if (addToCartButton) {
        // Get initial cart count
        const initialCartCount = await page.$eval('[class*="badge"]', el => el.textContent).catch(() => '0');
        
        // Click add to cart
        await addToCartButton.click();
        await page.waitForTimeout(2000); // Wait for cart update
        
        // Check if cart drawer opened
        const cartDrawerOpen = await checkElementExists(page, '[class*="drawer"]', 3000);
        
        // Check cart badge updated
        const newCartCount = await page.$eval('[class*="badge"]', el => el.textContent).catch(() => '0');
        
        if (cartDrawerOpen || newCartCount !== initialCartCount) {
          log('PASS', 'Add to cart functionality working', {
            cartDrawerOpened: cartDrawerOpen,
            cartUpdated: newCartCount !== initialCartCount
          });
          await takeScreenshot(page, '03-cart-drawer');
        } else {
          log('FAIL', 'Add to cart may not be working correctly');
        }
      } else {
        log('FAIL', 'No add to cart button found');
      }
    } catch (error) {
      log('WARN', 'Cart functionality test encountered issues', { error: error.message });
    }
    
    // Test 4: Cart Page
    log('INFO', 'Testing cart page...');
    try {
      await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle2' });
      await takeScreenshot(page, '04-cart-page');
      
      // Check cart content
      const cartItems = await page.$$('[class*="cart-item"]');
      const checkoutButton = await checkElementExists(page, 'a[href="/checkout"]');
      
      if (cartItems.length > 0 || checkoutButton) {
        log('PASS', 'Cart page displays correctly', {
          itemCount: cartItems.length,
          hasCheckoutButton: checkoutButton
        });
      } else {
        const emptyCartMessage = await checkElementExists(page, 'text=/καλάθι.*άδειο/i');
        if (emptyCartMessage) {
          log('INFO', 'Cart is empty (expected if no items added)');
        } else {
          log('WARN', 'Cart page may have rendering issues');
        }
      }
    } catch (error) {
      log('FAIL', 'Cart page failed to load', { error: error.message });
    }
    
    // Test 5: Checkout Flow
    log('INFO', 'Testing checkout flow...');
    try {
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' });
      await takeScreenshot(page, '05-checkout-page');
      
      const checkoutForm = await checkElementExists(page, 'form');
      const paymentSection = await checkElementExists(page, '[class*="payment"]', 3000);
      
      if (checkoutForm || paymentSection) {
        log('PASS', 'Checkout page loaded successfully');
      } else {
        log('WARN', 'Checkout page may require cart items');
      }
    } catch (error) {
      log('FAIL', 'Checkout page failed to load', { error: error.message });
    }
    
    // PHASE 2: FEATURE VALIDATION
    log('START', '\nPhase 2: Feature Validation');
    
    // Test Producer Portal
    log('INFO', 'Testing producer portal...');
    try {
      await page.goto(`${BASE_URL}/producer/register`, { waitUntil: 'networkidle2' });
      const hasRegistrationForm = await checkElementExists(page, 'form');
      log(hasRegistrationForm ? 'PASS' : 'FAIL', 'Producer registration page', {
        hasForm: hasRegistrationForm
      });
    } catch (error) {
      log('FAIL', 'Producer portal inaccessible', { error: error.message });
    }
    
    // Test B2B Features
    log('INFO', 'Testing B2B features...');
    try {
      await page.goto(`${BASE_URL}/b2b/products`, { waitUntil: 'networkidle2' });
      const hasB2BContent = await checkElementExists(page, '[class*="b2b"]', 3000);
      log(hasB2BContent ? 'PASS' : 'WARN', 'B2B products page', {
        hasB2BContent
      });
    } catch (error) {
      log('WARN', 'B2B features may require authentication', { error: error.message });
    }
    
    // PHASE 3: PERFORMANCE TESTING
    log('START', '\nPhase 3: Performance Testing');
    
    // Measure page load times
    const pagesToTest = ['/', '/products', '/producers', '/cart'];
    for (const pagePath of pagesToTest) {
      try {
        const startTime = Date.now();
        await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle2' });
        const loadTime = Date.now() - startTime;
        
        log(
          loadTime < 2000 ? 'PASS' : loadTime < 3000 ? 'WARN' : 'FAIL',
          `Page load time for ${pagePath}: ${loadTime}ms`
        );
      } catch (error) {
        log('FAIL', `Failed to test performance for ${pagePath}`);
      }
    }
    
    // Check for console errors
    if (consoleErrors.length > 0) {
      log('WARN', `Found ${consoleErrors.length} console errors`, consoleErrors.slice(0, 5));
    } else {
      log('PASS', 'No console errors detected');
    }
    
    // API Call Summary
    log('INFO', '\nAPI Call Summary:');
    const failedAPICalls = apiCalls.filter(call => !call.ok);
    if (failedAPICalls.length > 0) {
      log('WARN', `${failedAPICalls.length} API calls failed`, failedAPICalls);
    } else {
      log('PASS', `All ${apiCalls.length} API calls successful`);
    }
    
    // Mobile Responsiveness Quick Check
    log('INFO', '\nTesting mobile responsiveness...');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '06-mobile-products');
    
    const mobileMenuButton = await checkElementExists(page, 'button[class*="mobile"]', 2000);
    log(mobileMenuButton ? 'PASS' : 'INFO', 'Mobile layout check', {
      hasMobileMenu: mobileMenuButton
    });
    
  } catch (error) {
    log('FAIL', 'Test suite encountered critical error', { error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
    
    // Generate summary
    testResults.summary.total = testResults.tests.length;
    testResults.summary.passed = testResults.tests.filter(t => t.status === 'PASS').length;
    testResults.summary.failed = testResults.tests.filter(t => t.status === 'FAIL').length;
    testResults.summary.warnings = testResults.tests.filter(t => t.status === 'WARN').length;
    
    // Save results
    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    // Print summary
    log('COMPLETE', '\nTEST SUMMARY');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
    console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
    console.log(`Report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(testResults.summary.failed > 0 ? 1 : 0);
  }
}

// Run tests
runComprehensiveTests().catch(error => {
  console.error('Test suite failed to run:', error);
  process.exit(1);
});