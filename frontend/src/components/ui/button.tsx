import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/lib/design-system/variants"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    onDrag,
    onDragEnd,
    onDragStart,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    // Filter out drag props that conflict with framer-motion
    const filteredProps = { ...props }

    // When asChild is true, we need to pass a single child to Slot
    if (asChild && Slot) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant, size }),
            'touch-manipulation',
            isDisabled && 'cursor-not-allowed',
            className
          )}
          ref={ref}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          {...filteredProps}
        >
          {children}
        </Slot>
      )
    }

    // Regular button
    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          'touch-manipulation',
          isDisabled && 'cursor-not-allowed',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        {...filteredProps}
      >
        {leftIcon && !loading && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}

        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}

        <span className={loading ? 'opacity-70' : ''}>
          {children}
        </span>

        {rightIcon && !loading && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }