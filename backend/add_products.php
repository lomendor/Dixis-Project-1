<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductCategory;
use App\Models\AdoptableItem;
use Illuminate\Support\Str;

// Get producers
$producers = User::role('producer')->get();

echo "Found " . $producers->count() . " producers\n";

foreach ($producers as $producer) {
    echo "Producer: " . $producer->name . " (ID: " . $producer->id . ")\n";
}

// Get categories
$categories = ProductCategory::all();

echo "\nFound " . $categories->count() . " categories\n";

foreach ($categories as $category) {
    echo "Category: " . $category->name . " (ID: " . $category->id . ")\n";
}

// Add products for the first producer
$producer = $producers->first();

if (!$producer) {
    echo "No producer found. Exiting.\n";
    exit;
}

echo "\nAdding products for producer: " . $producer->name . " (ID: " . $producer->id . ")\n";

// Product 1: Μέλι Ανθέων
$product1 = new Product();
$product1->producer_id = $producer->id;
$product1->name = "Μέλι Ανθέων";
$product1->slug = Str::slug("meli-antheon-messinias");
$product1->description = "Αγνό μέλι ανθέων από τα βουνά της Μεσσηνίας. Συλλέγεται με παραδοσιακές μεθόδους και διατηρεί όλα τα θρεπτικά συστατικά του.";
$product1->short_description = "Αγνό μέλι ανθέων από τα βουνά της Μεσσηνίας.";
$product1->price = 8.50;
$product1->discount_price = null;
$product1->stock = 50;
$product1->sku = "HONEY-002";
$product1->weight_grams = 500;
$product1->dimensions = json_encode([
    'length_cm' => 10,
    'width_cm' => 10,
    'height_cm' => 15
]);
$product1->is_active = true;
$product1->is_featured = true;
$product1->is_seasonal = false;
$product1->season_start = null;
$product1->season_end = null;
$product1->is_limited_edition = false;
$product1->limited_quantity = null;
$product1->allow_wishlist_notifications = true;

try {
    $product1->save();
    echo "Added product: " . $product1->name . " (ID: " . $product1->id . ")\n";

    // Add product to category
    if ($categories->count() > 0) {
        $category = $categories->where('name', 'like', '%Μέλι%')->first() ?? $categories->first();
        $product1->categories()->attach($category->id);
        echo "Added product to category: " . $category->name . "\n";
    }

    // Add product image
    $image1 = new ProductImage();
    $image1->product_id = $product1->id;
    $image1->image_path = "product_images/honey.jpg";
    $image1->sort_order = 1;
    $image1->alt_text = "Μέλι Ανθέων";
    $image1->save();
    echo "Added image for product\n";
} catch (\Exception $e) {
    echo "Error adding product: " . $e->getMessage() . "\n";
}

// Product 2: Τυρί Φέτα ΠΟΠ
$product2 = new Product();
$product2->producer_id = $producer->id;
$product2->name = "Τυρί Φέτα ΠΟΠ";
$product2->slug = Str::slug("tyri-feta-pop-messinias");
$product2->description = "Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα. Ωριμάζει για τουλάχιστον 3 μήνες σε ξύλινα βαρέλια για να αποκτήσει την πλούσια γεύση της.";
$product2->short_description = "Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα.";
$product2->price = 12.90;
$product2->discount_price = 10.90;
$product2->stock = 30;
$product2->sku = "CHEESE-002";
$product2->weight_grams = 400;
$product2->dimensions = json_encode([
    'length_cm' => 15,
    'width_cm' => 10,
    'height_cm' => 5
]);
$product2->is_active = true;
$product2->is_featured = true;
$product2->is_seasonal = false;
$product2->season_start = null;
$product2->season_end = null;
$product2->is_limited_edition = false;
$product2->limited_quantity = null;
$product2->allow_wishlist_notifications = true;

try {
    $product2->save();
    echo "Added product: " . $product2->name . " (ID: " . $product2->id . ")\n";

    // Add product to category
    if ($categories->count() > 0) {
        $category = $categories->where('name', 'like', '%Τυρί%')->first() ?? $categories->first();
        $product2->categories()->attach($category->id);
        echo "Added product to category: " . $category->name . "\n";
    }

    // Add product image
    $image2 = new ProductImage();
    $image2->product_id = $product2->id;
    $image2->image_path = "product_images/feta.jpg";
    $image2->sort_order = 1;
    $image2->alt_text = "Τυρί Φέτα ΠΟΠ";
    $image2->save();
    echo "Added image for product\n";
} catch (\Exception $e) {
    echo "Error adding product: " . $e->getMessage() . "\n";
}

// Product 3: Βιολογικές Ελιές Καλαμών
$product3 = new Product();
$product3->producer_id = $producer->id;
$product3->name = "Βιολογικές Ελιές Καλαμών";
$product3->slug = Str::slug("viologikes-elies-kalamwn-messinias");
$product3->description = "Βιολογικές ελιές Καλαμών, χειροσυλλεγμένες και επεξεργασμένες με παραδοσιακό τρόπο. Διατηρούνται σε άλμη και έχουν πλούσια γεύση.";
$product3->short_description = "Βιολογικές ελιές Καλαμών, χειροσυλλεγμένες και επεξεργασμένες με παραδοσιακό τρόπο.";
$product3->price = 7.50;
$product3->discount_price = null;
$product3->stock = 40;
$product3->sku = "OLIVES-002";
$product3->weight_grams = 300;
$product3->dimensions = json_encode([
    'length_cm' => 12,
    'width_cm' => 8,
    'height_cm' => 5
]);
$product3->is_active = true;
$product3->is_featured = false;
$product3->is_seasonal = false;
$product3->season_start = null;
$product3->season_end = null;
$product3->is_limited_edition = false;
$product3->limited_quantity = null;
$product3->allow_wishlist_notifications = true;

try {
    $product3->save();
    echo "Added product: " . $product3->name . " (ID: " . $product3->id . ")\n";

    // Add product to category
    if ($categories->count() > 0) {
        $category = $categories->where('name', 'like', '%Ελιές%')->first() ?? $categories->first();
        $product3->categories()->attach($category->id);
        echo "Added product to category: " . $category->name . "\n";
    }

    // Add product image
    $image3 = new ProductImage();
    $image3->product_id = $product3->id;
    $image3->image_path = "product_images/olives.jpg";
    $image3->sort_order = 1;
    $image3->alt_text = "Βιολογικές Ελιές Καλαμών";
    $image3->save();
    echo "Added image for product\n";
} catch (\Exception $e) {
    echo "Error adding product: " . $e->getMessage() . "\n";
}

// Add adoptable items
echo "\nAdding adoptable items for producer: " . $producer->name . " (ID: " . $producer->id . ")\n";

// Adoptable Item 1: Ελαιόδεντρο
$adoptable1 = new AdoptableItem();
$adoptable1->producer_id = $producer->id;
$adoptable1->name = "Ελαιόδεντρο";
$adoptable1->slug = Str::slug("elaiodenro-messinias");
$adoptable1->description = "Υιοθετήστε ένα ελαιόδεντρο και λάβετε το λάδι του κάθε χρόνο. Το δέντρο σας θα φροντίζεται με παραδοσιακές μεθόδους καλλιέργειας.";
$adoptable1->type = "tree";
$adoptable1->location = "Μεσσηνία, Ελλάδα";
$adoptable1->status = "available";
$adoptable1->main_image = "adoptable_items/olive_tree.jpg";
$adoptable1->gallery_images = json_encode(["adoptable_items/olive_tree_1.jpg", "adoptable_items/olive_tree_2.jpg"]);
$adoptable1->attributes = json_encode([
    'price' => 120.00,
    'adoption_period_months' => 12,
    'benefits' => [
        'Παραλαβή 5 λίτρων εξαιρετικά παρθένου ελαιόλαδου',
        'Πιστοποιητικό υιοθεσίας',
        'Φωτογραφίες του δέντρου σας',
        'Ενημερώσεις για την καλλιέργεια'
    ]
]);
$adoptable1->featured = true;

try {
    $adoptable1->save();
    echo "Added adoptable item: " . $adoptable1->name . " (ID: " . $adoptable1->id . ")\n";
} catch (\Exception $e) {
    echo "Error adding adoptable item: " . $e->getMessage() . "\n";
}

// Adoptable Item 2: Μελίσσι
$adoptable2 = new AdoptableItem();
$adoptable2->producer_id = $producer->id;
$adoptable2->name = "Μελίσσι";
$adoptable2->slug = Str::slug("melissi-messinias");
$adoptable2->description = "Υιοθετήστε μια κυψέλη μελισσών και λάβετε το μέλι της κάθε χρόνο. Οι μέλισσές σας θα φροντίζονται με φυσικές μεθόδους μελισσοκομίας.";
$adoptable2->type = "beehive";
$adoptable2->location = "Μεσσηνία, Ελλάδα";
$adoptable2->status = "available";
$adoptable2->main_image = "adoptable_items/beehive.jpg";
$adoptable2->gallery_images = json_encode(["adoptable_items/beehive_1.jpg", "adoptable_items/beehive_2.jpg"]);
$adoptable2->attributes = json_encode([
    'price' => 90.00,
    'discount_price' => 80.00,
    'adoption_period_months' => 12,
    'benefits' => [
        'Παραλαβή 3 βάζων μελιού (συνολικά 1.5 κιλό)',
        'Πιστοποιητικό υιοθεσίας',
        'Φωτογραφίες της κυψέλης σας',
        'Ενημερώσεις για τη μελισσοκομία'
    ]
]);
$adoptable2->featured = true;

try {
    $adoptable2->save();
    echo "Added adoptable item: " . $adoptable2->name . " (ID: " . $adoptable2->id . ")\n";
} catch (\Exception $e) {
    echo "Error adding adoptable item: " . $e->getMessage() . "\n";
}

echo "\nDone!\n";
