<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_settings', function (Blueprint $table) {
            $table->id();
            $table->string('service'); // quickbooks, xero, etc.
            $table->unsignedBigInteger('user_id');
            $table->text('tokens'); // encrypted token data
            $table->string('realm_id')->nullable(); // QuickBooks company ID
            $table->json('settings')->nullable(); // additional service-specific settings
            $table->timestamp('connected_at')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['service', 'user_id']);
            $table->index(['service', 'is_active']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('integration_settings');
    }
};
