#!/usr/bin/env node

/**
 * Script to replace console.log statements with proper production logging
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript/JavaScript files with console statements
function getFilesWithConsoleLogs() {
  try {
    const result = execSync(
      `find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "console\\." | grep -v node_modules | grep -v ".next"`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.log('No console statements found or grep failed');
    return [];
  }
}

// Patterns to replace
const replacements = [
  {
    pattern: /console\.log\(/g,
    replacement: 'logger.info(',
    needsImport: true
  },
  {
    pattern: /console\.info\(/g,
    replacement: 'logger.info(',
    needsImport: true
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn(',
    needsImport: true
  },
  {
    pattern: /console\.error\(/g,
    replacement: 'logger.error(',
    needsImport: true
  },
  {
    pattern: /console\.debug\(/g,
    replacement: 'logger.debug(',
    needsImport: true
  }
];

// Files to keep console.log (development/test files)
const skipFiles = [
  'scripts/',
  'node_modules/',
  '.next/',
  'test-',
  'debug-',
  'healthcheck.js',
  'next.config',
  'src/config/features.ts' // This one has intentional dev console.log
];

function shouldSkipFile(filePath) {
  return skipFiles.some(skip => filePath.includes(skip));
}

function addLoggerImport(content, filePath) {
  // Check if import already exists
  if (content.includes("from '@/lib/logging/productionLogger'") || 
      content.includes("import { logger }")) {
    return content;
  }

  // Add import at the top
  const importStatement = "import { logger } from '@/lib/logging/productionLogger';\n";
  
  // Handle different file types
  if (content.includes("'use client'")) {
    // Add after 'use client'
    content = content.replace("'use client';\n", "'use client';\n\n" + importStatement);
  } else if (content.includes("'use server'")) {
    // Add after 'use server'
    content = content.replace("'use server';\n", "'use server';\n\n" + importStatement);
  } else {
    // Add at the beginning
    content = importStatement + "\n" + content;
  }
  
  return content;
}

function replaceConsoleStatements(content) {
  let modified = content;
  let hasReplacements = false;
  
  for (const { pattern, replacement } of replacements) {
    if (pattern.test(modified)) {
      modified = modified.replace(pattern, replacement);
      hasReplacements = true;
    }
  }
  
  return { content: modified, hasReplacements };
}

function processFile(filePath) {
  if (shouldSkipFile(filePath)) {
    console.log(`⏭️  Skipping: ${filePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { content: newContent, hasReplacements } = replaceConsoleStatements(content);
    
    if (hasReplacements) {
      // Add logger import
      const finalContent = addLoggerImport(newContent, filePath);
      
      // Write back to file
      fs.writeFileSync(filePath, finalContent, 'utf-8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Finding files with console statements...');
  const files = getFilesWithConsoleLogs();
  
  if (files.length === 0) {
    console.log('✅ No console statements found!');
    return;
  }
  
  console.log(`📝 Found ${files.length} files with console statements`);
  console.log('🔄 Processing files...\n');
  
  let processedCount = 0;
  let updatedCount = 0;
  
  for (const file of files) {
    processedCount++;
    if (processFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Skipped: ${processedCount - updatedCount} files`);
  console.log('\n✅ Console.log replacement completed!');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, replaceConsoleStatements };