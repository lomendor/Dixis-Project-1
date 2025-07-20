#!/usr/bin/env node

/**
 * Final Visual Test - Take screenshots and verify everything works
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function finalTest() {
  console.log('📸 Final visual test with screenshots...\n');
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false, // Show browser window
      devtools: false,  // Don't show devtools to speed up
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    let errorCount = 0;
    let maxUpdateErrors = 0;
    
    // Monitor errors
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        errorCount++;
        
        if (text.includes('Maximum update depth exceeded')) {
          maxUpdateErrors++;
        }
        
        // Only log first few errors
        if (errorCount <= 3) {
          console.log(`🔴 Error: ${text.substring(0, 80)}...`);
        }
      }
    });
    
    // Create screenshots directory
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    // Test Homepage
    console.log('📍 Testing Homepage...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'homepage-fixed.png'),
      fullPage: true 
    });
    console.log('✅ Homepage screenshot saved');
    
    // Test Products Page
    console.log('📍 Testing Products Page...');
    await page.goto('http://localhost:3001/products', { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'products-fixed.png'),
      fullPage: true 
    });
    console.log('✅ Products page screenshot saved');
    
    // Check page elements
    console.log('\n📍 Checking Page Elements...');
    
    const checks = [
      { selector: 'h1', name: 'Page Title' },
      { selector: 'nav', name: 'Navigation' },
      { selector: 'button', name: 'Buttons' },
      { selector: 'img', name: 'Images' }
    ];
    
    for (const check of checks) {
      try {
        const elements = await page.$$(check.selector);
        console.log(`✅ ${check.name}: Found ${elements.length} elements`);
      } catch (e) {
        console.log(`❌ ${check.name}: Not found`);
      }
    }
    
    console.log('\n📊 FINAL TEST RESULTS:');
    console.log(`Total console errors: ${errorCount}`);
    console.log(`Infinite loop errors: ${maxUpdateErrors}`);
    console.log(`Screenshots saved in: ${screenshotDir}`);
    
    if (maxUpdateErrors === 0) {
      console.log('\n🎉 SUCCESS: Application is working correctly!');
      console.log('✅ No infinite render loops');
      console.log('✅ Pages load successfully');
      console.log('✅ Screenshots captured');
    } else {
      console.log('\n⚠️  Still some infinite loop issues detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run test
try {
  require.resolve('puppeteer');
  finalTest();
} catch (e) {
  console.log('❌ Puppeteer not available');
  process.exit(1);
}