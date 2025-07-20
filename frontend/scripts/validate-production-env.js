#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * Validates all required environment variables for production deployment
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Required environment variables for production
const requiredEnvVars = {
  frontend: {
    'NODE_ENV': {
      required: true,
      expectedValue: 'production',
      description: 'Node.js environment'
    },
    'NEXT_PUBLIC_API_URL': {
      required: true,
      pattern: /^https:\/\/.+/,
      description: 'API URL (must be HTTPS in production)'
    },
    'NEXT_PUBLIC_APP_URL': {
      required: true,
      pattern: /^https:\/\/.+/,
      description: 'Application URL (must be HTTPS in production)'
    },
    'NEXT_TELEMETRY_DISABLED': {
      required: false,
      expectedValue: '1',
      description: 'Disable Next.js telemetry'
    }
  },
  backend: {
    'APP_NAME': {
      required: true,
      description: 'Application name'
    },
    'APP_ENV': {
      required: true,
      expectedValue: 'production',
      description: 'Laravel environment'
    },
    'APP_KEY': {
      required: true,
      pattern: /^base64:.{40,}/,
      description: 'Laravel application key (base64 encoded, 32+ chars)'
    },
    'APP_DEBUG': {
      required: true,
      expectedValue: 'false',
      description: 'Debug mode (must be false in production)'
    },
    'APP_URL': {
      required: true,
      pattern: /^https:\/\/.+/,
      description: 'Application URL (must be HTTPS in production)'
    },
    'DB_CONNECTION': {
      required: true,
      expectedValue: 'mysql',
      description: 'Database connection type'
    },
    'DB_HOST': {
      required: true,
      description: 'Database host'
    },
    'DB_DATABASE': {
      required: true,
      description: 'Database name'
    },
    'DB_USERNAME': {
      required: true,
      description: 'Database username'
    },
    'DB_PASSWORD': {
      required: true,
      minLength: 12,
      description: 'Database password (minimum 12 characters)'
    },
    'REDIS_HOST': {
      required: true,
      description: 'Redis host'
    },
    'REDIS_PASSWORD': {
      required: true,
      minLength: 16,
      description: 'Redis password (minimum 16 characters)'
    },
    'MAIL_MAILER': {
      required: true,
      description: 'Mail driver'
    },
    'MAIL_HOST': {
      required: true,
      description: 'Mail server host'
    },
    'MAIL_USERNAME': {
      required: true,
      description: 'Mail username'
    },
    'MAIL_PASSWORD': {
      required: true,
      description: 'Mail password'
    },
    'MAIL_FROM_ADDRESS': {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      description: 'From email address'
    },
    'STRIPE_KEY': {
      required: true,
      pattern: /^pk_live_.+/,
      description: 'Stripe publishable key (must be live key)'
    },
    'STRIPE_SECRET': {
      required: true,
      pattern: /^sk_live_.+/,
      description: 'Stripe secret key (must be live key)'
    },
    'STRIPE_WEBHOOK_SECRET': {
      required: true,
      pattern: /^whsec_.+/,
      description: 'Stripe webhook secret'
    },
    'QUEUE_CONNECTION': {
      required: true,
      expectedValue: 'redis',
      description: 'Queue connection (should be redis for production)'
    },
    'CACHE_DRIVER': {
      required: true,
      expectedValue: 'redis',
      description: 'Cache driver (should be redis for production)'
    },
    'SESSION_DRIVER': {
      required: true,
      expectedValue: 'redis',
      description: 'Session driver (should be redis for production)'
    }
  }
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Load environment file
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const envContent = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return env;
}

// Validate environment variable
function validateEnvVar(key, value, config) {
  const errors = [];
  
  if (config.required && (!value || value.trim() === '')) {
    errors.push(`${key} is required but not set`);
    return errors;
  }
  
  if (!value) {
    return errors; // Optional variable not set
  }
  
  if (config.expectedValue && value !== config.expectedValue) {
    errors.push(`${key} should be "${config.expectedValue}" but is "${value}"`);
  }
  
  if (config.pattern && !config.pattern.test(value)) {
    errors.push(`${key} does not match required pattern`);
  }
  
  if (config.minLength && value.length < config.minLength) {
    errors.push(`${key} should be at least ${config.minLength} characters long`);
  }
  
  return errors;
}

// Validate environment
function validateEnvironment(env, envConfig, envType) {
  info(`Validating ${envType} environment...`);
  
  let hasErrors = false;
  let hasWarnings = false;
  
  Object.entries(envConfig).forEach(([key, config]) => {
    const value = env[key];
    const errors = validateEnvVar(key, value, config);
    
    if (errors.length > 0) {
      hasErrors = true;
      errors.forEach(err => error(`${envType}: ${err}`));
      if (config.description) {
        info(`  Description: ${config.description}`);
      }
    } else if (value) {
      success(`${envType}: ${key} is valid`);
    } else if (!config.required) {
      warning(`${envType}: ${key} is optional and not set`);
      hasWarnings = true;
    }
  });
  
  return { hasErrors, hasWarnings };
}

// Security checks
function performSecurityChecks(frontendEnv, backendEnv) {
  info('Performing security checks...');
  
  let hasSecurityIssues = false;
  
  // Check for HTTPS URLs
  const urls = [
    frontendEnv.NEXT_PUBLIC_API_URL,
    frontendEnv.NEXT_PUBLIC_APP_URL,
    backendEnv.APP_URL
  ].filter(Boolean);
  
  urls.forEach(url => {
    if (!url.startsWith('https://')) {
      error(`Security: URL should use HTTPS in production: ${url}`);
      hasSecurityIssues = true;
    }
  });
  
  // Check for debug mode
  if (backendEnv.APP_DEBUG === 'true') {
    error('Security: APP_DEBUG should be false in production');
    hasSecurityIssues = true;
  }
  
  // Check for strong passwords
  const passwords = [
    { name: 'DB_PASSWORD', value: backendEnv.DB_PASSWORD },
    { name: 'REDIS_PASSWORD', value: backendEnv.REDIS_PASSWORD }
  ];
  
  passwords.forEach(({ name, value }) => {
    if (value && value.length < 16) {
      warning(`Security: ${name} should be at least 16 characters for better security`);
    }
  });
  
  // Check for live Stripe keys
  if (backendEnv.STRIPE_KEY && !backendEnv.STRIPE_KEY.startsWith('pk_live_')) {
    error('Security: STRIPE_KEY should be a live key (pk_live_) in production');
    hasSecurityIssues = true;
  }
  
  if (backendEnv.STRIPE_SECRET && !backendEnv.STRIPE_SECRET.startsWith('sk_live_')) {
    error('Security: STRIPE_SECRET should be a live key (sk_live_) in production');
    hasSecurityIssues = true;
  }
  
  if (!hasSecurityIssues) {
    success('Security checks passed');
  }
  
  return hasSecurityIssues;
}

// Main validation function
function main() {
  log('🔍 Production Environment Validation', 'blue');
  log('=====================================', 'blue');
  
  // Load environment files
  const frontendEnvPath = path.join(__dirname, '..', '.env.production');
  const backendEnvPath = path.join(__dirname, '..', '..', 'backend', '.env');
  
  const frontendEnv = loadEnvFile(frontendEnvPath);
  const backendEnv = loadEnvFile(backendEnvPath);
  
  if (!frontendEnv) {
    error(`Frontend environment file not found: ${frontendEnvPath}`);
    process.exit(1);
  }
  
  if (!backendEnv) {
    error(`Backend environment file not found: ${backendEnvPath}`);
    process.exit(1);
  }
  
  // Validate environments
  const frontendResult = validateEnvironment(frontendEnv, requiredEnvVars.frontend, 'Frontend');
  const backendResult = validateEnvironment(backendEnv, requiredEnvVars.backend, 'Backend');
  
  // Perform security checks
  const hasSecurityIssues = performSecurityChecks(frontendEnv, backendEnv);
  
  // Summary
  log('\n📊 Validation Summary', 'blue');
  log('====================', 'blue');
  
  const totalErrors = frontendResult.hasErrors || backendResult.hasErrors || hasSecurityIssues;
  const totalWarnings = frontendResult.hasWarnings || backendResult.hasWarnings;
  
  if (totalErrors) {
    error('❌ Validation failed! Please fix the errors above before deploying to production.');
    process.exit(1);
  } else if (totalWarnings) {
    warning('⚠️  Validation passed with warnings. Review the warnings above.');
    success('✅ Environment is ready for production deployment.');
  } else {
    success('🎉 All validations passed! Environment is ready for production deployment.');
  }
}

// Run validation
if (require.main === module) {
  main();
}

module.exports = { validateEnvironment, performSecurityChecks };
