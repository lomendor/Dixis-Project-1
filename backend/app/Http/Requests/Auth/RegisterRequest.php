<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            'first_name' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[a-zA-ZΑ-Ωα-ωάέήίόύώΐΰ\s]+$/u'
            ],
            'last_name' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[a-zA-ZΑ-Ωα-ωάέήίόύώΐΰ\s]+$/u'
            ],
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:254',
                'unique:users,email',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'regex:/^(\+30|0030|30)?[2-9]\d{9}$/'
            ],
            'role' => [
                'sometimes',
                'string',
                'in:customer,producer,business'
            ],
            'business_name' => [
                'required_if:role,producer,business',
                'nullable',
                'string',
                'min:2',
                'max:100'
            ],
            'business_type' => [
                'required_if:role,business',
                'nullable',
                'string',
                'in:restaurant,hotel,catering,retail,wholesale'
            ],
            'tax_id' => [
                'required_if:role,producer,business',
                'nullable',
                'string',
                'regex:/^\d{9}$/',
                'unique:users,tax_id'
            ],
            'terms_accepted' => [
                'required',
                'accepted'
            ],
            'marketing_consent' => [
                'sometimes',
                'boolean'
            ]
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'Το όνομα είναι υποχρεωτικό.',
            'first_name.min' => 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες.',
            'first_name.max' => 'Το όνομα δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες.',
            'first_name.regex' => 'Το όνομα μπορεί να περιέχει μόνο γράμματα και κενά.',
            
            'last_name.required' => 'Το επώνυμο είναι υποχρεωτικό.',
            'last_name.min' => 'Το επώνυμο πρέπει να έχει τουλάχιστον 2 χαρακτήρες.',
            'last_name.max' => 'Το επώνυμο δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες.',
            'last_name.regex' => 'Το επώνυμο μπορεί να περιέχει μόνο γράμματα και κενά.',
            
            'email.required' => 'Το email είναι υποχρεωτικό.',
            'email.email' => 'Παρακαλώ εισάγετε έγκυρο email.',
            'email.max' => 'Το email δεν μπορεί να υπερβαίνει τους 254 χαρακτήρες.',
            'email.unique' => 'Αυτό το email χρησιμοποιείται ήδη.',
            'email.regex' => 'Το email δεν έχει έγκυρη μορφή.',
            
            'password.required' => 'Ο κωδικός πρόσβασης είναι υποχρεωτικός.',
            'password.confirmed' => 'Η επιβεβαίωση κωδικού δεν ταιριάζει.',
            
            'phone.regex' => 'Παρακαλώ εισάγετε έγκυρο ελληνικό τηλέφωνο.',
            
            'role.in' => 'Παρακαλώ επιλέξτε έγκυρο ρόλο.',
            
            'business_name.required_if' => 'Το όνομα επιχείρησης είναι υποχρεωτικό για παραγωγούς και επιχειρήσεις.',
            'business_name.min' => 'Το όνομα επιχείρησης πρέπει να έχει τουλάχιστον 2 χαρακτήρες.',
            'business_name.max' => 'Το όνομα επιχείρησης δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες.',
            
            'business_type.required_if' => 'Ο τύπος επιχείρησης είναι υποχρεωτικός για επιχειρήσεις.',
            'business_type.in' => 'Παρακαλώ επιλέξτε έγκυρο τύπο επιχείρησης.',
            
            'tax_id.required_if' => 'Το ΑΦΜ είναι υποχρεωτικό για παραγωγούς και επιχειρήσεις.',
            'tax_id.regex' => 'Το ΑΦΜ πρέπει να έχει ακριβώς 9 ψηφία.',
            'tax_id.unique' => 'Αυτό το ΑΦΜ χρησιμοποιείται ήδη.',
            
            'terms_accepted.required' => 'Πρέπει να αποδεχτείτε τους όρους χρήσης.',
            'terms_accepted.accepted' => 'Πρέπει να αποδεχτείτε τους όρους χρήσης.',
            
            'marketing_consent.boolean' => 'Η συγκατάθεση για marketing πρέπει να είναι true ή false.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Sanitize and normalize data
        $data = [];

        if ($this->has('email')) {
            $data['email'] = strtolower(trim($this->email));
        }

        if ($this->has('first_name')) {
            $data['first_name'] = ucfirst(strtolower(trim($this->first_name)));
        }

        if ($this->has('last_name')) {
            $data['last_name'] = ucfirst(strtolower(trim($this->last_name)));
        }

        if ($this->has('phone')) {
            // Normalize Greek phone number
            $phone = preg_replace('/\D/', '', $this->phone);
            if (strlen($phone) === 10 && substr($phone, 0, 1) === '2') {
                $data['phone'] = '+30' . $phone;
            } elseif (strlen($phone) === 12 && substr($phone, 0, 2) === '30') {
                $data['phone'] = '+' . $phone;
            } else {
                $data['phone'] = $this->phone;
            }
        }

        if ($this->has('role') && !$this->role) {
            $data['role'] = 'customer'; // Default role
        }

        if ($this->has('marketing_consent')) {
            $data['marketing_consent'] = filter_var($this->marketing_consent, FILTER_VALIDATE_BOOLEAN);
        }

        $this->merge($data);
    }
}
