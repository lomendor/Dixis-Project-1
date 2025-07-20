#!/usr/bin/env node

/**
 * Puppeteer Visual Testing Script for Dixis Fresh
 * Tests the actual browser experience for issues
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testDixisFresh() {
  console.log('🎭 Starting Puppeteer Visual Testing...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Show browser for visual inspection
      devtools: true,  // Open DevTools
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`🔴 Console ${type}:`, msg.text());
      }
    });
    
    // Catch page errors
    page.on('pageerror', error => {
      console.log('🔴 Page Error:', error.message);
    });
    
    // Catch request failures
    page.on('requestfailed', request => {
      console.log('🔴 Request Failed:', request.url(), '-', request.failure().errorText);
    });
    
    console.log('📍 Testing Homepage...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for main content
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Check for API calls
    console.log('\n📍 Checking API Endpoints...');
    
    // Intercept API requests
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiCalls.push({
          url: url,
          status: response.status(),
          ok: response.ok()
        });
      }
    });
    
    // Navigate to products page
    console.log('\n📍 Testing Products Page...');
    await page.goto('http://localhost:3001/products', { 
      waitUntil: 'networkidle2' 
    });
    
    // Wait a bit for API calls
    await page.waitForTimeout(2000);
    
    // Print API call results
    console.log('\n📊 API Call Summary:');
    apiCalls.forEach(call => {
      const status = call.ok ? '✅' : '❌';
      console.log(`${status} ${call.status} - ${call.url}`);
    });
    
    // Check for visual elements
    console.log('\n📍 Checking Visual Elements...');
    
    const checks = [
      { selector: '.product-card', name: 'Product Cards' },
      { selector: 'img', name: 'Images' },
      { selector: 'button', name: 'Buttons' },
      { selector: '[href="/cart"]', name: 'Cart Link' }
    ];
    
    for (const check of checks) {
      try {
        const elements = await page.$$(check.selector);
        console.log(`✅ ${check.name}: Found ${elements.length} elements`);
      } catch (e) {
        console.log(`❌ ${check.name}: Not found`);
      }
    }
    
    // Check for error messages
    console.log('\n📍 Checking for Error Messages...');
    const errorTexts = await page.evaluate(() => {
      const errors = [];
      // Check for common error patterns
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const text = el.textContent || '';
        if (text.match(/error|failed|Error|Failed|500|404/i) && 
            !text.match(/error-free|no errors/i)) {
          errors.push(text.substring(0, 100));
        }
      });
      return [...new Set(errors)]; // Remove duplicates
    });
    
    if (errorTexts.length > 0) {
      console.log('❌ Found potential error messages:');
      errorTexts.slice(0, 5).forEach(err => console.log('  -', err));
    } else {
      console.log('✅ No error messages found');
    }
    
    // Take screenshots
    console.log('\n📸 Taking Screenshots...');
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'homepage.png'),
      fullPage: true 
    });
    console.log('✅ Homepage screenshot saved');
    
    await page.goto('http://localhost:3001/products');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'products.png'),
      fullPage: true 
    });
    console.log('✅ Products page screenshot saved');
    
    console.log('\n✅ Visual testing complete!');
    console.log('📁 Screenshots saved in:', screenshotDir);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  testDixisFresh();
} catch (e) {
  console.log('📦 Puppeteer not installed. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install puppeteer', { stdio: 'inherit' });
  console.log('✅ Puppeteer installed. Running tests...\n');
  testDixisFresh();
}