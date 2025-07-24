# 🔐 GitHub Secrets Setup Guide

## Overview
This guide explains how to configure GitHub repository secrets for automated VPS deployment.

## Required Secrets

The following secrets need to be configured in your GitHub repository:

### 1. `VPS_HOST`
- **Description**: IP address or domain of your VPS server
- **Example**: `147.93.126.235` or `dixis.io`
- **Usage**: SSH connection target

### 2. `VPS_USER` 
- **Description**: SSH username for VPS access
- **Example**: `root` or `dixis`
- **Usage**: SSH authentication

### 3. `VPS_SSH_KEY`
- **Description**: Private SSH key content for authentication
- **Example**: Contents of `dixis_new_key` file
- **Usage**: SSH key-based authentication

## Configuration Steps

### Step 1: Navigate to Repository Settings
1. Go to your GitHub repository
2. Click on **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets
For each required secret:

1. Click **New repository secret**
2. Enter the **Name** (e.g., `VPS_HOST`)
3. Enter the **Secret value**
4. Click **Add secret**

### Step 3: Verify Configuration
After adding all secrets, the GitHub Actions workflow will:
- ✅ Detect configured secrets automatically
- 🚀 Enable automated deployment on push to `main` branch
- 🔍 Perform health checks after deployment

## Without Secrets Configuration

If secrets are not configured:
- ⚠️ Workflow will show informative warning messages  
- 🏗️ Frontend build will still complete successfully
- 🚫 Deployment steps will be skipped gracefully
- ✨ Manual deployment can still be performed via SSH

## Security Best Practices

- 🔒 Never commit SSH keys or credentials to the repository
- 🛡️ Use GitHub secrets for sensitive information only
- 🔄 Rotate SSH keys periodically for security
- 👥 Limit repository access to trusted collaborators

## Troubleshooting

### Common Issues:
1. **SSH Key Format**: Ensure private key includes header/footer lines
2. **VPS Access**: Verify SSH key has proper permissions on VPS
3. **Network**: Confirm VPS is accessible from GitHub runners

### Testing Connection:
```bash
# Test SSH connection manually
ssh -i dixis_new_key root@147.93.126.235
```

## Manual Deployment Alternative

If automated deployment is not needed:
```bash
# Connect to VPS
ssh -i dixis_new_key root@147.93.126.235

# Deploy manually
cd /var/www/dixis
git pull origin main
cd frontend
npm ci --production
npm run build
pkill -f 'next' || true
nohup npm start > /var/log/nextjs.log 2>&1 &
systemctl reload nginx
```

---
*This setup enables secure, automated deployment while maintaining flexibility for manual deployment when needed.*