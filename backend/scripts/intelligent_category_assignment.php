<?php

/**
 * Intelligent Category Assignment Script
 * Auto-assigns products to categories based on product names and descriptions
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\ProductCategory;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🚀 Starting Intelligent Category Assignment...\n\n";

// Category mapping rules based on keywords (using exact category names)
$categoryMappings = [
    // Olive Oil & Olives  
    'ελαιόλαδο|ελαιο|olive.*oil|extra.*virgin|αγουρέλαιο' => ['Ελαιόλαδο'],
    'ελιές|ελιά|olives|καλαμών|καλαμάτας|χαλκιδικής|θρούμπες|αμφίσσης' => ['Επιτραπέζιες Ελιές'],
    'πάστα.*ελιάς|tapenade' => ['Πάστα Ελιάς'],
    
    // Honey Products
    'μέλι|honey|θυμαρίσιο|θυμάρι|πεύκου|καστανιάς|ελάτης|ανθέων|πορτοκαλιάς|κηρήθρα' => ['Μέλι'],
    'γύρη|pollen' => ['Γύρη'],
    'πρόπολη|propolis' => ['Πρόπολη'],
    'βασιλικός.*πολτός|royal.*jelly' => ['Βασιλικός Πολτός'],
    
    // Cheese & Dairy
    'τυρί|τυριά|cheese|φέτα|κεφαλογραβιέρα|κασέρι|γραβιέρα|μανούρι|μυζήθρα|ανθότυρο|κοπανιστή|σφέλα|μετσοβόνε' => ['Τυριά'],
    'γιαούρτι|yogurt' => ['Γιαούρτι'],
    'βούτυρο|butter' => ['Βούτυρο'],
    
    // Wine & Spirits
    'κρασί|wine|ερυθρό|λευκό|ροζέ' => ['Κρασί'],
    'τσίπουρο|ούζο|ouzo|tsipouro' => ['Τσίπουρο & Ούζο'],
    'λικέρ|liqueur' => ['Λικέρ'],
    'μπύρα|beer' => ['Μπύρα'],
    
    // Nuts & Dried Fruits
    'αμύγδαλα|καρύδια|φιστίκια|κουκουνάρι|φουντούκια|κάστανα|ηλιόσποροι|κολοκυθόσποροι' => ['Ξηροί Καρποί'],
    'σταφίδα|σύκα.*ξερά|κορινθιακή' => ['Αποξηραμένα Φρούτα'],
    
    // Herbs & Spices
    'μπαχαρικά|spices|πιπέρι|κανέλα|κύμινο' => ['Μπαχαρικά'],
    'ρίγανη|θυμάρι|δεντρολίβανο|μέντα|βασιλικός|δάφνη|μαστίχα|δίκταμο|φασκόμηλο|τσάι.*βουνού' => ['Βότανα'],
    'αρωματικά.*φυτά|aromatic.*herbs' => ['Αρωματικά Φυτά'],
    
    // Legumes
    'φασόλια|γίγαντες|πλακέ|μέτρια|φασολάκια|μαυρομάτικα' => ['Φασόλια'],
    'φακές|εγκλουβής' => ['Φακές'],
    'ρεβίθια|ελασσόνας' => ['Ρεβίθια'],
    'φάβα|σαντορίνης' => ['Φάβα'],
    
    // Additional legumes
    'λαθούρι|μπιζέλια.*ξερά' => ['Όσπρια'],
    
    // Cereals & Flour
    'άλευρα|flour|αλεύρι' => ['Άλευρα'],
    'δημητριακά|cereals|σιτάρι|κριθάρι' => ['Δημητριακά'],
    'ψωμί|bread|αρτοσκευάσματα' => ['Ψωμί & Αρτοσκευάσματα'],
    
    // Pasta
    'ζυμαρικά|pasta|χυλοπίτες|τραχανάς' => ['Παραδοσιακά Ζυμαρικά'],
    'χωρίς.*γλουτένη|gluten.*free' => ['Ζυμαρικά Χωρίς Γλουτένη'],
    
    // Preserves & Sauces
    'μαρμελάδα|jam|βερίκοκο|φράουλα|σύκο|πορτοκάλι|ροδάκινο|κυδώνι' => ['Μαρμελάδες'],
    'σάλτσες|sauce|σάλτσα' => ['Σάλτσες'],
    'γλυκό.*κουταλιού|κεράσι|μαστίχα|βύσσινο|καρύδι' => ['Γλυκά Κουταλιού'],
    
    // Additional products
    'πετιμέζι|ταχίνι' => ['Αλείμματα & Σάλτσες'],
    
    // Mushrooms & Truffles
    'μανιτάρια|mushrooms' => ['Μανιτάρια'],
    'τρούφες|truffles' => ['Τρούφες'],
    
    // Cosmetics
    'σαπούνια|soap' => ['Σαπούνια'],
    'κρέμες|cream' => ['Κρέμες'],
    'έλαια.*περιποίησης|essential.*oils' => ['Έλαια Περιποίησης'],
];

echo "📋 Category Mapping Rules: " . count($categoryMappings) . " rules loaded\n";

// Get all products without categories
$productsWithoutCategories = Product::whereDoesntHave('categories')->get();
echo "🔍 Found {$productsWithoutCategories->count()} products without categories\n\n";

// Get all available categories
$availableCategories = ProductCategory::where('is_active', true)->get()->keyBy('name');
echo "📁 Available Categories: {$availableCategories->count()}\n\n";

$assignmentCount = 0;
$logFile = storage_path('logs/category_assignment_' . date('Y-m-d_H-i-s') . '.log');

foreach ($productsWithoutCategories as $product) {
    echo "🔄 Processing: {$product->name}\n";
    
    $searchText = strtolower($product->name . ' ' . ($product->short_description ?? '') . ' ' . ($product->description ?? ''));
    $assignedCategories = [];
    
    foreach ($categoryMappings as $keywords => $categoryNames) {
        $keywordPattern = '/(' . $keywords . ')/u';
        
        if (preg_match($keywordPattern, $searchText)) {
            foreach ($categoryNames as $categoryName) {
                if ($availableCategories->has($categoryName)) {
                    $category = $availableCategories[$categoryName];
                    
                    // Check if not already assigned
                    if (!in_array($category->id, $assignedCategories)) {
                        $assignedCategories[] = $category->id;
                        echo "   ✅ Matched: {$categoryName}\n";
                        
                        // Log assignment
                        file_put_contents($logFile, 
                            "Product ID: {$product->id} | Name: {$product->name} | Category: {$categoryName} | Keyword: {$keywords}\n", 
                            FILE_APPEND | LOCK_EX
                        );
                    }
                }
            }
        }
    }
    
    // Assign categories to product
    if (!empty($assignedCategories)) {
        $product->categories()->sync($assignedCategories);
        $assignmentCount++;
        echo "   💾 Assigned " . count($assignedCategories) . " categories to product\n";
    } else {
        echo "   ⚠️  No matching categories found\n";
        
        // Assign to general category as fallback
        $generalCategory = $availableCategories->first(function($cat) {
            return in_array($cat->name, ['Άλλα', 'Γενικά', 'Παραδοσιακά']);
        });
        
        if ($generalCategory) {
            $product->categories()->sync([$generalCategory->id]);
            echo "   📦 Assigned to fallback category: {$generalCategory->name}\n";
            $assignmentCount++;
        }
    }
    
    echo "\n";
}

echo "🎉 Assignment Complete!\n";
echo "📊 Statistics:\n";
echo "   - Products processed: {$productsWithoutCategories->count()}\n";
echo "   - Products with new categories: {$assignmentCount}\n";
echo "   - Log file: {$logFile}\n";

// Verification
$remainingProductsWithoutCategories = Product::whereDoesntHave('categories')->count();
echo "   - Products still without categories: {$remainingProductsWithoutCategories}\n";

// Category distribution
echo "\n📈 Category Distribution:\n";
$categoryStats = DB::table('product_category_relations')
    ->join('product_categories', 'product_category_relations.category_id', '=', 'product_categories.id')
    ->select('product_categories.name', DB::raw('COUNT(*) as product_count'))
    ->groupBy('product_categories.id', 'product_categories.name')
    ->orderBy('product_count', 'desc')
    ->get();

foreach ($categoryStats as $stat) {
    echo "   - {$stat->name}: {$stat->product_count} products\n";
}

echo "\n✅ Category assignment completed successfully!\n";
?>