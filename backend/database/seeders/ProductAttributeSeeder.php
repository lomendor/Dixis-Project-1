<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductAttribute;
use Illuminate\Support\Str;

class ProductAttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define attributes
        $attributes = [
            [
                'name' => 'Μέθοδος Παραγωγής',
                'type' => 'select',
                'options' => [
                    'Βιολογική',
                    'Ολοκληρωμένη Διαχείριση',
                    'Συμβατική',
                    'Βιοδυναμική',
                ],
                'description' => 'Η μέθοδος παραγωγής του προϊόντος',
                'is_filterable' => true,
                'is_required' => true,
                'order' => 10,
            ],
            [
                'name' => 'Προέλευση',
                'type' => 'text',
                'description' => 'Η περιοχή προέλευσης του προϊόντος',
                'is_filterable' => true,
                'is_required' => true,
                'order' => 20,
            ],
            [
                'name' => 'Πιστοποιήσεις',
                'type' => 'select',
                'options' => [
                    'ΠΟΠ',
                    'ΠΓΕ',
                    'HACCP',
                    'ISO 22000',
                    'BRC',
                    'IFS',
                    'FSSC 22000',
                ],
                'description' => 'Πιστοποιήσεις που έχει το προϊόν',
                'is_filterable' => true,
                'is_required' => false,
                'order' => 30,
            ],
            [
                'name' => 'Χωρίς Γλουτένη',
                'type' => 'boolean',
                'description' => 'Αν το προϊόν είναι χωρίς γλουτένη',
                'is_filterable' => true,
                'is_required' => false,
                'order' => 40,
            ],
            [
                'name' => 'Vegan',
                'type' => 'boolean',
                'description' => 'Αν το προϊόν είναι vegan',
                'is_filterable' => true,
                'is_required' => false,
                'order' => 50,
            ],
            [
                'name' => 'Συστατικά',
                'type' => 'text',
                'description' => 'Τα συστατικά του προϊόντος',
                'is_filterable' => false,
                'is_required' => true,
                'order' => 60,
            ],
            [
                'name' => 'Διατροφική Αξία',
                'type' => 'text',
                'description' => 'Η διατροφική αξία του προϊόντος',
                'is_filterable' => false,
                'is_required' => false,
                'order' => 70,
            ],
            [
                'name' => 'Συνθήκες Διατήρησης',
                'type' => 'text',
                'description' => 'Πώς πρέπει να διατηρείται το προϊόν',
                'is_filterable' => false,
                'is_required' => true,
                'order' => 80,
            ],
            [
                'name' => 'Χρόνος Συγκομιδής',
                'type' => 'text',
                'description' => 'Πότε συγκομίστηκε το προϊόν',
                'is_filterable' => false,
                'is_required' => false,
                'order' => 90,
            ],
        ];

        // Create attributes
        foreach ($attributes as $attributeData) {
            ProductAttribute::create([
                'name' => $attributeData['name'],
                'slug' => Str::slug($attributeData['name']),
                'type' => $attributeData['type'],
                'options' => $attributeData['options'] ?? null,
                'description' => $attributeData['description'],
                'is_filterable' => $attributeData['is_filterable'],
                'is_required' => $attributeData['is_required'],
                'is_active' => true,
                'order' => $attributeData['order'],
            ]);
        }
    }
}
