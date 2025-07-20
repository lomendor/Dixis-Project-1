#!/usr/bin/env node

/**
 * Bundle analysis script for performance optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.results = {
      bundleSize: {},
      recommendations: [],
      performance: {}
    };
  }

  // Analyze bundle size
  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle size...');
    
    try {
      // Build with analyzer
      execSync('ANALYZE=true npm run build', { 
        stdio: 'inherit',
        cwd: process.cwd() 
      });
      
      // Check if build artifacts exist
      const buildDir = '.next';
      if (!fs.existsSync(buildDir)) {
        throw new Error('Build directory not found');
      }
      
      // Analyze static files
      const staticDir = path.join(buildDir, 'static');
      if (fs.existsSync(staticDir)) {
        this.analyzeStaticFiles(staticDir);
      }
      
      this.results.bundleSize.status = 'completed';
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      this.results.bundleSize.status = 'failed';
      this.results.bundleSize.error = error.message;
    }
  }

  // Analyze static files
  analyzeStaticFiles(staticDir) {
    const getDirectorySize = (dirPath) => {
      let totalSize = 0;
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    };

    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    try {
      const chunks = path.join(staticDir, 'chunks');
      if (fs.existsSync(chunks)) {
        const chunkFiles = fs.readdirSync(chunks);
        let totalJSSize = 0;
        let largeChunks = [];
        
        for (const file of chunkFiles) {
          if (file.endsWith('.js')) {
            const filePath = path.join(chunks, file);
            const size = fs.statSync(filePath).size;
            totalJSSize += size;
            
            // Check for large chunks (> 500KB)
            if (size > 500 * 1024) {
              largeChunks.push({
                file,
                size: formatSize(size)
              });
            }
          }
        }
        
        this.results.bundleSize.totalJS = formatSize(totalJSSize);
        this.results.bundleSize.largeChunks = largeChunks;
        
        // Add recommendations for large chunks
        if (largeChunks.length > 0) {
          this.results.recommendations.push({
            category: 'Bundle Size',
            issue: `Found ${largeChunks.length} large chunks (>500KB)`,
            recommendation: 'Consider code splitting or lazy loading for large components',
            impact: 'High'
          });
        }
      }
      
      // Analyze CSS
      const css = path.join(staticDir, 'css');
      if (fs.existsSync(css)) {
        const cssSize = getDirectorySize(css);
        this.results.bundleSize.totalCSS = formatSize(cssSize);
        
        // Check for large CSS files
        if (cssSize > 200 * 1024) { // 200KB
          this.results.recommendations.push({
            category: 'CSS Size',
            issue: 'Large CSS bundle detected',
            recommendation: 'Consider CSS purging or critical CSS extraction',
            impact: 'Medium'
          });
        }
      }
      
    } catch (error) {
      console.warn('⚠️  Could not analyze static files:', error.message);
    }
  }

  // Analyze dependencies
  analyzeDependencies() {
    console.log('📚 Analyzing dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const dependencies = packageJson.dependencies || {};
      
      // Check for large dependencies
      const largeDependencies = [
        '@tanstack/react-query', // ~100KB
        'framer-motion',         // ~150KB
        'axios',                 // ~40KB
        'react-dropzone'         // ~30KB
      ];
      
      const unusedDependencies = [];
      const heavyDependencies = [];
      
      for (const [dep, version] of Object.entries(dependencies)) {
        // Check if dependency is used
        try {
          const grepResult = execSync(
            `grep -r "from.*${dep}\\|import.*${dep}" src/ || true`,
            { encoding: 'utf-8' }
          );
          
          if (!grepResult.trim()) {
            unusedDependencies.push(dep);
          }
        } catch (error) {
          // Ignore grep errors
        }
        
        // Check for known heavy dependencies
        if (largeDependencies.includes(dep)) {
          heavyDependencies.push(dep);
        }
      }
      
      this.results.performance.dependencies = {
        total: Object.keys(dependencies).length,
        unused: unusedDependencies,
        heavy: heavyDependencies
      };
      
      // Add recommendations
      if (unusedDependencies.length > 0) {
        this.results.recommendations.push({
          category: 'Dependencies',
          issue: `${unusedDependencies.length} unused dependencies detected`,
          recommendation: `Remove unused dependencies: ${unusedDependencies.slice(0, 3).join(', ')}${unusedDependencies.length > 3 ? '...' : ''}`,
          impact: 'Medium'
        });
      }
      
    } catch (error) {
      console.warn('⚠️  Could not analyze dependencies:', error.message);
    }
  }

  // Check Next.js configuration
  analyzeNextJSConfig() {
    console.log('⚙️  Analyzing Next.js configuration...');
    
    try {
      if (fs.existsSync('next.config.js')) {
        const config = fs.readFileSync('next.config.js', 'utf-8');
        
        const optimizations = {
          'images': config.includes('images'),
          'swcMinify': config.includes('swcMinify'),
          'compress': config.includes('compress'),
          'bundleAnalyzer': config.includes('bundleAnalyzer')
        };
        
        this.results.performance.nextJSOptimizations = optimizations;
        
        // Check for missing optimizations
        const missing = Object.entries(optimizations)
          .filter(([key, value]) => !value)
          .map(([key]) => key);
        
        if (missing.length > 0) {
          this.results.recommendations.push({
            category: 'Next.js Config',
            issue: 'Missing performance optimizations',
            recommendation: `Enable: ${missing.join(', ')}`,
            impact: 'Medium'
          });
        }
      } else {
        this.results.recommendations.push({
          category: 'Next.js Config',
          issue: 'No next.config.js found',
          recommendation: 'Create next.config.js with performance optimizations',
          impact: 'High'
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze Next.js config:', error.message);
    }
  }

  // Analyze images
  analyzeImages() {
    console.log('🖼️  Analyzing images...');
    
    try {
      const publicDir = 'public';
      if (fs.existsSync(publicDir)) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
        let largeImages = [];
        let totalImageSize = 0;
        
        const scanDirectory = (dir) => {
          const files = fs.readdirSync(dir);
          
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
              scanDirectory(filePath);
            } else {
              const ext = path.extname(file).toLowerCase();
              if (imageExtensions.includes(ext)) {
                totalImageSize += stats.size;
                
                // Check for large images (> 500KB)
                if (stats.size > 500 * 1024) {
                  largeImages.push({
                    file: filePath,
                    size: this.formatSize(stats.size)
                  });
                }
              }
            }
          }
        };
        
        scanDirectory(publicDir);
        
        this.results.performance.images = {
          totalSize: this.formatSize(totalImageSize),
          largeImages: largeImages.length,
          details: largeImages.slice(0, 5) // Show first 5
        };
        
        if (largeImages.length > 0) {
          this.results.recommendations.push({
            category: 'Images',
            issue: `${largeImages.length} large images (>500KB) found`,
            recommendation: 'Optimize images using Next.js Image component and WebP format',
            impact: 'High'
          });
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze images:', error.message);
    }
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate performance score
  calculatePerformanceScore() {
    let score = 100;
    let deductions = 0;
    
    // Deduct points based on issues
    for (const rec of this.results.recommendations) {
      switch (rec.impact) {
        case 'High':
          deductions += 15;
          break;
        case 'Medium':
          deductions += 10;
          break;
        case 'Low':
          deductions += 5;
          break;
      }
    }
    
    score = Math.max(0, score - deductions);
    this.results.performance.score = score;
    
    return score;
  }

  // Generate report
  generateReport() {
    console.log('\n📊 Bundle Analysis Report');
    console.log('=========================\n');
    
    // Bundle Size
    if (this.results.bundleSize.status === 'completed') {
      console.log('📦 Bundle Size:');
      if (this.results.bundleSize.totalJS) {
        console.log(`   JavaScript: ${this.results.bundleSize.totalJS}`);
      }
      if (this.results.bundleSize.totalCSS) {
        console.log(`   CSS: ${this.results.bundleSize.totalCSS}`);
      }
      if (this.results.bundleSize.largeChunks?.length > 0) {
        console.log(`   Large Chunks: ${this.results.bundleSize.largeChunks.length}`);
      }
      console.log();
    }
    
    // Dependencies
    if (this.results.performance.dependencies) {
      const deps = this.results.performance.dependencies;
      console.log('📚 Dependencies:');
      console.log(`   Total: ${deps.total}`);
      if (deps.unused?.length > 0) {
        console.log(`   Unused: ${deps.unused.length}`);
      }
      if (deps.heavy?.length > 0) {
        console.log(`   Heavy: ${deps.heavy.length}`);
      }
      console.log();
    }
    
    // Images
    if (this.results.performance.images) {
      const images = this.results.performance.images;
      console.log('🖼️  Images:');
      console.log(`   Total Size: ${images.totalSize}`);
      if (images.largeImages > 0) {
        console.log(`   Large Images: ${images.largeImages}`);
      }
      console.log();
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.category}] ${rec.issue}`);
        console.log(`      → ${rec.recommendation} (Impact: ${rec.impact})`);
      });
      console.log();
    }
    
    // Performance Score
    const score = this.calculatePerformanceScore();
    console.log('🎯 Performance Score:');
    console.log(`   ${score}/100`);
    
    if (score >= 90) {
      console.log('   🎉 Excellent! Your bundle is well optimized.');
    } else if (score >= 70) {
      console.log('   ✅ Good! Some optimizations possible.');
    } else if (score >= 50) {
      console.log('   ⚠️  Fair. Consider implementing the recommendations.');
    } else {
      console.log('   ❌ Poor. Significant optimizations needed.');
    }
    
    return this.results;
  }

  // Run complete analysis
  async runAnalysis() {
    console.log('🚀 Starting Bundle Analysis...\n');
    
    await this.analyzeBundleSize();
    this.analyzeDependencies();
    this.analyzeNextJSConfig();
    this.analyzeImages();
    
    return this.generateReport();
  }
}

async function main() {
  const analyzer = new BundleAnalyzer();
  const results = await analyzer.runAnalysis();
  
  // Save results to file
  fs.writeFileSync('bundle-analysis.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Analysis saved to bundle-analysis.json');
  
  // Exit with warning code if score is low
  process.exit(results.performance.score < 70 ? 1 : 0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BundleAnalyzer;