#!/usr/bin/env node

/**
 * Quick Cart Functionality Test
 * Focused test on the critical cart functionality
 */

const puppeteer = require('puppeteer');

async function testCartFunctionality() {
  console.log('🛒 Testing Dixis Fresh Cart Functionality\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Test 1: Load Products Page
    console.log('1️⃣ Loading products page...');
    await page.goto('http://localhost:3000/products', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    console.log('✅ Products page loaded');
    
    // Test 2: Check for Add to Cart buttons
    console.log('\n2️⃣ Looking for Add to Cart buttons...');
    await page.waitForTimeout(2000); // Wait for products to render
    
    // Try multiple selectors
    const selectors = [
      'button:has-text("Προσθήκη στο Καλάθι")',
      'button[class*="cart"]',
      'button[class*="Cart"]',
      '[class*="ModernCartButton"]',
      'button'
    ];
    
    let cartButton = null;
    for (const selector of selectors) {
      const buttons = await page.$$(selector);
      if (buttons.length > 0) {
        // Check if any button contains cart-related text
        for (const button of buttons) {
          const text = await button.evaluate(el => el.textContent);
          if (text && text.includes('Καλάθι')) {
            cartButton = button;
            console.log(`✅ Found cart button with selector: ${selector}`);
            break;
          }
        }
        if (cartButton) break;
      }
    }
    
    if (!cartButton) {
      console.log('❌ No Add to Cart button found');
      console.log('Checking page structure...');
      
      // Debug: Print all buttons on page
      const allButtons = await page.$$('button');
      console.log(`Found ${allButtons.length} buttons total`);
      
      for (let i = 0; i < Math.min(5, allButtons.length); i++) {
        const text = await allButtons[i].evaluate(el => el.textContent);
        console.log(`  Button ${i + 1}: "${text}"`);
      }
      
      return;
    }
    
    // Test 3: Click Add to Cart
    console.log('\n3️⃣ Clicking Add to Cart button...');
    await cartButton.click();
    await page.waitForTimeout(3000); // Wait for cart action
    
    // Test 4: Check if cart updated
    console.log('\n4️⃣ Checking cart status...');
    
    // Check for cart drawer
    const cartDrawer = await page.$('[class*="drawer"]') || await page.$('[class*="Drawer"]');
    if (cartDrawer) {
      console.log('✅ Cart drawer opened');
    }
    
    // Check cart badge
    const cartBadge = await page.$('[class*="badge"]') || await page.$('span[class*="cart"]');
    if (cartBadge) {
      const badgeText = await cartBadge.evaluate(el => el.textContent);
      console.log(`✅ Cart badge shows: ${badgeText}`);
    }
    
    // Test 5: Navigate to cart page
    console.log('\n5️⃣ Navigating to cart page...');
    await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle2' });
    
    // Check cart content
    const cartEmpty = await page.$('text=/καλάθι.*άδειο/i');
    const cartItems = await page.$$('[class*="cart-item"]') || await page.$$('[class*="CartItem"]');
    
    if (cartEmpty) {
      console.log('⚠️ Cart appears to be empty');
    } else if (cartItems.length > 0) {
      console.log(`✅ Cart contains ${cartItems.length} item(s)`);
    }
    
    console.log('\n📊 Test Summary:');
    console.log('- Products page: ✅ Loads correctly');
    console.log('- Add to Cart buttons: ' + (cartButton ? '✅ Found' : '❌ Not found'));
    console.log('- Cart functionality: ' + (cartDrawer || cartBadge ? '✅ Working' : '⚠️ May need verification'));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      console.log('\n🔚 Test complete. Browser will close in 5 seconds...');
      await page.waitForTimeout(5000);
      await browser.close();
    }
  }
}

// Run the test
testCartFunctionality();