const { chromium } = require('playwright');

async function testFrontend() {
  console.log('🎯 Testing frontend loading...');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📍 Navigating to http://localhost:3000...');
    
    // Navigate to homepage with extended timeout
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Successfully loaded homepage');
    
    // Wait for page content to load
    await page.waitForTimeout(3000);
    
    // Get page title
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check if products page loads
    console.log('📍 Testing products page...');
    await page.goto('http://localhost:3000/products', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Successfully loaded products page');
    
    // Wait for content
    await page.waitForTimeout(3000);
    
    const productsTitle = await page.title();
    console.log('📄 Products page title:', productsTitle);
    
    // Check for loading indicators
    const loadingElements = await page.$$('[data-testid="loading"], .loading, .spinner');
    console.log('⏳ Loading elements found:', loadingElements.length);
    
    // Check for error messages
    const errorElements = await page.$$('.error, [role="alert"]');
    console.log('❌ Error elements found:', errorElements.length);
    
    // Take screenshot
    await page.screenshot({ path: 'frontend-test-screenshot.png' });
    console.log('📸 Screenshot saved as frontend-test-screenshot.png');
    
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testFrontend();