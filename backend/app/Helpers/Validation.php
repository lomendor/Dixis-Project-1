<?php

namespace App\Helpers;

class Validation
{
    /**
     * Validate an email address.
     *
     * @param string $email
     * @return bool
     */
    public static function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate a password.
     * Password must be at least 8 characters long and contain at least one uppercase letter,
     * one lowercase letter, and one number.
     *
     * @param string $password
     * @return bool
     */
    public static function isValidPassword(string $password): bool
    {
        // At least 8 characters
        if (strlen($password) < 8) {
            return false;
        }
        
        // At least one uppercase letter
        if (!preg_match('/[A-Z]/', $password)) {
            return false;
        }
        
        // At least one lowercase letter
        if (!preg_match('/[a-z]/', $password)) {
            return false;
        }
        
        // At least one number
        if (!preg_match('/[0-9]/', $password)) {
            return false;
        }
        
        return true;
    }

    /**
     * Validate a phone number.
     * Phone number must be at least 10 digits.
     *
     * @param string $phone
     * @return bool
     */
    public static function isValidPhone(string $phone): bool
    {
        // Remove any non-digit characters
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // Check if the phone number starts with + or 00
        if (substr($phone, 0, 1) === '+') {
            $phone = substr($phone, 1);
        } elseif (substr($phone, 0, 2) === '00') {
            $phone = substr($phone, 2);
        }
        
        // Check if the phone number is at least 10 digits
        return strlen($phone) >= 10;
    }

    /**
     * Validate a postal code.
     * Postal code must be 5 digits.
     *
     * @param string $postalCode
     * @return bool
     */
    public static function isValidPostalCode(string $postalCode): bool
    {
        return preg_match('/^[0-9]{5}$/', $postalCode) === 1;
    }
}
