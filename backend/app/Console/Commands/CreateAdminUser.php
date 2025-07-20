<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user = User::where('email', 'admin@dixis.gr')->first();

        if (!$user) {
            $user = User::create([
                'name' => 'Admin User',
                'email' => 'admin@dixis.gr',
                'email_verified_at' => now(),
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ]);
            $this->info('Admin user created successfully!');
        } else {
            $user->update(['role' => 'admin']);
            $this->info('Admin user role updated!');
        }

        $this->info('Email: admin@dixis.gr');
        $this->info('Password: admin123');
    }
}
