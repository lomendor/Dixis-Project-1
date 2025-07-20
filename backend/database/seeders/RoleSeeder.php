<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $roles = ['admin', 'producer', 'consumer', 'business'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // Create permissions
        $permissions = [
            'manage_products',
            'manage_orders',
            'manage_users',
            'view_dashboard',
            'place_orders',
            'manage_profile'
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // Assign permissions to roles
        $adminRole = Role::findByName('admin');
        $adminRole->givePermissionTo(Permission::all());

        $producerRole = Role::findByName('producer');
        $producerRole->givePermissionTo(['manage_products', 'view_dashboard', 'manage_profile']);

        $consumerRole = Role::findByName('consumer');
        $consumerRole->givePermissionTo(['place_orders', 'manage_profile']);

        $businessRole = Role::findByName('business');
        $businessRole->givePermissionTo(['place_orders', 'manage_profile', 'view_dashboard']);
    }
}
