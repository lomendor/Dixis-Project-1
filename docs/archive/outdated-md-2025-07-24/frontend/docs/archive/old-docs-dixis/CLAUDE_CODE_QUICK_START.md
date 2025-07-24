# ⚡ CLAUDE CODE - QUICK START GUIDE

## 🚨 IMMEDIATE ACTION REQUIRED

### **CRITICAL BUG - API PORT MISMATCH**
```bash
# URGENT: Laravel backend runs on port 8000, but API proxies use 8080
# This breaks most functionality!

# Files to fix immediately:
src/app/api/categories/route.ts (line 8)
src/app/api/auth/b2b/login/route.ts (line 18)
# Change all "8080" → "8000"
```

### **MISSING PAGES BREAKING NAVIGATION**
```bash
# These pages are referenced in navigation but don't exist:
src/app/b2b/reports/page.tsx - MISSING
src/app/b2b/settings/page.tsx - MISSING
# Users get 404 errors when clicking navigation
```

## 🎯 PROJECT STATUS SUMMARY

### **✅ WHAT WORKS**
- **Homepage:** Fully functional with real data
- **Products page:** 65 real products from database
- **Laravel backend:** Complete API with authentication, products, orders
- **Basic navigation:** Main pages load correctly
- **Component library:** Extensive UI components ready to use

### **❌ WHAT'S BROKEN**
- **API integration:** Port mismatch breaks most API calls
- **B2B navigation:** Missing pages cause 404 errors
- **Cart operations:** Uses mock data instead of backend
- **Authentication:** B2B login uses setTimeout instead of real API

### **🔄 WHAT NEEDS INTEGRATION**
- **Cart system:** Components exist but need backend connection
- **Order management:** Backend ready, frontend needs completion
- **Checkout flow:** Partial implementation needs finishing

## 🏗️ ARCHITECTURE OVERVIEW

### **BACKEND (Laravel - Port 8000)**
```
http://localhost:8000/api/
├── products?per_page=100     # 65 real products
├── categories               # Product categories
├── producers               # Producer listings  
├── auth/login              # User authentication
├── auth/b2b-login         # B2B authentication
├── orders                 # Order management
└── cart                   # Cart operations
```

### **FRONTEND (Next.js - Port 3000)**
```
dixis-fresh/src/
├── app/                   # Pages (Next.js App Router)
│   ├── api/              # API proxies (FIX PORT!)
│   ├── b2b/              # B2B dashboard
│   ├── products/         # Product pages ✅
│   └── cart/             # Cart page 🔄
├── components/           # UI components
│   ├── auth/            # Authentication 🔄
│   ├── cart/            # Cart components 🔄
│   ├── b2b/             # B2B components ✅
│   └── ui/              # Base UI ✅
└── stores/              # Zustand state
    ├── authStore.ts     # Auth state 🔄
    └── cartStore.ts     # Cart state 🔄
```

## 🎯 YOUR MISSION PRIORITIES

### **🚨 PHASE 1: CRITICAL FIXES (Do First)**

1. **Fix API Port Issue:**
```typescript
// In ALL files under src/app/api/
// Change this:
const backendUrl = `http://localhost:8080/api/...`
// To this:
const backendUrl = `http://localhost:8000/api/...`
```

2. **Create Missing B2B Pages:**
```bash
# Create these files with basic content:
src/app/b2b/reports/page.tsx
src/app/b2b/settings/page.tsx
```

3. **Test Basic Flow:**
```bash
# Verify these work after fixes:
- Homepage loads
- Products page shows 65 items  
- B2B navigation doesn't 404
- API calls succeed (check browser console)
```

### **⚡ PHASE 2: INTEGRATION (Do Next)**

1. **Cart Backend Integration:**
   - Connect `cartStore.ts` to real Laravel cart API
   - Replace mock data in cart components
   - Test add/remove/update cart operations

2. **Real B2B Authentication:**
   - Replace mock login with actual API calls
   - Implement proper JWT token handling
   - Add business verification flow

3. **Order Management:**
   - Connect order pages to Laravel orders API
   - Implement order creation and tracking
   - Add order history and status updates

## 🛠️ DEVELOPMENT SETUP

### **Start Servers:**
```bash
# Option 1: Use the script
./start-all.sh

# Option 2: Manual start
# Terminal 1: Laravel backend
cd backend && php artisan serve --port=8000

# Terminal 2: Next.js frontend
cd dixis-fresh && npm run dev
```

### **Key URLs:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **B2B Login:** http://localhost:3000/b2b/login

## 🎨 DESIGN REQUIREMENTS

### **Visual Style:**
- **Colors:** Black, white, electric green (#22c55e)
- **Typography:** System fonts (already configured)
- **Style:** Minimal modern (NO glassmorphism)
- **Mobile-first:** 70% of users are mobile

### **Component Usage:**
```typescript
// Use existing components:
import { Button } from '@/components/ui/button'
import { useCartActions } from '@/stores/cartStore'
import { useAuthUser } from '@/stores/authStore'

// Follow established patterns:
const { addToCart } = useCartActions()
const user = useAuthUser()
```

## 📋 QUALITY CHECKLIST

### **Before Committing:**
- [ ] `npm run typecheck` passes (no TypeScript errors)
- [ ] All navigation links work (no 404s)
- [ ] API calls use port 8000 (not 8080)
- [ ] Mobile responsive on phone screens
- [ ] Console has no errors
- [ ] Cart operations work end-to-end

### **Testing Flow:**
1. **Consumer Flow:** Homepage → Products → Add to cart → Checkout
2. **B2B Flow:** Login → Dashboard → Products → Create order
3. **Mobile Test:** All pages work on mobile device

## 🚀 SUCCESS DEFINITION

### **DONE WHEN:**
- All existing components work with real backend data
- No mock data anywhere in the application
- All navigation links lead to working pages
- Cart and order operations work end-to-end
- B2B dashboard is fully functional
- Mobile experience is perfect
- Zero TypeScript errors
- Performance is under 2 seconds

---

**🎯 REMEMBER:** You're integrating existing components, not building from scratch. Focus on connecting the frontend to the working backend. Quality over quantity. Mobile-first always.**
