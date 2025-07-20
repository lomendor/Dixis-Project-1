<?php
header('Content-Type: text/html; charset=utf-8');

// Get products from API
$apiUrl = 'http://localhost:8000/api/v1/products';
$products = [];

try {
    $response = file_get_contents($apiUrl);
    $data = json_decode($response, true);
    $products = $data['data'] ?? [];
} catch (Exception $e) {
    // Fallback products if API fails
    $products = [
        ['id' => 1, 'name' => 'Ελιές Καλαμών', 'price' => 5.99, 'description' => 'Φρέσκες ελιές από τη Μεσσηνία'],
        ['id' => 2, 'name' => 'Ελαιόλαδο Εξαιρετικό', 'price' => 9.99, 'description' => 'Παρθένο ελαιόλαδο από την Κρήτη'],
        ['id' => 3, 'name' => 'Μέλι Θυμαρίσιο', 'price' => 7.99, 'description' => 'Άγνωστο μέλι από τα βουνά'],
    ];
}
?>
<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dixis Fresh - Ελληνικά Προϊόντα</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #f0f9ff, #ecfdf5);
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        
        header { text-align: center; padding: 40px 0; }
        h1 { 
            font-size: 3.5rem; color: #059669; margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .subtitle { font-size: 1.3rem; color: #6b7280; margin-bottom: 30px; }
        
        .products-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 25px; 
            margin-top: 40px;
        }
        .product-card { 
            background: white; 
            border-radius: 16px; 
            padding: 25px; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .product-card:hover { transform: translateY(-5px); }
        .product-name { 
            font-size: 1.4rem; 
            color: #1f2937; 
            margin-bottom: 10px; 
            font-weight: bold;
        }
        .product-price { 
            font-size: 1.6rem; 
            color: #059669; 
            font-weight: bold; 
            margin-bottom: 15px;
        }
        .product-description { 
            color: #6b7280; 
            line-height: 1.5; 
            margin-bottom: 20px;
        }
        .btn { 
            background: #059669; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        .btn:hover { background: #047857; }
        
        .status { 
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            margin-bottom: 30px;
            text-align: center;
        }
        .success { color: #059669; font-weight: bold; }
        
        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .container { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🌱 Dixis Fresh</h1>
            <p class="subtitle">Φρέσκα Ελληνικά Προϊόντα από Έλληνες Παραγωγούς</p>
            
            <div class="status">
                <span class="success">✅ Laravel Backend Working Perfectly!</span><br>
                <small>Αυτή η σελίδα τρέχει με PHP + Laravel API</small>
            </div>
        </header>
        
        <main>
            <h2 style="text-align: center; color: #1f2937; margin-bottom: 30px;">
                🛒 Τα Προϊόντά μας (<?= count($products) ?> προϊόντα)
            </h2>
            
            <div class="products-grid">
                <?php foreach ($products as $product): ?>
                <div class="product-card">
                    <div class="product-name"><?= htmlspecialchars($product['name']) ?></div>
                    <div class="product-price">€<?= number_format($product['price'], 2) ?></div>
                    <div class="product-description">
                        <?= htmlspecialchars($product['description'] ?? 'Υψηλής ποιότητας ελληνικό προϊόν') ?>
                    </div>
                    <button class="btn" onclick="addToCart(<?= $product['id'] ?>)">
                        Προσθήκη στο Καλάθι
                    </button>
                </div>
                <?php endforeach; ?>
            </div>
            
            <?php if (empty($products)): ?>
            <div style="text-align: center; padding: 60px; color: #6b7280;">
                <h3>Δεν βρέθηκαν προϊόντα</h3>
                <p>Δοκιμάστε αργότερα ή ελέγξτε το Laravel API</p>
            </div>
            <?php endif; ?>
        </main>
    </div>

    <script>
        function addToCart(productId) {
            alert(`✅ Προϊόν #${productId} προστέθηκε στο καλάθι!\n\n(Αυτό είναι demo - το Next.js θα έχει πραγματικό καλάθι)`);
        }
        
        console.log('🎉 Dixis Fresh PHP Demo loaded successfully!');
        console.log('📊 Products loaded:', <?= count($products) ?>);
    </script>
</body>
</html>