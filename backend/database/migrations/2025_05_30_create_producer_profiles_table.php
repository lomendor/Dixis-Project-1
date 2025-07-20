<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('producer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('business_name', 200);
            $table->string('business_registration_number', 50)->nullable();
            $table->string('tax_number', 20)->unique();
            $table->text('description')->nullable();
            $table->json('specialties')->nullable();
            
            // Location
            $table->text('location_address');
            $table->string('location_city', 100);
            $table->string('location_region', 100);
            $table->string('location_postal_code', 10);
            $table->decimal('location_lat', 10, 8)->nullable();
            $table->decimal('location_lng', 11, 8)->nullable();
            
            // Contact & Media
            $table->string('website_url', 500)->nullable();
            $table->json('social_media')->nullable();
            $table->json('farm_photos')->nullable();
            $table->json('certification_documents')->nullable();
            
            // Verification & Trust
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('verification_notes')->nullable();
            $table->enum('trust_level', ['new', 'trusted', 'premium'])->default('new');
            $table->text('admin_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Business Settings
            $table->integer('payment_terms_days')->default(7);
            $table->decimal('minimum_order_amount', 10, 2)->default(0);
            $table->json('delivery_zones')->nullable();
            $table->integer('processing_time_days')->default(1);
            
            $table->timestamps();
            
            // Indexes
            $table->index('verification_status');
            $table->index('trust_level');
            $table->index(['location_lat', 'location_lng']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producer_profiles');
    }
};