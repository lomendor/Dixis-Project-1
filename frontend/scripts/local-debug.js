#!/usr/bin/env node

/**
 * Local Development Debug Script
 * Checks common issues and environment setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 DIXIS LOCAL DEVELOPMENT DEBUG SCRIPT');
console.log('=========================================\n');

const checks = [
  {
    name: 'Node.js Version',
    check: () => {
      const version = process.version;
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      return {
        status: majorVersion >= 16 ? 'PASS' : 'FAIL',
        message: `Node.js ${version} (minimum v16 required for Next.js 15)`,
        fix: majorVersion < 16 ? 'Update Node.js to v16 or higher' : null
      };
    }
  },
  {
    name: 'Port 3000 Availability',
    check: () => {
      try {
        const result = execSync('lsof -ti:3000', { encoding: 'utf8', stdio: 'pipe' });
        return {
          status: 'WARN',
          message: `Port 3000 is in use by process: ${result.trim()}`,
          fix: 'Kill the process: kill -9 ' + result.trim() + ' or use different port'
        };
      } catch (e) {
        return {
          status: 'PASS',
          message: 'Port 3000 is available'
        };
      }
    }
  },
  {
    name: 'Backend Port 8000/8080',
    check: () => {
      try {
        const result8000 = execSync('lsof -ti:8000', { encoding: 'utf8', stdio: 'pipe' });
        const result8080 = execSync('lsof -ti:8080', { encoding: 'utf8', stdio: 'pipe' });
        return {
          status: 'INFO',
          message: `Backend ports - 8000: ${result8000.trim() ? 'IN USE' : 'FREE'}, 8080: ${result8080.trim() ? 'IN USE' : 'FREE'}`
        };
      } catch (e) {
        return {
          status: 'PASS',
          message: 'Backend ports are available'
        };
      }
    }
  },
  {
    name: 'Dependencies Check',
    check: () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      
      if (!fs.existsSync(packageJsonPath)) {
        return {
          status: 'FAIL',
          message: 'package.json not found',
          fix: 'Run npm init or ensure you are in the correct directory'
        };
      }
      
      if (!fs.existsSync(nodeModulesPath)) {
        return {
          status: 'FAIL',
          message: 'node_modules not found',
          fix: 'Run: npm install'
        };
      }
      
      return {
        status: 'PASS',
        message: 'Dependencies appear to be installed'
      };
    }
  },
  {
    name: 'Next.js Cache',
    check: () => {
      const nextCachePath = path.join(process.cwd(), '.next');
      
      if (fs.existsSync(nextCachePath)) {
        const stats = fs.statSync(nextCachePath);
        return {
          status: 'INFO',
          message: `Next.js cache exists (created: ${stats.birthtime.toLocaleString()})`,
          fix: 'If experiencing issues, try: rm -rf .next && npm run dev'
        };
      }
      
      return {
        status: 'INFO',
        message: 'No Next.js cache found (first run)'
      };
    }
  },
  {
    name: 'Environment Files',
    check: () => {
      const envFiles = ['.env.local', '.env', '.env.development'];
      const foundFiles = envFiles.filter(file => fs.existsSync(path.join(process.cwd(), file)));
      
      if (foundFiles.length === 0) {
        return {
          status: 'WARN',
          message: 'No environment files found',
          fix: 'Create .env.local with necessary API endpoints'
        };
      }
      
      return {
        status: 'PASS',
        message: `Environment files found: ${foundFiles.join(', ')}`
      };
    }
  },
  {
    name: 'Backend Connection',
    check: () => {
      try {
        // Check if we can reach the backend
        const { spawn } = require('child_process');
        return {
          status: 'INFO',
          message: 'Backend connectivity check requires manual verification',
          fix: 'Test manually: curl http://localhost:8000/api/health'
        };
      } catch (e) {
        return {
          status: 'WARN',
          message: 'Unable to verify backend connection'
        };
      }
    }
  }
];

// Run all checks
checks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.name}`);
  try {
    const result = check.check();
    const statusSymbol = result.status === 'PASS' ? '✅' : 
                        result.status === 'FAIL' ? '❌' : 
                        result.status === 'WARN' ? '⚠️' : 'ℹ️';
    
    console.log(`   ${statusSymbol} ${result.message}`);
    if (result.fix) {
      console.log(`   💡 Fix: ${result.fix}`);
    }
  } catch (error) {
    console.log(`   ❌ Error running check: ${error.message}`);
  }
  console.log('');
});

console.log('🚀 QUICK FIXES:');
console.log('================');
console.log('1. Clear cache: rm -rf .next node_modules && npm install');
console.log('2. Kill port processes: lsof -ti:3000 | xargs kill -9');
console.log('3. Alternative port: npm run dev -- -p 3001');
console.log('4. Check backend: curl http://localhost:8000/api/health');
console.log('5. Clear browser: Clear cookies/cache for localhost');
console.log('');

console.log('📊 NEXT STEPS:');
console.log('===============');
console.log('1. Start backend: cd ../backend && php artisan serve --port=8000');
console.log('2. Start frontend: npm run dev');
console.log('3. Open browser: http://localhost:3000');
console.log('4. Check console for errors');