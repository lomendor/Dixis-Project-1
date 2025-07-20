<?php

namespace Database\Factories;

use App\Models\Producer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProducerFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Producer::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        // Realistic Greek producer names
        $greekProducerNames = [
            'Αγρόκτημα Παπαδόπουλου',
            'Βιολογικές Καλλιέργειες Κωνσταντίνου',
            'Οικογένεια Γεωργίου - Παραδοσιακά Προϊόντα',
            'Αγροτικός Συνεταιρισμός Κρήτης',
            'Ελαιώνες Μεσσηνίας',
            'Μελισσοκομία Θεσσαλίας',
            'Τυροκομείο Ηπείρου',
            'Αμπελώνες Σαντορίνης',
            'Βιοκαλλιέργειες Πελοποννήσου',
            'Παραδοσιακά Προϊόντα Μακεδονίας',
            'Κτήμα Οικογένειας Αντωνίου',
            'Συνεταιρισμός Ελαιοπαραγωγών Καλαμάτας',
            'Μανιτάρια Βορείου Ελλάδος',
            'Αγρόκτημα Βιολογικών Προϊόντων',
            'Παραδοσιακό Τυροκομείο Μετσόβου'
        ];

        // Greek cities and regions
        $greekCities = [
            ['city' => 'Καλαμάτα', 'region' => 'Πελοπόννησος', 'postal' => '24100'],
            ['city' => 'Ηράκλειο', 'region' => 'Κρήτη', 'postal' => '71201'],
            ['city' => 'Θεσσαλονίκη', 'region' => 'Μακεδονία', 'postal' => '54622'],
            ['city' => 'Βόλος', 'region' => 'Θεσσαλία', 'postal' => '38221'],
            ['city' => 'Ιωάννινα', 'region' => 'Ήπειρος', 'postal' => '45221'],
            ['city' => 'Μυτιλήνη', 'region' => 'Βόρειο Αιγαίο', 'postal' => '81100'],
            ['city' => 'Χανιά', 'region' => 'Κρήτη', 'postal' => '73100'],
            ['city' => 'Κόρινθος', 'region' => 'Πελοπόννησος', 'postal' => '20100'],
            ['city' => 'Λάρισα', 'region' => 'Θεσσαλία', 'postal' => '41221'],
            ['city' => 'Πάτρα', 'region' => 'Δυτική Ελλάδα', 'postal' => '26221'],
            ['city' => 'Ρόδος', 'region' => 'Νότιο Αιγαίο', 'postal' => '85100'],
            ['city' => 'Κοζάνη', 'region' => 'Δυτική Μακεδονία', 'postal' => '50100'],
            ['city' => 'Τρίπολη', 'region' => 'Πελοπόννησος', 'postal' => '22100'],
            ['city' => 'Σέρρες', 'region' => 'Κεντρική Μακεδονία', 'postal' => '62122'],
            ['city' => 'Αγρίνιο', 'region' => 'Δυτική Ελλάδα', 'postal' => '30100']
        ];

        // Greek producer descriptions
        $descriptions = [
            'Οικογενειακή επιχείρηση με παράδοση τριών γενεών στην παραγωγή βιολογικών προϊόντων. Χρησιμοποιούμε παραδοσιακές μεθόδους καλλιέργειας και σεβόμαστε το περιβάλλον.',
            'Αγροτικός συνεταιρισμός που δραστηριοποιείται στην παραγωγή και επεξεργασία παραδοσιακών ελληνικών προϊόντων υψηλής ποιότητας.',
            'Βιολογική μονάδα παραγωγής με πιστοποιήσεις ΒΙΟ ΕΛΛΑΣ. Ειδικευόμαστε στην καλλιέργεια και επεξεργασία προϊόντων χωρίς χημικά.',
            'Παραδοσιακή επιχείρηση που συνδυάζει την εμπειρία του παρελθόντος με τις σύγχρονες τεχνικές παραγωγής για προϊόντα εξαιρετικής ποιότητας.',
            'Τοπικός παραγωγός με έμφαση στη βιώσιμη γεωργία και την προστασία της τοπικής βιοποικιλότητας. Όλα μας τα προϊόντα είναι 100% φυσικά.',
            'Συνεταιρισμός παραγωγών που προωθεί τα αυθεντικά γεύματα της ελληνικής γης με σεβασμό στην παράδοση και την ποιότητα.'
        ];

        $location = $this->faker->randomElement($greekCities);
        $businessName = $this->faker->randomElement($greekProducerNames);
        $description = $this->faker->randomElement($descriptions);

        return [
            'user_id' => User::factory()->create(['role' => 'producer']),
            'business_name' => $businessName,
            'tax_id' => $this->faker->numerify('#########'),
            'tax_office' => $location['city'] . ' ΔΟΥ',
            'description' => $description,
            'address' => $this->faker->streetAddress,
            'city' => $location['city'],
            'postal_code' => $location['postal'],
            'region' => $location['region'],
            'latitude' => $this->faker->latitude(34.5, 41.8), // Greece coordinates
            'longitude' => $this->faker->longitude(19.3, 29.6), // Greece coordinates
            'map_description' => 'Βρισκόμαστε στο κέντρο της ' . $location['city'],
            'website' => $this->faker->optional(0.7)->url,
            'social_media' => [
                'facebook' => $this->faker->optional(0.8)->url,
                'instagram' => $this->faker->optional(0.6)->userName,
            ],
            'bio' => $this->faker->optional(0.8)->text(200),
            'verified' => $this->faker->boolean(85), // 85% verified
            'rating' => $this->faker->randomFloat(1, 3.5, 5.0),
            'uses_custom_shipping_rates' => $this->faker->boolean(30),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
