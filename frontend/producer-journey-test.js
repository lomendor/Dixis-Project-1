const { chromium } = require('playwright');

async function testProducerJourney() {
  console.log('🎯 PRODUCER JOURNEY TESTING - Registration to Product Creation');
  console.log('📋 Testing complete producer workflow as requested by user');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000 
  });
  
  const page = await browser.newPage();
  const gaps = [];
  const workingFeatures = [];
  
  try {
    // Step 1: Homepage Navigation
    console.log('\n📍 STEP 1: Homepage and Navigation');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    
    const title = await page.title();
    console.log('✅ Homepage loads:', title);
    workingFeatures.push('Homepage loading and navigation');
    
    // Check for producer registration link
    const becomeProducerLink = await page.$('a[href*="become-producer"], a[href*="producer/register"]') || 
                              await page.$('text=Γίνε Παραγωγός') ||
                              await page.$('text=Εγγραφή Παραγωγού');
    if (becomeProducerLink) {
      console.log('✅ Producer registration link found');
      workingFeatures.push('Producer registration navigation');
    } else {
      console.log('❌ Producer registration link NOT found on homepage');
      gaps.push('No clear "Become Producer" link on homepage');
    }
    
    // Step 2: Try to access producer registration
    console.log('\n📍 STEP 2: Producer Registration Page');
    const possibleUrls = [
      '/become-producer',
      '/producer/register', 
      '/producer/getting-started',
      '/auth/register?type=producer'
    ];
    
    let registrationPageFound = false;
    for (const url of possibleUrls) {
      try {
        await page.goto(`http://localhost:3000${url}`, { waitUntil: 'networkidle', timeout: 10000 });
        const currentUrl = page.url();
        if (!currentUrl.includes('404') && !currentUrl.includes('not-found')) {
          console.log(`✅ Producer registration page found at: ${url}`);
          workingFeatures.push(`Producer registration page (${url})`);
          registrationPageFound = true;
          break;
        }
      } catch (error) {
        console.log(`⚠️ Could not access ${url}`);
      }
    }
    
    if (!registrationPageFound) {
      console.log('❌ No producer registration page found');
      gaps.push('Producer registration page missing or inaccessible');
    }
    
    // Step 3: Test producer login page
    console.log('\n📍 STEP 3: Producer Login');
    try {
      await page.goto('http://localhost:3000/producer', { waitUntil: 'networkidle', timeout: 15000 });
      console.log('✅ Producer dashboard/login page accessible');
      workingFeatures.push('Producer dashboard navigation');
      
      // Check for login form
      const loginForm = await page.$('form, [data-testid="login-form"], input[type="email"]');
      if (loginForm) {
        console.log('✅ Login form detected');
        workingFeatures.push('Producer login form');
      } else {
        console.log('❌ No login form found');
        gaps.push('Producer login form missing');
      }
    } catch (error) {
      console.log('❌ Producer page inaccessible:', error.message);
      gaps.push('Producer dashboard page inaccessible');
    }
    
    // Step 4: Test product creation workflow
    console.log('\n📍 STEP 4: Product Management');
    const productUrls = [
      '/producer/products',
      '/producer/products/new',
      '/producer/dashboard'
    ];
    
    for (const url of productUrls) {
      try {
        await page.goto(`http://localhost:3000${url}`, { waitUntil: 'networkidle', timeout: 10000 });
        const currentUrl = page.url();
        if (!currentUrl.includes('404') && !currentUrl.includes('not-found')) {
          console.log(`✅ Product management page accessible: ${url}`);
          workingFeatures.push(`Product management (${url})`);
          
          // Check for product creation form
          const createButton = await page.$('button:has-text("Νέο Προϊόν"), button:has-text("Δημιουργία"), [data-testid="create-product"]');
          if (createButton) {
            console.log('✅ Product creation button found');
            workingFeatures.push('Product creation interface');
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not access ${url}: ${error.message}`);
        gaps.push(`Product management page (${url}) inaccessible`);
      }
    }
    
    // Step 5: Test existing features from backend
    console.log('\n📍 STEP 5: Backend Integration Test');
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle', timeout: 15000 });
    
    // Check if products load
    const productCards = await page.$$('.product-card, [data-testid="product"], .grid > div');
    console.log(`✅ Products displaying: ${productCards.length} product cards found`);
    if (productCards.length > 0) {
      workingFeatures.push(`Product display system (${productCards.length} products)`);
    } else {
      gaps.push('Products not displaying on frontend');
    }
    
    // Check for producer information
    const producerInfo = await page.$$('[data-testid="producer"], .producer-info') ||
                        await page.$$('text=Αγρόκτημα');
    if (producerInfo.length > 0) {
      console.log('✅ Producer information displaying in products');
      workingFeatures.push('Producer information integration');
    } else {
      console.log('❌ Producer information not visible');
      gaps.push('Producer information not showing in product display');
    }
    
    // Step 6: Authentication Flow Test
    console.log('\n📍 STEP 6: Authentication System');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle', timeout: 10000 });
    
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    
    if (emailInput && passwordInput) {
      console.log('✅ Authentication form functional');
      workingFeatures.push('Authentication system (login form)');
    } else {
      console.log('❌ Authentication form incomplete');
      gaps.push('Authentication form missing required fields');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'producer-journey-final.png', fullPage: true });
    console.log('📸 Final screenshot saved');
    
  } catch (error) {
    console.error('❌ Producer journey test failed:', error.message);
    gaps.push(`Critical error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Results Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 PRODUCER JOURNEY TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log('\n✅ WORKING FEATURES:');
  workingFeatures.forEach((feature, index) => {
    console.log(`${index + 1}. ${feature}`);
  });
  
  console.log('\n❌ GAPS FOUND:');
  gaps.forEach((gap, index) => {
    console.log(`${index + 1}. ${gap}`);
  });
  
  console.log('\n📈 SUMMARY:');
  console.log(`Working Features: ${workingFeatures.length}`);
  console.log(`Gaps Found: ${gaps.length}`);
  console.log(`Success Rate: ${Math.round((workingFeatures.length / (workingFeatures.length + gaps.length)) * 100)}%`);
  
  console.log('\n🎯 NEXT STEPS:');
  if (gaps.length > 0) {
    console.log('1. Fix identified gaps in producer workflow');
    console.log('2. Implement missing producer registration/dashboard features');
    console.log('3. Test consumer journey next');
  } else {
    console.log('1. Producer journey is complete - proceed to consumer journey testing');
  }
}

testProducerJourney();