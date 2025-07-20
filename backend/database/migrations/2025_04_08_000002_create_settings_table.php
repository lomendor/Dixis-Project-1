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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value');
            $table->string('type'); // string, integer, float, boolean, array, json
            $table->string('group')->default('general');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        $this->insertDefaultSettings();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }

    /**
     * Insert default settings.
     */
    private function insertDefaultSettings(): void
    {
        $settings = [
            [
                'key' => 'site_name',
                'value' => json_encode('Dixis'),
                'type' => 'string',
                'group' => 'general',
                'description' => 'The name of the site',
            ],
            [
                'key' => 'site_description',
                'value' => json_encode('Πλατφόρμα αγοράς προϊόντων απευθείας από παραγωγούς'),
                'type' => 'string',
                'group' => 'general',
                'description' => 'The description of the site',
            ],
            [
                'key' => 'contact_email',
                'value' => json_encode('info@dixis.gr'),
                'type' => 'string',
                'group' => 'contact',
                'description' => 'The contact email of the site',
            ],
            [
                'key' => 'contact_phone',
                'value' => json_encode('+30 210 1234567'),
                'type' => 'string',
                'group' => 'contact',
                'description' => 'The contact phone of the site',
            ],
            [
                'key' => 'social_media',
                'value' => json_encode([
                    'facebook' => 'https://facebook.com/dixis',
                    'instagram' => 'https://instagram.com/dixis',
                    'twitter' => 'https://twitter.com/dixis',
                ]),
                'type' => 'json',
                'group' => 'social',
                'description' => 'Social media links',
            ],
            [
                'key' => 'commission_rate',
                'value' => json_encode(10),
                'type' => 'integer',
                'group' => 'financial',
                'description' => 'The commission rate for producers (percentage)',
            ],
            [
                'key' => 'vat_rate',
                'value' => json_encode(24),
                'type' => 'integer',
                'group' => 'financial',
                'description' => 'The VAT rate (percentage)',
            ],
            [
                'key' => 'enable_producer_registration',
                'value' => json_encode(true),
                'type' => 'boolean',
                'group' => 'registration',
                'description' => 'Enable producer registration',
            ],
            [
                'key' => 'enable_business_registration',
                'value' => json_encode(true),
                'type' => 'boolean',
                'group' => 'registration',
                'description' => 'Enable business registration',
            ],
            [
                'key' => 'enable_consumer_registration',
                'value' => json_encode(true),
                'type' => 'boolean',
                'group' => 'registration',
                'description' => 'Enable consumer registration',
            ],
        ];

        DB::table('settings')->insert($settings);
    }
};
