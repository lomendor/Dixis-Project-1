<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Helpers\Validation;

class ValidationTest extends TestCase
{
    /**
     * Test email validation.
     */
    public function test_email_validation(): void
    {
        $validEmails = [
            'test@example.com',
            'user.name@example.com',
            'user+tag@example.com',
            'user@subdomain.example.com',
        ];
        
        $invalidEmails = [
            'test',
            'test@',
            '@example.com',
            'test@example',
            'test@.com',
        ];
        
        foreach ($validEmails as $email) {
            $this->assertTrue(Validation::isValidEmail($email), "Email $email should be valid");
        }
        
        foreach ($invalidEmails as $email) {
            $this->assertFalse(Validation::isValidEmail($email), "Email $email should be invalid");
        }
    }

    /**
     * Test password validation.
     */
    public function test_password_validation(): void
    {
        $validPasswords = [
            'Password123',
            'StrongP@ssw0rd',
            'P@ssw0rd!',
        ];
        
        $invalidPasswords = [
            'pass',         // Too short
            'password',     // No uppercase or numbers
            'PASSWORD123',  // No lowercase
            'Password',     // No numbers
        ];
        
        foreach ($validPasswords as $password) {
            $this->assertTrue(Validation::isValidPassword($password), "Password $password should be valid");
        }
        
        foreach ($invalidPasswords as $password) {
            $this->assertFalse(Validation::isValidPassword($password), "Password $password should be invalid");
        }
    }

    /**
     * Test phone number validation.
     */
    public function test_phone_validation(): void
    {
        $validPhones = [
            '+306912345678',
            '00306912345678',
            '6912345678',
        ];
        
        $invalidPhones = [
            '123',          // Too short
            'abcdefghij',   // Not a number
            '12345',        // Too short
        ];
        
        foreach ($validPhones as $phone) {
            $this->assertTrue(Validation::isValidPhone($phone), "Phone $phone should be valid");
        }
        
        foreach ($invalidPhones as $phone) {
            $this->assertFalse(Validation::isValidPhone($phone), "Phone $phone should be invalid");
        }
    }

    /**
     * Test postal code validation.
     */
    public function test_postal_code_validation(): void
    {
        $validPostalCodes = [
            '12345',
            '54321',
        ];
        
        $invalidPostalCodes = [
            '123',          // Too short
            'abcde',        // Not a number
            '1234567',      // Too long
        ];
        
        foreach ($validPostalCodes as $postalCode) {
            $this->assertTrue(Validation::isValidPostalCode($postalCode), "Postal code $postalCode should be valid");
        }
        
        foreach ($invalidPostalCodes as $postalCode) {
            $this->assertFalse(Validation::isValidPostalCode($postalCode), "Postal code $postalCode should be invalid");
        }
    }
}
