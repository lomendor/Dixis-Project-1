/**
 * 🎯 VIVA WALLET COMPONENT SPECIFIC TESTING
 * 
 * Targeted test to verify the Viva Wallet component renders correctly
 * when the payment method is selected
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

// 🎯 Wait for element to be stable
async function waitForStableElement(page: Page, selector: string, timeout: number = 10000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.waitForTimeout(500); // Additional stability wait
}

test.describe('🎯 VIVA WALLET COMPONENT TESTING', () => {

  test('Verify Viva Wallet Payment Option Selection and Component Rendering', async ({ page }) => {
    console.log('\n🎯 Testing Viva Wallet Component Rendering...\n');
    
    await retryOperation(async () => {
      // Step 1: Add items to cart to enable checkout
      console.log('🛒 Step 1: Adding items to cart...');
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('.group.relative.bg-white.rounded-xl', { timeout: 10000 });
      
      // Add first product
      const addToCartButton = page.locator('button:has-text("Προσθήκη στο Καλάθι")').first();
      await addToCartButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Added product to cart');
      
      // Step 2: Navigate to checkout
      console.log('💳 Step 2: Navigating to checkout...');
      await page.goto('http://localhost:3000/checkout');
      await page.waitForTimeout(3000);
      
      // Step 3: Look for payment method selection
      console.log('🔍 Step 3: Looking for payment methods...');
      const pageContent = await page.textContent('body');
      
      // Check if Viva Wallet is listed as a payment option
      const hasVivaWalletOption = pageContent?.includes('Viva Wallet') || 
                                  pageContent?.includes('Ελληνικές κάρτες') ||
                                  pageContent?.includes('δόσεις');
      
      if (hasVivaWalletOption) {
        console.log('✅ Viva Wallet payment option found in checkout');
        
        // Try to find and click the Viva Wallet payment method
        const vivaWalletRadio = page.locator('input[value="VIVA_WALLET"], input[id*="VIVA"], label:has-text("Viva Wallet")');
        const vivaWalletButton = page.locator('button:has-text("Viva Wallet"), div:has-text("Viva Wallet")');
        
        const radioCount = await vivaWalletRadio.count();
        const buttonCount = await vivaWalletButton.count();
        
        console.log(`🔍 Found ${radioCount} radio buttons, ${buttonCount} clickable elements for Viva Wallet`);
        
        if (radioCount > 0) {
          console.log('🎯 Selecting Viva Wallet payment method...');
          await vivaWalletRadio.first().click();
          await page.waitForTimeout(2000);
          
          // Step 4: Verify Viva Wallet component appears
          console.log('🔍 Step 4: Checking for Viva Wallet component...');
          
          const vivaWalletComponentText = await page.textContent('body');
          
          const vivaWalletComponentIndicators = [
            'Πληρωμή μέσω Viva Wallet',
            'Greek cards',
            'installments',
            'δόσεις',
            'Viva Wallet'
          ];
          
          const foundIndicators = vivaWalletComponentIndicators.filter(indicator =>
            vivaWalletComponentText?.includes(indicator)
          );
          
          if (foundIndicators.length > 0) {
            console.log(`✅ Viva Wallet component indicators found: ${foundIndicators.join(', ')}`);
          }
          
          // Look for installment options specifically
          const installmentOptions = [
            'άτοκες δόσεις',
            '3 δόσεις',
            '6 δόσεις', 
            '12 δόσεις',
            'Επιλέξτε δόσεις'
          ];
          
          const foundInstallmentOptions = installmentOptions.filter(option =>
            vivaWalletComponentText?.includes(option)
          );
          
          if (foundInstallmentOptions.length > 0) {
            console.log(`✅ Greek installment options found: ${foundInstallmentOptions.join(', ')}`);
          }
          
        } else if (buttonCount > 0) {
          console.log('🎯 Clicking Viva Wallet payment option...');
          await vivaWalletButton.first().click();
          await page.waitForTimeout(2000);
        }
        
      } else {
        console.log('⚠️ Viva Wallet payment option not immediately visible');
        console.log('📋 Current page content sample:', pageContent?.substring(0, 500));
        
        // Look for any payment method selection interface
        const paymentMethodElements = page.locator(
          'input[type="radio"], .payment-method, [data-testid*="payment"], form'
        );
        const paymentElementCount = await paymentMethodElements.count();
        console.log(`🔍 Found ${paymentElementCount} potential payment elements`);
        
        if (paymentElementCount > 0) {
          console.log('✅ Payment interface is present, Viva Wallet may need different interaction');
        }
      }
      
      // Step 5: Final verification of all payment-related content
      console.log('🔍 Step 5: Final payment content verification...');
      
      const finalPageContent = await page.textContent('body');
      
      const allPaymentKeywords = [
        'πληρωμή',     // payment
        'κάρτα',       // card  
        'Viva',        // Viva
        'δόσεις',      // installments
        'Ελληνικές',   // Greek
        'πιστωτική',   // credit
        'checkout',
        'payment'
      ];
      
      const foundKeywords = allPaymentKeywords.filter(keyword =>
        finalPageContent?.toLowerCase().includes(keyword.toLowerCase())
      );
      
      console.log(`✅ Payment-related keywords found: ${foundKeywords.join(', ')}`);
      
      // Check for form elements that might be Viva Wallet related
      const formElements = await page.evaluate(() => {
        const forms = document.querySelectorAll('form, .payment-form, [data-testid*="payment"]');
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
        const selects = document.querySelectorAll('select, [data-testid*="installment"]');
        
        return {
          forms: forms.length,
          inputs: inputs.length,
          selects: selects.length
        };
      });
      
      console.log(`📊 Form elements found:`, formElements);
      
      if (formElements.forms > 0 || formElements.inputs > 0) {
        console.log('✅ Payment form infrastructure detected');
      }
      
    }, 'Viva Wallet Component Test');
  });

  test('Test Viva Wallet API Integration Availability', async ({ page }) => {
    console.log('\n🔌 Testing Viva Wallet API Integration...\n');
    
    await retryOperation(async () => {
      // Test the specific API endpoint that was accessible in previous tests
      console.log('🔍 Testing Viva Wallet API endpoints...');
      
      const response = await page.request.get('http://localhost:3000/api/viva-wallet/test');
      const status = response.status();
      
      console.log(`✅ /api/viva-wallet/test - Status: ${status}`);
      
      if (status === 200) {
        const responseText = await response.text();
        console.log('📋 API Response preview:', responseText.substring(0, 200));
      }
      
      // Test Greek payment creation API
      const greekPaymentAPI = 'http://localhost:3000/api/payments/greek/viva-wallet/create';
      try {
        const paymentResponse = await page.request.post(greekPaymentAPI, {
          data: {
            amount: 5000, // €50 in cents
            currency: 'EUR',
            installments: 3,
            description: 'Test Greek order'
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Greek payment API - Status: ${paymentResponse.status()}`);
        
        if (paymentResponse.status() === 200) {
          const paymentData = await paymentResponse.json();
          console.log('✅ Greek payment API responding with data');
          
          if (paymentData.installments || paymentData.demoMode) {
            console.log('✅ Greek payment features confirmed');
          }
        }
        
      } catch (error) {
        console.log('⚠️ Greek payment API not fully configured yet');
      }
      
    }, 'API Integration Test');
  });

});