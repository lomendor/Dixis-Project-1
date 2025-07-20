<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProductCategory::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->get('type'));
        }

        // Filter by parent
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->get('parent_id'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'order');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Include relationships
        $query->with(['parent', 'children']);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $categories = $query->paginate($perPage);

        return response()->json($categories);
    }

    /**
     * Store a newly created category
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_categories',
            'slug' => 'nullable|string|max:255|unique:product_categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:product_categories,id',
            'type' => ['required', Rule::in(['main', 'sub'])],
            'order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        // Generate slug if not provided
        if (!isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Set default order
        if (!isset($validated['order'])) {
            $validated['order'] = ProductCategory::max('order') + 1;
        }

        $category = ProductCategory::create($validated);

        return response()->json([
            'message' => 'Η κατηγορία δημιουργήθηκε επιτυχώς',
            'category' => $category->load(['parent', 'children'])
        ], 201);
    }

    /**
     * Display the specified category
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $category = ProductCategory::with(['parent', 'children', 'products'])
            ->findOrFail($id);

        // Get product count
        $productCount = $category->products()->count();

        return response()->json([
            'category' => $category,
            'product_count' => $productCount
        ]);
    }

    /**
     * Update the specified category
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = ProductCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('product_categories')->ignore($category->id)
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('product_categories')->ignore($category->id)
            ],
            'description' => 'nullable|string',
            'parent_id' => [
                'nullable',
                'exists:product_categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    // Prevent setting itself as parent
                    if ($value == $category->id) {
                        $fail('Η κατηγορία δεν μπορεί να είναι γονέας του εαυτού της.');
                    }
                    // Prevent circular references
                    if ($value && $this->wouldCreateCircularReference($category->id, $value)) {
                        $fail('Αυτή η αλλαγή θα δημιουργούσε κυκλική αναφορά.');
                    }
                }
            ],
            'type' => ['sometimes', 'required', Rule::in(['main', 'sub'])],
            'order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        // Generate slug if name changed and slug not provided
        if (isset($validated['name']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Η κατηγορία ενημερώθηκε επιτυχώς',
            'category' => $category->load(['parent', 'children'])
        ]);
    }

    /**
     * Remove the specified category
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $category = ProductCategory::findOrFail($id);

        // Check if category has products
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Δεν μπορείτε να διαγράψετε κατηγορία που περιέχει προϊόντα.'
            ], 422);
        }

        // Check if category has children
        if ($category->children()->exists()) {
            return response()->json([
                'message' => 'Δεν μπορείτε να διαγράψετε κατηγορία που έχει υποκατηγορίες.'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Η κατηγορία διαγράφηκε επιτυχώς'
        ]);
    }

    /**
     * Check if setting a parent would create a circular reference
     *
     * @param int $categoryId
     * @param int $parentId
     * @return bool
     */
    private function wouldCreateCircularReference(int $categoryId, int $parentId): bool
    {
        $parent = ProductCategory::find($parentId);
        
        while ($parent) {
            if ($parent->id === $categoryId) {
                return true;
            }
            $parent = $parent->parent;
        }
        
        return false;
    }
}