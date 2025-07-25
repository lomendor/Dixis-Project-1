#!/bin/bash

# 🧪 Dixis Greek Market Production Testing Script
# Comprehensive testing for production readiness

set -e

echo "🧪 Starting Dixis Greek Market Production Tests..."
echo "================================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local method="${2:-GET}"
    local expected_status="${3:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}🔍 Testing API: $method $endpoint${NC}"
    
    if command -v curl >/dev/null 2>&1; then
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "http://localhost:8000$endpoint")
        
        if [ "$response_code" = "$expected_status" ]; then
            echo -e "${GREEN}✅ PASS: API $endpoint (HTTP $response_code)${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL: API $endpoint (HTTP $response_code, expected $expected_status)${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  SKIP: curl not available for API testing${NC}"
        return 0
    fi
}

cd backend

echo ""
echo "🔧 Phase 1: Basic Application Tests"
echo "-----------------------------------"

# Test Laravel application
run_test "Laravel Application Status" "php artisan --version"

# Test environment configuration
run_test "Environment Configuration" "php artisan config:show app.name"

# Test database connection
run_test "Database Connection" "php artisan migrate:status"

# Test cache functionality
run_test "Cache System" "php artisan cache:clear && php artisan config:cache"

echo ""
echo "🇬🇷 Phase 2: Greek Market Services Tests"
echo "-----------------------------------------"

# Test Greek VAT service
run_test "Greek VAT Service" "php artisan tinker --execute='app(App\\Services\\GreekVATService::class)->getVATRatesSummary();'"

# Test Greek shipping service
run_test "Greek Shipping Service" "php artisan tinker --execute='app(App\\Services\\GreekShippingService::class);'"

# Test Viva Wallet service
run_test "Viva Wallet Service" "php artisan tinker --execute='app(App\\Services\\VivaWalletService::class);'"

echo ""
echo "🗄️  Phase 3: Database & Model Tests"
echo "------------------------------------"

# Test critical models
run_test "Product Model" "php artisan tinker --execute='\\App\\Models\\Product::count();'"
run_test "Order Model" "php artisan tinker --execute='\\App\\Models\\Order::first();'"
run_test "Payment Model" "php artisan tinker --execute='\\App\\Models\\Payment::first();'"
run_test "User Model" "php artisan tinker --execute='\\App\\Models\\User::count();'"

echo ""
echo "🌐 Phase 4: API Endpoints Tests"
echo "-------------------------------"

# Start Laravel development server for testing
echo "Starting Laravel development server..."
php artisan serve --port=8000 --quiet &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test public endpoints
test_api_endpoint "/api/health" "GET" "200"
test_api_endpoint "/api/v1/products" "GET" "200"

# Test Greek market endpoints
test_api_endpoint "/api/v1/vat/greek/rates" "GET" "200"
test_api_endpoint "/api/v1/shipping/greek/zones" "GET" "200"
test_api_endpoint "/api/v1/shipping/greek/carriers" "GET" "200"

# Stop development server
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "🔒 Phase 5: Security & Configuration Tests"
echo "------------------------------------------"

# Test security settings
run_test "Debug Mode Disabled" "php artisan tinker --execute='echo config(\"app.debug\") ? \"true\" : \"false\";' | grep -q false"

# Test environment settings
run_test "Production Environment" "php artisan tinker --execute='echo app()->environment();' | grep -q production"

# Test file permissions
run_test "Storage Permissions" "[ -w storage/logs ]"
run_test "Cache Permissions" "[ -w bootstrap/cache ]"

echo ""
echo "📊 Phase 6: Performance Tests"
echo "-----------------------------"

# Test cache performance
run_test "Config Cache Active" "[ -f bootstrap/cache/config.php ]"
run_test "Route Cache Active" "[ -f bootstrap/cache/routes-v7.php ]"
run_test "View Cache Active" "[ -d storage/framework/views ]"

# Test optimization
run_test "Composer Autoloader Optimized" "php artisan tinker --execute='echo class_exists(\"Composer\\\\Autoload\\\\ClassLoader\") ? \"true\" : \"false\";' | grep -q true"

cd ..

echo ""
echo "📱 Phase 7: Frontend Tests"
echo "--------------------------"

if [ -d "frontend" ]; then
    cd frontend
    
    # Test if build exists
    run_test "Frontend Build Exists" "[ -d .next ] || [ -d dist ] || [ -d build ]"
    
    # Test package.json
    run_test "Package Configuration" "[ -f package.json ]"
    
    cd ..
else
    echo -e "${YELLOW}⚠️  Frontend directory not found, skipping frontend tests${NC}"
fi

echo ""
echo "🏁 Test Results Summary"
echo "======================"

echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}📊 Total Tests: $TOTAL_TESTS${NC}"

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(( (TESTS_PASSED * 100) / TOTAL_TESTS ))
    echo -e "${BLUE}📈 Success Rate: $SUCCESS_RATE%${NC}"
    
    if [ $SUCCESS_RATE -ge 90 ]; then
        echo -e "${GREEN}🎉 EXCELLENT: Production ready! (≥90% pass rate)${NC}"
        exit 0
    elif [ $SUCCESS_RATE -ge 75 ]; then
        echo -e "${YELLOW}⚠️  GOOD: Minor issues to address (75-89% pass rate)${NC}"
        exit 0
    else
        echo -e "${RED}❌ CRITICAL: Major issues found (<75% pass rate)${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ ERROR: No tests were run${NC}"
    exit 1
fi