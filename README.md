## ⚠️ LEGACY REPOSITORY NOTICE

**🚨 This repository is deprecated and archived for historical purposes.**

### 🔄 **Active Development**
Use **[lomendor/Project-Dixis](https://github.com/lomendor/Project-Dixis)** for current development.

### 🔒 **Security Workflows**
All automated security scans have been disabled to prevent email noise.
Security workflows can be triggered manually if needed for reference purposes.

### 📅 **Last Updated**: January 2025

---

# 🏢 DIXIS - Clean Enterprise Marketplace Platform (ARCHIVED)

**From Producer to Table - Clean, Professional, Production-Ready**

> ⚠️ **Note**: This is a legacy version. Active development continues at [Project-Dixis](https://github.com/lomendor/Project-Dixis).

## 🎯 Overview

DIXIS is a modern marketplace platform connecting Greek producers directly with consumers and businesses. This is the **clean, organized version** of the project - no clutter, no chaos, just working code.

## 🏗️ Architecture

```
dixis-clean/
├── backend/           # Laravel 11 API
├── frontend/          # Next.js 15.3.2 Application (dixis-fresh)
├── docs/             # Documentation
├── deployment/       # Production configs
├── CLAUDE.md         # Context Engineering
└── start-all.sh      # Development script
```

## 🚀 Quick Start

```bash
# Prerequisites
# PostgreSQL 14+, Node.js 20+, PHP 8.2+

# Initial setup
cp backend/.env.example backend/.env
# Configure PostgreSQL database in .env

# Install dependencies & start
./start-all.sh

# Access points:
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# Products API: http://localhost:8000/api/v1/products
```

## 📊 Project Status

- **Backend**: ✅ Laravel API with 65 Greek products
- **Frontend**: ✅ Next.js with 103 pages
- **Database**: ✅ PostgreSQL migration SUCCESS (65 Greek products migrated)
- **Cart System**: ✅ VERIFIED working (Full CRUD operations)
- **API Integration**: ✅ Next.js ↔ Laravel ↔ PostgreSQL confirmed
- **Deployment**: ✅ VPS ready
- **Revenue Potential**: €70K-€290K marketplace

## 🎯 Key Features

- **B2B & B2C** marketplace
- **Stripe payments** integration
- **Multi-tenant** architecture
- **Mobile-first** design
- **Production-ready** deployment

## 🔧 Development

- **Laravel 11** backend
- **Next.js 15.3.2** frontend
- **PostgreSQL** database
- **Docker** containerization
- **Professional** CI/CD ready

## 🎉 Recent Achievements

### ✅ PostgreSQL Migration SUCCESS (July 2025)
- **Status**: Complete migration from SQLite to PostgreSQL
- **Data**: 65 Greek traditional products successfully migrated
- **Integrity**: Zero data loss, all relationships preserved
- **Performance**: Improved query performance and scalability
- **Cart System**: Full CRUD operations verified and working

### ✅ Production-Ready Status
- **API Integration**: Next.js ↔ Laravel ↔ PostgreSQL confirmed
- **Cart Operations**: Create, Add, Update, Remove all functional
- **Real Data**: Cart displaying actual Greek product names and prices
- **Test Results**: Cart ID creation and product management verified

## 📝 Documentation

See `docs/` directory for detailed documentation and `CLAUDE.md` for context engineering.

---

**Clean. Simple. Professional.** 🚀
