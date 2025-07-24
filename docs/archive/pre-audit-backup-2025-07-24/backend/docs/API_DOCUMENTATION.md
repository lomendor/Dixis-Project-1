# Dixis API Documentation

## Overview

The Dixis Marketplace API provides comprehensive functionality for managing an agricultural marketplace platform. It supports multiple user roles (consumers, producers, admins) and includes features for product management, order processing, shipping calculations, and more.

## Documentation Access

### Swagger UI Interface
- **URL**: `http://localhost:8000/api/documentation`
- **Features**: Interactive API testing, endpoint documentation, schema browser
- **Best for**: Development, testing, API exploration

### JSON Schema
- **URL**: `http://localhost:8000/docs/api-docs.json`
- **Format**: OpenAPI 3.1.0 specification
- **Best for**: API client generation, integration, automation

## Quick Start

### 1. Generate Documentation

```bash
# Using the helper script (recommended)
./generate_docs.sh

# Or using Laravel Artisan
php artisan l5-swagger:generate

# Or using our custom command
php artisan api:docs --generate
```

### 2. View Documentation

Start your Laravel development server:
```bash
php artisan serve
```

Then visit: `http://localhost:8000/api/documentation`

## API Structure

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
The API uses Laravel Sanctum for authentication. Include the bearer token in requests:

```bash
curl -H "Authorization: Bearer {your-token}" \
     http://localhost:8000/api/v1/protected-endpoint
```

### Response Format
All API responses follow a consistent structure:

```json
{
    "message": "Operation completed successfully",
    "data": { ... },
    "errors": null
}
```

## Core Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /logout` - User logout
- `GET /user` - Get authenticated user

### Products
- `GET /products` - List products with filtering
- `GET /products/{slug}` - Get product details
- `GET /products/featured` - Get featured products
- `GET /products/search` - Search products

### Cart & Orders
- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PUT /cart/items/{id}` - Update cart item
- `POST /orders` - Create order
- `GET /orders` - Get user's orders

### Producers
- `GET /producers` - List producers
- `GET /producers/{id}` - Get producer details
- `GET /producers/{id}/products` - Get producer's products

### Shipping
- `POST /shipping/calculate` - Calculate shipping costs
- `GET /shipping/zones` - Get shipping zones
- `POST /shipping/find-zone` - Find zone by postal code

## User Roles & Permissions

### Consumer
- Browse products and producers
- Manage cart and orders
- Write reviews
- Manage wishlist

### Producer
- Manage products and inventory
- Process orders
- Configure shipping
- Answer questions
- Manage profile and documents

### Admin
- Manage all users and producers
- Moderate reviews and questions
- Configure system settings
- Manage categories and shipping

## Advanced Features

### Multi-Producer Orders
The system supports orders containing products from multiple producers, with automatic order splitting and coordination.

### Shipping Calculation
Advanced shipping calculation considering:
- Weight tiers
- Shipping zones (based on postal codes)
- Producer-specific rates
- Free shipping thresholds

### Greek Marketplace Specialization
- PDO/PGI product certification
- Greek postal code zone mapping
- Localized content and messages
- Agricultural adoption programs

## API Client Examples

### JavaScript/Fetch
```javascript
// Login
const response = await fetch('/api/v1/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password'
    })
});

const data = await response.json();
const token = data.token;

// Authenticated request
const products = await fetch('/api/v1/products', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    }
});
```

### PHP/Guzzle
```php
use GuzzleHttp\Client;

$client = new Client(['base_uri' => 'http://localhost:8000/api/v1/']);

// Login
$response = $client->post('login', [
    'json' => [
        'email' => 'user@example.com',
        'password' => 'password'
    ]
]);

$data = json_decode($response->getBody(), true);
$token = $data['token'];

// Authenticated request
$response = $client->get('products', [
    'headers' => [
        'Authorization' => "Bearer {$token}",
        'Accept' => 'application/json'
    ]
]);
```

### Python/Requests
```python
import requests

base_url = 'http://localhost:8000/api/v1'

# Login
response = requests.post(f'{base_url}/login', json={
    'email': 'user@example.com',
    'password': 'password'
})

token = response.json()['token']

# Authenticated request
headers = {
    'Authorization': f'Bearer {token}',
    'Accept': 'application/json'
}

products = requests.get(f'{base_url}/products', headers=headers)
```

## Error Handling

### Standard HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authenticated users**: 60 requests per minute
- **Unauthenticated users**: 30 requests per minute
- **Admin endpoints**: 120 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## Testing

### Manual Testing
Use the Swagger UI at `/api/documentation` for interactive testing.

### Automated Testing
API endpoints are covered by comprehensive integration tests:

```bash
# Run API tests
php artisan test tests/Feature/Api/

# Run specific test suite
php artisan test tests/Feature/Api/AuthenticationFlowTest.php
```

## Development Workflow

### 1. Adding New Endpoints

1. Create controller method
2. Add route in `routes/api.php`
3. Add OpenAPI annotations
4. Regenerate documentation
5. Write tests

### 2. OpenAPI Annotations

Use OpenAPI 3.1.0 annotations in your controllers:

```php
/**
 * @OA\Get(
 *     path="/api/v1/products",
 *     operationId="getProducts",
 *     tags={"Products"},
 *     summary="Get products list",
 *     @OA\Parameter(
 *         name="page",
 *         in="query",
 *         description="Page number",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Products retrieved successfully",
 *         @OA\JsonContent(ref="#/components/schemas/PaginatedResponse")
 *     )
 * )
 */
public function index(Request $request) { ... }
```

### 3. Schema Definitions

Define reusable schemas in `app/Http/Controllers/Api/Schemas/CommonSchemas.php`:

```php
/**
 * @OA\Schema(
 *     schema="Product",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Organic Tomatoes"),
 *     @OA\Property(property="price", type="number", format="decimal", example=3.50)
 * )
 */
```

## Production Deployment

### Environment Variables

Set these in your production `.env`:

```env
L5_SWAGGER_GENERATE_ALWAYS=false
L5_SWAGGER_CONST_HOST=https://your-domain.com
APP_URL=https://your-domain.com
```

### Security Considerations

1. **Disable auto-generation** in production (`L5_SWAGGER_GENERATE_ALWAYS=false`)
2. **Protect documentation** with middleware if needed
3. **Use HTTPS** for all API endpoints
4. **Implement proper CORS** settings
5. **Monitor rate limits** and adjust as needed

### CDN Setup

For better performance, serve static documentation assets via CDN:

```php
// config/l5-swagger.php
'ui' => [
    'assets_path' => env('SWAGGER_UI_ASSETS_PATH', '/vendor/swagger-api/swagger-ui/dist/'),
]
```

## Support & Troubleshooting

### Common Issues

**Documentation not generating?**
- Check OpenAPI annotations syntax
- Ensure controller files are in the scan path
- Run `composer dump-autoload`

**Swagger UI not loading?**
- Verify Laravel server is running
- Check browser console for JavaScript errors
- Ensure assets are published

**Authentication not working?**
- Verify Sanctum configuration
- Check token format (Bearer prefix)
- Ensure routes are in `auth:sanctum` middleware group

### Getting Help

1. Check the [L5-Swagger documentation](https://github.com/DarkaOnLine/L5-Swagger)
2. Review [OpenAPI 3.1.0 specification](https://swagger.io/specification/)
3. Run `./generate_docs.sh` for validation and examples
4. Check Laravel logs in `storage/logs/laravel.log`

## Changelog

### Version 1.0.0
- Initial API documentation setup
- Complete authentication endpoints
- Product catalog management
- Shopping cart functionality
- Order processing system
- Multi-producer support
- Greek localization
- Comprehensive testing suite