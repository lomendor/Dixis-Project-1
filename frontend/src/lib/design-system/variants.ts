/**
 * Dixis Design System Component Variants
 * Consistent component styling patterns using class-variance-authority
 */

import { cva, type VariantProps } from 'class-variance-authority';

// Button Variants
export const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'touch-manipulation',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-600 text-white shadow-sm',
          'hover:bg-primary-700 hover:shadow-md',
          'active:bg-primary-800 active:scale-[0.98]',
        ],
        secondary: [
          'bg-secondary-100 text-secondary-900 shadow-sm',
          'hover:bg-secondary-200 hover:shadow-md',
          'active:bg-secondary-300 active:scale-[0.98]',
        ],
        outline: [
          'border border-primary-300 bg-white text-primary-700 shadow-sm',
          'hover:bg-primary-50 hover:border-primary-400 hover:shadow-md',
          'active:bg-primary-100 active:scale-[0.98]',
        ],
        ghost: [
          'text-secondary-700',
          'hover:bg-secondary-100 hover:text-secondary-900',
          'active:bg-secondary-200 active:scale-[0.98]',
        ],
        destructive: [
          'bg-error-600 text-white shadow-sm',
          'hover:bg-error-700 hover:shadow-md',
          'active:bg-error-800 active:scale-[0.98]',
        ],
        link: [
          'text-primary-600 underline-offset-4',
          'hover:underline hover:text-primary-700',
          'active:text-primary-800',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Card Variants
export const cardVariants = cva(
  [
    'rounded-lg border bg-white shadow-sm',
    'transition-all duration-200 ease-in-out',
  ],
  {
    variants: {
      variant: {
        default: 'border-secondary-200',
        elevated: 'border-secondary-200 shadow-md hover:shadow-lg',
        interactive: [
          'border-secondary-200 cursor-pointer',
          'hover:border-primary-300 hover:shadow-md hover:scale-[1.02]',
          'active:scale-[0.98]',
        ],
        outlined: 'border-primary-300 bg-primary-50/50',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

// Badge Variants
export const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
    'text-xs font-medium transition-colors',
  ],
  {
    variants: {
      variant: {
        default: 'bg-secondary-100 text-secondary-800',
        primary: 'bg-primary-100 text-primary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        error: 'bg-error-100 text-error-800',
        outline: 'border border-secondary-300 text-secondary-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Input Variants
export const inputVariants = cva(
  [
    'flex w-full rounded-md border bg-white px-3 py-2',
    'text-sm transition-colors',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-secondary-500',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'touch-manipulation',
  ],
  {
    variants: {
      variant: {
        default: 'border-secondary-300 focus-visible:border-primary-500',
        error: 'border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500',
        success: 'border-success-500 focus-visible:border-success-500 focus-visible:ring-success-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Alert Variants
export const alertVariants = cva(
  [
    'relative w-full rounded-lg border p-4',
    '[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  ],
  {
    variants: {
      variant: {
        default: 'bg-white border-secondary-200 text-secondary-900',
        info: 'bg-info-50 border-info-200 text-info-900 [&>svg]:text-info-600',
        success: 'bg-success-50 border-success-200 text-success-900 [&>svg]:text-success-600',
        warning: 'bg-warning-50 border-warning-200 text-warning-900 [&>svg]:text-warning-600',
        error: 'bg-error-50 border-error-200 text-error-900 [&>svg]:text-error-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Avatar Variants
export const avatarVariants = cva(
  [
    'relative flex shrink-0 overflow-hidden rounded-full',
    'bg-secondary-100 text-secondary-600',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Loading Spinner Variants
export const spinnerVariants = cva(
  [
    'animate-spin rounded-full border-2 border-current border-t-transparent',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-secondary-400',
        primary: 'text-primary-600',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// Navigation Variants
export const navigationVariants = cva(
  [
    'flex items-center gap-1 rounded-md px-3 py-2',
    'text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default: [
          'text-secondary-700',
          'hover:bg-secondary-100 hover:text-secondary-900',
        ],
        active: [
          'bg-primary-100 text-primary-900',
          'hover:bg-primary-200',
        ],
        ghost: [
          'text-secondary-600',
          'hover:bg-secondary-50 hover:text-secondary-900',
        ],
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Product Card Variants
export const productCardVariants = cva(
  [
    'group relative overflow-hidden rounded-lg border bg-white',
    'transition-all duration-300 ease-in-out',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-secondary-200 shadow-sm',
          'hover:border-primary-300 hover:shadow-md hover:scale-[1.02]',
        ],
        featured: [
          'border-primary-300 shadow-md ring-1 ring-primary-200',
          'hover:shadow-lg hover:scale-[1.02]',
        ],
        compact: [
          'border-secondary-200',
          'hover:border-primary-300 hover:shadow-sm',
        ],
      },
      size: {
        sm: 'max-w-xs',
        md: 'max-w-sm',
        lg: 'max-w-md',
        full: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Export variant props types
export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type AlertVariants = VariantProps<typeof alertVariants>;
export type AvatarVariants = VariantProps<typeof avatarVariants>;
export type SpinnerVariants = VariantProps<typeof spinnerVariants>;
export type NavigationVariants = VariantProps<typeof navigationVariants>;
export type ProductCardVariants = VariantProps<typeof productCardVariants>;
