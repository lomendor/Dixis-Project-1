<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:254',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:128'
            ],
            'remember_me' => [
                'sometimes',
                'boolean'
            ],
            'device_name' => [
                'sometimes',
                'string',
                'max:255'
            ]
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Το email είναι υποχρεωτικό.',
            'email.email' => 'Παρακαλώ εισάγετε έγκυρο email.',
            'email.max' => 'Το email δεν μπορεί να υπερβαίνει τους 254 χαρακτήρες.',
            'email.regex' => 'Το email δεν έχει έγκυρη μορφή.',
            'password.required' => 'Ο κωδικός πρόσβασης είναι υποχρεωτικός.',
            'password.min' => 'Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες.',
            'password.max' => 'Ο κωδικός πρόσβασης δεν μπορεί να υπερβαίνει τους 128 χαρακτήρες.',
            'remember_me.boolean' => 'Το πεδίο "Να με θυμάσαι" πρέπει να είναι true ή false.',
            'device_name.max' => 'Το όνομα συσκευής δεν μπορεί να υπερβαίνει τους 255 χαρακτήρες.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Sanitize email
        if ($this->has('email')) {
            $this->merge([
                'email' => strtolower(trim($this->email))
            ]);
        }

        // Ensure remember_me is boolean
        if ($this->has('remember_me')) {
            $this->merge([
                'remember_me' => filter_var($this->remember_me, FILTER_VALIDATE_BOOLEAN)
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional security checks
            $email = $this->input('email');
            $password = $this->input('password');

            // Check for suspicious patterns
            if ($email && $this->containsSuspiciousPatterns($email)) {
                $validator->errors()->add('email', 'Email contains invalid characters.');
            }

            if ($password && $this->containsSuspiciousPatterns($password)) {
                $validator->errors()->add('password', 'Password contains invalid characters.');
            }
        });
    }

    /**
     * Check for suspicious patterns in input
     */
    private function containsSuspiciousPatterns(string $input): bool
    {
        $suspiciousPatterns = [
            '/<script[^>]*>.*?<\/script>/is',
            '/javascript:/i',
            '/on\w+\s*=/i',
            '/(\bunion\b.*\bselect\b)/i',
            '/(\bselect\b.*\bfrom\b)/i',
            '/(\binsert\b.*\binto\b)/i',
            '/(\bdelete\b.*\bfrom\b)/i',
            '/(\bdrop\b.*\btable\b)/i'
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }

        return false;
    }
}
