<?php

namespace App\Services\B2B;

use App\Models\BusinessUser;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\B2B\BulkOrderDetail;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BulkOrderService
{
    /**
     * Create bulk order from CSV file
     */
    public function createFromCsv(UploadedFile $file, BusinessUser $businessUser, array $options = []): array
    {
        $csvData = $this->parseCsvFile($file);
        $products = $this->validateAndProcessCsvData($csvData, $businessUser);
        
        return $this->createBulkOrder($products, $businessUser, array_merge($options, [
            'source' => 'csv',
            'original_filename' => $file->getClientOriginalName()
        ]));
    }

    /**
     * Create bulk order from product array
     */
    public function createFromProducts(array $products, BusinessUser $businessUser, array $options = []): array
    {
        $processedProducts = $this->validateAndProcessProducts($products, $businessUser);
        
        return $this->createBulkOrder($processedProducts, $businessUser, array_merge($options, [
            'source' => 'manual'
        ]));
    }

    /**
     * Validate bulk order without creating it
     */
    public function validateBulkOrder(array $products, BusinessUser $businessUser): array
    {
        $validation = [
            'valid' => true,
            'errors' => [],
            'warnings' => [],
            'summary' => [
                'total_products' => count($products),
                'total_quantity' => 0,
                'estimated_total' => 0,
                'available_products' => 0,
                'unavailable_products' => 0
            ]
        ];

        foreach ($products as $index => $productData) {
            $product = Product::find($productData['product_id']);
            
            if (!$product) {
                $validation['errors'][] = "Product ID {$productData['product_id']} not found";
                $validation['summary']['unavailable_products']++;
                continue;
            }

            if (!$product->b2b_available) {
                $validation['errors'][] = "Product '{$product->name}' not available for B2B";
                $validation['summary']['unavailable_products']++;
                continue;
            }

            if ($product->stock < $productData['quantity']) {
                $validation['warnings'][] = "Product '{$product->name}' has insufficient stock ({$product->stock} available, {$productData['quantity']} requested)";
            }

            $validation['summary']['available_products']++;
            $validation['summary']['total_quantity'] += $productData['quantity'];
            
            // Calculate price with B2B discount
            $price = $product->price * (1 - $businessUser->getDiscountPercentage() / 100);
            $validation['summary']['estimated_total'] += $price * $productData['quantity'];
        }

        // Check credit limit
        if ($validation['summary']['estimated_total'] > $businessUser->getAvailableCredit()) {
            $validation['errors'][] = 'Order total exceeds available credit limit';
            $validation['valid'] = false;
        }

        if (!empty($validation['errors'])) {
            $validation['valid'] = false;
        }

        return $validation;
    }

    /**
     * Parse CSV file
     */
    private function parseCsvFile(UploadedFile $file): array
    {
        $csvData = [];
        $handle = fopen($file->getPathname(), 'r');
        
        if ($handle === false) {
            throw new \Exception('Unable to read CSV file');
        }

        // Read header row
        $headers = fgetcsv($handle);
        if (!$headers) {
            throw new \Exception('CSV file is empty or invalid');
        }

        // Normalize headers
        $headers = array_map('trim', $headers);
        $headers = array_map('strtolower', $headers);

        // Read data rows
        $rowNumber = 1;
        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;
            
            if (count($row) !== count($headers)) {
                continue; // Skip malformed rows
            }

            $rowData = array_combine($headers, $row);
            $rowData['_row_number'] = $rowNumber;
            $csvData[] = $rowData;
        }

        fclose($handle);

        if (empty($csvData)) {
            throw new \Exception('No valid data found in CSV file');
        }

        return $csvData;
    }

    /**
     * Validate and process CSV data
     */
    private function validateAndProcessCsvData(array $csvData, BusinessUser $businessUser): array
    {
        $products = [];
        $errors = [];

        foreach ($csvData as $row) {
            try {
                $product = null;

                // Find product by SKU or name
                if (!empty($row['product_sku'])) {
                    $product = Product::where('sku', trim($row['product_sku']))->first();
                } elseif (!empty($row['product_name'])) {
                    $product = Product::where('name', 'LIKE', '%' . trim($row['product_name']) . '%')->first();
                }

                if (!$product) {
                    $errors[] = "Row {$row['_row_number']}: Product not found";
                    continue;
                }

                if (!$product->b2b_available) {
                    $errors[] = "Row {$row['_row_number']}: Product '{$product->name}' not available for B2B";
                    continue;
                }

                $quantity = (int) ($row['quantity'] ?? 0);
                if ($quantity <= 0) {
                    $errors[] = "Row {$row['_row_number']}: Invalid quantity";
                    continue;
                }

                $customPrice = null;
                if (!empty($row['custom_price']) && is_numeric($row['custom_price'])) {
                    $customPrice = (float) $row['custom_price'];
                }

                $products[] = [
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'custom_price' => $customPrice,
                    'notes' => $row['notes'] ?? null,
                    '_row_number' => $row['_row_number']
                ];

            } catch (\Exception $e) {
                $errors[] = "Row {$row['_row_number']}: " . $e->getMessage();
            }
        }

        if (!empty($errors)) {
            throw new \Exception('CSV validation failed: ' . implode(', ', $errors));
        }

        return $products;
    }

    /**
     * Validate and process products array
     */
    private function validateAndProcessProducts(array $products, BusinessUser $businessUser): array
    {
        $processedProducts = [];

        foreach ($products as $productData) {
            $product = Product::find($productData['product_id']);
            
            if (!$product || !$product->b2b_available) {
                throw new \Exception("Product ID {$productData['product_id']} not available for B2B");
            }

            $processedProducts[] = [
                'product_id' => $product->id,
                'quantity' => $productData['quantity'],
                'custom_price' => $productData['custom_price'] ?? null,
                'notes' => $productData['notes'] ?? null
            ];
        }

        return $processedProducts;
    }

    /**
     * Create the actual bulk order
     */
    private function createBulkOrder(array $products, BusinessUser $businessUser, array $options = []): array
    {
        return DB::transaction(function () use ($products, $businessUser, $options) {
            
            // Calculate totals
            $subtotal = 0;
            $totalQuantity = 0;

            foreach ($products as $productData) {
                $product = Product::find($productData['product_id']);
                $price = $productData['custom_price'] ?? 
                        ($product->price * (1 - $businessUser->getDiscountPercentage() / 100));
                
                $subtotal += $price * $productData['quantity'];
                $totalQuantity += $productData['quantity'];
            }

            // Check credit limit
            if ($subtotal > $businessUser->getAvailableCredit()) {
                throw new \Exception('Order total exceeds available credit limit');
            }

            // Calculate tax and total
            $taxAmount = $subtotal * 0.24; // Greek VAT
            $total = $subtotal + $taxAmount;

            // Create order
            $order = Order::create([
                'user_id' => $businessUser->user_id,
                'business_user_id' => $businessUser->id,
                'order_number' => $this->generateBulkOrderNumber(),
                'status' => 'pending_approval',
                'is_bulk_order' => true,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $total,
                'currency' => 'EUR',
                'delivery_date' => $options['delivery_date'] ?? null,
                'priority' => $options['priority'] ?? 'normal',
                'notes' => $options['notes'] ?? null
            ]);

            // Create order items
            foreach ($products as $productData) {
                $product = Product::find($productData['product_id']);
                $price = $productData['custom_price'] ?? 
                        ($product->price * (1 - $businessUser->getDiscountPercentage() / 100));

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $productData['quantity'],
                    'price' => $price,
                    'total' => $price * $productData['quantity'],
                    'notes' => $productData['notes']
                ]);
            }

            // Create bulk order details
            BulkOrderDetail::create([
                'order_id' => $order->id,
                'source' => $options['source'] ?? 'manual',
                'original_filename' => $options['original_filename'] ?? null,
                'total_products' => count($products),
                'total_quantity' => $totalQuantity,
                'processing_notes' => $options['processing_notes'] ?? null
            ]);

            Log::info('Bulk order created', [
                'order_id' => $order->id,
                'business_user_id' => $businessUser->id,
                'total_products' => count($products),
                'total_amount' => $total
            ]);

            return [
                'order' => $order->load(['items.product', 'bulkOrderDetails']),
                'summary' => [
                    'total_products' => count($products),
                    'total_quantity' => $totalQuantity,
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $total
                ]
            ];
        });
    }

    /**
     * Generate unique bulk order number
     */
    private function generateBulkOrderNumber(): string
    {
        $prefix = 'BULK';
        $date = date('Ymd');
        
        $lastOrder = Order::where('order_number', 'LIKE', "{$prefix}-{$date}-%")
            ->orderBy('id', 'desc')
            ->first();

        if ($lastOrder && preg_match("/{$prefix}-{$date}-(\d+)/", $lastOrder->order_number, $matches)) {
            $sequence = intval($matches[1]) + 1;
        } else {
            $sequence = 1;
        }

        return sprintf('%s-%s-%04d', $prefix, $date, $sequence);
    }
}