<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *     title="Dixis Marketplace API",
 *     version="1.0.0",
 *     description="Comprehensive API for the Dixis Greek Agricultural Marketplace Platform",
 *     termsOfService="https://dixis.io/terms",
 *     @OA\Contact(
 *         email="api@dixis.io",
 *         name="Dixis API Support"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="Dixis API Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Laravel Sanctum Bearer Token Authentication"
 * )
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication and registration endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Products",
 *     description="Product catalog management"
 * )
 * 
 * @OA\Tag(
 *     name="Producers",
 *     description="Producer profiles and management"
 * )
 * 
 * @OA\Tag(
 *     name="Cart",
 *     description="Shopping cart functionality"
 * )
 * 
 * @OA\Tag(
 *     name="Orders",
 *     description="Order management and processing"
 * )
 * 
 * @OA\Tag(
 *     name="Shipping",
 *     description="Shipping calculation and zone management"
 * )
 * 
 * @OA\Tag(
 *     name="Categories",
 *     description="Product category management"
 * )
 * 
 * @OA\Tag(
 *     name="Reviews",
 *     description="Product and producer reviews"
 * )
 * 
 * @OA\Tag(
 *     name="Wishlist",
 *     description="User wishlist management"
 * )
 * 
 * @OA\Tag(
 *     name="Adoptions",
 *     description="Agricultural adoption program"
 * )
 * 
 * @OA\Tag(
 *     name="Admin",
 *     description="Administrative functions (Admin role required)"
 * )
 * 
 * @OA\Tag(
 *     name="Producer Dashboard",
 *     description="Producer-specific functionality (Producer role required)"
 * )
 */
abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
