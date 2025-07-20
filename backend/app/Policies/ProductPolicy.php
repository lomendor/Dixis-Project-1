<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductPolicy
{
    /**
     * Determine whether the user can view any models.
     * Generally, anyone can view the product list (index),
     * but the controller filters based on role/status.
     * We can return true here and let controller handle specifics.
     */
    public function viewAny(User $user): bool
    {
        return true; // Controller handles filtering public vs producer's own list
    }

    /**
     * Determine whether the user can view the model.
     * Allow viewing only if the product is active OR if the user is the producer owner.
     */
    public function view(?User $user, Product $product): bool
    {
        // Allow if product is active (public access)
        if ($product->is_active) {
            return true;
        }

        // If no user is logged in and product is inactive, deny access
        if (!$user) {
            return false;
        }

        // Allow if the user is the producer who owns the product (even if inactive)
        if ($user->hasRole('producer') && $user->producer?->id === $product->producer_id) {
            return true;
        }

        // Allow admins with manage-all-products permission to view any product
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-all-products');
    }

    /**
     * Determine whether the user can create models.
     * Only producers can create products.
     */
    public function create(User $user): bool
    {
        // Check if user has the 'producer' role, a linked producer profile exists, and has the create-product permission
        return $user->hasRole('producer') && $user->producer !== null && $user->hasPermissionTo('create-product');
    }

    /**
     * Determine whether the user can update the model.
     * Only the producer who owns the product can update it.
     */
    public function update(User $user, Product $product): bool
    {
        // Check if user is a producer, has the edit-product permission, and their producer ID matches the product's producer ID
        if ($user->hasRole('producer') && $user->hasPermissionTo('edit-product') && $user->producer?->id === $product->producer_id) {
            return true;
        }

        // Allow admins with manage-all-products permission to update any product
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-all-products');
    }

    /**
     * Determine whether the user can delete the model.
     * Only the producer who owns the product can delete it.
     */
    public function delete(User $user, Product $product): bool
    {
        // Check if user is a producer, has the delete-product permission, and their producer ID matches the product's producer ID
        if ($user->hasRole('producer') && $user->hasPermissionTo('delete-product') && $user->producer?->id === $product->producer_id) {
            return true;
        }

        // Allow admins with manage-all-products permission to delete any product
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-all-products');
    }

    /**
     * Determine whether the user can restore the model.
     * (Optional - if using Soft Deletes)
     */
    // public function restore(User $user, Product $product): bool
    // {
    //     return $user->role === 'producer' && $user->producer?->id === $product->producer_id;
    // }

    /**
     * Determine whether the user can permanently delete the model.
     * (Optional - if using Soft Deletes)
     */
    // public function forceDelete(User $user, Product $product): bool
    // {
    //     return $user->role === 'producer' && $user->producer?->id === $product->producer_id;
    // }
}
