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
        Schema::create('tenant_themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('primary_color', 7)->default('#16a34a');
            $table->string('secondary_color', 7)->default('#059669');
            $table->string('accent_color', 7)->default('#10b981');
            $table->string('background_color', 7)->default('#ffffff');
            $table->string('text_color', 7)->default('#1f2937');
            $table->string('font_family')->default('Inter');
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();
            $table->text('custom_css')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->unique('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_themes');
    }
};
