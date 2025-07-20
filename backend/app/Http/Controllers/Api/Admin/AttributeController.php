<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeController extends Controller
{
    /**
     * Display a listing of the attributes.
     * Accessible only by admins.
     */
    public function index(Request $request)
    {
        $query = ProductAttribute::query();

        // Apply sorting
        $query->orderBy('name', 'asc');

        $attributes = $query->get();

        return response()->json($attributes);
    }

    /**
     * Store a newly created attribute in storage.
     * Accessible only by admins.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:text,number,boolean,date,select,multiselect',
            'options' => 'nullable|array',
            'options.*' => 'string',
            'is_filterable' => 'nullable|boolean',
            'is_required' => 'nullable|boolean',
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
     * Accessible only by admins.
     */
    public function show($id)
    {
        $attribute = ProductAttribute::findOrFail($id);
        return response()->json($attribute);
    }

    /**
     * Update the specified attribute in storage.
     * Accessible only by admins.
     */
    public function update(Request $request, $id)
    {
        $attribute = ProductAttribute::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:text,number,boolean,date,select,multiselect',
            'options' => 'nullable|array',
            'options.*' => 'string',
            'is_filterable' => 'nullable|boolean',
            'is_required' => 'nullable|boolean',
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
    public function destroy($id)
    {
        $attribute = ProductAttribute::findOrFail($id);

        // Check if attribute has values
        if (ProductAttributeValue::where('attribute_id', $attribute->id)->exists()) {
            return response()->json(['message' => 'Cannot delete attribute with values.'], 422);
        }

        // Delete attribute
        $attribute->delete();

        return response()->json(['message' => 'Attribute deleted successfully.']);
    }
}
