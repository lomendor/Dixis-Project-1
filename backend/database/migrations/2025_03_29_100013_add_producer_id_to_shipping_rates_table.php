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
        // Skip this migration as it's already been applied
        // We'll handle the product_cost_breakdowns migration separately
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Skip this migration as it's already been applied
    }
};
