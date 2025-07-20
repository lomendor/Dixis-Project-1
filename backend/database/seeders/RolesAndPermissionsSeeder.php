<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions - Admin/Platform Management
        $adminPermissions = [
            'access-admin-panel',
            'manage-users',
            'manage-producers',
            'manage-businesses',
            'manage-categories',
            'manage-all-products',
            'manage-all-orders',
            'manage-reviews',
            'manage-platform-settings',
            'view-platform-analytics',
            'manage-subscriptions',
            'manage-producer-services',
        ];

        // Create permissions - Producer Actions
        $producerPermissions = [
            'view-producer-dashboard',
            'manage-own-profile',
            'create-product',
            'edit-own-product',
            'delete-own-product',
            'view-own-orders',
            'update-own-order-items-status',
            'manage-own-shipping-methods',
            'view-own-sales-analytics',
            'respond-to-product-questions',
            'manage-virtual-tours',
            'manage-preorder-campaigns',
            'manage-adoption-items',
            'post-adoption-updates',
            'order-producer-services',
        ];

        // Create permissions - Consumer Actions
        $consumerPermissions = [
            'view-consumer-dashboard',
            'manage-own-addresses',
            'place-order',
            'view-own-orders',
            'submit-review',
            'manage-wishlist',
            'ask-product-question',
            'register-for-sessions',
            'place-preorder',
            'adopt-item',
            'return-packaging',
            'enroll-in-course',
            'participate-in-forum',
        ];

        // Create permissions - Business User Actions
        $businessPermissions = [
            'view-business-dashboard',
            'manage-own-business-profile',
            'place-b2b-order',
            'manage-recurring-orders',
            'manage-multiple-delivery-points',
            'access-b2b-reports',
            'access-exclusive-preorders',
            'subscribe-to-business-plan',
        ];

        // Combine all permissions
        $allPermissions = array_merge(
            $adminPermissions,
            $producerPermissions,
            $consumerPermissions,
            $businessPermissions
        );

        // Create permissions in the database
        foreach ($allPermissions as $permission) {
            // Check if permission already exists
            if (!Permission::where('name', $permission)->exists()) {
                Permission::create(['name' => $permission]);
            }
        }

        // Create roles if they don't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $producerRole = Role::firstOrCreate(['name' => 'producer']);
        $consumerRole = Role::firstOrCreate(['name' => 'consumer']);
        $businessRole = Role::firstOrCreate(['name' => 'business_user']);

        // Assign permissions to roles

        // Admin gets all permissions
        $adminRole->givePermissionTo($allPermissions);

        // Producer gets producer permissions
        $producerRole->givePermissionTo($producerPermissions);

        // Consumer gets consumer permissions
        $consumerRole->givePermissionTo($consumerPermissions);

        // Business user gets consumer permissions + business permissions
        $businessRole->givePermissionTo(array_merge($consumerPermissions, $businessPermissions));

        // Assign roles to existing users based on their 'role' column
        if (Schema::hasTable('users')) {
            $users = User::all();
            foreach ($users as $user) {
                // Remove any existing roles first
                $user->syncRoles([]);

                // Assign the appropriate role based on the 'role' column
                switch ($user->role) {
                    case 'admin':
                        $user->assignRole('admin');
                        break;
                    case 'producer':
                        $user->assignRole('producer');
                        break;
                    case 'business_user':
                        $user->assignRole('business_user');
                        break;
                    default: // 'consumer' or any other value
                        $user->assignRole('consumer');
                        break;
                }
            }
        }
    }
}
