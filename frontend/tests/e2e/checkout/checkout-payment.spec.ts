import { test, expect } from '@playwright/test';

test.describe('Checkout and Payment Flow', () => {
  
  // Helper function to add product to cart
  const addProductToCart = async (page: any) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const addToCartButton = page.locator('text=/add to cart|προσθήκη στο καλάθι/i').first();
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(2000);
      return true;
    }
    return false;
  };

  test.beforeEach(async ({ page }) => {
    // Add a product to cart before each checkout test
    await addProductToCart(page);
  });

  test('should navigate to checkout from cart', async ({ page }) => {
    await page.goto('/cart');
    
    // Look for checkout button
    const checkoutButton = page.locator(
      'button:has-text(/checkout|ολοκλήρωση/i), a:has-text(/checkout|ολοκλήρωση/i), .checkout-btn'
    );
    
    if (await checkoutButton.count() > 0) {
      await checkoutButton.first().click();
      
      // Should navigate to checkout page
      await page.waitForURL('**/checkout', { timeout: 10000 });
      
      // Verify checkout page elements
      await expect(page.locator('h1, h2')).toContainText(/checkout|ολοκλήρωση/i);
      
      // Check for order summary
      const orderSummary = page.locator(
        '.order-summary, .checkout-summary, text=/order summary|περίληψη παραγγελίας/i'
      );
      if (await orderSummary.count() > 0) {
        await expect(orderSummary.first()).toBeVisible();
      }
    } else {
      test.skip(true, 'Checkout button not found');
    }
  });

  test('should display checkout steps and progress', async ({ page }) => {
    await page.goto('/checkout');
    
    // Look for checkout steps indicator
    const checkoutSteps = page.locator(
      '.checkout-steps, .steps, .progress, [data-testid*="step"]'
    );
    
    if (await checkoutSteps.count() > 0) {
      await expect(checkoutSteps.first()).toBeVisible();
      
      // Check for step indicators
      const stepItems = checkoutSteps.locator('.step, .step-item, li');
      const stepCount = await stepItems.count();
      
      expect(stepCount).toBeGreaterThanOrEqual(2); // At least shipping and payment
    }
    
    // Check for current step indication
    const activeStep = page.locator(
      '.step.active, .step.current, .active-step, [aria-current="step"]'
    );
    
    if (await activeStep.count() > 0) {
      await expect(activeStep.first()).toBeVisible();
    }
  });

  test('should fill shipping information form', async ({ page }) => {
    await page.goto('/checkout');
    
    // Look for shipping form
    const shippingForm = page.locator(
      'form, .shipping-form, .address-form, [data-testid*="shipping"]'
    );
    
    if (await shippingForm.count() > 0) {
      // Fill shipping address fields
      const shippingFields = [
        { selector: 'input[name*="firstName"], input[name*="first_name"]', value: 'Γιάννης' },
        { selector: 'input[name*="lastName"], input[name*="last_name"]', value: 'Παπαδόπουλος' },
        { selector: 'input[name*="email"]', value: 'test@example.com' },
        { selector: 'input[name*="phone"]', value: '+30 210 1234567' },
        { selector: 'input[name*="address"]', value: 'Πανεπιστημίου 25' },
        { selector: 'input[name*="city"]', value: 'Αθήνα' },
        { selector: 'input[name*="postal"], input[name*="zip"]', value: '10679' }
      ];
      
      for (const field of shippingFields) {
        const input = page.locator(field.selector);
        if (await input.count() > 0) {
          await input.fill(field.value);
        }
      }
      
      // Look for continue/next button
      const continueButton = page.locator(
        'button:has-text(/continue|συνέχεια/i), button:has-text(/next|επόμενο/i), .continue-btn'
      );
      
      if (await continueButton.count() > 0) {
        await continueButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should select shipping method', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill basic info first (if needed)
    const emailInput = page.locator('input[name*="email"]');
    if (await emailInput.count() > 0 && await emailInput.inputValue() === '') {
      await emailInput.fill('test@example.com');
    }
    
    // Look for shipping methods section
    const shippingMethods = page.locator(
      '.shipping-methods, .delivery-options, [data-testid*="shipping-method"]'
    );
    
    if (await shippingMethods.count() > 0) {
      await expect(shippingMethods.first()).toBeVisible();
      
      // Look for shipping options
      const shippingOptions = shippingMethods.locator(
        'input[type="radio"], .shipping-option, .delivery-option'
      );
      
      if (await shippingOptions.count() > 0) {
        // Select first shipping option
        await shippingOptions.first().check();
        
        // Check if shipping cost is displayed
        const shippingCost = page.locator(
          'text=/shipping cost|κόστος αποστολής/i, .shipping-cost, .delivery-cost'
        );
        
        if (await shippingCost.count() > 0) {
          await expect(shippingCost.first()).toBeVisible();
        }
      }
    }
  });

  test('should display order summary with correct totals', async ({ page }) => {
    await page.goto('/checkout');
    
    // Look for order summary section
    const orderSummary = page.locator(
      '.order-summary, .checkout-summary, .order-details'
    );
    
    if (await orderSummary.count() > 0) {
      await expect(orderSummary.first()).toBeVisible();
      
      // Check for order items
      const orderItems = orderSummary.locator('.order-item, .item, .product-line');
      if (await orderItems.count() > 0) {
        await expect(orderItems.first()).toBeVisible();
      }
      
      // Check for pricing breakdown
      const pricingElements = [
        'text=/subtotal|υποσύνολο/i',
        'text=/shipping|αποστολή/i',
        'text=/tax|φόρος/i',
        'text=/total|σύνολο/i'
      ];
      
      let visiblePricing = 0;
      for (const element of pricingElements) {
        const priceElement = page.locator(element);
        if (await priceElement.count() > 0) {
          visiblePricing++;
        }
      }
      
      expect(visiblePricing).toBeGreaterThanOrEqual(2); // At least subtotal and total
    }
  });

  test('should handle payment method selection', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill required fields first
    const requiredFields = [
      { selector: 'input[name*="email"]', value: 'test@example.com' },
      { selector: 'input[name*="firstName"]', value: 'Test' },
      { selector: 'input[name*="lastName"]', value: 'User' }
    ];
    
    for (const field of requiredFields) {
      const input = page.locator(field.selector);
      if (await input.count() > 0 && await input.inputValue() === '') {
        await input.fill(field.value);
      }
    }
    
    // Navigate to payment section
    const paymentSection = page.locator(
      '.payment-methods, .payment-section, [data-testid*="payment"]'
    );
    
    if (await paymentSection.count() > 0) {
      await expect(paymentSection.first()).toBeVisible();
      
      // Look for payment options
      const paymentOptions = paymentSection.locator(
        'input[type="radio"], .payment-option, .payment-method'
      );
      
      if (await paymentOptions.count() > 0) {
        // Select first payment method
        await paymentOptions.first().check();
        
        // Check for payment method labels
        const paymentLabels = page.locator(
          'text=/credit card|πιστωτική κάρτα/i, text=/paypal/i, text=/cash on delivery|αντικαταβολή/i'
        );
        
        if (await paymentLabels.count() > 0) {
          await expect(paymentLabels.first()).toBeVisible();
        }
      }
    }
  });

  test('should fill credit card information', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill required checkout fields first
    const basicFields = [
      { selector: 'input[name*="email"]', value: 'test@example.com' },
      { selector: 'input[name*="firstName"]', value: 'Test' },
      { selector: 'input[name*="lastName"]', value: 'User' },
      { selector: 'input[name*="address"]', value: 'Test Address 123' },
      { selector: 'input[name*="city"]', value: 'Athens' },
      { selector: 'input[name*="postal"]', value: '12345' }
    ];
    
    for (const field of basicFields) {
      const input = page.locator(field.selector);
      if (await input.count() > 0) {
        await input.fill(field.value);
      }
    }
    
    // Select credit card payment if available
    const creditCardOption = page.locator(
      'input[value*="card"], input[value*="credit"], text=/credit card|πιστωτική κάρτα/i'
    );
    
    if (await creditCardOption.count() > 0) {
      await creditCardOption.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Look for credit card form
    const cardForm = page.locator(
      '.card-form, .payment-form, [data-testid*="card"]'
    );
    
    if (await cardForm.count() > 0) {
      // Fill card details (using test card numbers)
      const cardFields = [
        { selector: 'input[name*="cardNumber"], input[placeholder*="card number"]', value: '4242424242424242' },
        { selector: 'input[name*="expiry"], input[placeholder*="MM/YY"]', value: '12/25' },
        { selector: 'input[name*="cvc"], input[placeholder*="CVC"]', value: '123' },
        { selector: 'input[name*="cardName"], input[placeholder*="name on card"]', value: 'Test User' }
      ];
      
      for (const field of cardFields) {
        const input = page.locator(field.selector);
        if (await input.count() > 0) {
          await input.fill(field.value);
        }
      }
    } else {
      // Might be using Stripe Elements or similar
      const stripeFrame = page.frameLocator('iframe[name*="stripe"], iframe[src*="stripe"]');
      if (stripeFrame) {
        const cardNumberInput = stripeFrame.locator('input[name="cardnumber"]');
        if (await cardNumberInput.count() > 0) {
          await cardNumberInput.fill('4242424242424242');
          
          const expiryInput = stripeFrame.locator('input[name="exp-date"]');
          if (await expiryInput.count() > 0) {
            await expiryInput.fill('1225');
          }
          
          const cvcInput = stripeFrame.locator('input[name="cvc"]');
          if (await cvcInput.count() > 0) {
            await cvcInput.fill('123');
          }
        }
      }
    }
  });

  test('should validate checkout form fields', async ({ page }) => {
    await page.goto('/checkout');
    
    // Try to submit empty form
    const submitButton = page.locator(
      'button[type="submit"], button:has-text(/place order|υποβολή παραγγελίας/i), .place-order-btn'
    );
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Look for validation errors
      const validationErrors = page.locator(
        '.error, .invalid, [role="alert"], .field-error, .validation-error'
      );
      
      if (await validationErrors.count() > 0) {
        await expect(validationErrors.first()).toBeVisible();
      }
      
      // Check specific field errors
      const emailError = page.locator('text=/email/i').locator('.error, .invalid');
      if (await emailError.count() > 0) {
        await expect(emailError.first()).toBeVisible();
      }
    }
  });

  test('should handle guest checkout', async ({ page }) => {
    await page.goto('/checkout');
    
    // Look for guest checkout option
    const guestOption = page.locator(
      'text=/guest checkout|επισκέπτης/i, input[value*="guest"], .guest-checkout'
    );
    
    if (await guestOption.count() > 0) {
      if (guestOption.first().inputValue !== undefined) {
        // It's a radio button or checkbox
        await guestOption.first().check();
      } else {
        // It's a link or button
        await guestOption.first().click();
      }
      
      await page.waitForTimeout(1000);
      
      // Should show guest checkout form
      const guestForm = page.locator('form, .checkout-form');
      await expect(guestForm.first()).toBeVisible();
      
      // Fill guest information
      await page.fill('input[name*="email"]', 'guest@example.com');
      
      // Should not require login
      const loginForm = page.locator('.login-form, text=/login|σύνδεση/i');
      expect(await loginForm.count()).toBe(0);
    }
  });

  test('should complete order placement flow', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill complete checkout form
    const checkoutData = {
      email: 'test@example.com',
      firstName: 'Γιάννης',
      lastName: 'Παπαδόπουλος',
      phone: '+30 210 1234567',
      address: 'Πανεπιστημίου 25',
      city: 'Αθήνα',
      postalCode: '10679'
    };
    
    // Fill form fields
    for (const [key, value] of Object.entries(checkoutData)) {
      const input = page.locator(`input[name*="${key}"], input[id*="${key}"]`);
      if (await input.count() > 0) {
        await input.fill(value);
      }
    }
    
    // Select shipping method if available
    const shippingOption = page.locator('input[name*="shipping"], .shipping-option').first();
    if (await shippingOption.count() > 0) {
      await shippingOption.check();
    }
    
    // Select payment method (cash on delivery if available)
    const codOption = page.locator(
      'input[value*="cod"], text=/cash on delivery|αντικαταβολή/i'
    );
    
    if (await codOption.count() > 0) {
      await codOption.first().click();
    }
    
    // Accept terms and conditions if required
    const termsCheckbox = page.locator(
      'input[name*="terms"], input[name*="agree"], .terms-checkbox'
    );
    
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
    }
    
    // Place order
    const placeOrderButton = page.locator(
      'button:has-text(/place order|υποβολή παραγγελίας/i), button:has-text(/complete order|ολοκλήρωση/i)'
    );
    
    if (await placeOrderButton.count() > 0) {
      await placeOrderButton.click();
      
      // Wait for order confirmation
      await page.waitForURL('**/order-success', { timeout: 15000 }).catch(async () => {
        // Might redirect to confirmation page with different URL
        await page.waitForTimeout(5000);
      });
      
      // Look for success message
      const successMessage = page.locator(
        'text=/order placed|παραγγελία υποβλήθηκε/i, text=/thank you|ευχαριστούμε/i, .order-success'
      );
      
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
      
      // Look for order number
      const orderNumber = page.locator(
        'text=/order number|αριθμός παραγγελίας/i, .order-id, .order-number'
      );
      
      if (await orderNumber.count() > 0) {
        await expect(orderNumber.first()).toBeVisible();
      }
    }
  });

  test('should handle payment errors gracefully', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill form with minimal data
    await page.fill('input[name*="email"]', 'test@example.com');
    
    // Simulate payment error by using invalid card
    const cardNumberInput = page.locator('input[name*="cardNumber"]');
    if (await cardNumberInput.count() > 0) {
      await cardNumberInput.fill('4000000000000002'); // Declined card
      await page.fill('input[name*="expiry"]', '12/25');
      await page.fill('input[name*="cvc"]', '123');
    }
    
    // Try to place order
    const placeOrderButton = page.locator(
      'button:has-text(/place order|υποβολή παραγγελίας/i)'
    );
    
    if (await placeOrderButton.count() > 0) {
      await placeOrderButton.click();
      await page.waitForTimeout(5000);
      
      // Look for error message
      const errorMessage = page.locator(
        'text=/payment failed|αποτυχία πληρωμής/i, text=/error|σφάλμα/i, .payment-error, .error-message'
      );
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
      
      // Should remain on checkout page
      expect(page.url()).toContain('checkout');
    }
  });

  test('should handle mobile checkout experience', async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 667 });
    }
    
    await page.goto('/checkout');
    
    // Check mobile layout
    const checkoutForm = page.locator('form, .checkout-container');
    if (await checkoutForm.count() > 0) {
      const formBox = await checkoutForm.first().boundingBox();
      expect(formBox?.width).toBeLessThanOrEqual(400);
    }
    
    // Test mobile form interaction
    await page.tap('input[name*="email"]');
    await page.fill('input[name*="email"]', 'mobile@test.com');
    
    // Check if mobile keyboard optimizations work
    const emailInput = page.locator('input[name*="email"]');
    const inputType = await emailInput.getAttribute('type');
    expect(inputType).toBe('email'); // Should trigger email keyboard
    
    // Test mobile payment interaction
    const paymentSection = page.locator('.payment-section, .payment-methods');
    if (await paymentSection.count() > 0) {
      await page.tap('input[type="radio"]', { force: true });
    }
  });

  test('should calculate order total correctly', async ({ page }) => {
    await page.goto('/checkout');
    
    // Get order summary
    const orderSummary = page.locator('.order-summary, .checkout-summary');
    
    if (await orderSummary.count() > 0) {
      // Get subtotal
      const subtotalElement = page.locator('text=/subtotal|υποσύνολο/i');
      let subtotal = 0;
      
      if (await subtotalElement.count() > 0) {
        const subtotalText = await subtotalElement.first().textContent();
        const match = subtotalText?.match(/[\d.,]+/);
        if (match) {
          subtotal = parseFloat(match[0].replace(',', '.'));
        }
      }
      
      // Get shipping cost
      const shippingElement = page.locator('text=/shipping|αποστολή/i');
      let shipping = 0;
      
      if (await shippingElement.count() > 0) {
        const shippingText = await shippingElement.first().textContent();
        const match = shippingText?.match(/[\d.,]+/);
        if (match) {
          shipping = parseFloat(match[0].replace(',', '.'));
        }
      }
      
      // Get total
      const totalElement = page.locator('text=/total|σύνολο/i');
      if (await totalElement.count() > 0) {
        const totalText = await totalElement.first().textContent();
        const match = totalText?.match(/[\d.,]+/);
        
        if (match && subtotal > 0) {
          const total = parseFloat(match[0].replace(',', '.'));
          const expectedTotal = subtotal + shipping;
          
          // Allow small rounding differences
          expect(Math.abs(total - expectedTotal)).toBeLessThan(0.01);
        }
      }
    }
  });
});