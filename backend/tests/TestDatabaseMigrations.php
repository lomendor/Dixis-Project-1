<?php

namespace Tests;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

trait TestDatabaseMigrations
{
    /**
     * Define hooks to migrate the database before and after each test.
     */
    public function runDatabaseMigrations()
    {
        // For SQLite in-memory database, we need to avoid VACUUM
        if (config('database.default') === 'sqlite' && config('database.connections.sqlite.database') === ':memory:') {
            // Drop all tables first
            Schema::dropAllTables();

            // Create the payments table first to avoid issues with migrations that modify it
            $this->createPaymentsTable();

            // Run migrations without fresh (which uses VACUUM)
            Artisan::call('migrate');
        } else {
            // Create the payments table first to avoid issues with migrations that modify it
            $this->createPaymentsTable();

            // Run migrations
            Artisan::call('migrate:fresh');
        }

        $this->beforeApplicationDestroyed(function () {
            Artisan::call('migrate:rollback');
        });
    }

    /**
     * Create the payments table with the necessary structure.
     */
    protected function createPaymentsTable()
    {
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function ($table) {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->string('payment_gateway');
                $table->string('transaction_id')->nullable();
                $table->decimal('amount', 10, 2);
                $table->string('status');
                $table->text('details')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }
}
