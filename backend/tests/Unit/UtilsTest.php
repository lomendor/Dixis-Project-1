<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Helpers\Utils;

class UtilsTest extends TestCase
{
    /**
     * Test generating a random string.
     */
    public function test_generate_random_string(): void
    {
        $length = 10;
        $randomString = Utils::generateRandomString($length);
        
        $this->assertEquals($length, strlen($randomString));
        $this->assertMatchesRegularExpression('/^[a-zA-Z0-9]+$/', $randomString);
    }

    /**
     * Test formatting a price.
     */
    public function test_format_price(): void
    {
        $price = 10.99;
        $formattedPrice = Utils::formatPrice($price);
        
        $this->assertEquals('€10.99', $formattedPrice);
    }

    /**
     * Test calculating tax.
     */
    public function test_calculate_tax(): void
    {
        $price = 100;
        $taxRate = 24; // 24%
        
        $tax = Utils::calculateTax($price, $taxRate);
        
        $this->assertEquals(24, $tax);
    }

    /**
     * Test calculating discount.
     */
    public function test_calculate_discount(): void
    {
        $price = 100;
        $discountPercentage = 10; // 10%
        
        $discountedPrice = Utils::calculateDiscount($price, $discountPercentage);
        
        $this->assertEquals(90, $discountedPrice);
    }
}
