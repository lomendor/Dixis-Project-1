// Module loading diagnostic utility
export function checkModuleLoading() {
  if (typeof window !== 'undefined') {
    console.log('🔍 Module Loading Check:');
    console.log('- Window:', typeof window);
    console.log('- React:', typeof require('react'));
    console.log('- ReactDOM:', typeof require('react-dom'));
    console.log('- QueryClient:', typeof require('@tanstack/react-query').QueryClient);
    console.log('- Next Router:', typeof require('next/navigation'));
    
    // Check for common webpack issues
    if (typeof __webpack_require__ !== 'undefined') {
      console.log('- Webpack Require:', typeof __webpack_require__);
      console.log('- Webpack Modules:', Object.keys(__webpack_require__.m || {}).length);
    }
    
    // Check for module resolution issues
    try {
      const testImport = require('@tanstack/react-query');
      console.log('✅ React Query imported successfully');
    } catch (error) {
      console.error('❌ React Query import failed:', error);
    }
  }
}

// Call this function in development to debug module issues
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.checkModuleLoading = checkModuleLoading;
}