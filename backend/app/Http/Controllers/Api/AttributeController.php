<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeController extends Controller
{
    /**
     * Display a listing of the attributes.
     * Publicly accessible.
     */
    public function index(Request $request)
    {
        $filterableOnly = $request->boolean('filterable_only', false);
        $activeOnly = $request->boolean('active_only', true);

        $query = ProductAttribute::query();

        // Filter by is_filterable if requested
        if ($filterableOnly) {
            $query->where('is_filterable', true);
        }

        // Filter by is_active if requested
        if ($activeOnly) {
            $query->where('is_active', true);
        }

        // Order by order and name
        $query->orderBy('order')->orderBy('name');

        $attributes = $query->get();

        return response()->json($attributes);
    }

    /**
     * Store a newly created attribute in storage.
     * Accessible only by admins.
     */
    public function store(Request $request)
    {
        // Authorize using policy
        $this->authorize('create', ProductAttribute::class);

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:text,select,boolean',
            'options' => 'nullable|array',
            'options.*' => 'string',
            'description' => 'nullable|string',
            'is_filterable' => 'nullable|boolean',
            'is_required' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        // Generate slug from name
        $validatedData['slug'] = Str::slug($validatedData['name']);

        // Ensure slug is unique
        $slug = $validatedData['slug'];
        $count = 0;
        while (ProductAttribute::where('slug', $slug)->exists()) {
            $count++;
            $slug = $validatedData['slug'] . '-' . $count;
        }
        $validatedData['slug'] = $slug;

        // Create attribute
        $attribute = ProductAttribute::create($validatedData);

        return response()->json($attribute, 201);
    }

    /**
     * Display the specified attribute.
     * Publicly accessible.
     */
    public function show(ProductAttribute $attribute)
    {
        // Ensure the attribute is active if not admin
        if (!$attribute->is_active && !auth()->user()?->hasPermissionTo('manage-categories')) {
            return response()->json(['message' => 'Attribute not found or not active.'], 404);
        }

        return response()->json($attribute);
    }

    /**
     * Update the specified attribute in storage.
     * Accessible only by admins.
     */
    public function update(Request $request, ProductAttribute $attribute)
    {
        // Authorize using policy
        $this->authorize('update', $attribute);

        $validatedData = $request->validate([
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:text,select,boolean',
            'options' => 'nullable|array',
            'options.*' => 'string',
            'description' => 'nullable|string',
            'is_filterable' => 'nullable|boolean',
            'is_required' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        // Update slug if name is changed
        if (isset($validatedData['name']) && $validatedData['name'] !== $attribute->name) {
            $validatedData['slug'] = Str::slug($validatedData['name']);

            // Ensure slug is unique
            $slug = $validatedData['slug'];
            $count = 0;
            while (ProductAttribute::where('slug', $slug)->where('id', '!=', $attribute->id)->exists()) {
                $count++;
                $slug = $validatedData['slug'] . '-' . $count;
            }
            $validatedData['slug'] = $slug;
        }

        // Update attribute
        $attribute->update($validatedData);

        return response()->json($attribute);
    }

    /**
     * Remove the specified attribute from storage.
     * Accessible only by admins.
     */
    public function destroy(ProductAttribute $attribute)
    {
        // Authorize using policy
        $this->authorize('delete', $attribute);

        // Check if attribute has values
        if (ProductAttributeValue::where('attribute_id', $attribute->id)->exists()) {
            return response()->json(['message' => 'Cannot delete attribute with values.'], 422);
        }

        // Delete attribute
        $attribute->delete();

        return response()->json(['message' => 'Attribute deleted successfully.']);
    }

    /**
     * Get all possible values for a filterable attribute.
     * Publicly accessible.
     */
    public function values(ProductAttribute $attribute)
    {
        // Ensure the attribute is active and filterable
        if (!$attribute->is_active || !$attribute->is_filterable) {
            return response()->json(['message' => 'Attribute not found, not active, or not filterable.'], 404);
        }

        // For select type attributes, return the predefined options
        if ($attribute->type === 'select' && is_array($attribute->options)) {
            return response()->json($attribute->options);
        }

        // For other types, get distinct values from products
        $values = ProductAttributeValue::where('attribute_id', $attribute->id)
                                      ->distinct()
                                      ->pluck('value')
                                      ->filter()
                                      ->values();

        return response()->json($values);
    }
}
