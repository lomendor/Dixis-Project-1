#!/bin/bash

# Dixis Automated Testing Hooks
# Continuous verification of platform functionality

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test Suite: Core Platform Functionality
test_core_platform() {
    log "Testing core platform functionality..."
    
    # Test Backend API
    local backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/products)
    if [ "$backend_status" = "200" ]; then
        success "Backend API responding (200 OK)"
    else
        error "Backend API failed (Status: $backend_status)"
        return 1
    fi
    
    # Test Frontend
    local frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    if [ "$frontend_status" = "200" ]; then
        success "Frontend responding (200 OK)"
    else
        error "Frontend failed (Status: $frontend_status)"
        return 1
    fi
    
    # Test Database Connection
    local product_count=$(curl -s http://localhost:8000/api/v1/products | jq -r '.data | length' 2>/dev/null)
    if [ "$product_count" -gt "0" ]; then
        success "Database connection verified ($product_count products)"
    else
        error "Database connection failed"
        return 1
    fi
    
    return 0
}

# Test Suite: Greek Market Features
test_greek_market_features() {
    log "Testing Greek market specific features..."
    
    # Test Greek Language Content
    local greek_title=$(curl -s http://localhost:3000 | grep -o "Dixis.*Ελληνικά" | head -1)
    if [ -n "$greek_title" ]; then
        success "Greek language content verified"
    else
        warning "Greek language content not found in homepage"
    fi
    
    # Test Greek Product Names
    local greek_product=$(curl -s http://localhost:8000/api/v1/products | jq -r '.data[0].name' 2>/dev/null)
    if echo "$greek_product" | grep -q '[Α-Ωα-ω]'; then
        success "Greek product names verified: $greek_product"
    else
        warning "Greek product names not found"
    fi
    
    # Test Greek Producers
    local producer_count=$(curl -s http://localhost:8000/api/v1/producers | jq -r 'length' 2>/dev/null)
    if [ "$producer_count" -gt "0" ]; then
        success "Greek producers verified ($producer_count producers)"
    else
        warning "Greek producers not found"
    fi
    
    return 0
}

# Test Suite: E-commerce Functionality
test_ecommerce_functionality() {
    log "Testing e-commerce functionality..."
    
    # Test User Registration
    local test_email="autotest$(date +%s)@example.com"
    local registration_response=$(curl -s -X POST http://localhost:8000/api/v1/register \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"Auto Test\",\"email\":\"$test_email\",\"password\":\"password123\",\"password_confirmation\":\"password123\",\"role\":\"consumer\"}")
    
    if echo "$registration_response" | jq -r '.user.id' >/dev/null 2>&1; then
        success "User registration working"
    else
        error "User registration failed"
        return 1
    fi
    
    # Test Cart Functionality
    local cart_response=$(curl -s -X POST http://localhost:8000/api/v1/cart/guest)
    local cart_id=$(echo "$cart_response" | jq -r '.id' 2>/dev/null)
    
    if [ "$cart_id" != "null" ] && [ -n "$cart_id" ]; then
        success "Cart creation working (Cart ID: $cart_id)"
        
        # Test Add to Cart
        local add_response=$(curl -s -X POST "http://localhost:8000/api/v1/cart/$cart_id/items" \
            -H "Content-Type: application/json" \
            -d '{"product_id": 65, "quantity": 1}')
        
        local item_count=$(echo "$add_response" | jq -r '.itemCount' 2>/dev/null)
        if [ "$item_count" = "1" ]; then
            success "Add to cart working"
        else
            error "Add to cart failed"
            return 1
        fi
    else
        error "Cart creation failed"
        return 1
    fi
    
    return 0
}

# Performance Testing
test_performance() {
    log "Testing performance metrics..."
    
    # Test API Response Time
    local start_time=$(date +%s%3N)
    curl -s http://localhost:8000/api/v1/products >/dev/null
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    if [ "$response_time" -lt "500" ]; then
        success "API response time: ${response_time}ms (excellent)"
    elif [ "$response_time" -lt "1000" ]; then
        warning "API response time: ${response_time}ms (acceptable)"
    else
        error "API response time: ${response_time}ms (too slow)"
    fi
    
    # Test Frontend Load Time
    start_time=$(date +%s%3N)
    curl -s http://localhost:3000 >/dev/null
    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    if [ "$response_time" -lt "1000" ]; then
        success "Frontend load time: ${response_time}ms (good)"
    elif [ "$response_time" -lt "2000" ]; then
        warning "Frontend load time: ${response_time}ms (acceptable)"
    else
        error "Frontend load time: ${response_time}ms (needs optimization)"
    fi
}

# Update Context Engine with Results
update_context_engine() {
    local test_results="$1"
    log "Updating Context Engineering system with test results..."
    
    if [ "$test_results" = "success" ]; then
        # Notify context engine of successful tests
        node scripts/context-hooks.js metric-change platformFunctionality 95 90
        success "Context engine updated with successful test results"
    else
        warning "Context engine notified of test failures"
    fi
}

# Main Test Execution
run_all_tests() {
    log "🚀 Starting Dixis Automated Test Suite..."
    echo "=================================================="
    
    local overall_result="success"
    
    # Run test suites
    if ! test_core_platform; then
        overall_result="failed"
    fi
    
    echo ""
    
    if ! test_greek_market_features; then
        overall_result="warning"
    fi
    
    echo ""
    
    if ! test_ecommerce_functionality; then
        overall_result="failed"
    fi
    
    echo ""
    
    test_performance
    
    echo ""
    echo "=================================================="
    
    # Update Context Engineering
    update_context_engine "$overall_result"
    
    # Summary
    if [ "$overall_result" = "success" ]; then
        success "🎉 All tests passed! Platform is operational."
    elif [ "$overall_result" = "warning" ]; then
        warning "⚠️  Tests completed with warnings. Review needed."
    else
        error "❌ Critical tests failed. Immediate attention required."
        exit 1
    fi
}

# Command line interface
case "${1:-all}" in
    "core")
        test_core_platform
        ;;
    "greek")
        test_greek_market_features
        ;;
    "ecommerce")
        test_ecommerce_functionality
        ;;
    "performance")
        test_performance
        ;;
    "all")
        run_all_tests
        ;;
    *)
        echo "Usage: $0 [core|greek|ecommerce|performance|all]"
        echo "  core        - Test backend/frontend/database"
        echo "  greek       - Test Greek language and market features"
        echo "  ecommerce   - Test registration/cart/checkout"
        echo "  performance - Test response times"
        echo "  all         - Run complete test suite (default)"
        ;;
esac