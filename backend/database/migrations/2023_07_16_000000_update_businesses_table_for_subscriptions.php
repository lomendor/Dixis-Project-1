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
        Schema::table('businesses', function (Blueprint $table) {
            // Rename 'name' column to 'business_name' for consistency with Producer model
            $table->renameColumn('name', 'business_name');
            
            // Add verification_date and verification_notes columns
            $table->timestamp('verification_date')->nullable()->after('verified');
            $table->text('verification_notes')->nullable()->after('verification_date');
            
            // Add logo column
            $table->string('logo')->nullable()->after('description');
            
            // Add country column
            $table->string('country')->nullable()->after('postal_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            // Rename 'business_name' column back to 'name'
            $table->renameColumn('business_name', 'name');
            
            // Drop added columns
            $table->dropColumn('verification_date');
            $table->dropColumn('verification_notes');
            $table->dropColumn('logo');
            $table->dropColumn('country');
        });
    }
};
