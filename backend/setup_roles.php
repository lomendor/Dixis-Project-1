<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

// Bootstrap Laravel
$app = Application::configure(basePath: __DIR__)
    ->withRouting(
        web: __DIR__.'/routes/web.php',
        api: __DIR__.'/routes/api.php',
        commands: __DIR__.'/routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🚀 Setting up roles and permissions...\n\n";

try {
    // Create basic roles
    $roles = ['admin', 'producer', 'consumer', 'business'];
    foreach ($roles as $roleName) {
        $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        echo "✅ Role '{$roleName}' created/verified\n";
    }

    echo "\n";

    // Create basic permissions
    $permissions = [
        'manage_products', 'manage_orders', 'manage_users', 
        'view_dashboard', 'place_orders', 'manage_profile'
    ];
    foreach ($permissions as $permissionName) {
        $permission = Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        echo "✅ Permission '{$permissionName}' created/verified\n";
    }

    echo "\n🎯 Roles and permissions setup completed successfully!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
