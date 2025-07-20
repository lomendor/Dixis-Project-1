<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producer;
use App\Models\User;
use App\Models\ProducerQuestion;
use Carbon\Carbon;

class ProducerQuestionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Βρίσκουμε όλους τους παραγωγούς
        $producers = Producer::all();
        
        if ($producers->isEmpty()) {
            $this->command->info('Δεν υπάρχουν παραγωγοί για να προσθέσουμε ερωτήσεις. Παρακαλώ εκτελέστε πρώτα το ProducerSeeder.');
            return;
        }
        
        // Βρίσκουμε μερικούς χρήστες για τις ερωτήσεις
        $users = User::where('id', '!=', 1)->take(5)->get();
        
        if ($users->isEmpty()) {
            $this->command->info('Δεν υπάρχουν χρήστες για να προσθέσουμε ερωτήσεις. Παρακαλώ εκτελέστε πρώτα το UserSeeder.');
            return;
        }
        
        // Δοκιμαστικές ερωτήσεις και απαντήσεις
        $questions = [
            [
                'question' => 'Χρησιμοποιείτε φυτοφάρμακα στις καλλιέργειες σας;',
                'answer' => 'Όχι, καλλιεργούμε αποκλειστικά με βιολογικές μεθόδους και χρησιμοποιούμε μόνο φυσικά σκευάσματα για την προστασία των φυτών.',
                'is_public' => true,
                'has_answer' => true
            ],
            [
                'question' => 'Πόσο συχνά συλλέγετε τα προϊόντα σας;',
                'answer' => 'Συλλέγουμε τα λαχανικά καθημερινά τις πρώτες πρωινές ώρες για να διατηρούν τη φρεσκάδα τους. Τα φρούτα τα συλλέγουμε ανάλογα με την ωρίμανσή τους, συνήθως 2-3 φορές την εβδομάδα.',
                'is_public' => true,
                'has_answer' => true
            ],
            [
                'question' => 'Πώς μπορώ να επισκεφθώ το αγρόκτημά σας;',
                'answer' => 'Μπορείτε να επισκεφθείτε το αγρόκτημά μας κάθε Σάββατο και Κυριακή από τις 10:00 έως τις 18:00. Είναι καλύτερο να μας ενημερώσετε πριν την επίσκεψή σας στο τηλέφωνο που αναγράφεται στην ιστοσελίδα μας.',
                'is_public' => true,
                'has_answer' => true
            ],
            [
                'question' => 'Έχετε δυνατότητα αποστολής των προϊόντων σας σε άλλες περιοχές εκτός της δικής σας;',
                'answer' => 'Ναι, μπορούμε να αποστείλουμε τα προϊόντα μας σε όλη την Ελλάδα. Το κόστος αποστολής εξαρτάται από το βάρος της παραγγελίας και την απόσταση. Για λεπτομέρειες, παρακαλούμε επικοινωνήστε μαζί μας.',
                'is_public' => true,
                'has_answer' => true
            ],
            [
                'question' => 'Προσφέρετε εκπτώσεις για μεγάλες παραγγελίες;',
                'answer' => null,
                'is_public' => true,
                'has_answer' => false
            ],
            [
                'question' => 'Ποια είναι η διαδικασία παραγωγής του ελαιόλαδού σας;',
                'answer' => null,
                'is_public' => true,
                'has_answer' => false
            ]
        ];
        
        foreach ($producers as $producer) {
            $this->command->info("Προσθήκη ερωτήσεων για τον παραγωγό: {$producer->business_name}");
            
            foreach ($questions as $index => $questionData) {
                $user = $users[rand(0, count($users) - 1)];
                
                $createdAt = Carbon::now()->subDays(rand(1, 30));
                $answeredAt = null;
                
                if ($questionData['has_answer']) {
                    // Η απάντηση δόθηκε 1-3 μέρες μετά την ερώτηση
                    $answeredAt = (clone $createdAt)->addDays(rand(1, 3));
                }
                
                ProducerQuestion::create([
                    'producer_id' => $producer->id,
                    'user_id' => $user->id,
                    'question' => $questionData['question'],
                    'answer' => $questionData['answer'],
                    'is_public' => $questionData['is_public'],
                    'answered_at' => $answeredAt,
                    'created_at' => $createdAt,
                    'updated_at' => $answeredAt ?? $createdAt
                ]);
            }
        }
        
        $this->command->info('Οι ερωτήσεις των παραγωγών προστέθηκαν με επιτυχία!');
    }
}