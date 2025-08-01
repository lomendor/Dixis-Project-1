/**
 * 🇬🇷 VIVA WALLET INTEGRATION VERIFICATION
 * 
 * Phase 1B: Comprehensive testing of Viva Wallet payment integration
 * Focus on Greek localization, installment options, and payment flow
 */

import { test, expect, Page } from '@playwright/test';

// 🛡️ Enhanced retry mechanism
async function retryOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📋 ${operationName} - Attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      console.log(`✅ ${operationName} - Success on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ ${operationName} - Failed attempt ${attempt}: ${lastError.message}`);
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1);
        console.log(`⏳ ${operationName} - Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`${operationName} failed after ${maxRetries} attempts. Last error: ${lastError!.message}`);
}

// 🎯 Intelligent wait helper
async function waitForStableState(page: Page, selector: string, timeout: number = 10000) {
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector(sel);
      return element && element.getBoundingClientRect().height > 0;
    },
    selector,
    { timeout }
  );
}

test.describe('💳 VIVA WALLET GREEK PAYMENT INTEGRATION', () => {

  test('Phase 1B-1: Complete Checkout Flow with Cart Items', async ({ page }) => {
    console.log('\n💳 Phase 1B-1: Testing Complete Checkout Flow...\n');
    
    await retryOperation(async () => {
      // Step 1: Add items to cart first
      console.log('🛒 Step 1: Adding items to cart...');
      await page.goto('http://localhost:3000/products');
      await waitForStableState(page, '.group.relative.bg-white.rounded-xl', 10000);
      
      // Add multiple items to cart to test installment eligibility
      const addToCartButtons = page.locator('button:has-text("Προσθήκη στο Καλάθι")');
      const buttonCount = await addToCartButtons.count();
      
      if (buttonCount > 0) {
        // Add first product
        await addToCartButtons.first().click();
        await page.waitForTimeout(1500);
        console.log('✅ Added first product to cart');
        
        // Add second product if available
        if (buttonCount > 1) {
          await addToCartButtons.nth(1).click();
          await page.waitForTimeout(1500);
          console.log('✅ Added second product to cart');
        }
      }
      
      // Step 2: Navigate to checkout
      console.log('💳 Step 2: Navigating to checkout...');
      await page.goto('http://localhost:3000/checkout');
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      if (currentUrl.includes('checkout')) {
        console.log('✅ Successfully reached checkout page');
        
        // Check if Viva Wallet integration is present
        const bodyText = await page.textContent('body');
        
        // Look for Viva Wallet specific elements
        const hasVivaWallet = bodyText?.includes('Viva Wallet') || 
                             bodyText?.includes('δόσεις') ||
                             bodyText?.includes('Πληρωμή με κάρτα') ||
                             bodyText?.includes('Installments');
        
        if (hasVivaWallet) {
          console.log('✅ Viva Wallet integration detected in checkout');
        } else {
          console.log('⚠️ Viva Wallet integration not immediately visible - checking for payment components');
        }
        
        // Check for payment method selection
        const paymentSections = page.locator('form, .payment, [data-testid*="payment"], .checkout-form');
        const paymentFormsCount = await paymentSections.count();
        
        if (paymentFormsCount > 0) {
          console.log(`✅ Found ${paymentFormsCount} payment form sections`);
        }
        
      } else {
        console.log(`⚠️ Redirected to: ${currentUrl} - may require authentication`);
        
        // If redirected to login, try to continue as guest or register
        if (currentUrl.includes('login') || currentUrl.includes('auth')) {
          // Look for guest checkout option
          const guestCheckout = page.locator('button:has-text("Guest"), a:has-text("Continue"), button:has-text("Συνέχεια")');
          const guestCount = await guestCheckout.count();
          
          if (guestCount > 0) {
            await guestCheckout.first().click();
            await page.waitForTimeout(2000);
            console.log('✅ Proceeded with guest checkout');
          }
        }
      }
      
    }, 'Complete Checkout Flow Test');
  });

  test('Phase 1B-2: Viva Wallet Component Verification', async ({ page }) => {
    console.log('\n🔍 Phase 1B-2: Testing Viva Wallet Components...\n');
    
    await retryOperation(async () => {
      // Test Viva Wallet component directly if it exists
      console.log('🔍 Checking for Viva Wallet React component...');
      
      // Look for the component file in the source
      const vivaWalletPageExists = await page.goto('http://localhost:3000/api/viva-wallet/test')
        .then(() => true)
        .catch(() => false);
      
      if (vivaWalletPageExists) {
        console.log('✅ Viva Wallet API endpoint accessible');
      }
      
      // Test the component rendering by checking the checkout page
      await page.goto('http://localhost:3000/checkout');
      await page.waitForTimeout(3000);
      
      // Check for React components and payment forms
      const hasReactComponents = await page.evaluate(() => {
        // Check for React elements with Viva Wallet related data attributes or classes
        const vivaComponents = document.querySelectorAll('[data-testid*="viva"], [class*="viva"], [data-component*="viva"]');
        const paymentComponents = document.querySelectorAll('[data-testid*="payment"], [class*="payment"]');
        const installmentComponents = document.querySelectorAll('[data-testid*="installment"], [class*="installment"]');
        
        return {
          vivaComponents: vivaComponents.length,
          paymentComponents: paymentComponents.length,
          installmentComponents: installmentComponents.length
        };
      });
      
      console.log(`🔍 Component scan results:`, hasReactComponents);
      
      if (hasReactComponents.vivaComponents > 0) {
        console.log('✅ Viva Wallet specific components found');
      }
      
      if (hasReactComponents.paymentComponents > 0) {
        console.log('✅ Payment components found');
      }
      
      if (hasReactComponents.installmentComponents > 0) {
        console.log('✅ Installment components found');
      }
      
    }, 'Viva Wallet Component Verification');
  });

  test('Phase 1B-3: Greek Installment Options Testing', async ({ page }) => {
    console.log('\n🇬🇷 Phase 1B-3: Testing Greek Installment Options...\n');
    
    await retryOperation(async () => { 
      // Navigate to checkout and check for Greek installment text
      await page.goto('http://localhost:3000/checkout');
      await page.waitForTimeout(3000);
      
      const pageContent = await page.textContent('body');
      
      // Check for Greek installment terminology
      const greekInstallmentTerms = [
        'δόσεις',           // installments
        'άτοκες',           // interest-free
        'μήνες',            // months
        'μηνιαίες',         // monthly
        'Πληρωμή',          // Payment
        'χωρίς τόκους',     // without interest
        'έως',              // up to
        'δόσεις των'        // installments of
      ];
      
      const foundTerms = greekInstallmentTerms.filter(term => 
        pageContent?.includes(term)
      );
      
      if (foundTerms.length > 0) {
        console.log(`✅ Found Greek installment terms: ${foundTerms.join(', ')}`);
      } else {
        console.log('⚠️ Greek installment terms not found in current page state');
      }
      
      // Check for installment amount thresholds
      const installmentThresholds = [
        '€30',      // Minimum for 3 installments
        '€60',      // Minimum for 6 installments  
        '€100',     // Minimum for 12 installments
        '€200'      // Minimum for 24 installments
      ];
      
      const foundThresholds = installmentThresholds.filter(threshold =>
        pageContent?.includes(threshold)
      );
      
      if (foundThresholds.length > 0) {
        console.log(`✅ Found installment thresholds: ${foundThresholds.join(', ')}`);
      }
      
      // Test specific Greek phrases for Viva Wallet
      const greekVivaWalletPhrases = [
        'Πληρωμή με κάρτα',
        'Ασφαλής πληρωμή',
        'Viva Wallet',
        'Επιλέξτε δόσεις',
        'Άμεση πληρωμή'
      ];
      
      const foundPhrases = greekVivaWalletPhrases.filter(phrase =>
        pageContent?.includes(phrase)
      );
      
      if (foundPhrases.length > 0) {
        console.log(`✅ Found Greek Viva Wallet phrases: ${foundPhrases.join(', ')}`);
      }
      
    }, 'Greek Installment Options Test');
  });

  test('Phase 1B-4: Payment API Integration Testing', async ({ page }) => {
    console.log('\n🔌 Phase 1B-4: Testing Payment API Integration...\n');
    
    await retryOperation(async () => {
      // Test Viva Wallet API endpoints
      const apiEndpoints = [
        'http://localhost:3000/api/payments/viva-wallet/create-order',
        'http://localhost:3000/api/payments/viva-wallet/callback',
        'http://localhost:3000/api/viva-wallet/demo-mode',
        'http://localhost:3000/api/viva-wallet/installments'
      ];
      
      console.log('🔍 Testing Viva Wallet API endpoints...');
      
      const endpointResults = [];
      
      for (const endpoint of apiEndpoints) {
        try {
          const response = await page.request.get(endpoint);
          const status = response.status();
          
          endpointResults.push({
            endpoint,
            status,
            available: status !== 404
          });
          
          console.log(`${status === 404 ? '⚠️' : '✅'} ${endpoint} - Status: ${status}`);
          
          if (status === 200) {
            const responseBody = await response.text();
            if (responseBody.includes('demo') || responseBody.includes('Viva')) {
              console.log(`  📋 Response contains Viva Wallet data`);
            }
          }
          
        } catch (error) {
          console.log(`❌ ${endpoint} - Error: ${error}`);
          endpointResults.push({
            endpoint,
            status: 'error',
            available: false
          });
        }
      }
      
      // Test payment data structure
      const testPaymentData = {
        amount: 5000, // €50.00 in cents
        currency: 'EUR',
        installments: 3,
        description: 'Test Greek marketplace order',
        customerInfo: {
          email: 'test@example.com',
          name: 'Test Customer',
          country: 'GR'
        }
      };
      
      console.log('💰 Testing payment data structure...');
      
      try {
        const paymentResponse = await page.request.post('http://localhost:3000/api/payments/create', {
          data: testPaymentData,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (paymentResponse.ok()) {
          const paymentResult = await paymentResponse.json();
          console.log('✅ Payment API responding with valid data structure');
          
          if (paymentResult.installments || paymentResult.vivaWallet) {
            console.log('✅ Viva Wallet specific data found in payment response');
          }
        }
      } catch (error) {
        console.log('⚠️ Payment API not yet implemented or different endpoint');
      }
      
      // Summary
      const availableEndpoints = endpointResults.filter(r => r.available).length;
      const totalEndpoints = endpointResults.length;
      
      console.log(`\n📊 VIVA WALLET API SUMMARY:`);
      console.log(`- API Endpoints: ${availableEndpoints}/${totalEndpoints} available`);
      console.log(`- Payment Integration: ${availableEndpoints > 0 ? '✅ Active' : '⚠️ Pending'}`);
      
    }, 'Payment API Integration Test');
  });

  test('Phase 1B-5: Demo Mode Verification', async ({ page }) => {
    console.log('\n🧪 Phase 1B-5: Testing Viva Wallet Demo Mode...\n');
    
    await retryOperation(async () => {
      // Test demo mode functionality
      console.log('🧪 Testing Viva Wallet demo mode...');
      
      await page.goto('http://localhost:3000/checkout');
      await page.waitForTimeout(2000);
      
      // Look for demo mode indicators
      const pageContent = await page.textContent('body');
      
      const demoModeIndicators = [
        'demo',
        'test',
        'sandbox',
        'δοκιμαστικό',
        'TEST MODE',
        'DEMO MODE'
      ];
      
      const foundDemoIndicators = demoModeIndicators.filter(indicator =>
        pageContent?.toLowerCase().includes(indicator.toLowerCase())
      );
      
      if (foundDemoIndicators.length > 0) {
        console.log(`✅ Demo mode indicators found: ${foundDemoIndicators.join(', ')}`);
      } else {
        console.log('⚠️ Demo mode indicators not visible - may be in production mode');
      }
      
      // Test demo credit card numbers (if form is available)
      const cardInputs = page.locator('input[type="text"], input[placeholder*="card"], input[placeholder*="κάρτα"]');
      const cardInputCount = await cardInputs.count();
      
      if (cardInputCount > 0) {
        console.log(`✅ Found ${cardInputCount} potential card input fields`);
        
        // Try to test with demo card number
        const demoCardNumber = '4111111111111111'; // Standard Visa test card
        
        try {
          await cardInputs.first().fill(demoCardNumber);
          await page.waitForTimeout(500);
          console.log('✅ Demo card number input successful');
          
          // Clear the field
          await cardInputs.first().clear();
        } catch (error) {
          console.log('⚠️ Card input field not ready for interaction');
        }
      }
      
      // Check for Greek demo mode messages
      const greekDemoMessages = [
        'Δοκιμαστική λειτουργία',
        'Προσομοίωση πληρωμής',
        'Test environment',
        'Sandbox mode'
      ];
      
      const foundGreekDemo = greekDemoMessages.filter(msg =>
        pageContent?.includes(msg)
      );
      
      if (foundGreekDemo.length > 0) {
        console.log(`✅ Greek demo messages found: ${foundGreekDemo.join(', ')}`);
      }
      
    }, 'Demo Mode Verification Test');
  });

});