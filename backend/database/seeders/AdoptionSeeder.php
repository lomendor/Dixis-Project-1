<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AdoptableItem;
use App\Models\AdoptionPlan;
use App\Models\Producer;
use Illuminate\Support\Str;

class AdoptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all producers
        $producers = Producer::all();

        if ($producers->isEmpty()) {
            $this->command->info('No producers found. Please run ProducerSeeder first.');
            return;
        }

        // Create adoptable items for each producer
        foreach ($producers as $producer) {
            // Create olive trees
            $this->createOliveTrees($producer);

            // Create vineyards
            $this->createVineyards($producer);

            // Create beehives
            $this->createBeehives($producer);
        }
    }

    /**
     * Create olive trees for a producer.
     */
    private function createOliveTrees(Producer $producer): void
    {
        $varieties = ['Κορωνέικη', 'Καλαμών', 'Χονδρολιά', 'Μανάκι', 'Αθηνολιά'];
        $ages = ['5 ετών', '10 ετών', '15 ετών', '20 ετών', '50+ ετών'];

        for ($i = 1; $i <= 3; $i++) {
            $variety = $varieties[array_rand($varieties)];
            $age = $ages[array_rand($ages)];
            $name = "Ελαιόδεντρο {$variety} #{$i}";
            $slug = Str::slug("{$producer->name}-{$name}-{$i}-" . rand(1000, 9999));

            $adoptableItem = AdoptableItem::create([
                'producer_id' => $producer->id,
                'name' => $name,
                'slug' => $slug,
                'description' => "Ένα υπέροχο ελαιόδεντρο ποικιλίας {$variety}, ηλικίας {$age}, που βρίσκεται στον ελαιώνα του παραγωγού {$producer->name}. Με την υιοθεσία αυτού του δέντρου, θα λαμβάνετε τακτικά το εξαιρετικό παρθένο ελαιόλαδο που παράγει, καθώς και ενημερώσεις για την κατάστασή του.",
                'type' => 'olive_tree',
                'location' => $producer->city,
                'status' => 'available',
                'attributes' => [
                    'Ποικιλία' => $variety,
                    'Ηλικία' => $age,
                    'Παραγωγή' => rand(10, 30) . ' κιλά ελαιόλαδο ετησίως',
                ],
                'featured' => $i === 1,
            ]);

            // Create adoption plans
            $this->createOliveTreePlans($adoptableItem);
        }
    }

    /**
     * Create vineyards for a producer.
     */
    private function createVineyards(Producer $producer): void
    {
        $varieties = ['Αγιωργίτικο', 'Ασύρτικο', 'Μοσχοφίλερο', 'Ξινόμαυρο', 'Σαββατιανό'];

        for ($i = 1; $i <= 2; $i++) {
            $variety = $varieties[array_rand($varieties)];
            $name = "Αμπέλι {$variety} #{$i}";
            $slug = Str::slug("{$producer->name}-{$name}-{$i}-" . rand(1000, 9999));

            $adoptableItem = AdoptableItem::create([
                'producer_id' => $producer->id,
                'name' => $name,
                'slug' => $slug,
                'description' => "Ένα υπέροχο αμπέλι ποικιλίας {$variety} που βρίσκεται στον αμπελώνα του παραγωγού {$producer->name}. Με την υιοθεσία αυτού του αμπελιού, θα λαμβάνετε τακτικά το εξαιρετικό κρασί που παράγει, καθώς και ενημερώσεις για την κατάστασή του.",
                'type' => 'vineyard',
                'location' => $producer->city,
                'status' => 'available',
                'attributes' => [
                    'Ποικιλία' => $variety,
                    'Έκταση' => rand(1, 5) . ' στρέμματα',
                    'Παραγωγή' => rand(100, 500) . ' κιλά σταφύλια ετησίως',
                ],
                'featured' => $i === 1,
            ]);

            // Create adoption plans
            $this->createVineyardPlans($adoptableItem);
        }
    }

    /**
     * Create beehives for a producer.
     */
    private function createBeehives(Producer $producer): void
    {
        $honeyTypes = ['Θυμαρίσιο', 'Πευκόμελο', 'Ανθόμελο', 'Ελάτης', 'Καστανιάς'];

        for ($i = 1; $i <= 2; $i++) {
            $honeyType = $honeyTypes[array_rand($honeyTypes)];
            $name = "Μελίσσι {$honeyType} #{$i}";
            $slug = Str::slug("{$producer->name}-{$name}-{$i}-" . rand(1000, 9999));

            $adoptableItem = AdoptableItem::create([
                'producer_id' => $producer->id,
                'name' => $name,
                'slug' => $slug,
                'description' => "Ένα υγιές μελίσσι που παράγει εξαιρετικό {$honeyType} μέλι και βρίσκεται στο μελισσοκομείο του παραγωγού {$producer->name}. Με την υιοθεσία αυτού του μελισσιού, θα λαμβάνετε τακτικά το εξαιρετικό μέλι που παράγει, καθώς και ενημερώσεις για την κατάστασή του.",
                'type' => 'beehive',
                'location' => $producer->city,
                'status' => 'available',
                'attributes' => [
                    'Τύπος μελιού' => $honeyType,
                    'Αριθμός μελισσών' => rand(10000, 50000),
                    'Παραγωγή' => rand(10, 30) . ' κιλά μέλι ετησίως',
                ],
                'featured' => $i === 1,
            ]);

            // Create adoption plans
            $this->createBeehivePlans($adoptableItem);
        }
    }

    /**
     * Create adoption plans for an olive tree.
     */
    private function createOliveTreePlans(AdoptableItem $adoptableItem): void
    {
        // 6-month plan
        AdoptionPlan::create([
            'adoptable_item_id' => $adoptableItem->id,
            'name' => 'Βασικό Πρόγραμμα',
            'description' => 'Υιοθετήστε το ελαιόδεντρο για 6 μήνες και λάβετε 2 λίτρα εξαιρετικό παρθένο ελαιόλαδο.',
            'price' => 60.00,
            'duration_months' => 6,
            'benefits' => [
                '2 λίτρα εξαιρετικό παρθένο ελαιόλαδο',
                'Πιστοποιητικό υιοθεσίας',
                'Μηνιαίες ενημερώσεις για το δέντρο σας',
            ],
            'active' => true,
        ]);

        // 12-month plan
        AdoptionPlan::create([
            'adoptable_item_id' => $adoptableItem->id,
            'name' => 'Ετήσιο Πρόγραμμα',
            'description' => 'Υιοθετήστε το ελαιόδεντρο για 12 μήνες και λάβετε 5 λίτρα εξαιρετικό παρθένο ελαιόλαδο.',
            'price' => 110.00,
            'duration_months' => 12,
            'benefits' => [
                '5 λίτρα εξαιρετικό παρθένο ελαιόλαδο',
                'Πιστοποιητικό υιοθεσίας',
                'Μηνιαίες ενημερώσεις για το δέντρο σας',
                'Δυνατότητα επίσκεψης στον ελαιώνα',
            ],
            'active' => true,
        ]);
    }

    /**
     * Create adoption plans for a vineyard.
     */
    private function createVineyardPlans(AdoptableItem $adoptableItem): void
    {
        // 6-month plan
        AdoptionPlan::create([
            'adoptable_item_id' => $adoptableItem->id,
            'name' => 'Βασικό Πρόγραμμα',
            'description' => 'Υιοθετήστε το αμπέλι για 6 μήνες και λάβετε 3 φιάλες κρασί.',
            'price' => 80.00,
            'duration_months' => 6,
            'benefits' => [
                '3 φιάλες κρασί',
                'Πιστοποιητικό υιοθεσίας',
                'Μηνιαίες ενημερώσεις για το αμπέλι σας',
            ],
            'active' => true,
        ]);

        // 12-month plan
        AdoptionPlan::create([
            'adoptable_item_id' => $adoptableItem->id,
            'name' => 'Ετήσιο Πρόγραμμα',
            'description' => 'Υιοθετήστε το αμπέλι για 12 μήνες και λάβετε 6 φιάλες κρασί.',
            'price' => 150.00,
            'duration_months' => 12,
            'benefits' => [
                '6 φιάλες κρασί',
                'Πιστοποιητικό υιοθεσίας',
                'Μηνιαίες ενημερώσεις για το αμπέλι σας',
                'Δυνατότητα επίσκεψης στον αμπελώνα',
                'Συμμετοχή στον τρύγο',
            ],
            'active' => true,
        ]);
    }

    /**
     * Create adoption plans for a beehive.
     */
    private function createBeehivePlans(AdoptableItem $adoptableItem): void
    {
        // 6-month plan
        AdoptionPlan::create([
            'adoptable_item_id' => $adoptableItem->id,
            'name' => 'Βασικό Πρόγραμμα',
            'description' => 'Υιοθετήστε το μελίσσι για 6 μήνες και λάβετε 3 βάζα μέλι.',
            'price' => 70.00,
            'duration_months' => 6,
            'benefits' => [
                '3 βάζα μέλι (450γρ το καθένα)',
                'Πιστοποιητικό υιοθεσίας',
                'Μηνιαίες ενημερώσεις για το μελίσσι σας',
            ],
            'active' => true,
        ]);

        // 12-month plan
        AdoptionPlan::create([
            'adoptable_item_id' => $adoptableItem->id,
            'name' => 'Ετήσιο Πρόγραμμα',
            'description' => 'Υιοθετήστε το μελίσσι για 12 μήνες και λάβετε 6 βάζα μέλι.',
            'price' => 130.00,
            'duration_months' => 12,
            'benefits' => [
                '6 βάζα μέλι (450γρ το καθένα)',
                'Πιστοποιητικό υιοθεσίας',
                'Μηνιαίες ενημερώσεις για το μελίσσι σας',
                'Δυνατότητα επίσκεψης στο μελισσοκομείο',
                'Ένα βάζο γύρη μέλισσας',
            ],
            'active' => true,
        ]);
    }
}
