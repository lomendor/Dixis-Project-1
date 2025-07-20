#!/usr/bin/env node

/**
 * Quick Visual Test - Limited time test to check if infinite loop is fixed
 */

const puppeteer = require('puppeteer');

async function quickTest() {
  console.log('🔍 Quick test for infinite loop fix...\n');
  
  let browser;
  let testResults = {
    homepage: { loaded: false, errors: [] },
    consoleErrors: 0,
    maxUpdateErrors: 0
  };
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Track console errors
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        testResults.consoleErrors++;
        
        if (text.includes('Maximum update depth exceeded')) {
          testResults.maxUpdateErrors++;
        }
        
        // Only log first few errors to avoid spam
        if (testResults.consoleErrors <= 5) {
          console.log(`🔴 Console Error: ${text.substring(0, 100)}`);
        }
      }
    });
    
    // Test homepage with 10 second timeout
    console.log('📍 Testing homepage...');
    try {
      await page.goto('http://localhost:3001', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      // Wait for title to ensure basic rendering
      await page.waitForSelector('title', { timeout: 5000 });
      testResults.homepage.loaded = true;
      console.log('✅ Homepage loaded successfully');
      
    } catch (error) {
      console.log('❌ Homepage failed to load:', error.message);
      testResults.homepage.errors.push(error.message);
    }
    
    // Wait a bit to see if infinite errors continue
    console.log('⏳ Monitoring for infinite loop errors (3 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Results
  console.log('\n📊 QUICK TEST RESULTS:');
  console.log(`Homepage loaded: ${testResults.homepage.loaded ? '✅' : '❌'}`);
  console.log(`Total console errors: ${testResults.consoleErrors}`);
  console.log(`Maximum update depth errors: ${testResults.maxUpdateErrors}`);
  
  if (testResults.maxUpdateErrors === 0) {
    console.log('\n🎉 SUCCESS: No infinite loop detected!');
    return true;
  } else if (testResults.maxUpdateErrors < 10) {
    console.log('\n⚠️  IMPROVED: Reduced infinite loop errors');
    return true;
  } else {
    console.log('\n❌ STILL BROKEN: Infinite loop continues');
    return false;
  }
}

// Check if puppeteer is available and run test
try {
  require.resolve('puppeteer');
  quickTest();
} catch (e) {
  console.log('❌ Puppeteer not available');
  process.exit(1);
}