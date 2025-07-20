<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\ShippingZone;
use App\Models\DeliveryMethod;

class StoreFreeShippingRuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization logic will be handled by the middleware (role:producer)
        // and ensuring the producer owns the rule being updated/deleted in the controller.
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
            'free_shipping_threshold' => ['required', 'numeric', 'min:0'], // Use correct field name
            'shipping_zone_id' => ['nullable', 'integer', Rule::exists(ShippingZone::class, 'id')],
            'delivery_method_id' => ['nullable', 'integer', Rule::exists(DeliveryMethod::class, 'id')], // Validate ID
            'is_active' => ['sometimes', 'boolean'],
            // TODO: Add validation to prevent duplicate rules (same producer, zone, method) if needed
            // This might require a custom rule or checking in the controller before saving,
            // considering nullable fields and the unique constraint in the migration.
        ];
    }
}
