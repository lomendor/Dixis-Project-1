# 🎯 CLAUDE CODE INSTRUCTIONS - API CLIENT CONSOLIDATION

## ✅ SUCCESS UPDATE

**PREVIOUS TASK COMPLETED:** ✅ baseUrl fix worked!
- ✅ Application now runs successfully on http://localhost:3009
- ✅ Path aliases (@/) working correctly
- ✅ Compilation errors reduced from blocking to manageable

## 🎯 NEW TASK: CONSOLIDATE API CLIENT ARCHITECTURE

**OBJECTIVE:** Clean up multiple API clients into single, consistent pattern
**PRIORITY:** HIGH - Reduces complexity and improves maintainability
**APPROACH:** Structured architectural consolidation

## � CURRENT STATE ANALYSIS

**Multiple API Clients Found:**
1. `src/lib/api/index.ts` - Axios-based, simple endpoints
2. `src/lib/api/client/apiClient.ts` - Fetch-based, TypeScript interfaces
3. `src/lib/api/production.ts` - Production-ready with caching
4. `src/lib/api/services/cart/cartApi.ts` - Uses fetch-based apiClient

**CHOSEN PATTERN:** Enhanced Hooks Pattern (already analyzed in API_PATTERNS_AUDIT.md)

## �️ CONSOLIDATION STRATEGY

### STEP 1: Standardize on Fetch-Based API Client
**Target:** `src/lib/api/client/apiClient.ts` (already working)
**Reason:** TypeScript interfaces, modern fetch API, already used by cartApi.ts

### STEP 2: Migrate Axios-Based Endpoints
**Source:** `src/lib/api/index.ts` (axios-based)
**Action:** Convert to use fetch-based apiClient
**Keep:** The endpoint structure and API methods

### STEP 3: Integrate Production Features
**Source:** `src/lib/api/production.ts` (caching, rate limiting)
**Action:** Add production features to main apiClient
**Keep:** Error handling, timeout, retry logic

## � DETAILED IMPLEMENTATION PLAN

### PHASE 1: Enhance Main API Client (apiClient.ts)
**File:** `src/lib/api/client/apiClient.ts`
**Actions:**
1. Add production features from production.ts:
   - Request timeout handling
   - Retry logic for failed requests
   - Rate limiting protection
   - Error response caching
2. Keep existing TypeScript interfaces
3. Maintain current fetch-based approach

### PHASE 2: Create Unified API Service Layer
**File:** `src/lib/api/services/index.ts` (new file)
**Actions:**
1. Import enhanced apiClient
2. Create service methods for all endpoints from index.ts:
   - Products API
   - Categories API
   - Cart API
   - User API
3. Export unified API interface

### PHASE 3: Update Import Statements
**Files to modify:**
- All components currently importing from `src/lib/api/index.ts`
- Update to use new unified service layer
- Maintain same method signatures for compatibility

## 🧪 TESTING & VERIFICATION

### After Each Phase:
```bash
cd "/Users/panagiotiskourkoutis/Dixis Project 2/dixis-fresh"
npm run type-check
npm run build
npm run dev
```

### Functional Testing:
1. **Cart functionality** - Add/remove items
2. **Product browsing** - Categories, search
3. **API responses** - Check network tab for errors
4. **Error handling** - Test with network issues

## ✅ SUCCESS CRITERIA

### Phase 1 Complete:
- ✅ apiClient.ts enhanced with production features
- ✅ No breaking changes to existing interfaces
- ✅ Type-check passes without new errors

### Phase 2 Complete:
- ✅ New unified service layer created
- ✅ All endpoints from index.ts migrated
- ✅ Consistent API interface exported

### Phase 3 Complete:
- ✅ All imports updated to use new service layer
- ✅ Application runs without errors
- ✅ All functionality works as before
- ✅ Reduced from 4 API clients to 1 unified system

## 🎯 EXECUTION APPROACH

**START WITH:** Phase 1 only - enhance apiClient.ts
**THEN:** Test and verify before proceeding
**NEXT:** Phase 2 - create service layer
**FINALLY:** Phase 3 - update imports

**Remember:** Test after each phase, report results!

## 🧪 TESTING & VERIFICATION

### Test 1: TypeScript Compilation
```bash
npm run type-check
```
**Expected:** No errors about missing exports

### Test 2: Next.js Build
```bash
npm run build
```
**Expected:** Successful build without import errors

### Test 3: Development Server
```bash
npm run dev
```
**Expected:** Server starts without compilation errors

### Test 4: Import Verification
Create a test file to verify imports work:
```typescript
// test-import.ts
import { apiClient } from '@/lib/api/client/apiClient';
console.log('Import successful:', typeof apiClient);
```

## 🎯 EXPECTED OUTCOME

After completing these steps:

1. ✅ TypeScript can resolve `@/` path aliases
2. ✅ `cartApi.ts` can import `apiClient` successfully  
3. ✅ Application compiles without errors
4. ✅ Development server starts normally
5. ✅ Cart functionality can be tested

## ⚠️ IMPORTANT NOTES

### DO NOT:
- Change the API client implementation
- Modify the cartApi.ts imports
- Create new API clients
- Make multiple changes simultaneously

### DO:
- Make ONE change at a time
- Test after each change
- Verify compilation before proceeding
- Report any new errors immediately

## 🚨 IF PROBLEMS PERSIST

If the baseUrl fix doesn't resolve the issue, check:

1. **Cache Issues:** Delete `.next` folder and rebuild
2. **IDE Issues:** Restart TypeScript language server
3. **Module Resolution:** Check for circular dependencies
4. **Path Casing:** Ensure correct case sensitivity

## 📞 NEXT STEPS

1. **FIRST:** Fix tsconfig.json baseUrl
2. **THEN:** Test compilation
3. **FINALLY:** Report success/failure with specific error messages

**Remember:** Make SMALL changes, test immediately, report results!
