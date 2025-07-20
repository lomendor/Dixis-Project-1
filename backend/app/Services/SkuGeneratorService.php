<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Producer;
use App\Models\ProductCategory;
use Illuminate\Support\Str;

class SkuGeneratorService
{
    /**
     * Generate a unique SKU for a new product
     *
     * @param array $productData Product data including producer_id, category_id, and name
     * @return string The generated SKU
     */
    public function generateSku(array $productData): string
    {
        // Get producer prefix (first 3 letters of producer business name)
        $producerPrefix = $this->getProducerPrefix($productData['producer_id'] ?? null);
        
        // Get category prefix (first 2 letters of category name)
        $categoryPrefix = $this->getCategoryPrefix($productData['category_id'] ?? null);
        
        // Get product name prefix (first 3 letters of product name)
        $namePrefix = $this->getNamePrefix($productData['name'] ?? '');
        
        // Generate a unique 4-digit number
        $uniqueNumber = $this->generateUniqueNumber();
        
        // Combine all parts to create the SKU
        $sku = strtoupper($producerPrefix . '-' . $categoryPrefix . '-' . $namePrefix . '-' . $uniqueNumber);
        
        // Ensure the SKU is unique
        return $this->ensureUniqueSku($sku);
    }
    
    /**
     * Get the producer prefix (first 3 letters of producer business name)
     *
     * @param int|null $producerId The producer ID
     * @return string The producer prefix
     */
    private function getProducerPrefix(?int $producerId): string
    {
        if (!$producerId) {
            return 'XXX';
        }
        
        $producer = Producer::find($producerId);
        if (!$producer) {
            return 'XXX';
        }
        
        $businessName = $producer->business_name ?? $producer->user->name ?? '';
        $businessName = $this->transliterateGreekToLatin($businessName);
        
        // Get first 3 letters, remove spaces and special characters
        $prefix = preg_replace('/[^A-Za-z0-9]/', '', $businessName);
        $prefix = substr($prefix, 0, 3);
        
        return $prefix ?: 'XXX';
    }
    
    /**
     * Get the category prefix (first 2 letters of category name)
     *
     * @param int|null $categoryId The category ID
     * @return string The category prefix
     */
    private function getCategoryPrefix(?int $categoryId): string
    {
        if (!$categoryId) {
            return 'XX';
        }
        
        $category = ProductCategory::find($categoryId);
        if (!$category) {
            return 'XX';
        }
        
        $categoryName = $category->name ?? '';
        $categoryName = $this->transliterateGreekToLatin($categoryName);
        
        // Get first 2 letters, remove spaces and special characters
        $prefix = preg_replace('/[^A-Za-z0-9]/', '', $categoryName);
        $prefix = substr($prefix, 0, 2);
        
        return $prefix ?: 'XX';
    }
    
    /**
     * Get the product name prefix (first 3 letters of product name)
     *
     * @param string $productName The product name
     * @return string The product name prefix
     */
    private function getNamePrefix(string $productName): string
    {
        $productName = $this->transliterateGreekToLatin($productName);
        
        // Get first 3 letters, remove spaces and special characters
        $prefix = preg_replace('/[^A-Za-z0-9]/', '', $productName);
        $prefix = substr($prefix, 0, 3);
        
        return $prefix ?: 'XXX';
    }
    
    /**
     * Generate a unique 4-digit number
     *
     * @return string The unique number
     */
    private function generateUniqueNumber(): string
    {
        // Get the current timestamp microseconds and take the last 4 digits
        $timestamp = microtime(true) * 10000;
        $number = str_pad(substr($timestamp, -4), 4, '0', STR_PAD_LEFT);
        
        return $number;
    }
    
    /**
     * Ensure the SKU is unique by adding a suffix if necessary
     *
     * @param string $sku The SKU to check
     * @return string The unique SKU
     */
    private function ensureUniqueSku(string $sku): string
    {
        $originalSku = $sku;
        $counter = 1;
        
        while (Product::where('sku', $sku)->exists()) {
            $sku = $originalSku . '-' . $counter++;
        }
        
        return $sku;
    }
    
    /**
     * Transliterate Greek characters to Latin
     *
     * @param string $text The text to transliterate
     * @return string The transliterated text
     */
    private function transliterateGreekToLatin(string $text): string
    {
        $greek = [
            'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π',
            'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'ά', 'έ', 'ή', 'ί', 'ό', 'ύ', 'ώ', 'ϊ',
            'ϋ', 'ΐ', 'ΰ', 'ς',
            'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π',
            'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω', 'Ά', 'Έ', 'Ή', 'Ί', 'Ό', 'Ύ', 'Ώ', 'Ϊ', 'Ϋ'
        ];
        
        $latin = [
            'a', 'b', 'g', 'd', 'e', 'z', 'i', 'th', 'i', 'k', 'l', 'm', 'n', 'x', 'o', 'p',
            'r', 's', 't', 'y', 'f', 'ch', 'ps', 'o', 'a', 'e', 'i', 'i', 'o', 'y', 'o', 'i',
            'y', 'i', 'y', 's',
            'A', 'B', 'G', 'D', 'E', 'Z', 'I', 'TH', 'I', 'K', 'L', 'M', 'N', 'X', 'O', 'P',
            'R', 'S', 'T', 'Y', 'F', 'CH', 'PS', 'O', 'A', 'E', 'I', 'I', 'O', 'Y', 'O', 'I', 'Y'
        ];
        
        return str_replace($greek, $latin, $text);
    }
}
