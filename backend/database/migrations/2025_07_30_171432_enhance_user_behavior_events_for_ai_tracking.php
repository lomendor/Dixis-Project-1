<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * DIXIS PLATFORM - Enhanced User Behavior Events Migration
 * AI-powered analytics for Greek marketplace with ML training data collection
 * 
 * Features Added:
 * - Event categorization for AI training
 * - Greek market context tracking
 * - AI/ML training data storage
 * - Enhanced event data structure
 * - GDPR-compliant data handling
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_behavior_events', function (Blueprint $table) {
            // Enhanced event classification
            $table->string('event_category', 50)->nullable()->after('event_type')
                  ->comment('AI training event category (engagement, conversion, etc.)');
            
            $table->json('event_data')->nullable()->after('event_category')
                  ->comment('Structured event data for AI analysis');
            
            // Greek market context fields
            $table->json('greek_context')->nullable()->after('metadata')
                  ->comment('Greek marketplace context (region, season, cultural factors)');
            
            // AI/ML training data
            $table->json('ai_training_data')->nullable()->after('greek_context')
                  ->comment('Prepared features and labels for ML model training');
            
            // Add indexes for performance
            $table->index('event_category', 'idx_event_category');
            $table->index('created_at', 'idx_created_at');
            $table->index(['user_id', 'created_at'], 'idx_user_created');
            $table->index(['session_id', 'created_at'], 'idx_session_created');
            
            // Greek market specific indexes
            $table->index(DB::raw("(JSON_UNQUOTE(JSON_EXTRACT(greek_context, '$.user_region')))"), 
                         'idx_greek_region');
            $table->index(DB::raw("(JSON_UNQUOTE(JSON_EXTRACT(greek_context, '$.is_tourism_season')))"), 
                         'idx_tourism_season');
        });
        
        // Create partitioning for better performance (optional - for high volume)
        if (config('database.default') === 'mysql') {
            // MySQL partitioning by month for better performance
            DB::statement("
                ALTER TABLE user_behavior_events 
                PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
                    PARTITION p202501 VALUES LESS THAN (202502),
                    PARTITION p202502 VALUES LESS THAN (202503),
                    PARTITION p202503 VALUES LESS THAN (202504),
                    PARTITION p202504 VALUES LESS THAN (202505),
                    PARTITION p202505 VALUES LESS THAN (202506),
                    PARTITION p202506 VALUES LESS THAN (202507),
                    PARTITION p202507 VALUES LESS THAN (202508),
                    PARTITION p202508 VALUES LESS THAN (202509),
                    PARTITION p202509 VALUES LESS THAN (202510),
                    PARTITION p202510 VALUES LESS THAN (202511),
                    PARTITION p202511 VALUES LESS THAN (202512),
                    PARTITION p202512 VALUES LESS THAN (202601),
                    PARTITION p_future VALUES LESS THAN MAXVALUE
                )
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_behavior_events', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex('idx_event_category');
            $table->dropIndex('idx_created_at');
            $table->dropIndex('idx_user_created');
            $table->dropIndex('idx_session_created');
            $table->dropIndex('idx_greek_region');
            $table->dropIndex('idx_tourism_season');
            
            // Drop columns
            $table->dropColumn([
                'event_category',
                'event_data', 
                'greek_context',
                'ai_training_data'
            ]);
        });
        
        // Remove partitioning if it was added
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE user_behavior_events REMOVE PARTITIONING");
        }
    }
};
