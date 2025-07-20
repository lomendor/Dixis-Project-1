import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global E2E test teardown...');
  
  try {
    // Clean up test data if needed
    await cleanupTestData();
    
    // Clean up temporary files (optional)
    await cleanupTempFiles();
    
    // Generate test summary
    await generateTestSummary();
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid failing the test run
  }
}

async function cleanupTestData() {
  console.log('🗑️ Cleaning up test data...');
  
  try {
    // Add any test data cleanup logic here
    // For example:
    // - Remove test users created during tests
    // - Clean up test orders
    // - Reset test database state
    
    console.log('✅ Test data cleanup completed');
  } catch (error) {
    console.log('⚠️ Test data cleanup failed:', (error as Error).message);
  }
}

async function cleanupTempFiles() {
  console.log('📁 Cleaning up temporary files...');
  
  try {
    // Clean up old screenshots (keep only recent ones)
    const testResultsDir = path.join(process.cwd(), 'test-results');
    
    if (fs.existsSync(testResultsDir)) {
      const files = fs.readdirSync(testResultsDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      files.forEach(file => {
        const filePath = path.join(testResultsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          if (fs.lstatSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
          console.log(`🗑️ Removed old file: ${file}`);
        }
      });
    }
    
    console.log('✅ Temporary files cleanup completed');
  } catch (error) {
    console.log('⚠️ Temporary files cleanup failed:', (error as Error).message);
  }
}

async function generateTestSummary() {
  console.log('📊 Generating test summary...');
  
  try {
    const testResultsDir = path.join(process.cwd(), 'test-results');
    const resultsFile = path.join(testResultsDir, 'results.json');
    
    if (fs.existsSync(resultsFile)) {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      
      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        success: (results.stats?.failed || 0) === 0
      };
      
      // Write summary to file
      const summaryFile = path.join(testResultsDir, 'summary.json');
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
      
      // Log summary to console
      console.log('📈 Test Summary:');
      console.log(`   Total Tests: ${summary.totalTests}`);
      console.log(`   Passed: ${summary.passed}`);
      console.log(`   Failed: ${summary.failed}`);
      console.log(`   Skipped: ${summary.skipped}`);
      console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
      console.log(`   Success: ${summary.success ? '✅' : '❌'}`);
      
    } else {
      console.log('⚠️ No test results file found');
    }
    
    console.log('✅ Test summary generated');
  } catch (error) {
    console.log('⚠️ Test summary generation failed:', (error as Error).message);
  }
}

export default globalTeardown;
