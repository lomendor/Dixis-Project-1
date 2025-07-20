<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_logs', function (Blueprint $table) {
            $table->id();
            $table->string('service_name');
            $table->string('operation');
            $table->string('external_id')->nullable();
            $table->morphs('model');
            $table->json('request_data')->nullable();
            $table->json('response_data')->nullable();
            $table->string('status'); // success, error, pending
            $table->text('error_message')->nullable();
            $table->integer('response_time_ms')->nullable();
            $table->timestamps();

            $table->index(['service_name', 'status']);
            // morphs() already creates index for model_type and model_id
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('integration_logs');
    }
};
