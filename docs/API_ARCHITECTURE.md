# 🏗️ API ARCHITECTURE - DIXIS MARKETPLACE

**@context @api-architecture @hybrid-approach @routing-decisions**

## 📊 CURRENT STATE ANALYSIS

### Architecture Overview
- **Total API Endpoints**: 90 (52 Next.js + 38 Laravel)
- **Network Topology**: 3-Layer (Frontend → Next.js API → Laravel API → Database)
- **Fetch Calls**: 198 across frontend components
- **Port Configuration**: Mixed (3000, 8000, 8080)

### Performance Baseline
- **Direct Laravel API**: 753ms average response time
- **Next.js Proxy**: 618ms average response time  
- **Network Hops**: 2 per API request (additional JSON parsing overhead)

## 🎯 ROUTE CLASSIFICATION & DECISION MATRIX

### **CATEGORY A: Keep Next.js Proxy (14 routes)**
*Routes with valuable business logic, mock fallbacks, or authentication*

| Route | Purpose | Rationale | Status |
|-------|---------|-----------|--------|
| `/api/products` | Product listing with mock fallback | Development resilience, complex logic | ✅ Keep |
| `/api/producers` | Producer listing with fallback | Mock data for offline development | ✅ Keep |
| `/api/auth/login` | User authentication | Session management, security | ✅ Keep |
| `/api/auth/register` | User registration | Complex validation logic | ✅ Keep |
| `/api/cart/guest` | Guest cart creation | Business logic, state management | ✅ Keep |
| `/api/payment/create-intent` | Payment processing | Security, error handling | ✅ Keep |
| `/api/orders/[id]` | Order management | Complex business rules | ✅ Keep |
| `/api/business/dashboard/stats` | B2B dashboard | Aggregated data, caching | ✅ Keep |
| `/api/admin/producer-applications` | Admin functionality | Authorization, complex queries | ✅ Keep |
| `/api/notifications/order-created` | Notification system | Event handling, queuing | ✅ Keep |
| `/api/invoices/generate` | Invoice creation | PDF generation, business logic | ✅ Keep |
| `/api/analytics/track` | Analytics tracking | Data processing, aggregation | ✅ Keep |
| `/api/monitoring/health` | System monitoring | Health checks, alerting | ✅ Keep |
| `/api/shipping/calculate` | Shipping calculation | Greek market logic, rates | ✅ Keep |

### **CATEGORY B: Migrate to Direct Laravel (16 routes)**
*Simple CRUD operations without complex logic*

| Route | Current Function | Migration Target | Expected Improvement |
|-------|-----------------|------------------|---------------------|
| `/api/categories` | Simple proxy to Laravel | Direct Laravel call | 25% faster |
| `/api/health/backend` | Health check proxy | Direct Laravel health | 30% faster |
| `/api/filters` | Filter options proxy | Direct Laravel filters | 20% faster |
| `/api/currency/rates` | Exchange rates proxy | Direct Laravel rates | 25% faster |
| `/api/tax/calculate` | Simple tax calculation | Direct Laravel tax | 20% faster |
| `/api/producers/search` | Search proxy | Direct Laravel search | 15% faster |
| `/api/products/search` | Product search proxy | Direct Laravel search | 15% faster |
| `/api/producers/featured` | Featured producers | Direct Laravel featured | 20% faster |
| `/api/products/featured` | Featured products | Direct Laravel featured | 20% faster |
| `/api/producer/register` | Producer registration | Direct Laravel register | 25% faster |
| `/api/cart/[id]` | Simple cart retrieval | Direct Laravel cart | 30% faster |
| `/api/business/orders` | Order listing | Direct Laravel orders | 20% faster |
| `/api/admin/integrations/quickbooks/status` | Simple status check | Direct Laravel status | 35% faster |
| `/api/tax/compliance-report` | Report generation | Direct Laravel report | 25% faster |
| `/api/account/stats` | Account statistics | Direct Laravel stats | 20% faster |
| `/api/payments` | Payment methods list | Direct Laravel payments | 25% faster |

### **CATEGORY C: Evaluate Case-by-Case (22 routes)**
*Complex routes requiring individual assessment*

| Route | Complexity | Assessment Needed |
|-------|------------|-------------------|
| `/api/products/[id]` | Medium | Check if transformation logic needed |
| `/api/producers/[id]/products` | Medium | Recently created, evaluate usage |
| `/api/cart/[id]/items` | High | Complex cart operations |
| `/api/auth/b2b/*` | High | B2B authentication flow |
| `/api/business/dashboard/*` | High | Dashboard aggregations |
| `/api/admin/*` | High | Admin panel operations |
| *[...and 16 more]* | Various | Individual evaluation required |

## 🚀 MIGRATION STRATEGY

### **Phase 1: Quick Wins (Week 1)**
Migrate 5 simplest routes with highest performance impact:
1. `/api/categories` - Simple lookup, 25% improvement expected
2. `/api/health/backend` - Basic health check, 30% improvement  
3. `/api/filters` - Static data, 20% improvement
4. `/api/currency/rates` - External API proxy, 25% improvement
5. `/api/producers/featured` - Basic query, 20% improvement

### **Phase 2: Batch Migration (Week 2)**
Migrate remaining 11 Category B routes with standardized approach.

### **Phase 3: Complex Evaluation (Week 3)**
Assess Category C routes individually based on usage patterns and complexity.

## 📈 EXPECTED OUTCOMES

### **Performance Improvements**
- **Direct Route Performance**: 25-30% faster average response times
- **Reduced Server Load**: Fewer Next.js processes handling simple proxies
- **Better Error Visibility**: Direct error propagation from Laravel

### **Maintenance Benefits**
- **Reduced Complexity**: 16 fewer API routes to maintain
- **Single Source of Truth**: API changes only need Laravel updates
- **Clearer Architecture**: Explicit separation of concerns

### **Development Experience**
- **Faster Local Development**: Fewer proxy delays for simple operations
- **Better Debugging**: Direct error messages from Laravel
- **Simplified Testing**: Test Laravel APIs directly

## 🔧 IMPLEMENTATION NOTES

### **Environment Configuration**
```typescript
// Centralized API configuration
export const API_CONFIG = {
  laravel: {
    base: process.env.NEXT_PUBLIC_LARAVEL_API || 'http://localhost:8000/api/v1',
    timeout: 10000,
    retries: 2
  },
  proxy: {
    base: '/api',
    fallbackEnabled: process.env.NODE_ENV === 'development',
    routes: PROXY_ROUTES_CONFIG
  }
}
```

### **Hybrid Client Architecture**
```typescript
/**
 * Smart API client that routes requests based on configuration
 * @context @hybrid-approach @api-client
 */
class HybridAPIClient {
  // Routes to proxy (Category A) vs direct (Category B)
  // Environment-aware routing
  // Centralized error handling
  // Performance monitoring
}
```

## 📝 CONTEXT ENGINEERING TAGS

- `@api-architecture`: Core architectural decisions and rationale
- `@hybrid-approach`: Implementation strategy for mixed routing
- `@routing-decisions`: Specific route classifications and reasoning  
- `@migration-plan`: Step-by-step transformation approach
- `@performance-metrics`: Baseline measurements and improvement targets
- `@route-classification`: Decision matrix for proxy vs direct routing

---

**Created**: 2025-01-26  
**Status**: Architecture documented, ready for implementation  
**Next**: Begin Phase 1 migration with performance tracking  
**Owner**: Development Team  
**Review**: Weekly architecture review meetings