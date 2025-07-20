#!/bin/bash

# Dixis Backend Test Runner Script

echo "🧪 Dixis Backend Test Runner"
echo "============================"

# Check if we're in the correct directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: This script must be run from the backend directory"
    exit 1
fi

# Function to run tests
run_tests() {
    local test_type=$1
    local test_path=$2
    
    echo ""
    echo "🏃 Running $test_type tests..."
    echo "--------------------------------"
    
    if [ -z "$test_path" ]; then
        php artisan test
    else
        php artisan test "$test_path"
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ $test_type tests passed!"
    else
        echo "❌ $test_type tests failed!"
        return 1
    fi
}

# Function to setup test database
setup_test_db() {
    echo "🔧 Setting up test database..."
    
    # Create test database file if it doesn't exist
    if [ ! -f "database/testing.sqlite" ]; then
        touch database/testing.sqlite
        echo "✅ Created test database file"
    fi
    
    # Run migrations on test database
    php artisan migrate --env=testing --force
    
    if [ $? -eq 0 ]; then
        echo "✅ Test database setup complete!"
    else
        echo "❌ Failed to setup test database!"
        exit 1
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "Select test suite to run:"
    echo "1) All tests"
    echo "2) Unit tests only"
    echo "3) Feature tests only"
    echo "4) Integration tests (API flows)"
    echo "5) Specific test file"
    echo "6) Setup test database"
    echo "7) Run with coverage"
    echo "0) Exit"
    echo ""
    read -p "Enter your choice: " choice
    
    case $choice in
        1)
            run_tests "All"
            ;;
        2)
            run_tests "Unit" "tests/Unit"
            ;;
        3)
            run_tests "Feature" "tests/Feature"
            ;;
        4)
            echo "Running Integration Tests..."
            run_tests "Authentication Flow" "tests/Feature/Api/AuthenticationFlowTest.php"
            run_tests "Cart to Order Flow" "tests/Feature/Api/CartToOrderFlowTest.php"
            run_tests "Producer Dashboard Flow" "tests/Feature/Api/ProducerDashboardFlowTest.php"
            run_tests "Admin Dashboard Flow" "tests/Feature/Api/AdminDashboardFlowTest.php"
            run_tests "Shipping Calculation Flow" "tests/Feature/Api/ShippingCalculationFlowTest.php"
            ;;
        5)
            read -p "Enter test file path: " test_file
            run_tests "Specific" "$test_file"
            ;;
        6)
            setup_test_db
            ;;
        7)
            echo "Running tests with coverage..."
            php artisan test --coverage
            ;;
        0)
            echo "Goodbye! 👋"
            exit 0
            ;;
        *)
            echo "Invalid choice!"
            ;;
    esac
}

# Check PHP version
php_version=$(php -v | head -n 1 | cut -d " " -f 2)
echo "PHP Version: $php_version"

# Check if PHPUnit is installed
if ! [ -x "$(command -v phpunit)" ] && ! [ -f "vendor/bin/phpunit" ]; then
    echo "⚠️  PHPUnit not found. Installing dependencies..."
    composer install
fi

# Main loop
while true; do
    show_menu
    echo ""
    read -p "Press Enter to continue..."
done