#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Validates required environment variables for production deployment
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
};

// Environment-specific required variables
const requiredVars = {
  development: [
    'NEXT_PUBLIC_SITE_URL',
  ],
  production: [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_API_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'SESSION_SECRET',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ],
  staging: [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_API_URL',
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
  ],
};

// Optional but recommended variables
const recommendedVars = [
  'SENTRY_DSN',
  'GOOGLE_ANALYTICS_ID',
  'STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
  'EMAIL_FROM',
  'SENDGRID_API_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
];

// Security validation rules
const securityRules = {
  JWT_SECRET: {
    minLength: 32,
    description: 'JWT secret should be at least 32 characters long',
  },
  NEXTAUTH_SECRET: {
    minLength: 32,
    description: 'NextAuth secret should be at least 32 characters long',
  },
  DATABASE_URL: {
    pattern: /^(postgresql|mysql|sqlite):\/\//,
    description: 'Database URL should start with postgresql://, mysql://, or sqlite://',
  },
  NEXT_PUBLIC_SITE_URL: {
    pattern: /^https?:\/\//,
    description: 'Site URL should start with http:// or https://',
  },
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function loadEnvFile(envPath) {
  try {
    if (!fs.existsSync(envPath)) {
      return {};
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });

    return envVars;
  } catch (error) {
    logError(`Failed to load ${envPath}: ${error.message}`);
    return {};
  }
}

function validateEnvironment() {
  const environment = process.env.NODE_ENV || 'development';
  
  log(`\n${colors.bright}🔍 Validating Environment Variables${colors.reset}`, 'cyan');
  log(`Environment: ${environment}`, 'blue');
  
  // Load environment variables from various sources
  const envSources = [
    { name: '.env.local', path: '.env.local' },
    { name: '.env', path: '.env' },
    { name: 'process.env', vars: process.env },
  ];

  let allEnvVars = { ...process.env };

  // Load from files
  envSources.slice(0, 2).forEach(source => {
    const vars = loadEnvFile(source.path);
    allEnvVars = { ...allEnvVars, ...vars };
    if (Object.keys(vars).length > 0) {
      logInfo(`Loaded ${Object.keys(vars).length} variables from ${source.name}`);
    }
  });

  // Validate required variables
  const required = requiredVars[environment] || requiredVars.development;
  const missing = [];
  const invalid = [];

  log('\n📋 Checking Required Variables:', 'cyan');
  
  required.forEach(varName => {
    const value = allEnvVars[varName];
    
    if (!value) {
      missing.push(varName);
      logError(`${varName} is missing`);
    } else {
      // Check security rules
      const rule = securityRules[varName];
      if (rule) {
        let isValid = true;
        
        if (rule.minLength && value.length < rule.minLength) {
          invalid.push(`${varName}: ${rule.description}`);
          isValid = false;
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
          invalid.push(`${varName}: ${rule.description}`);
          isValid = false;
        }
        
        if (isValid) {
          logSuccess(`${varName} is valid`);
        } else {
          logError(`${varName} is invalid`);
        }
      } else {
        logSuccess(`${varName} is set`);
      }
    }
  });

  // Check recommended variables
  log('\n💡 Checking Recommended Variables:', 'cyan');
  
  const missingRecommended = [];
  recommendedVars.forEach(varName => {
    const value = allEnvVars[varName];
    
    if (!value) {
      missingRecommended.push(varName);
      logWarning(`${varName} is not set (recommended)`);
    } else {
      logSuccess(`${varName} is set`);
    }
  });

  // Security checks
  log('\n🔒 Security Checks:', 'cyan');
  
  const securityIssues = [];
  
  // Check for default/weak values
  const weakValues = ['password', '123456', 'secret', 'changeme', 'default'];
  Object.entries(allEnvVars).forEach(([key, value]) => {
    if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')) {
      if (weakValues.some(weak => value.toLowerCase().includes(weak))) {
        securityIssues.push(`${key} appears to contain a weak value`);
        logError(`${key} appears to contain a weak value`);
      } else {
        logSuccess(`${key} appears secure`);
      }
    }
  });

  // Check for exposed secrets in public variables
  Object.entries(allEnvVars).forEach(([key, value]) => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) {
        if (!key.includes('PUBLIC_KEY') && !key.includes('PUBLISHABLE')) {
          securityIssues.push(`${key} appears to expose a secret in a public variable`);
          logError(`${key} appears to expose a secret in a public variable`);
        }
      }
    }
  });

  // Summary
  log('\n📊 Validation Summary:', 'cyan');
  
  if (missing.length === 0 && invalid.length === 0 && securityIssues.length === 0) {
    logSuccess('All required environment variables are valid!');
    
    if (missingRecommended.length > 0) {
      logWarning(`${missingRecommended.length} recommended variables are missing`);
      log('Consider setting these for better functionality:', 'yellow');
      missingRecommended.forEach(varName => {
        log(`  - ${varName}`, 'yellow');
      });
    }
    
    return true;
  } else {
    if (missing.length > 0) {
      logError(`${missing.length} required variables are missing:`);
      missing.forEach(varName => {
        log(`  - ${varName}`, 'red');
      });
    }
    
    if (invalid.length > 0) {
      logError(`${invalid.length} variables are invalid:`);
      invalid.forEach(issue => {
        log(`  - ${issue}`, 'red');
      });
    }
    
    if (securityIssues.length > 0) {
      logError(`${securityIssues.length} security issues found:`);
      securityIssues.forEach(issue => {
        log(`  - ${issue}`, 'red');
      });
    }
    
    return false;
  }
}

function generateEnvTemplate() {
  log('\n📝 Generating .env.example template...', 'cyan');
  
  const templatePath = '.env.example';
  if (fs.existsSync(templatePath)) {
    logSuccess('.env.example already exists');
  } else {
    logWarning('.env.example not found - consider creating one');
  }
  
  // Show example of how to create .env.local
  log('\n💡 To get started:', 'cyan');
  log('1. Copy .env.example to .env.local', 'blue');
  log('2. Fill in your actual values', 'blue');
  log('3. Run this script again to validate', 'blue');
}

// Main execution
function main() {
  log(`${colors.bright}🚀 Dixis Environment Validation${colors.reset}`, 'magenta');
  
  const isValid = validateEnvironment();
  
  if (!isValid) {
    generateEnvTemplate();
    log('\n❌ Environment validation failed!', 'red');
    process.exit(1);
  } else {
    log('\n✅ Environment validation passed!', 'green');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateEnvironment,
  requiredVars,
  recommendedVars,
  securityRules,
};
