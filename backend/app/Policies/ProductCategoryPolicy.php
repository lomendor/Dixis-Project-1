<?php

namespace App\Policies;

use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductCategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     * Categories are publicly viewable, so this is always true.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * Categories are publicly viewable, so this is always true.
     */
    public function view(?User $user, ProductCategory $productCategory): bool
    {
        return $productCategory->is_active;
    }

    /**
     * Determine whether the user can create models.
     * Only admins with the manage-categories permission can create categories.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }

    /**
     * Determine whether the user can update the model.
     * Only admins with the manage-categories permission can update categories.
     */
    public function update(User $user, ProductCategory $productCategory): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }

    /**
     * Determine whether the user can delete the model.
     * Only admins with the manage-categories permission can delete categories.
     */
    public function delete(User $user, ProductCategory $productCategory): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }

    /**
     * Determine whether the user can restore the model.
     * Only admins with the manage-categories permission can restore categories.
     */
    public function restore(User $user, ProductCategory $productCategory): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Only admins with the manage-categories permission can permanently delete categories.
     */
    public function forceDelete(User $user, ProductCategory $productCategory): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }
}
