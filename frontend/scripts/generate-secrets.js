#!/usr/bin/env node
const crypto = require('crypto');

console.log('🔐 Generating secure secrets for production...\n');

// Generate secure random strings
const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('base64').replace(/[/+=]/g, '').substring(0, length);
};

const secrets = {
  NEXTAUTH_SECRET: generateSecret(32),
  JWT_SECRET: generateSecret(32),
  SESSION_SECRET: generateSecret(32)
};

console.log('Copy these secure secrets to your .env.production file:\n');
console.log('# Authentication Secrets (Generated on:', new Date().toISOString(), ')');
Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}="${value}"`);
});

console.log('\n⚠️  IMPORTANT: Save these secrets securely. They cannot be recovered once lost!');
console.log('✅ Each secret is cryptographically secure and unique.\n');

// Also generate a template for other sensitive values
console.log('📝 Don\'t forget to update these values with your real credentials:\n');
console.log('# Stripe Live Keys (get from https://dashboard.stripe.com/apikeys)');
console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."');
console.log('STRIPE_SECRET_KEY="sk_live_..."');
console.log('STRIPE_WEBHOOK_SECRET="whsec_..."');
console.log('\n# Email SMTP Configuration');
console.log('SMTP_USER="your-email@dixis.io"');
console.log('SMTP_PASS="your-email-password"');
console.log('\n# Backend API URL');
console.log('NEXT_PUBLIC_API_URL="https://api.dixis.io"');