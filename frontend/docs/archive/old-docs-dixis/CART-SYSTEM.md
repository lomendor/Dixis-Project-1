# 🛒 Dixis Shopping Cart System

## Overview

A complete, production-ready shopping cart system built with **Zustand state management**, TypeScript, and TanStack Query. Features real-time updates, SSR compatibility, offline support, and a beautiful user interface.

> **Updated Architecture**: Now uses unified Zustand stores instead of Context for better performance and SSR compatibility.

## 🎯 Features

### Core Functionality
- ✅ **Add/Remove Items** - Full CRUD operations for cart items
- ✅ **Quantity Management** - Increase/decrease quantities with validation
- ✅ **Real-time Updates** - Optimistic UI with instant feedback
- ✅ **Cart Persistence** - localStorage for guest users, API sync for authenticated users
- ✅ **Stock Validation** - Prevent adding more items than available
- ✅ **Price Calculations** - Automatic subtotal, total, and discount calculations

### User Interface
- ✅ **Cart Icon** - Navbar integration with item count badge
- ✅ **Cart Drawer** - Slide-out panel for quick cart access
- ✅ **Cart Page** - Full-page cart view with detailed controls
- ✅ **Product Integration** - Add to cart buttons on product pages
- ✅ **Quick Add** - Hover buttons for instant adding
- ✅ **Responsive Design** - Mobile-first, works on all devices

### Advanced Features
- ✅ **Offline Support** - Works without internet connection
- ✅ **Error Handling** - Graceful error recovery with user feedback
- ✅ **Toast Notifications** - Success/error messages for all actions
- ✅ **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- ✅ **Performance** - Optimized with React.memo, useMemo, and efficient re-renders
- ✅ **TypeScript** - Full type safety throughout the system

## 🏗️ Architecture

### File Structure
```
src/
├── stores/
│   └── cartStore.ts            # Zustand cart state management (SSR-safe)
├── lib/api/models/cart/
│   └── types.ts                # Cart TypeScript interfaces
├── lib/api/services/cart/
│   └── useCart.ts              # TanStack Query hooks for cart API
├── components/cart/
│   ├── CartButton.tsx          # Add to cart button component
│   ├── ModernCartIcon.tsx      # Cart icon with badge
│   ├── ModernCartDrawer.tsx    # Slide-out cart panel
│   └── ModernCartButton.tsx    # Modern cart button component
├── app/
│   └── cart/
│       └── page.tsx            # Full cart page
```

### State Management (Updated Architecture)
- **Zustand Store** - Global state with SSR-safe hydration
- **Individual Hooks** - Performance-optimized selectors (useCartSummary, useCartActions)
- **TanStack Query** - Server state management and caching
- **localStorage** - Client-side persistence for guest users
- **Optimistic Updates** - Immediate UI feedback before API confirmation

### API Integration
- **Backend Ready** - Designed to work with existing Laravel cart API
- **Offline Fallback** - Mock data when API is unavailable
- **Error Recovery** - Automatic retry and fallback mechanisms

## 🚀 Usage

### Basic Cart Operations (Updated for Zustand)

```tsx
import { useCartActions, useCartSummary } from '@/stores/cartStore';

function ProductCard({ product }) {
  const { addToCart, removeFromCart, getItemQuantity } = useCartActions();
  const { itemCount } = useCartSummary();

  const quantity = getItemQuantity(product.id);

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price}€</p>

      <CartButton
        productId={product.id}
        productName={product.name}
        price={product.price}
        maxQuantity={product.stock}
      />

      {quantity > 0 && (
        <p>In cart: {quantity}</p>
      )}
    </div>
  );
}
```

### Cart Icon in Navigation (Updated for Zustand)

```tsx
import ModernCartIcon from '@/components/cart/ModernCartIcon';

function Navbar() {
  return (
    <nav>
      <div className="nav-items">
        <ModernCartIcon />
      </div>
    </nav>
  );
}
```

### Zustand Store Usage (No Provider Needed)

```tsx
// No provider needed! Zustand works globally
import { useCartSummary, useCartActions, useCartDrawer } from '@/stores/cartStore';

function App({ children }) {
  // Cart state is available everywhere without providers
  return (
    <div>
      {children}
    </div>
  );
}
```

## 🎨 Components

### CartButton
Full-featured add to cart button with quantity controls.

**Props:**
- `productId` - Unique product identifier
- `productName` - Product name for notifications
- `price` - Current product price
- `maxQuantity` - Maximum allowed quantity
- `size` - Button size ('sm', 'md', 'lg')
- `variant` - Button style ('primary', 'secondary', 'outline')
- `showQuantityControls` - Show +/- buttons when in cart

### CartIcon
Cart icon with item count badge and optional total display.

**Props:**
- `size` - Icon size ('sm', 'md', 'lg')
- `showBadge` - Show item count badge
- `showTotal` - Show cart total price
- `onClick` - Custom click handler

### CartDrawer
Slide-out cart panel with full cart functionality.

**Features:**
- Item list with images and details
- Quantity controls for each item
- Remove item buttons
- Cart total calculation
- Checkout and continue shopping buttons

## 🔧 Configuration

### Cart Configuration
```tsx
export const DEFAULT_CART_CONFIG: CartConfig = {
  maxItems: 50,
  maxQuantityPerItem: 99,
  enableGuestCart: true,
  guestCartExpiration: 30, // days
  persistence: {
    enableLocalStorage: true,
    enableSessionStorage: false,
    autoSync: true,
    syncInterval: 30000, // 30 seconds
  },
  validation: {
    enableStockValidation: true,
    enablePriceValidation: true,
    validateOnAdd: true,
    validateOnUpdate: true,
  },
};
```

## 🧪 Testing

### Demo Page
Visit `/cart-demo` to see all cart features in action:
- Different cart icon variants
- Various button styles and sizes
- Interactive product cards
- Real-time cart updates

### Test Scenarios
1. **Add Products** - Add various products to cart
2. **Update Quantities** - Increase/decrease item quantities
3. **Remove Items** - Remove individual items or clear entire cart
4. **Stock Validation** - Try adding more items than available
5. **Offline Mode** - Test functionality without internet
6. **Persistence** - Refresh page and verify cart persists

## 🔄 API Integration

### Backend Endpoints
The cart system is designed to work with these API endpoints:

```
GET    /api/cart              # Get current cart
POST   /api/cart/items        # Add item to cart
PUT    /api/cart/items/{id}   # Update cart item
DELETE /api/cart/items/{id}   # Remove cart item
DELETE /api/cart/clear        # Clear entire cart
POST   /api/cart/validate     # Validate cart items
```

### Request/Response Format
```typescript
// Add to cart request
{
  productId: string,
  quantity: number,
  attributes?: CartItemAttributes
}

// Cart response
{
  id: string,
  items: CartItem[],
  itemCount: number,
  subtotal: number,
  total: number,
  currency: string
}
```

## 🎯 Next Steps

### Potential Enhancements
- [ ] **Wishlist Integration** - Save items for later
- [ ] **Cart Sharing** - Share cart with others
- [ ] **Bulk Operations** - Select multiple items for actions
- [ ] **Cart Analytics** - Track cart abandonment and conversion
- [ ] **Promotional Codes** - Discount code system
- [ ] **Saved Carts** - Multiple saved cart configurations
- [ ] **Cart Recommendations** - Suggest related products

### Performance Optimizations
- [ ] **Virtual Scrolling** - For large cart item lists
- [ ] **Image Lazy Loading** - Optimize cart item images
- [ ] **Bundle Splitting** - Code splitting for cart components
- [ ] **Service Worker** - Enhanced offline capabilities

## 📱 Mobile Experience

The cart system is fully responsive and optimized for mobile:
- Touch-friendly buttons and controls
- Swipe gestures for cart drawer
- Optimized layouts for small screens
- Fast tap responses with haptic feedback

## ♿ Accessibility

Full accessibility support includes:
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for modals and drawers

---

**Built with ❤️ for the Dixis e-commerce platform**
