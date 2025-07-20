'use client';

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartDrawer, useCartSummary } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

interface EnhancedCartIconProps {
  className?: string;
  variant?: "default" | "minimal" | "badge";
  showPrice?: boolean;
}

export function EnhancedCartIcon({ 
  className, 
  variant = "default",
  showPrice = false
}: EnhancedCartIconProps) {
  const { open } = useCartDrawer();
  const { itemCount, total, currency } = useCartSummary();

  const [isAnimating, setIsAnimating] = React.useState(false);
  const prevItemCount = React.useRef(itemCount);

  // Animate when items are added
  React.useEffect(() => {
    if (itemCount > prevItemCount.current) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timeout);
    }
    prevItemCount.current = itemCount;
  }, [itemCount]);

  const formatPrice = React.useCallback((price: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(price);
  }, [currency]);

  if (variant === "minimal") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={open}
        className={cn("relative", className)}
        aria-label={`Καλάθι αγορών με ${itemCount} προϊόντα`}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ShoppingCart className="h-5 w-5" />
        </motion.div>
        
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute -top-1 -right-1"
            >
              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  }

  if (variant === "badge") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={open}
        className={cn("relative", className)}
        aria-label={`Καλάθι αγορών με ${itemCount} προϊόντα`}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-sm">
            Καλάθι
            {itemCount > 0 && ` (${itemCount})`}
          </span>
        </motion.div>
        
        {showPrice && total > 0 && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="ml-2 text-sm font-semibold text-primary"
          >
            {formatPrice(total)}
          </motion.span>
        )}
      </Button>
    );
  }

  // Default variant
  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={open}
        className="relative h-10 w-10"
        aria-label={`Καλάθι αγορών με ${itemCount} προϊόντα`}
      >
        <motion.div
          animate={isAnimating ? { 
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0]
          } : {}}
          transition={{ duration: 0.6 }}
        >
          <ShoppingCart className="h-5 w-5" />
        </motion.div>
        
        {/* Cart Count Badge */}
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute -top-2 -right-2"
            >
              <motion.div
                animate={isAnimating ? {
                  scale: [1, 1.5, 1],
                  backgroundColor: ["hsl(var(--destructive))", "hsl(var(--primary))", "hsl(var(--destructive))"]
                } : {}}
                transition={{ duration: 0.6 }}
              >
                <Badge 
                  variant="destructive" 
                  className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold border-2 border-background"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </Badge>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Floating Price Display */}
      {showPrice && total > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <Badge variant="secondary" className="text-xs font-semibold">
              {formatPrice(total)}
            </Badge>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pulse effect for new items */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-full border-2 border-primary pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}