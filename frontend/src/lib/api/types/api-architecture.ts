/**
 * @fileoverview API Architecture Types and Configurations
 * @context @api-architecture @hybrid-approach @route-classification
 * @see docs/API_ARCHITECTURE.md for routing decisions
 * @see docs/MIGRATION_PLAN.md for implementation status
 */

export type RouteType = 'proxy' | 'direct';

export type RouteReason = 
  | 'mock-fallback'      // Development resilience with mock data
  | 'auth'               // Authentication and session management
  | 'business-logic'     // Complex business rules and processing
  | 'simple-crud'        // Basic CRUD operations
  | 'performance'        // Performance-critical operations
  | 'security'           // Security-sensitive operations
  | 'external-api';      // External API integrations

export type MigrationStatus = 
  | 'keep'               // Keep as proxy (Category A)
  | 'migrate'            // Migrate to direct (Category B)
  | 'evaluate'           // Evaluate case-by-case (Category C)
  | 'completed'          // Migration completed
  | 'in-progress';       // Currently being migrated

export interface APIRoute {
  /** Route path (e.g., '/api/products') */
  path: string;
  
  /** Current routing type */
  type: RouteType;
  
  /** Reason for routing decision */
  reason: RouteReason;
  
  /** Migration status */
  migrationStatus: MigrationStatus;
  
  /** Expected performance improvement for direct routes */
  performanceImprovement?: string;
  
  /** Complexity level for migration planning */
  complexity: 'low' | 'medium' | 'high';
  
  /** Number of components affected by migration */
  componentCount?: number;
  
  /** Migration priority (1 = highest) */
  priority?: number;
  
  /** Additional notes or context */
  notes?: string;
}

export interface PerformanceMetrics {
  /** Response time before migration (ms) */
  before?: number;
  
  /** Response time after migration (ms) */
  after?: number;
  
  /** Percentage improvement */
  improvement?: number;
  
  /** Measurement date */
  measuredAt?: Date;
}

export interface MigrationTracker {
  route: APIRoute;
  metrics: PerformanceMetrics;
  migratedAt?: Date;
  migratedBy?: string;
  rollbackPlan?: string;
  issues?: string[];
  solutions?: string[];
}

/**
 * Route Classification Configuration
 * @context @route-classification
 * 
 * This configuration drives the hybrid API client routing decisions
 * and migration planning. Each route is classified based on:
 * - Business value of proxy layer
 * - Performance impact of direct calls  
 * - Migration complexity and risk
 */
export const ROUTE_CLASSIFICATION: Record<string, APIRoute> = {
  // CATEGORY B: Migrated to Direct (was Category A, now migrated)
  'products': {
    path: '/api/products',
    type: 'direct', // MIGRATED - direct Laravel API calls
    reason: 'simple-crud',
    migrationStatus: 'completed',
    performanceImprovement: '94%', // Actual improvement (467ms → 26ms)
    complexity: 'medium', // Was high but proved manageable
    componentCount: 17, // Found 17 references across codebase
    priority: 9,
    notes: 'COMPLETED - 94% performance improvement, proxy removed'
  },
  
  'producers': {
    path: '/api/producers',
    type: 'direct', // MIGRATED - direct Laravel API calls
    reason: 'simple-crud',
    migrationStatus: 'completed',
    performanceImprovement: '97%', // Actual improvement (1455ms → 38ms)
    complexity: 'medium', // Was high but proved to be simple proxy
    componentCount: 10, // Found 10 references across codebase
    priority: 10,
    notes: 'COMPLETED - 97% performance improvement, proxy removed'
  },
  
  'auth/login': {
    path: '/api/auth/login',
    type: 'proxy',
    reason: 'auth',
    migrationStatus: 'keep', 
    complexity: 'high',
    componentCount: 3,
    notes: 'Session management and security critical'
  },
  
  'payment/create-intent': {
    path: '/api/payment/create-intent',
    type: 'proxy',
    reason: 'security',
    migrationStatus: 'keep',
    complexity: 'high',
    componentCount: 5,
    notes: 'Payment security requires proxy layer'
  },

  // CATEGORY B: Migrate to Direct (Simple CRUD, performance-critical)
  'categories': {
    path: '/api/categories',
    type: 'proxy', // Current state
    reason: 'simple-crud',
    migrationStatus: 'migrate',
    performanceImprovement: '25%',
    complexity: 'low',
    componentCount: 8,
    priority: 1,
    notes: 'Simple lookup, high impact migration'
  },
  
  'health/backend': {
    path: '/api/health/backend',
    type: 'proxy', // Current state
    reason: 'simple-crud', 
    migrationStatus: 'migrate',
    performanceImprovement: '30%',
    complexity: 'low',
    componentCount: 2,
    priority: 2,
    notes: 'Fastest expected performance gain'
  },
  
  'filters': {
    path: '/api/filters',
    type: 'direct', // REMOVED - phantom route cleanup
    reason: 'simple-crud',
    migrationStatus: 'completed',
    performanceImprovement: '100%', // Eliminated error responses
    complexity: 'low',
    componentCount: 2, // Only found in ResourcePreloader + architecture
    priority: 3,
    notes: 'REMOVED - phantom route (no backend endpoint existed)'
  },
  
  'currency/rates': {
    path: '/api/currency/rates',
    type: 'direct', // REMOVED - duplicate implementation cleanup
    reason: 'external-api',
    migrationStatus: 'completed',
    performanceImprovement: '100%', // Eliminated duplicate implementation
    complexity: 'medium', // Was complex but unused
    componentCount: 0, // No actual usage found
    priority: 4,
    notes: 'REMOVED - duplicate implementation (currencyStore handles this functionality)'
  },
  
  'producers/featured': {
    path: '/api/producers/featured',
    type: 'direct', // MIGRATED - direct Laravel API calls
    reason: 'simple-crud',
    migrationStatus: 'completed',
    performanceImprovement: '34%', // Actual improvement (94ms → 62ms)
    complexity: 'medium',
    componentCount: 4, // ResourcePreloader + cacheStrategy + other components
    priority: 5,
    notes: 'COMPLETED - 34% performance improvement, proxy removed'
  },

  // Additional Category B routes...
  'products/featured': {
    path: '/api/products/featured',
    type: 'direct', // MIGRATED - direct Laravel API calls
    reason: 'simple-crud', 
    migrationStatus: 'completed',
    performanceImprovement: '96%', // Actual improvement (1070ms → 39ms)
    complexity: 'medium',
    componentCount: 6, // cacheStrategy + SimpleFeaturedProducts + ResourcePreloader + apiConstants + docs
    priority: 6,
    notes: 'COMPLETED - 96% performance improvement, proxy removed'
  },
  
  'tax/calculate': {
    path: '/api/tax/calculate',
    type: 'proxy',
    reason: 'simple-crud',
    migrationStatus: 'migrate', 
    performanceImprovement: '20%',
    complexity: 'low',
    componentCount: 4,
    priority: 7
  },

  // CATEGORY B: Migrated to Direct
  'products/[id]': {
    path: '/api/products/[id]',
    type: 'direct', // MIGRATED - direct Laravel API calls
    reason: 'simple-crud',
    migrationStatus: 'completed',
    performanceImprovement: '94%', // Actual improvement (509ms → 32ms)
    complexity: 'low', // Was medium but proved to be simple proxy
    componentCount: 2, // useProductsEnhanced + ResourcePreloader
    priority: 11,
    notes: 'COMPLETED - 94% performance improvement, proxy removed'
  },
  
  'cart/[id]': {
    path: '/api/cart/[id]',
    type: 'direct', // MIGRATED - direct Laravel API calls
    reason: 'simple-crud',
    migrationStatus: 'completed',
    performanceImprovement: '99%', // Actual improvement (2362ms → 23ms)
    complexity: 'low',
    componentCount: 3, // cartApi service + documentation + types
    priority: 7,
    notes: 'COMPLETED - 99% performance improvement, simple CRUD proxy removed'
  },
  
  'cart/[id]/items': {
    path: '/api/cart/[id]/items',
    type: 'direct', // MIGRATED - direct Laravel API calls
    reason: 'simple-crud',
    migrationStatus: 'completed',
    performanceImprovement: '96%', // Actual improvement (1381ms → 52ms)
    complexity: 'medium', // Was high but proved to be manageable CRUD
    componentCount: 6, // cartApi service + useCart + integration tests + documentation
    priority: 8,
    notes: 'COMPLETED - 96% performance improvement, full CRUD cart operations migrated'
  },

  'producers/[id]/products': {
    path: '/api/producers/[id]/products',
    type: 'direct', // MIGRATED - direct Laravel API calls
    reason: 'simple-crud',
    migrationStatus: 'completed',
    performanceImprovement: '94%', // Actual improvement (433ms → 25ms)
    complexity: 'low', // Simple proxy
    componentCount: 4, // apiConstants + producer pages + core endpoints
    priority: 12,
    notes: 'COMPLETED - 94% performance improvement, producer products endpoint migrated'
  }
};

/**
 * Migration Phase Configuration  
 * @context @migration-plan
 */
export const MIGRATION_PHASES = {
  phase1: {
    name: 'Foundation & Quick Wins',
    duration: '1 week',
    routes: ['categories', 'health/backend', 'filters', 'currency/rates', 'producers/featured'],
    target: '5 routes migrated, process established'
  },
  
  phase2: {
    name: 'Batch Migration', 
    duration: '1 week',
    routes: ['products/featured', 'tax/calculate', 'producers/search', 'products/search', 'producer/register', 'cart/[id]', 'business/orders', 'account/stats'],
    target: '8 additional routes migrated'
  },
  
  phase3: {
    name: 'Complex Evaluation',
    duration: '1 week', 
    routes: ['products/[id]', 'cart/[id]/items', 'business/dashboard/*'],
    target: 'Complex routes evaluated, hybrid client implemented'
  }
} as const;

/**
 * Performance Targets
 * @context @performance-targets
 */
export const PERFORMANCE_TARGETS = {
  /** Target average improvement for direct routes */
  averageImprovement: 25, // percentage
  
  /** Target server load reduction */
  serverLoadReduction: 20, // percentage
  
  /** Maximum acceptable response time */
  maxResponseTime: 1000, // milliseconds
  
  /** Target error rate (maintain or improve) */
  maxErrorRate: 0.01 // 1%
} as const;