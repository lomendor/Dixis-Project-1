#!/usr/bin/env node

/**
 * Complete Product Categorization - Final 5 Products
 * Intelligent assignment to finish 100% categorization
 */

const { execSync } = require('child_process');

class CategorizationCompleter {
    constructor() {
        this.baseUrl = 'http://localhost:8000/api/v1';
        
        // Category mapping based on discovered IDs
        this.categoryMap = {
            'Μέλι & Γλυκά': 11,
            'Ελιές & Τουρσιά': 10,
            'Ελαιόλαδο & Λάδια': 9,
            'Τυριά & Γαλακτοκομικά': 12,
            'Μέλι': 5,
            'Ελαιόλαδο': 3,
            'Τυριά': 4
        };

        // Products to categorize (from analysis)
        this.productsToFix = [
            { id: 3, name: 'Μέλι Θυμαρίσιο', targetCategory: 'Μέλι & Γλυκά' },
            { id: 1, name: 'Ελιές Καλαμών', targetCategory: 'Ελιές & Τουρσιά' },
            { id: 2, name: 'Ελαιόλαδο Εξαιρετικό Παρθένο', targetCategory: 'Ελαιόλαδο & Λάδια' },
            { id: 5, name: 'Κρασί Αγιωργίτικο', targetCategory: 'Ποτά', fallback: 'Φρούτα & Λαχανικά' },
            { id: 4, name: 'Φέτα ΠΟΠ', targetCategory: 'Τυριά & Γαλακτοκομικά' }
        ];
    }

    async completeCategorizationRun() {
        console.log('🎯 Completing Final Product Categorization...\n');

        try {
            // First verify current uncategorized products
            const currentStatus = await this.checkCurrentStatus();
            
            if (currentStatus.uncategorized === 0) {
                console.log('🎉 All products are already categorized!');
                return { success: true, message: 'Already complete' };
            }

            console.log(`📋 Found ${currentStatus.uncategorized} uncategorized products\n`);

            // Process each product
            let successCount = 0;
            let errors = [];

            for (const product of this.productsToFix) {
                try {
                    const result = await this.categorizeProduct(product);
                    if (result.success) {
                        successCount++;
                        console.log(`✅ ${product.name} → ${product.targetCategory}`);
                    } else {
                        errors.push(`❌ ${product.name}: ${result.error}`);
                    }
                } catch (error) {
                    errors.push(`❌ ${product.name}: ${error.message}`);
                }
            }

            // Final verification
            console.log('\n🔍 Verifying completion...');
            const finalStatus = await this.checkCurrentStatus();

            console.log('\n🎯 Results:');
            console.log(`   Successfully categorized: ${successCount} products`);
            console.log(`   Errors: ${errors.length}`);
            console.log(`   Final completion: ${finalStatus.categorized}/${finalStatus.total} (${((finalStatus.categorized/finalStatus.total)*100).toFixed(1)}%)`);

            if (errors.length > 0) {
                console.log('\n🚨 Errors encountered:');
                errors.forEach(error => console.log(`   ${error}`));
            }

            if (finalStatus.uncategorized === 0) {
                console.log('\n🎉 🎉 100% CATEGORIZATION ACHIEVED! 🎉 🎉');
                console.log('✅ Platform is now fully production ready!');
            }

            return {
                success: successCount > 0,
                successCount,
                errors,
                finalCompletion: (finalStatus.categorized/finalStatus.total)*100
            };

        } catch (error) {
            console.log('❌ Error in categorization process:', error.message);
            return { success: false, error: error.message };
        }
    }

    async checkCurrentStatus() {
        const response = execSync(`curl -s "${this.baseUrl}/products?per_page=100"`, { timeout: 10000 });
        const data = JSON.parse(response.toString());
        
        const products = data.data || [];
        const categorized = products.filter(p => p.category_id && p.category);
        const uncategorized = products.filter(p => !p.category_id || !p.category);

        return {
            total: products.length,
            categorized: categorized.length,
            uncategorized: uncategorized.length
        };
    }

    async categorizeProduct(product) {
        try {
            const categoryId = this.categoryMap[product.targetCategory];
            
            if (!categoryId && !product.fallback) {
                return { success: false, error: `Category ${product.targetCategory} not found` };
            }

            const finalCategoryId = categoryId || this.categoryMap[product.fallback];
            
            if (!finalCategoryId) {
                return { success: false, error: `No valid category found` };
            }

            // Update product category using API (if endpoint exists) or direct database approach
            // For now, let's try updating via a simple API approach
            
            const updateCommand = `curl -s -X PUT "${this.baseUrl}/products/${product.id}" ` +
                `-H "Content-Type: application/json" ` +
                `-d '{"category_id": ${finalCategoryId}}'`;
            
            try {
                const updateResponse = execSync(updateCommand, { timeout: 5000 });
                const updateData = JSON.parse(updateResponse.toString());
                
                if (updateData.success !== false) {
                    return { success: true };
                } else {
                    // Try alternative approach if API doesn't work
                    return await this.tryAlternativeUpdate(product.id, finalCategoryId);
                }
            } catch (apiError) {
                // Try alternative approach if API call fails
                return await this.tryAlternativeUpdate(product.id, finalCategoryId);
            }

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async tryAlternativeUpdate(productId, categoryId) {
        // If API doesn't work, at least log what should be done
        console.log(`📝 Manual update needed: Product ${productId} → Category ${categoryId}`);
        
        // Provide SQL command for manual execution
        console.log(`   SQL: UPDATE products SET category_id = ${categoryId} WHERE id = ${productId};`);
        
        return { 
            success: false, 
            error: 'API update failed - manual SQL update needed',
            sqlCommand: `UPDATE products SET category_id = ${categoryId} WHERE id = ${productId};`
        };
    }
}

// Run categorization completion
if (require.main === module) {
    const completer = new CategorizationCompleter();
    completer.completeCategorizationRun().then(result => {
        if (result.success) {
            console.log('\n🚀 Categorization completion process finished successfully!');
            process.exit(0);
        } else {
            console.log('\n❌ Categorization completion had issues');
            process.exit(1);
        }
    }).catch(error => {
        console.log('❌ Fatal error:', error.message);
        process.exit(2);
    });
}

module.exports = CategorizationCompleter;