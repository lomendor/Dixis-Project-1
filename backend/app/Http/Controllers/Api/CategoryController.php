<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    /**
     * Display a listing of active product categories.
     * Publicly accessible.
     */
    public function index(Request $request)
    {
        $type = $request->query('type'); // 'product', 'functional', or null for all
        $includeChildren = $request->boolean('include_children', false);
        $parentId = $request->query('parent_id'); // null for root categories, or specific parent ID
        $onlyWithProducts = $request->boolean('only_with_products', false); // Φιλτράρισμα για κατηγορίες με προϊόντα

        $query = ProductCategory::where('is_active', true);

        // Filter by type if specified
        if ($type) {
            $query->where('type', $type);
        }

        // Filter by parent_id if specified
        if ($parentId !== null) {
            $query->where('parent_id', $parentId === 'null' ? null : $parentId);
        }

        // Φιλτράρισμα για κατηγορίες που έχουν προϊόντα
        if ($onlyWithProducts) {
            $query->whereHas('products');
        }

        // Order by the order field and then by name
        $query->orderBy('order')->orderBy('name');

        // Select fields
        $query->select('id', 'name', 'slug', 'parent_id', 'image', 'type', 'order');

        // Get categories
        $categories = $query->get();

        // Include children if requested
        if ($includeChildren && $categories->isNotEmpty()) {
            $categories->load(['children' => function ($query) {
                $query->where('is_active', true)
                      ->orderBy('order')
                      ->orderBy('name')
                      ->select('id', 'name', 'slug', 'parent_id', 'image', 'type', 'order');
            }]);
        }

        return response()->json($categories);
    }

    /**
     * Display a hierarchical tree of categories.
     * Publicly accessible.
     */
    public function tree(Request $request)
    {
        $type = $request->query('type'); // 'product', 'functional', or null for all

        // Get root categories (those with no parent)
        $query = ProductCategory::where('is_active', true)
                               ->whereNull('parent_id');

        // Filter by type if specified
        if ($type) {
            $query->where('type', $type);
        }

        // Order by the order field and then by name
        $query->orderBy('order')->orderBy('name');

        // Select fields
        $query->select('id', 'name', 'slug', 'parent_id', 'image', 'type', 'order');

        // Get categories with their children recursively
        $categories = $query->with(['children' => function ($query) {
            $query->where('is_active', true)
                  ->orderBy('order')
                  ->orderBy('name')
                  ->select('id', 'name', 'slug', 'parent_id', 'image', 'type', 'order');
        }])->get();

        return response()->json($categories);
    }

    /**
     * Display the specified category.
     * Publicly accessible.
     */
    public function show(ProductCategory $category)
    {
        // Ensure the category is active
        if (!$category->is_active) {
            return response()->json(['message' => 'Category not found or not active.'], 404);
        }

        // Load parent and children
        $category->load(['parent', 'children' => function ($query) {
            $query->where('is_active', true)
                  ->orderBy('order')
                  ->orderBy('name');
        }]);

        return response()->json($category);
    }

    /**
     * Store a newly created category in storage.
     * Accessible only by admins.
     */
    public function store(Request $request)
    {
        // Authorize using policy
        $this->authorize('create', ProductCategory::class);

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:product_categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'type' => 'required|in:product,functional',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        // Generate slug from name
        $validatedData['slug'] = Str::slug($validatedData['name']);

        // Ensure slug is unique
        $slug = $validatedData['slug'];
        $count = 0;
        while (ProductCategory::where('slug', $slug)->exists()) {
            $count++;
            $slug = $validatedData['slug'] . '-' . $count;
        }
        $validatedData['slug'] = $slug;

        // Create category
        $category = ProductCategory::create($validatedData);

        return response()->json($category, 201);
    }

    /**
     * Update the specified category in storage.
     * Accessible only by admins.
     */
    public function update(Request $request, ProductCategory $category)
    {
        // Authorize using policy
        $this->authorize('update', $category);

        $validatedData = $request->validate([
            'name' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:product_categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'type' => 'nullable|in:product,functional',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        // Update slug if name is changed
        if (isset($validatedData['name']) && $validatedData['name'] !== $category->name) {
            $validatedData['slug'] = Str::slug($validatedData['name']);

            // Ensure slug is unique
            $slug = $validatedData['slug'];
            $count = 0;
            while (ProductCategory::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                $count++;
                $slug = $validatedData['slug'] . '-' . $count;
            }
            $validatedData['slug'] = $slug;
        }

        // Prevent category from being its own parent
        if (isset($validatedData['parent_id']) && $validatedData['parent_id'] == $category->id) {
            return response()->json(['message' => 'A category cannot be its own parent.'], 422);
        }

        // Prevent circular references
        if (isset($validatedData['parent_id'])) {
            $parentId = $validatedData['parent_id'];
            while ($parentId !== null) {
                $parent = ProductCategory::find($parentId);
                if (!$parent) {
                    break;
                }
                if ($parent->id === $category->id) {
                    return response()->json(['message' => 'Circular reference detected.'], 422);
                }
                $parentId = $parent->parent_id;
            }
        }

        // Update category
        $category->update($validatedData);

        return response()->json($category);
    }

    /**
     * Remove the specified category from storage.
     * Accessible only by admins.
     */
    public function destroy(ProductCategory $category)
    {
        // Authorize using policy
        $this->authorize('delete', $category);

        // Check if category has children
        if ($category->children()->exists()) {
            return response()->json(['message' => 'Cannot delete category with children.'], 422);
        }

        // Check if category has products
        if ($category->products()->exists()) {
            return response()->json(['message' => 'Cannot delete category with products.'], 422);
        }

        // Delete category
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
