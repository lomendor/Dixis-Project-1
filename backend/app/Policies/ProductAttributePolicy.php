<?php

namespace App\Policies;

use App\Models\ProductAttribute;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductAttributePolicy
{
    /**
     * Determine whether the user can view any models.
     * Attributes are publicly viewable, so this is always true.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * Attributes are publicly viewable if they are active.
     */
    public function view(?User $user, ProductAttribute $productAttribute): bool
    {
        return $productAttribute->is_active;
    }

    /**
     * Determine whether the user can create models.
     * Only admins with the manage-categories permission can create attributes.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }

    /**
     * Determine whether the user can update the model.
     * Only admins with the manage-categories permission can update attributes.
     */
    public function update(User $user, ProductAttribute $productAttribute): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }

    /**
     * Determine whether the user can delete the model.
     * Only admins with the manage-categories permission can delete attributes.
     */
    public function delete(User $user, ProductAttribute $productAttribute): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }

    /**
     * Determine whether the user can restore the model.
     * Only admins with the manage-categories permission can restore attributes.
     */
    public function restore(User $user, ProductAttribute $productAttribute): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Only admins with the manage-categories permission can permanently delete attributes.
     */
    public function forceDelete(User $user, ProductAttribute $productAttribute): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-categories');
    }
}
