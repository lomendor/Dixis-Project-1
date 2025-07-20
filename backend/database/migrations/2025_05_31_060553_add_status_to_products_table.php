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
        // Check if the columns already exist before adding them
        $columns = Schema::getColumnListing('products');
        
        Schema::table('products', function (Blueprint $table) use ($columns) {
            if (!in_array('status', $columns)) {
                $table->enum('status', ['active', 'inactive', 'pending', 'approved', 'rejected'])
                      ->default('pending')
                      ->after('is_featured');
            }
            
            if (!in_array('is_organic', $columns)) {
                $table->boolean('is_organic')->default(false);
            }
            
            if (!in_array('is_vegan', $columns)) {
                $table->boolean('is_vegan')->default(false);
            }
            
            if (!in_array('is_gluten_free', $columns)) {
                $table->boolean('is_gluten_free')->default(false);
            }
            
            if (!in_array('weight', $columns)) {
                $table->decimal('weight', 10, 2)->nullable();
            }
            
            if (!in_array('stock_quantity', $columns)) {
                $table->integer('stock_quantity')->default(0);
            }
            
            if (!in_array('category_id', $columns)) {
                $table->unsignedBigInteger('category_id')->nullable();
                $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            }
        });
        
        // Add indexes separately to avoid errors if they already exist
        try {
            Schema::table('products', function (Blueprint $table) {
                $table->index('status');
            });
        } catch (\Exception $e) {}
        
        try {
            Schema::table('products', function (Blueprint $table) {
                $table->index(['producer_id', 'status']);
            });
        } catch (\Exception $e) {}
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop foreign key first if it exists
            try {
                $table->dropForeign(['category_id']);
            } catch (\Exception $e) {}
            
            // Drop columns if they exist
            $columns = Schema::getColumnListing('products');
            
            $columnsToDelete = [];
            if (in_array('status', $columns)) $columnsToDelete[] = 'status';
            if (in_array('is_organic', $columns)) $columnsToDelete[] = 'is_organic';
            if (in_array('is_vegan', $columns)) $columnsToDelete[] = 'is_vegan';
            if (in_array('is_gluten_free', $columns)) $columnsToDelete[] = 'is_gluten_free';
            if (in_array('weight', $columns)) $columnsToDelete[] = 'weight';
            if (in_array('stock_quantity', $columns)) $columnsToDelete[] = 'stock_quantity';
            if (in_array('category_id', $columns)) $columnsToDelete[] = 'category_id';
            
            if (!empty($columnsToDelete)) {
                $table->dropColumn($columnsToDelete);
            }
        });
        
        // Drop indexes
        try {
            Schema::table('products', function (Blueprint $table) {
                $table->dropIndex(['status']);
            });
        } catch (\Exception $e) {}
        
        try {
            Schema::table('products', function (Blueprint $table) {
                $table->dropIndex(['producer_id', 'status']);
            });
        } catch (\Exception $e) {}
    }
};