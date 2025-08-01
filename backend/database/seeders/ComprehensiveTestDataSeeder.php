<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShippingZone;
use App\Models\ShippingRate;
use App\Models\Tenant;
use App\Models\TenantTheme;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ComprehensiveTestDataSeeder extends Seeder
{
    /**
     * Run the comprehensive test data seeder.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting comprehensive test data seeding...');

        // Create test users
        $this->createTestUsers();
        
        // Create categories
        $this->createCategories();
        
        // Create producers
        $this->createProducers();
        
        // Create products
        $this->createProducts();
        
        // Create shipping zones and rates
        $this->createShippingData();
        
        // Create sample orders
        $this->createSampleOrders();
        
        // Create tenants for multi-tenant testing
        $this->createTenants();

        $this->command->info('✅ Comprehensive test data seeding completed!');
    }

    private function createTestUsers(): void
    {
        $this->command->info('👥 Creating test users...');

        // Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@dixis.io',
            'email_verified_at' => now(),
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'phone' => '+30 210 1234567'
        ]);

        // Producer user
        User::create([
            'name' => 'Γιάννης Παπαδόπουλος',
            'email' => 'producer@dixis.io',
            'email_verified_at' => now(),
            'password' => Hash::make('producer123'),
            'role' => 'producer',
            'phone' => '+30 210 9876543'
        ]);

        // B2B user
        User::create([
            'name' => 'Μαρία Γεωργίου',
            'email' => 'b2b@dixis.io',
            'email_verified_at' => now(),
            'password' => Hash::make('b2b123'),
            'role' => 'b2b',
            'phone' => '+30 210 5555555'
        ]);

        // Regular customer
        User::create([
            'name' => 'Κώστας Αντωνίου',
            'email' => 'customer@dixis.io',
            'email_verified_at' => now(),
            'password' => Hash::make('customer123'),
            'role' => 'customer',
            'phone' => '+30 210 7777777'
        ]);

        // Test user for E2E testing
        User::create([
            'name' => 'Test User',
            'email' => 'test@dixis.io',
            'email_verified_at' => now(),
            'password' => Hash::make('testpassword123'),
            'role' => 'customer',
            'phone' => '+30 210 1111111'
        ]);
    }

    private function createCategories(): void
    {
        $this->command->info('📂 Creating categories...');

        $categories = [
            ['name' => 'Φρούτα', 'slug' => 'frouta', 'description' => 'Φρέσκα εποχιακά φρούτα'],
            ['name' => 'Λαχανικά', 'slug' => 'lachanika', 'description' => 'Φρέσκα λαχανικά από τον κήπο'],
            ['name' => 'Ελαιόλαδο', 'slug' => 'elaiolado', 'description' => 'Εξαιρετικό παρθένο ελαιόλαδο'],
            ['name' => 'Τυριά', 'slug' => 'tyria', 'description' => 'Παραδοσιακά ελληνικά τυριά'],
            ['name' => 'Μέλι', 'slug' => 'meli', 'description' => 'Φυσικό μέλι από ελληνικά βουνά'],
            ['name' => 'Κρέας', 'slug' => 'kreas', 'description' => 'Φρέσκο κρέας από ελληνικές φάρμες'],
            ['name' => 'Ψάρια', 'slug' => 'psaria', 'description' => 'Φρέσκα ψάρια από ελληνικές θάλασσες'],
            ['name' => 'Αρτοποιήματα', 'slug' => 'artopoiimata', 'description' => 'Φρέσκο ψωμί και αρτοποιήματα'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }

    private function createProducers(): void
    {
        $this->command->info('🏭 Creating producers...');

        $producers = [
            [
                'name' => 'Αγρόκτημα Παπαδόπουλου',
                'slug' => 'papadopoulos-farm',
                'description' => 'Οικογενειακό αγρόκτημα με παράδοση 3 γενεών στην καλλιέργεια βιολογικών προϊόντων.',
                'location' => 'Καλαμάτα, Μεσσηνία',
                'phone' => '+30 27210 12345',
                'email' => 'info@papadopoulos-farm.gr',
                'website' => 'https://papadopoulos-farm.gr',
                'certification' => 'Βιολογικό',
                'established_year' => 1985,
                'user_id' => 2
            ],
            [
                'name' => 'Κτήμα Γεωργιάδη',
                'slug' => 'georgiadi-estate',
                'description' => 'Παραδοσιακό κτήμα στη Κρήτη με εξειδίκευση στο ελαιόλαδο και τα κρητικά προϊόντα.',
                'location' => 'Χανιά, Κρήτη',
                'phone' => '+30 28210 54321',
                'email' => 'contact@georgiadi-estate.gr',
                'website' => 'https://georgiadi-estate.gr',
                'certification' => 'ΠΟΠ Κρήτης',
                'established_year' => 1920,
                'user_id' => 2
            ],
            [
                'name' => 'Μελισσοκομία Αντωνίου',
                'slug' => 'antoniou-honey',
                'description' => 'Παραδοσιακή μελισσοκομία στα βουνά της Αρκαδίας με φυσικό μέλι υψηλής ποιότητας.',
                'location' => 'Τρίπολη, Αρκαδία',
                'phone' => '+30 27710 98765',
                'email' => 'honey@antoniou.gr',
                'certification' => 'Φυσικό Προϊόν',
                'established_year' => 1995,
                'user_id' => 2
            ],
            [
                'name' => 'Τυροκομείο Καραγιάννη',
                'slug' => 'karagianni-cheese',
                'description' => 'Παραδοσιακό τυροκομείο με εξειδίκευση σε ελληνικά τυριά από κατσικίσιο και πρόβειο γάλα.',
                'location' => 'Μέτσοβο, Ιωάννινα',
                'phone' => '+30 26560 41234',
                'email' => 'info@karagianni-cheese.gr',
                'certification' => 'ΠΟΠ Μετσόβου',
                'established_year' => 1960,
                'user_id' => 2
            ]
        ];

        foreach ($producers as $producer) {
            Producer::create($producer);
        }
    }

    private function createProducts(): void
    {
        $this->command->info('🛍️ Creating products...');

        $products = [
            [
                'name' => 'Βιολογικό Ελαιόλαδο Εξαιρετικό Παρθένο',
                'slug' => 'biologiko-elaiolado-exaireto-partheno',
                'description' => 'Εξαιρετικό παρθένο ελαιόλαδο από βιολογικές καλλιέργειες στην Καλαμάτα.',
                'price' => 12.50,
                'b2b_price' => 10.00,
                'stock' => 150,
                'category_id' => 3,
                'producer_id' => 1,
                'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
                'is_featured' => true,
                'is_seasonal' => false,
                'season_start' => null,
                'season_end' => null,
                'nutritional_info' => json_encode([
                    'calories_per_100ml' => 884,
                    'fat' => 100,
                    'saturated_fat' => 14,
                    'vitamin_e' => 14
                ])
            ],
            [
                'name' => 'Φέτα ΠΟΠ Μετσόβου',
                'slug' => 'feta-pop-metsovou',
                'description' => 'Παραδοσιακή φέτα ΠΟΠ από πρόβειο και κατσικίσιο γάλα από το Μέτσοβο.',
                'price' => 8.90,
                'b2b_price' => 7.50,
                'stock' => 80,
                'category_id' => 4,
                'producer_id' => 4,
                'image_url' => 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500',
                'is_featured' => true,
                'is_seasonal' => false
            ],
            [
                'name' => 'Μέλι Ελάτης Αρκαδίας',
                'slug' => 'meli-elatis-arkadias',
                'description' => 'Φυσικό μέλι ελάτης από τα βουνά της Αρκαδίας, πλούσιο σε μεταλλικά στοιχεία.',
                'price' => 15.00,
                'b2b_price' => 12.50,
                'stock' => 60,
                'category_id' => 5,
                'producer_id' => 3,
                'image_url' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500',
                'is_featured' => false,
                'is_seasonal' => true,
                'season_start' => '2024-09-01',
                'season_end' => '2024-12-31'
            ],
            [
                'name' => 'Βιολογικές Ντομάτες Καλαμάτας',
                'slug' => 'biologikes-ntomates-kalamatas',
                'description' => 'Φρέσκες βιολογικές ντομάτες από τους κήπους της Καλαμάτας.',
                'price' => 3.50,
                'b2b_price' => 2.80,
                'stock' => 200,
                'category_id' => 2,
                'producer_id' => 1,
                'image_url' => 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500',
                'is_featured' => false,
                'is_seasonal' => true,
                'season_start' => '2024-06-01',
                'season_end' => '2024-10-31'
            ],
            [
                'name' => 'Κρητικά Πορτοκάλια Βαλέντσια',
                'slug' => 'kritika-portokalia-valencia',
                'description' => 'Ζουμερά πορτοκάλια Valencia από τους κήπους της Κρήτης.',
                'price' => 2.20,
                'b2b_price' => 1.80,
                'stock' => 300,
                'category_id' => 1,
                'producer_id' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500',
                'is_featured' => true,
                'is_seasonal' => true,
                'season_start' => '2024-12-01',
                'season_end' => '2024-05-31'
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }

    private function createShippingData(): void
    {
        $this->command->info('🚚 Creating shipping zones and rates...');

        // Create shipping zones for Greece
        $zones = [
            ['name' => 'Αττική', 'code' => 'ATT', 'description' => 'Περιοχή Αττικής'],
            ['name' => 'Θεσσαλονίκη', 'code' => 'THE', 'description' => 'Περιοχή Θεσσαλονίκης'],
            ['name' => 'Μεγάλες Πόλεις', 'code' => 'BIG', 'description' => 'Πάτρα, Λάρισα, Ηράκλειο'],
            ['name' => 'Υπόλοιπη Ελλάδα', 'code' => 'GRE', 'description' => 'Υπόλοιπη ηπειρωτική Ελλάδα'],
            ['name' => 'Νησιά Αιγαίου', 'code' => 'AEG', 'description' => 'Νησιά Αιγαίου'],
            ['name' => 'Ιόνια Νησιά', 'code' => 'ION', 'description' => 'Ιόνια Νησιά'],
            ['name' => 'Κρήτη', 'code' => 'CRE', 'description' => 'Νήσος Κρήτη']
        ];

        foreach ($zones as $zone) {
            $shippingZone = ShippingZone::create($zone);
            
            // Create shipping rates for each zone
            ShippingRate::create([
                'shipping_zone_id' => $shippingZone->id,
                'min_weight' => 0,
                'max_weight' => 5,
                'price' => $this->getShippingPrice($zone['code'], 'light')
            ]);
            
            ShippingRate::create([
                'shipping_zone_id' => $shippingZone->id,
                'min_weight' => 5,
                'max_weight' => 20,
                'price' => $this->getShippingPrice($zone['code'], 'medium')
            ]);
            
            ShippingRate::create([
                'shipping_zone_id' => $shippingZone->id,
                'min_weight' => 20,
                'max_weight' => null,
                'price' => $this->getShippingPrice($zone['code'], 'heavy')
            ]);
        }
    }

    private function getShippingPrice(string $zoneCode, string $weight): float
    {
        $basePrices = [
            'ATT' => ['light' => 3.50, 'medium' => 5.50, 'heavy' => 8.50],
            'THE' => ['light' => 4.00, 'medium' => 6.00, 'heavy' => 9.00],
            'BIG' => ['light' => 4.50, 'medium' => 6.50, 'heavy' => 9.50],
            'GRE' => ['light' => 5.00, 'medium' => 7.00, 'heavy' => 10.00],
            'AEG' => ['light' => 6.50, 'medium' => 9.50, 'heavy' => 15.00],
            'ION' => ['light' => 6.00, 'medium' => 9.00, 'heavy' => 14.00],
            'CRE' => ['light' => 5.50, 'medium' => 8.00, 'heavy' => 12.00]
        ];

        return $basePrices[$zoneCode][$weight] ?? 10.00;
    }

    private function createSampleOrders(): void
    {
        $this->command->info('📦 Creating sample orders...');

        // Create a few sample orders for testing
        $order1 = Order::create([
            'user_id' => 4, // Customer
            'order_number' => 'DX-' . date('Y') . '-001',
            'status' => 'completed',
            'total_amount' => 45.60,
            'shipping_cost' => 5.50,
            'payment_status' => 'paid',
            'payment_method' => 'stripe',
            'shipping_address' => json_encode([
                'name' => 'Κώστας Αντωνίου',
                'address' => 'Ερμού 50',
                'city' => 'Αθήνα',
                'postal_code' => '10563',
                'country' => 'GR',
                'phone' => '+30 210 7777777'
            ]),
            'notes' => 'Παράδοση το πρωί αν είναι δυνατόν'
        ]);

        // Add order items
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => 1,
            'quantity' => 2,
            'price' => 12.50,
            'total' => 25.00
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => 2,
            'quantity' => 1,
            'price' => 8.90,
            'total' => 8.90
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => 3,
            'quantity' => 1,
            'price' => 15.00,
            'total' => 15.00
        ]);
    }

    private function createTenants(): void
    {
        $this->command->info('🏢 Creating tenants for multi-tenant testing...');

        $tenant1 = Tenant::create([
            'name' => 'Κρητικά Προϊόντα',
            'slug' => 'kritika-proionta',
            'domain' => 'kritika.dixis.io',
            'description' => 'Παραδοσιακά κρητικά προϊόντα απευθείας από τους παραγωγούς',
            'logo_url' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
            'contact_email' => 'info@kritika.dixis.io',
            'contact_phone' => '+30 2810 123456',
            'subscription_plan' => 'premium',
            'subscription_expires_at' => now()->addYear(),
            'is_active' => true,
            'settings' => json_encode([
                'commission_rate' => 12.5,
                'min_order_amount' => 25.00,
                'free_shipping_threshold' => 50.00
            ])
        ]);

        TenantTheme::create([
            'tenant_id' => $tenant1->id,
            'primary_color' => '#8B4513',
            'secondary_color' => '#D2691E',
            'accent_color' => '#FF6347',
            'background_color' => '#FFF8DC',
            'text_color' => '#2F4F4F',
            'font_family' => 'Georgia, serif',
            'logo_position' => 'center',
            'layout_style' => 'traditional',
            'custom_css' => '.hero { background: linear-gradient(135deg, #8B4513, #D2691E); }'
        ]);

        $tenant2 = Tenant::create([
            'name' => 'Βιολογικά Προϊόντα Αττικής',
            'slug' => 'biologika-attikis',
            'domain' => 'biologika.dixis.io',
            'description' => 'Βιολογικά προϊόντα από τους κήπους της Αττικής',
            'logo_url' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
            'contact_email' => 'info@biologika.dixis.io',
            'contact_phone' => '+30 210 987654',
            'subscription_plan' => 'basic',
            'subscription_expires_at' => now()->addMonths(6),
            'is_active' => true,
            'settings' => json_encode([
                'commission_rate' => 10.0,
                'min_order_amount' => 20.00,
                'free_shipping_threshold' => 40.00
            ])
        ]);

        TenantTheme::create([
            'tenant_id' => $tenant2->id,
            'primary_color' => '#228B22',
            'secondary_color' => '#32CD32',
            'accent_color' => '#ADFF2F',
            'background_color' => '#F0FFF0',
            'text_color' => '#006400',
            'font_family' => 'Arial, sans-serif',
            'logo_position' => 'left',
            'layout_style' => 'modern',
            'custom_css' => '.hero { background: linear-gradient(135deg, #228B22, #32CD32); }'
        ]);
    }
}
