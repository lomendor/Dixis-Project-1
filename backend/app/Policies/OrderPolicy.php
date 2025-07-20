<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Consumers can view their own orders
        if ($user->hasRole('consumer') && $user->hasPermissionTo('view-own-orders')) {
            return true;
        }

        // Producers can view orders for their products
        if ($user->hasRole('producer') && $user->hasPermissionTo('view-own-orders')) {
            return true;
        }

        // Business users can view their own orders
        if ($user->hasRole('business_user') && $user->hasPermissionTo('view-own-orders')) {
            return true;
        }

        // Admins can view all orders
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-all-orders');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Order $order): bool
    {
        // Consumers can view their own orders
        if ($user->hasRole('consumer') && $user->hasPermissionTo('view-own-orders') && $order->user_id === $user->id) {
            return true;
        }

        // Business users can view their own orders
        if ($user->hasRole('business_user') && $user->hasPermissionTo('view-own-orders') && $order->user_id === $user->id) {
            return true;
        }

        // Producers can view orders that contain their products
        if ($user->hasRole('producer') && $user->hasPermissionTo('view-own-orders') && $user->producer) {
            // Check if any order item belongs to this producer
            foreach ($order->items as $item) {
                if ($item->product && $item->product->producer_id === $user->producer->id) {
                    return true;
                }
            }
        }

        // Admins can view all orders
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-all-orders');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Consumers can place orders
        if ($user->hasRole('consumer') && $user->hasPermissionTo('place-order')) {
            return true;
        }

        // Business users can place B2B orders
        if ($user->hasRole('business_user') && $user->hasPermissionTo('place-b2b-order')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Order $order): bool
    {
        // Producers can update order items status for their products
        if ($user->hasRole('producer') && $user->hasPermissionTo('update-own-order-items-status') && $user->producer) {
            // Check if any order item belongs to this producer
            foreach ($order->items as $item) {
                if ($item->product && $item->product->producer_id === $user->producer->id) {
                    return true;
                }
            }
        }

        // Admins can update all orders
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-all-orders');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Order $order): bool
    {
        // Only admins can delete orders
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-all-orders');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Order $order): bool
    {
        // Only admins can restore orders
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-all-orders');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Order $order): bool
    {
        // Only admins can force delete orders
        return $user->hasRole('admin') && $user->hasPermissionTo('manage-all-orders');
    }
}
