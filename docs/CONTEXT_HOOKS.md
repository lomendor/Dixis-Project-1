# 🔍 CONTEXT ENGINEERING HOOKS - SEARCHABLE KNOWLEDGE

**@context @context-engineering @knowledge-management @searchable-tags**

## 🎯 SEARCH SYSTEM OVERVIEW

This document establishes searchable context hooks for the Dixis marketplace, ensuring that future developers can quickly find relevant information, decisions, and implementation details.

## 🏗️ API ARCHITECTURE CONTEXTS

### **@api-architecture**
**Core architectural decisions and system design**
- **Current State**: 3-layer architecture (Frontend → Next.js → Laravel → DB)
- **Target State**: Strategic hybrid approach (Proxy for complex, Direct for simple)
- **Decision Date**: 2025-01-26
- **Key Files**: `docs/API_ARCHITECTURE.md`, `lib/api/config.ts`
- **Search Terms**: architecture, API design, system topology, routing decisions

### **@hybrid-approach**  
**Implementation strategy for mixed routing**
- **Concept**: Keep proxies for business value, direct calls for performance
- **Classification**: 14 proxy routes (complex), 16 direct routes (simple), 22 evaluate
- **Performance Impact**: 25-30% improvement on direct routes
- **Key Files**: `docs/MIGRATION_PLAN.md`, `lib/api/client.ts`
- **Search Terms**: hybrid, proxy vs direct, performance optimization, routing strategy

### **@routing-decisions**
**Specific route classifications with reasoning**
- **Proxy Routes**: Products (mock fallback), Auth (sessions), Payments (security)
- **Direct Routes**: Categories (simple CRUD), Health (basic checks), Filters (static data)
- **Decision Matrix**: Business logic vs performance trade-offs
- **Key Files**: `docs/API_ARCHITECTURE.md` (Decision Matrix section)
- **Search Terms**: route classification, proxy reasons, direct migration, API endpoints

### **@migration-plan**
**Step-by-step transformation approach**
- **Timeline**: 3 weeks, phased approach
- **Phase 1**: 5 quick wins (categories, health, filters, currency, featured)
- **Phase 2**: Batch migration of remaining 11 simple routes
- **Phase 3**: Complex route evaluation and hybrid client
- **Key Files**: `docs/MIGRATION_PLAN.md`, `docs/MIGRATION_LOG.md`
- **Search Terms**: migration timeline, implementation phases, route migration

## 📊 PERFORMANCE & METRICS CONTEXTS

### **@performance-baseline**
**Current system performance measurements**
- **Direct Laravel**: 753ms average response time
- **Next.js Proxy**: 618ms average response time  
- **Network Hops**: 2 per request (additional JSON parsing)
- **Total Endpoints**: 90 (52 Next.js + 38 Laravel)
- **Fetch Calls**: 198 across frontend components
- **Key Files**: `docs/API_ARCHITECTURE.md`, performance testing scripts
- **Search Terms**: performance metrics, response times, baseline measurements

### **@performance-targets**
**Expected improvements and optimization goals**
- **Direct Route Improvement**: 25-30% faster response times
- **Server Load Reduction**: 20% fewer Next.js processes
- **Error Rate**: Maintain or improve current levels
- **Development Speed**: Faster local development with fewer proxy delays
- **Key Files**: `docs/MIGRATION_PLAN.md`, performance monitoring tools
- **Search Terms**: performance improvements, optimization targets, speed gains

## 🔧 TECHNICAL IMPLEMENTATION CONTEXTS

### **@hybrid-client**
**Smart API client with automatic routing**
- **Purpose**: Route requests to proxy vs direct based on configuration
- **Features**: Environment-aware, performance monitoring, centralized errors
- **Configuration**: Route classification in `API_CONFIG`
- **Implementation**: `lib/api/client.ts`, `lib/api/config.ts`
- **Search Terms**: API client, hybrid routing, smart routing, client configuration

### **@route-classification**
**System for categorizing API routes**
- **Category A**: Keep proxy (14 routes) - Complex logic, mock fallbacks, auth
- **Category B**: Migrate direct (16 routes) - Simple CRUD, performance critical
- **Category C**: Evaluate case-by-case (22 routes) - Complex assessment needed
- **Decision Factors**: Business logic complexity, performance impact, maintenance overhead
- **Key Files**: `docs/API_ARCHITECTURE.md`, `lib/api/types.ts`
- **Search Terms**: route categories, classification system, migration priorities

### **@api-client**
**Frontend API consumption patterns**
- **Current**: 198 fetch calls across components
- **Pattern**: Mixed direct calls and proxy routing
- **Configuration**: Centralized in `lib/apiConstants.ts`
- **Error Handling**: Fallback to mock data in development
- **Key Files**: `lib/apiConstants.ts`, `lib/api/client.ts`, component files
- **Search Terms**: API calls, fetch patterns, client configuration, error handling

## 🚀 MIGRATION & PROGRESS CONTEXTS

### **@migration-status**
**Real-time progress tracking**
- **Phase 1**: 0/5 routes completed (categories, health, filters, currency, featured)
- **Phase 2**: 0/8 routes planned (search, register, cart, tax, etc.)
- **Phase 3**: Complex evaluation pending
- **Overall**: 0/16 total migrations completed
- **Key Files**: `docs/MIGRATION_LOG.md`, migration tracking scripts
- **Search Terms**: migration progress, completed routes, pending migrations

### **@migration-examples**
**Step-by-step migration examples**
- **Template Process**: Benchmark → Analyze → Migrate → Test → Document
- **Categories Example**: Remove proxy route, update 8 components, measure improvement
- **Rollback Strategy**: Git branches, feature flags, monitoring
- **Key Files**: `docs/MIGRATION_PLAN.md`, individual migration branches
- **Search Terms**: migration examples, step-by-step process, rollback strategy

## 🛠️ TROUBLESHOOTING CONTEXTS

### **@troubleshooting**
**Common issues and solutions**
- **Port Conflicts**: 3000 vs 8000 vs 8080 configuration issues
- **CORS Issues**: Cross-origin requests in development
- **Performance Problems**: Proxy delays, network timeouts
- **Environment Differences**: Dev vs staging vs production configurations
- **Key Files**: `docs/TROUBLESHOOTING.md`, environment configuration files
- **Search Terms**: common issues, debugging, configuration problems, CORS errors

### **@environment-config**
**Development, staging, production setup**
- **Development**: Mixed proxy/direct for testing
- **Staging**: Full hybrid approach testing
- **Production**: Optimized routing for performance
- **Environment Variables**: API URLs, timeout settings, feature flags
- **Key Files**: `.env.local`, `lib/api/config.ts`, deployment scripts
- **Search Terms**: environment setup, configuration, deployment, environment variables

## 📚 DOCUMENTATION CONTEXTS

### **@api-patterns**
**Common API usage patterns and best practices**
- **Request Patterns**: Query parameters, headers, authentication
- **Response Handling**: Success/error states, data transformation
- **Caching Strategy**: Server-side rendering, client-side caching
- **Error Handling**: Fallback strategies, user experience
- **Key Files**: Component examples, API service files, documentation
- **Search Terms**: API patterns, best practices, request handling, caching

### **@team-knowledge**
**Preserved team decisions and context**
- **Architecture Decisions**: Why hybrid approach chosen
- **Performance Priorities**: Speed vs resilience trade-offs
- **Greek Market Requirements**: Local compliance, payment systems
- **Business Logic**: Complex rules preserved in proxy routes
- **Key Files**: All documentation files, meeting notes, decision records
- **Search Terms**: team decisions, business context, Greek market, compliance

## 🔍 HOW TO USE CONTEXT HOOKS

### **Finding Information**
1. **Search by Context**: Use `@context-tag` in your IDE or documentation search
2. **Follow Cross-References**: Related contexts linked in each section
3. **Check Key Files**: Direct links to relevant implementation files
4. **Use Search Terms**: Additional keywords for broader searches

### **Adding New Context**
1. **Choose Appropriate Tag**: Follow existing naming conventions
2. **Document Decision**: Include reasoning, alternatives considered
3. **Link Related Files**: Reference implementation and documentation
4. **Update Cross-References**: Link to related contexts

### **Maintenance**
- **Weekly Reviews**: Update progress contexts during team meetings
- **Migration Updates**: Real-time updates to migration status
- **Performance Monitoring**: Regular updates to metrics contexts
- **Documentation Sync**: Keep context hooks aligned with code changes

---

**Created**: 2025-01-26  
**Updated**: Real-time during development  
**Maintainer**: Development Team  
**Usage**: Search by @context-tag for instant knowledge discovery