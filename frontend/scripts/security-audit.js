#!/usr/bin/env node

/**
 * Security audit script for production readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  addIssue(category, message, severity = 'high') {
    this.issues.push({ category, message, severity });
  }

  addWarning(category, message) {
    this.warnings.push({ category, message });
  }

  addPassed(category, message) {
    this.passed.push({ category, message });
  }

  // Check environment variables
  auditEnvironmentVariables() {
    console.log('🔍 Auditing environment variables...');
    
    const envFiles = ['.env', '.env.local', '.env.production'];
    const criticalVars = [
      'JWT_SECRET',
      'SESSION_SECRET', 
      'STRIPE_SECRET_KEY',
      'DATABASE_URL'
    ];
    
    let foundEnvFile = false;
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        foundEnvFile = true;
        const content = fs.readFileSync(envFile, 'utf-8');
        
        // Check for placeholder values
        const placeholders = [
          'your-secret-key',
          'change-this',
          'placeholder',
          'example',
          'test-key',
          'sk_test_',
          'pk_test_'
        ];
        
        for (const placeholder of placeholders) {
          if (content.includes(placeholder)) {
            this.addIssue('Environment', `Placeholder value found in ${envFile}: ${placeholder}`);
          }
        }
        
        // Check for weak secrets
        const secretMatches = content.match(/SECRET.*=.*(.{1,20})/g);
        if (secretMatches) {
          secretMatches.forEach(match => {
            const value = match.split('=')[1]?.trim();
            if (value && value.length < 32) {
              this.addWarning('Environment', `Weak secret detected: ${match.split('=')[0]} (less than 32 characters)`);
            }
          });
        }
      }
    }
    
    if (!foundEnvFile) {
      this.addWarning('Environment', 'No environment files found. Make sure to configure .env.local for production');
    } else {
      this.addPassed('Environment', 'Environment files found and checked');
    }
  }

  // Check for hardcoded secrets in code
  auditHardcodedSecrets() {
    console.log('🔍 Searching for hardcoded secrets...');
    
    const secretPatterns = [
      /sk_live_[a-zA-Z0-9]{99}/g,  // Stripe live secret
      /pk_live_[a-zA-Z0-9]{99}/g,  // Stripe live publishable
      /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}/gi,
      /(?:secret|key|token)\s*[:=]\s*['"][^'"]{16,}/gi,
      /mysql:\/\/[^:]+:[^@]+@/gi,   // Database URLs with passwords
      /mongodb:\/\/[^:]+:[^@]+@/gi
    ];
    
    try {
      const result = execSync(
        'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "secret\\|password\\|key" | head -20',
        { encoding: 'utf-8', cwd: process.cwd() }
      );
      
      const files = result.trim().split('\n').filter(Boolean);
      
      let secretsFound = false;
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        
        for (const pattern of secretPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              this.addIssue('Hardcoded Secret', `Potential secret in ${file}: ${match.substring(0, 50)}...`);
              secretsFound = true;
            });
          }
        }
      }
      
      if (!secretsFound) {
        this.addPassed('Hardcoded Secrets', 'No obvious hardcoded secrets found in source code');
      }
    } catch (error) {
      this.addWarning('Hardcoded Secrets', 'Could not scan for hardcoded secrets');
    }
  }

  // Check dependencies for vulnerabilities
  auditDependencies() {
    console.log('🔍 Auditing dependencies for vulnerabilities...');
    
    try {
      const result = execSync('npm audit --audit-level moderate --json', { 
        encoding: 'utf-8', 
        cwd: process.cwd() 
      });
      
      const auditData = JSON.parse(result);
      
      if (auditData.metadata.vulnerabilities.total > 0) {
        const vulns = auditData.metadata.vulnerabilities;
        
        if (vulns.critical > 0) {
          this.addIssue('Dependencies', `${vulns.critical} critical vulnerabilities found`);
        }
        if (vulns.high > 0) {
          this.addIssue('Dependencies', `${vulns.high} high-severity vulnerabilities found`);
        }
        if (vulns.moderate > 0) {
          this.addWarning('Dependencies', `${vulns.moderate} moderate vulnerabilities found`);
        }
      } else {
        this.addPassed('Dependencies', 'No known vulnerabilities in dependencies');
      }
    } catch (error) {
      if (error.status === 0) {
        this.addPassed('Dependencies', 'No known vulnerabilities in dependencies');
      } else {
        this.addWarning('Dependencies', 'Could not run dependency audit');
      }
    }
  }

  // Check security configuration
  auditSecurityConfig() {
    console.log('🔍 Auditing security configuration...');
    
    // Check middleware
    if (fs.existsSync('src/middleware.ts')) {
      const middleware = fs.readFileSync('src/middleware.ts', 'utf-8');
      
      const securityFeatures = [
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Strict-Transport-Security'
      ];
      
      let missingHeaders = [];
      
      for (const header of securityFeatures) {
        if (!middleware.includes(header)) {
          missingHeaders.push(header);
        }
      }
      
      if (missingHeaders.length > 0) {
        this.addWarning('Security Headers', `Missing security headers: ${missingHeaders.join(', ')}`);
      } else {
        this.addPassed('Security Headers', 'Security headers properly configured');
      }
      
      // Check for rate limiting
      if (middleware.includes('rateLimitStore') || middleware.includes('rateLimit')) {
        this.addPassed('Rate Limiting', 'Rate limiting implemented');
      } else {
        this.addWarning('Rate Limiting', 'No rate limiting detected');
      }
    } else {
      this.addWarning('Security Headers', 'No middleware.ts found - security headers may not be configured');
    }
    
    // Check Next.js config
    if (fs.existsSync('next.config.js')) {
      const nextConfig = fs.readFileSync('next.config.js', 'utf-8');
      
      if (nextConfig.includes('headers') || nextConfig.includes('security')) {
        this.addPassed('Next.js Security', 'Security configuration found in next.config.js');
      } else {
        this.addWarning('Next.js Security', 'No security configuration in next.config.js');
      }
    }
  }

  // Check for sensitive data in git
  auditGitSecurity() {
    console.log('🔍 Checking git security...');
    
    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf-8');
      
      const requiredIgnores = ['.env', '.env.local', 'node_modules', '.next'];
      const missingIgnores = requiredIgnores.filter(item => !gitignore.includes(item));
      
      if (missingIgnores.length > 0) {
        this.addWarning('Git Security', `Missing from .gitignore: ${missingIgnores.join(', ')}`);
      } else {
        this.addPassed('Git Security', '.gitignore properly configured');
      }
    } else {
      this.addIssue('Git Security', '.gitignore file not found');
    }
    
    // Check if .env files are tracked
    try {
      const trackedFiles = execSync('git ls-files', { encoding: 'utf-8' });
      const envFiles = ['.env', '.env.local', '.env.production'];
      
      for (const envFile of envFiles) {
        if (trackedFiles.includes(envFile)) {
          this.addIssue('Git Security', `Environment file ${envFile} is tracked by git`);
        }
      }
    } catch (error) {
      this.addWarning('Git Security', 'Could not check git tracked files');
    }
  }

  // Run all audits
  runAudit() {
    console.log('🛡️  Starting Security Audit...\n');
    
    this.auditEnvironmentVariables();
    this.auditHardcodedSecrets();
    this.auditDependencies();
    this.auditSecurityConfig();
    this.auditGitSecurity();
    
    this.generateReport();
  }

  // Generate audit report
  generateReport() {
    console.log('\n📋 Security Audit Report');
    console.log('========================\n');
    
    // Critical Issues
    if (this.issues.length > 0) {
      console.log('❌ CRITICAL ISSUES:');
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. [${issue.category}] ${issue.message}`);
      });
      console.log();
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. [${warning.category}] ${warning.message}`);
      });
      console.log();
    }
    
    // Passed Checks
    if (this.passed.length > 0) {
      console.log('✅ PASSED CHECKS:');
      this.passed.forEach((check, index) => {
        console.log(`   ${index + 1}. [${check.category}] ${check.message}`);
      });
      console.log();
    }
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Critical Issues: ${this.issues.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log(`   Passed Checks: ${this.passed.length}`);
    
    if (this.issues.length === 0) {
      console.log('\n🎉 No critical security issues found!');
      if (this.warnings.length === 0) {
        console.log('🛡️  Your application appears to be production-ready from a security perspective.');
      }
    } else {
      console.log('\n🚨 Please address the critical issues before deploying to production.');
    }
    
    return {
      issues: this.issues.length,
      warnings: this.warnings.length,
      passed: this.passed.length,
      ready: this.issues.length === 0
    };
  }
}

function main() {
  const auditor = new SecurityAuditor();
  auditor.runAudit();
  
  // Exit with error code if critical issues found
  process.exit(auditor.issues.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = SecurityAuditor;