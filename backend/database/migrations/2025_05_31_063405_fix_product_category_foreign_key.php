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
        Schema::table('products', function (Blueprint $table) {
            // First, drop the existing foreign key constraint
            try {
                $table->dropForeign(['category_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist, continue
            }
            
            // Now add the correct foreign key constraint to product_categories table
            $table->foreign('category_id')->references('id')->on('product_categories')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop the correct foreign key
            try {
                $table->dropForeign(['category_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist, continue
            }
            
            // Restore the original (incorrect) foreign key for rollback
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
        });
    }
};