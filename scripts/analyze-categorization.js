#!/usr/bin/env node

/**
 * Analyze Current Product Categorization Status
 * Real-time analysis of products and categories
 */

const { execSync } = require('child_process');

class CategorizationAnalyzer {
    constructor() {
        this.baseUrl = 'http://localhost:8000/api/v1';
    }

    async analyzeCurrentState() {
        console.log('🔍 Analyzing Current Product Categorization Status...\n');

        try {
            // Get all products with categories
            const productsResponse = execSync(`curl -s "${this.baseUrl}/products?per_page=100"`, { timeout: 10000 });
            const productsData = JSON.parse(productsResponse.toString());

            if (!productsData.data || productsData.data.length === 0) {
                console.log('❌ No products found');
                return;
            }

            const products = productsData.data;
            console.log(`📊 Total Products: ${products.length}`);

            // Analyze categorization
            const categorized = products.filter(p => p.category_id && p.category && p.category.name);
            const uncategorized = products.filter(p => !p.category_id || !p.category || !p.category.name);

            console.log(`✅ Categorized Products: ${categorized.length}`);
            console.log(`❌ Uncategorized Products: ${uncategorized.length}`);

            // Category breakdown
            const categoryStats = {};
            categorized.forEach(product => {
                const categoryName = product.category.name;
                if (!categoryStats[categoryName]) {
                    categoryStats[categoryName] = [];
                }
                categoryStats[categoryName].push(product.name);
            });

            console.log('\n📋 Category Distribution:');
            Object.keys(categoryStats).forEach(category => {
                console.log(`   ${category}: ${categoryStats[category].length} products`);
                categoryStats[category].forEach(productName => {
                    console.log(`      - ${productName}`);
                });
            });

            if (uncategorized.length > 0) {
                console.log('\n🚨 Uncategorized Products:');
                uncategorized.forEach(product => {
                    console.log(`   - ${product.name} (ID: ${product.id})`);
                });
            }

            // Manual categorization recommendations
            if (uncategorized.length > 0) {
                console.log('\n💡 Suggested Categorizations:');
                uncategorized.forEach(product => {
                    const suggestion = this.suggestCategory(product.name);
                    console.log(`   ${product.name} → ${suggestion.category} (${suggestion.reason})`);
                });
            }

            // Summary
            console.log('\n🎯 Summary:');
            if (uncategorized.length === 0) {
                console.log('   ✅ All products are properly categorized!');
                console.log('   ✅ No manual categorization needed!');
                console.log('   ✅ Platform ready for production use!');
            } else {
                console.log(`   📋 ${uncategorized.length} products need categorization`);
                console.log(`   🎯 ${((categorized.length / products.length) * 100).toFixed(1)}% completion rate`);
            }

            return {
                total: products.length,
                categorized: categorized.length,
                uncategorized: uncategorized.length,
                categories: Object.keys(categoryStats),
                needsWork: uncategorized.length > 0
            };

        } catch (error) {
            console.log('❌ Error analyzing categorization:', error.message);
            return null;
        }
    }

    suggestCategory(productName) {
        const name = productName.toLowerCase();
        
        // Greek category mappings
        const categories = {
            'Φρούτα': ['πορτοκάλια', 'μήλα', 'αχλάδια', 'κεράσια', 'ροδάκινα', 'βερίκοκα', 'καρπούζια', 'ντομάτες'],
            'Λαχανικά': ['σπανάκι', 'κολοκυθάκια', 'παντζάρια', 'καρότα', 'μαρούλια'],
            'Ελαιόλαδο & Λάδια': ['ελαιόλαδο', 'εξτραπάρθενο'],
            'Τυριά & Γαλακτοκομικά': ['φέτα', 'κασέρι', 'γραβιέρα', 'φορμαέλλα', 'μανούρι'],
            'Μέλι & Γλυκά': ['μέλι', 'θυμαρίσιο', 'ανθών'],
            'Ξηροί Καρποί': ['καρύδια', 'αμύγδαλα', 'φουντούκια'],
            'Ποτά': ['κρασί', 'τσίπουρο', 'ούζο'],
            'Μπαχαρικά': ['ρίγανη', 'θυμάρι', 'βασιλικός']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            for (const keyword of keywords) {
                if (name.includes(keyword)) {
                    return { category, reason: `Contains keyword: ${keyword}` };
                }
            }
        }

        return { category: 'Φρούτα & Λαχανικά', reason: 'Default category' };
    }
}

// Run analysis
if (require.main === module) {
    const analyzer = new CategorizationAnalyzer();
    analyzer.analyzeCurrentState().then(result => {
        if (result) {
            process.exit(result.needsWork ? 1 : 0);
        } else {
            process.exit(2);
        }
    });
}

module.exports = CategorizationAnalyzer;