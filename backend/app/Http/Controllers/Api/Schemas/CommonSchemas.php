<?php

namespace App\Http\Controllers\Api\Schemas;

/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     title="User",
 *     description="User model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(
 *         property="roles",
 *         type="array",
 *         @OA\Items(type="string", example="consumer")
 *     ),
 *     @OA\Property(
 *         property="permissions",
 *         type="array",
 *         @OA\Items(type="string")
 *     )
 * )
 */

/**
 * @OA\Schema(
 *     schema="Producer",
 *     type="object",
 *     title="Producer",
 *     description="Producer profile",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="business_name", type="string", example="Organic Farm Co."),
 *     @OA\Property(property="contact_name", type="string", example="Maria Papadopoulou"),
 *     @OA\Property(property="description", type="string", nullable=true),
 *     @OA\Property(property="short_description", type="string", nullable=true),
 *     @OA\Property(property="phone", type="string", example="+302101234567"),
 *     @OA\Property(property="email", type="string", format="email", example="info@organicfarm.gr"),
 *     @OA\Property(property="address", type="string", example="123 Farm Road"),
 *     @OA\Property(property="city", type="string", example="Athens"),
 *     @OA\Property(property="region", type="string", example="Attica"),
 *     @OA\Property(property="postal_code", type="string", example="10001"),
 *     @OA\Property(property="website", type="string", format="url", nullable=true),
 *     @OA\Property(property="tax_id", type="string", example="123456789"),
 *     @OA\Property(property="is_verified", type="boolean", example=true),
 *     @OA\Property(property="verification_status", type="string", enum={"pending", "approved", "rejected"}),
 *     @OA\Property(property="logo", type="string", nullable=true),
 *     @OA\Property(property="cover_image", type="string", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */

/**
 * @OA\Schema(
 *     schema="Product",
 *     type="object",
 *     title="Product",
 *     description="Product model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="producer_id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Organic Tomatoes"),
 *     @OA\Property(property="slug", type="string", example="organic-tomatoes"),
 *     @OA\Property(property="description", type="string"),
 *     @OA\Property(property="short_description", type="string", nullable=true),
 *     @OA\Property(property="price", type="number", format="decimal", example=3.50),
 *     @OA\Property(property="unit", type="string", example="kg"),
 *     @OA\Property(property="stock", type="integer", example=100),
 *     @OA\Property(property="weight", type="integer", example=1000, description="Weight in grams"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="is_featured", type="boolean", example=false),
 *     @OA\Property(property="status", type="string", enum={"draft", "pending_approval", "approved", "rejected"}),
 *     @OA\Property(property="sku", type="string", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(
 *         property="producer",
 *         ref="#/components/schemas/Producer"
 *     ),
 *     @OA\Property(
 *         property="images",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/ProductImage")
 *     ),
 *     @OA\Property(
 *         property="categories",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/ProductCategory")
 *     )
 * )
 */

/**
 * @OA\Schema(
 *     schema="ProductImage",
 *     type="object",
 *     title="Product Image",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="product_id", type="integer", example=1),
 *     @OA\Property(property="image_path", type="string", example="products/tomatoes-1.jpg"),
 *     @OA\Property(property="is_main", type="boolean", example=true),
 *     @OA\Property(property="alt_text", type="string", nullable=true),
 *     @OA\Property(property="order", type="integer", example=1)
 * )
 */

/**
 * @OA\Schema(
 *     schema="ProductCategory",
 *     type="object",
 *     title="Product Category",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Vegetables"),
 *     @OA\Property(property="slug", type="string", example="vegetables"),
 *     @OA\Property(property="description", type="string", nullable=true),
 *     @OA\Property(property="parent_id", type="integer", nullable=true),
 *     @OA\Property(property="type", type="string", enum={"main", "sub"}),
 *     @OA\Property(property="order", type="integer", example=1),
 *     @OA\Property(
 *         property="children",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/ProductCategory")
 *     )
 * )
 */

/**
 * @OA\Schema(
 *     schema="Order",
 *     type="object",
 *     title="Order",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="order_number", type="string", example="ORD-2024-001"),
 *     @OA\Property(property="status", type="string", enum={"pending", "processing", "shipped", "delivered", "cancelled"}),
 *     @OA\Property(property="subtotal", type="number", format="decimal", example=35.50),
 *     @OA\Property(property="shipping_cost", type="number", format="decimal", example=5.00),
 *     @OA\Property(property="total", type="number", format="decimal", example=40.50),
 *     @OA\Property(property="notes", type="string", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(
 *         property="items",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/OrderItem")
 *     ),
 *     @OA\Property(property="user", ref="#/components/schemas/User"),
 *     @OA\Property(property="shipping_address", ref="#/components/schemas/Address"),
 *     @OA\Property(property="billing_address", ref="#/components/schemas/Address")
 * )
 */

/**
 * @OA\Schema(
 *     schema="OrderItem",
 *     type="object",
 *     title="Order Item",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="order_id", type="integer", example=1),
 *     @OA\Property(property="product_id", type="integer", example=1),
 *     @OA\Property(property="quantity", type="integer", example=2),
 *     @OA\Property(property="price", type="number", format="decimal", example=3.50),
 *     @OA\Property(property="subtotal", type="number", format="decimal", example=7.00),
 *     @OA\Property(property="status", type="string", enum={"pending", "processing", "shipped", "delivered"}),
 *     @OA\Property(property="product", ref="#/components/schemas/Product")
 * )
 */

/**
 * @OA\Schema(
 *     schema="Cart",
 *     type="object",
 *     title="Shopping Cart",
 *     @OA\Property(property="id", type="string", example="cart_123456"),
 *     @OA\Property(property="user_id", type="integer", nullable=true),
 *     @OA\Property(property="subtotal", type="number", format="decimal", example=35.50),
 *     @OA\Property(property="total", type="number", format="decimal", example=35.50),
 *     @OA\Property(property="items_count", type="integer", example=3),
 *     @OA\Property(
 *         property="items",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/CartItem")
 *     ),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */

/**
 * @OA\Schema(
 *     schema="CartItem",
 *     type="object",
 *     title="Cart Item",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="cart_id", type="string", example="cart_123456"),
 *     @OA\Property(property="product_id", type="integer", example=1),
 *     @OA\Property(property="quantity", type="integer", example=2),
 *     @OA\Property(property="price", type="number", format="decimal", example=3.50),
 *     @OA\Property(property="subtotal", type="number", format="decimal", example=7.00),
 *     @OA\Property(property="product", ref="#/components/schemas/Product")
 * )
 */

/**
 * @OA\Schema(
 *     schema="Address",
 *     type="object",
 *     title="Address",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="type", type="string", enum={"shipping", "billing"}),
 *     @OA\Property(property="first_name", type="string", example="John"),
 *     @OA\Property(property="last_name", type="string", example="Doe"),
 *     @OA\Property(property="company", type="string", nullable=true),
 *     @OA\Property(property="address_line_1", type="string", example="123 Main St"),
 *     @OA\Property(property="address_line_2", type="string", nullable=true),
 *     @OA\Property(property="city", type="string", example="Athens"),
 *     @OA\Property(property="state", type="string", example="Attica"),
 *     @OA\Property(property="postal_code", type="string", example="10001"),
 *     @OA\Property(property="country", type="string", example="Greece"),
 *     @OA\Property(property="phone", type="string", nullable=true)
 * )
 */

/**
 * @OA\Schema(
 *     schema="ShippingRate",
 *     type="object",
 *     title="Shipping Rate",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="shipping_zone_id", type="integer", example=1),
 *     @OA\Property(property="delivery_method_id", type="integer", example=1),
 *     @OA\Property(property="weight_tier_id", type="integer", example=1),
 *     @OA\Property(property="rate", type="number", format="decimal", example=5.00),
 *     @OA\Property(property="zone", ref="#/components/schemas/ShippingZone"),
 *     @OA\Property(property="delivery_method", ref="#/components/schemas/DeliveryMethod"),
 *     @OA\Property(property="weight_tier", ref="#/components/schemas/WeightTier")
 * )
 */

/**
 * @OA\Schema(
 *     schema="ShippingZone",
 *     type="object",
 *     title="Shipping Zone",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Athens"),
 *     @OA\Property(property="code", type="string", example="ATH"),
 *     @OA\Property(property="is_active", type="boolean", example=true)
 * )
 */

/**
 * @OA\Schema(
 *     schema="DeliveryMethod",
 *     type="object",
 *     title="Delivery Method",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Standard Delivery"),
 *     @OA\Property(property="code", type="string", example="standard"),
 *     @OA\Property(property="description", type="string", nullable=true),
 *     @OA\Property(property="is_active", type="boolean", example=true)
 * )
 */

/**
 * @OA\Schema(
 *     schema="WeightTier",
 *     type="object",
 *     title="Weight Tier",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="0-2kg"),
 *     @OA\Property(property="min_weight", type="integer", example=0),
 *     @OA\Property(property="max_weight", type="integer", example=2000)
 * )
 */

/**
 * @OA\Schema(
 *     schema="Review",
 *     type="object",
 *     title="Review",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="product_id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="rating", type="integer", minimum=1, maximum=5, example=5),
 *     @OA\Property(property="comment", type="string"),
 *     @OA\Property(property="status", type="string", enum={"pending", "approved", "rejected"}),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="user", ref="#/components/schemas/User"),
 *     @OA\Property(property="product", ref="#/components/schemas/Product")
 * )
 */

/**
 * @OA\Schema(
 *     schema="ApiResponse",
 *     type="object",
 *     title="API Response",
 *     @OA\Property(property="message", type="string", example="Operation completed successfully"),
 *     @OA\Property(property="data", type="object", nullable=true),
 *     @OA\Property(property="errors", type="object", nullable=true)
 * )
 */

/**
 * @OA\Schema(
 *     schema="ValidationError",
 *     type="object",
 *     title="Validation Error Response",
 *     @OA\Property(property="message", type="string", example="The given data was invalid."),
 *     @OA\Property(
 *         property="errors",
 *         type="object",
 *         @OA\AdditionalProperties(
 *             type="array",
 *             @OA\Items(type="string")
 *         ),
 *         example={
 *             "email": {"The email field is required."},
 *             "password": {"The password must be at least 8 characters."}
 *         }
 *     )
 * )
 */

/**
 * @OA\Schema(
 *     schema="PaginatedResponse",
 *     type="object",
 *     title="Paginated Response",
 *     @OA\Property(
 *         property="data",
 *         type="array",
 *         @OA\Items(type="object")
 *     ),
 *     @OA\Property(property="current_page", type="integer", example=1),
 *     @OA\Property(property="per_page", type="integer", example=15),
 *     @OA\Property(property="total", type="integer", example=150),
 *     @OA\Property(property="last_page", type="integer", example=10),
 *     @OA\Property(property="from", type="integer", example=1),
 *     @OA\Property(property="to", type="integer", example=15),
 *     @OA\Property(property="path", type="string", example="/api/v1/products"),
 *     @OA\Property(property="first_page_url", type="string"),
 *     @OA\Property(property="last_page_url", type="string"),
 *     @OA\Property(property="next_page_url", type="string", nullable=true),
 *     @OA\Property(property="prev_page_url", type="string", nullable=true)
 * )
 */

class CommonSchemas
{
    // This class exists only to hold the OpenAPI schema definitions
}