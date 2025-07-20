<?php

namespace App\Helpers;

class Utils
{
    /**
     * Generate a random string of specified length.
     *
     * @param int $length
     * @return string
     */
    public static function generateRandomString(int $length = 10): string
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        
        return $randomString;
    }

    /**
     * Format a price with the Euro symbol.
     *
     * @param float $price
     * @return string
     */
    public static function formatPrice(float $price): string
    {
        return '€' . number_format($price, 2, '.', ',');
    }

    /**
     * Calculate tax amount based on price and tax rate.
     *
     * @param float $price
     * @param float $taxRate
     * @return float
     */
    public static function calculateTax(float $price, float $taxRate): float
    {
        return $price * ($taxRate / 100);
    }

    /**
     * Calculate discounted price.
     *
     * @param float $price
     * @param float $discountPercentage
     * @return float
     */
    public static function calculateDiscount(float $price, float $discountPercentage): float
    {
        return $price - ($price * ($discountPercentage / 100));
    }
}
