# Dixis Backend Tests

## Overview

Αυτό το directory περιέχει όλα τα tests για το Dixis marketplace backend. Τα tests είναι οργανωμένα σε:

- **Unit Tests**: Μεμονωμένα tests για models, services, και utilities
- **Feature Tests**: Tests για ολοκληρωμένα features και API endpoints
- **Integration Tests**: End-to-end tests για critical business flows

## Test Structure

```
tests/
├── Unit/                    # Unit tests
│   ├── Models/             # Model tests
│   ├── Services/           # Service tests
│   └── Controllers/        # Controller unit tests
├── Feature/                # Feature tests
│   ├── Api/               # API integration tests
│   │   ├── AuthenticationFlowTest.php
│   │   ├── CartToOrderFlowTest.php
│   │   ├── ProducerDashboardFlowTest.php
│   │   ├── AdminDashboardFlowTest.php
│   │   └── ShippingCalculationFlowTest.php
│   └── ...
└── TestCase.php           # Base test class
```

## Running Tests

### Quick Start

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Run specific test file
php artisan test tests/Feature/Api/AuthenticationFlowTest.php

# Run with coverage
php artisan test --coverage
```

### Using Test Runner Script

```bash
# Make script executable (first time only)
chmod +x run_tests.sh

# Run the interactive test runner
./run_tests.sh
```

## Critical Test Flows

### 1. Authentication Flow (`AuthenticationFlowTest.php`)
Tests the complete authentication cycle:
- User registration (consumer & producer)
- Login/logout
- Password reset
- Email verification
- Profile updates

### 2. Cart to Order Flow (`CartToOrderFlowTest.php`)
Tests the shopping experience:
- Adding items to cart
- Cart management (update/remove)
- Shipping calculation
- Order creation
- Stock management
- Multi-producer orders

### 3. Producer Dashboard Flow (`ProducerDashboardFlowTest.php`)
Tests producer functionality:
- Product management (CRUD)
- Order management
- Question answering
- Shipping configuration
- Profile management
- Document uploads

### 4. Admin Dashboard Flow (`AdminDashboardFlowTest.php`)
Tests admin operations:
- Producer verification
- Category management
- Review moderation
- User management
- Order management
- Shipping configuration
- Settings management

### 5. Shipping Calculation Flow (`ShippingCalculationFlowTest.php`)
Tests shipping system:
- Zone detection
- Rate calculation
- Weight tier selection
- Multi-producer shipping
- Custom producer rates
- Free shipping rules

## Test Database Setup

The tests use a separate SQLite database to avoid affecting development data.

```bash
# Create test database
touch database/testing.sqlite

# Run migrations on test database
php artisan migrate --env=testing

# Or use the test runner
./run_tests.sh
# Select option 6 (Setup test database)
```

## Writing New Tests

### Basic Test Structure

```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class YourFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup test data
    }

    public function test_your_feature_works_correctly()
    {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        $response = $this->actingAs($user)
            ->postJson('/api/v1/your-endpoint', [
                'data' => 'value'
            ]);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Success'
            ]);
    }
}
```

### Best Practices

1. **Use Factories**: Always use factories for creating test data
2. **Test Happy Path & Edge Cases**: Cover both successful and failure scenarios
3. **Use RefreshDatabase**: Ensure clean database for each test
4. **Test Authorization**: Verify role-based access control
5. **Test Validation**: Ensure proper validation rules
6. **Use Descriptive Names**: Test method names should describe what they test

## Common Test Helpers

### Authentication

```php
// Act as authenticated user
Sanctum::actingAs($user);

// Act as specific role
$user->assignRole('producer');
Sanctum::actingAs($user);
```

### Assertions

```php
// Response assertions
$response->assertStatus(200);
$response->assertJson(['key' => 'value']);
$response->assertJsonStructure(['data' => ['id', 'name']]);
$response->assertJsonValidationErrors(['email']);

// Database assertions
$this->assertDatabaseHas('users', ['email' => 'test@example.com']);
$this->assertDatabaseMissing('orders', ['status' => 'cancelled']);
```

### Creating Test Data

```php
// Single record
$product = Product::factory()->create();

// Multiple records
$products = Product::factory()->count(5)->create();

// With specific attributes
$producer = Producer::factory()->create([
    'is_verified' => true
]);

// With relationships
$product = Product::factory()
    ->for($producer)
    ->has(ProductImage::factory()->count(3))
    ->create();
```

## Continuous Integration

Tests are automatically run on:
- Push to main branch
- Pull requests
- Daily scheduled runs

See `.github/workflows/laravel.yml` for CI configuration.

## Troubleshooting

### Common Issues

1. **Database not found**: Run `touch database/testing.sqlite`
2. **Migrations fail**: Check `.env.testing` database configuration
3. **Permission denied**: Run `chmod +x run_tests.sh`
4. **Tests timeout**: Increase PHP memory limit or test timeout

### Debug Mode

```bash
# Run tests with detailed output
php artisan test --debug

# Stop on first failure
php artisan test --stop-on-failure
```

## Coverage Reports

Generate coverage reports:

```bash
# HTML coverage report
php artisan test --coverage-html=coverage

# Console coverage summary
php artisan test --coverage
```

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Add integration tests for critical flows
4. Update this README if needed