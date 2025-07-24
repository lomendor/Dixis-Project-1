# Dixis Design System

A comprehensive design system for the Dixis marketplace platform, built with TypeScript, Tailwind CSS, and Framer Motion.

## 🎨 Overview

The Dixis Design System provides a consistent, accessible, and modern foundation for building user interfaces across the platform. It includes design tokens, component variants, and utility classes that ensure brand consistency and excellent user experience.

## 📁 Structure

```
src/lib/design-system/
├── tokens.ts          # Design tokens (colors, typography, spacing)
├── variants.ts        # Component variants using CVA
├── README.md         # This documentation
└── examples/         # Usage examples
```

## 🎯 Design Principles

### 1. **Consistency**
- Unified color palette based on Dixis brand green (#22c55e)
- Consistent spacing scale (4px base unit)
- Standardized typography hierarchy

### 2. **Accessibility**
- WCAG 2.1 AA compliant color contrasts
- Minimum 44px touch targets for mobile
- Semantic HTML and proper ARIA labels

### 3. **Performance**
- Optimized animations with Framer Motion
- Efficient CSS-in-JS with class-variance-authority
- Tree-shakeable design tokens

### 4. **Mobile-First**
- Touch-optimized interactions
- Responsive breakpoints
- Safe area support for modern devices

## 🎨 Color System

### Primary Colors
```typescript
primary: {
  50: '#f0fdf4',   // Very light green
  500: '#22c55e',  // Brand green
  600: '#16a34a',  // Primary dark
  900: '#14532d',  // Very dark green
}
```

### Semantic Colors
- **Success**: Green variants for positive actions
- **Warning**: Amber variants for caution
- **Error**: Red variants for destructive actions
- **Info**: Blue variants for informational content

## 📝 Typography

### Font Family
- **Primary**: Inter (web font)
- **Fallback**: System UI fonts

### Scale
- **xs**: 12px (0.75rem)
- **sm**: 14px (0.875rem)
- **base**: 16px (1rem)
- **lg**: 18px (1.125rem)
- **xl**: 20px (1.25rem)
- **2xl**: 24px (1.5rem)
- **3xl**: 30px (1.875rem)

## 📏 Spacing System

Based on 4px increments for consistent spacing:

```typescript
spacing: {
  1: '4px',    // 0.25rem
  2: '8px',    // 0.5rem
  4: '16px',   // 1rem
  6: '24px',   // 1.5rem
  8: '32px',   // 2rem
  // ... up to 96 (384px)
}
```

## 🧩 Component Variants

### Button Variants

```typescript
// Usage
<Button variant="primary" size="lg">
  Primary Button
</Button>

// Available variants
variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
size: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
```

### Card Variants

```typescript
// Usage
<Card variant="elevated" padding="lg">
  Card content
</Card>

// Available variants
variant: 'default' | 'elevated' | 'interactive' | 'outlined'
padding: 'none' | 'sm' | 'md' | 'lg'
```

### Badge Variants

```typescript
// Usage
<Badge variant="success" size="md">
  Success Badge
</Badge>

// Available variants
variant: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline'
size: 'sm' | 'md' | 'lg'
```

## 🎭 Animation System

### Duration Scale
- **75ms**: Micro-interactions
- **150ms**: Small transitions
- **300ms**: Standard transitions
- **500ms**: Large transitions

### Timing Functions
- **ease-in**: Accelerating animations
- **ease-out**: Decelerating animations (preferred)
- **ease-in-out**: Smooth start and end

### Common Animations
```typescript
// Hover effects
whileHover={{ scale: 1.02 }}

// Tap effects
whileTap={{ scale: 0.98 }}

// Loading states
animate={{ rotate: 360 }}
```

## 📱 Mobile Optimizations

### Touch Targets
- Minimum 44px height/width
- Proper touch-action properties
- Disabled tap highlights

### Safe Areas
```css
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

### Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## 🛠️ Usage Examples

### Basic Button
```tsx
import { Button } from '@/components/ui/button';

<Button 
  variant="primary" 
  size="lg"
  loading={isLoading}
  leftIcon={<PlusIcon />}
>
  Add to Cart
</Button>
```

### Product Card
```tsx
import { ProductCard } from '@/components/ui/enhanced-card';

<ProductCard
  product={{
    id: '1',
    name: 'Organic Olive Oil',
    price: 12.99,
    image: '/product.jpg',
    producer: 'Greek Farms',
    category: 'Oil',
    inStock: true,
  }}
  onAddToCart={(id) => addToCart(id)}
  onViewProduct={(id) => router.push(`/products/${id}`)}
/>
```

### Stats Dashboard
```tsx
import { StatsCard } from '@/components/ui/enhanced-card';

<StatsCard
  title="Total Orders"
  value="1,234"
  change={{ value: '+12%', type: 'increase' }}
  icon={<ShoppingBagIcon />}
/>
```

## 🎨 Custom Utilities

### Touch Optimization
```css
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

### Smooth Scrolling
```css
.scroll-smooth {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
```

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 🔧 Development Guidelines

### 1. **Use Design Tokens**
Always use design tokens instead of hardcoded values:
```tsx
// ✅ Good
className="text-primary-600 p-4"

// ❌ Bad
style={{ color: '#16a34a', padding: '16px' }}
```

### 2. **Leverage Variants**
Use component variants for consistent styling:
```tsx
// ✅ Good
<Button variant="primary" size="lg">

// ❌ Bad
<button className="bg-green-600 text-white px-8 py-4">
```

### 3. **Mobile-First Approach**
Design for mobile first, then enhance for larger screens:
```tsx
// ✅ Good
className="text-sm md:text-base lg:text-lg"

// ❌ Bad
className="text-lg md:text-sm"
```

### 4. **Semantic HTML**
Use proper semantic elements:
```tsx
// ✅ Good
<main>
  <section>
    <h1>Page Title</h1>
  </section>
</main>

// ❌ Bad
<div>
  <div>
    <div>Page Title</div>
  </div>
</div>
```

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Class Variance Authority](https://cva.style/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

When adding new components or tokens:

1. Follow existing naming conventions
2. Add proper TypeScript types
3. Include accessibility considerations
4. Test on mobile devices
5. Update documentation

## 📄 License

This design system is part of the Dixis platform and follows the same licensing terms.
