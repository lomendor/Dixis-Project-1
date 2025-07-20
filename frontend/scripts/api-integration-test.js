#!/usr/bin/env node

/**
 * API Integration Test - Cart & Products
 * Tests the complete API flow from products to cart
 */

async function runAPITests() {
  console.log('🚀 Dixis API Integration Test\n');
  
  const BASE_URL = 'http://localhost:3000';
  let testResults = [];
  
  const logTest = (name, success, details = null) => {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
    if (details) {
      console.log(`   ${details}`);
    }
    testResults.push({ name, success, details });
  };
  
  try {
    // Test 1: Products API
    console.log('1️⃣ Testing Products API...');
    const productsResponse = await fetch(`${BASE_URL}/api/products?per_page=3`);
    const productsData = await productsResponse.json();
    
    if (productsResponse.ok && productsData.data && productsData.data.length > 0) {
      logTest('Products API', true, `Found ${productsData.data.length} products`);
      
      // Get first product for cart testing
      const testProduct = productsData.data[0];
      console.log(`   Using product: ${testProduct.name} (ID: ${testProduct.id})`);
      
      // Test 2: Create Guest Cart
      console.log('\n2️⃣ Testing Cart Creation...');
      const cartResponse = await fetch(`${BASE_URL}/api/cart/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const cartData = await cartResponse.json();
      
      if (cartResponse.ok && cartData.id) {
        logTest('Guest Cart Creation', true, `Cart ID: ${cartData.id}`);
        const cartId = cartData.id;
        
        // Test 3: Add Item to Cart
        console.log('\n3️⃣ Testing Add to Cart...');
        const addItemResponse = await fetch(`${BASE_URL}/api/cart/${cartId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: testProduct.id,
            quantity: 2
          })
        });
        const addItemData = await addItemResponse.json();
        
        if (addItemResponse.ok && addItemData.items && addItemData.items.length > 0) {
          logTest('Add Item to Cart', true, `Added ${addItemData.items[0].productName} x${addItemData.items[0].quantity}`);
          
          // Test 4: Get Cart
          console.log('\n4️⃣ Testing Get Cart...');
          const getCartResponse = await fetch(`${BASE_URL}/api/cart/${cartId}`);
          const getCartData = await getCartResponse.json();
          
          if (getCartResponse.ok && getCartData.items.length > 0) {
            logTest('Get Cart', true, `Cart has ${getCartData.itemCount} items, total: €${getCartData.total}`);
            
            // Test 5: Update Item Quantity
            console.log('\n5️⃣ Testing Update Cart Item...');
            const itemId = getCartData.items[0].id;
            const updateResponse = await fetch(`${BASE_URL}/api/cart/${cartId}/items`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                item_id: itemId,
                quantity: 3
              })
            });
            
            if (updateResponse.ok) {
              logTest('Update Item Quantity', true, 'Quantity updated successfully');
              
              // Test 6: Remove Item
              console.log('\n6️⃣ Testing Remove Cart Item...');
              const removeResponse = await fetch(`${BASE_URL}/api/cart/${cartId}/items?item_id=${itemId}`, {
                method: 'DELETE'
              });
              
              if (removeResponse.ok) {
                logTest('Remove Cart Item', true, 'Item removed successfully');
                
                // Test 7: Clear Cart
                console.log('\n7️⃣ Testing Clear Cart...');
                const clearResponse = await fetch(`${BASE_URL}/api/cart/${cartId}`, {
                  method: 'DELETE'
                });
                
                if (clearResponse.ok) {
                  logTest('Clear Cart', true, 'Cart cleared successfully');
                } else {
                  logTest('Clear Cart', false, `HTTP ${clearResponse.status}`);
                }
              } else {
                logTest('Remove Cart Item', false, `HTTP ${removeResponse.status}`);
              }
            } else {
              logTest('Update Item Quantity', false, `HTTP ${updateResponse.status}`);
            }
          } else {
            logTest('Get Cart', false, 'Cart empty or not found');
          }
        } else {
          logTest('Add Item to Cart', false, `HTTP ${addItemResponse.status}`);
        }
      } else {
        logTest('Guest Cart Creation', false, `HTTP ${cartResponse.status}`);
      }
    } else {
      logTest('Products API', false, `HTTP ${productsResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const passed = testResults.filter(t => t.success).length;
  const total = testResults.length;
  const failed = total - passed;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Cart & API integration is working correctly!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
  
  return failed === 0;
}

// Run the tests
runAPITests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });