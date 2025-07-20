'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  CreditCard,
  Eye,
  X,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useCartDrawer, useCartSummary, useCartActions } from "@/stores/cartStore";
import { cn, formatPrice } from "@/lib/utils";
import { CartItem, isProductCartItem, isAdoptionCartItem } from "@/lib/api/models/cart/types";
import { idToString } from "@/lib/api/client/apiTypes";

interface EnhancedCartDrawerProps {
  className?: string;
}

export function EnhancedCartDrawer({ className }: EnhancedCartDrawerProps) {
  const cartStore = useCartStore();
  const { cart, isLoading, lastAddedItem } = cartStore;

  const { isOpen, close } = useCartDrawer();
  const { itemCount, subtotal, total, currency } = useCartSummary();
  const { updateQuantity, removeFromCart, clearCart } = useCartActions();

  const [removingItems, setRemovingItems] = React.useState<Set<string>>(new Set());

  // Handle quantity update with optimistic UI
  const handleUpdateQuantity = React.useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      logger.error('Error updating quantity:', toError(error), errorToContext(error));
    }
  }, [updateQuantity]);

  // Handle item removal with animation
  const handleRemoveItem = React.useCallback(async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    
    try {
      await removeFromCart(itemId);
    } catch (error) {
      logger.error('Error removing item:', toError(error), errorToContext(error));
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [removeFromCart]);

  // Handle clear cart
  const handleClearCart = React.useCallback(async () => {
    try {
      await clearCart();
    } catch (error) {
      logger.error('Error clearing cart:', toError(error), errorToContext(error));
    }
  }, [clearCart]);

  // Format price helper
  const formatPriceValue = React.useCallback((price: number) => {
    return formatPrice(price, currency);
  }, [currency]);

  // Empty cart state
  const EmptyCartState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <div className="absolute -top-1 -right-1">
          <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs text-muted-foreground">0</span>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Το καλάθι σας είναι άδειο</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Ανακαλύψτε υπέροχα ελληνικά προϊόντα και ξεκινήστε τις αγορές σας!
      </p>
      
      <Button asChild onClick={close}>
        <Link href="/products">
          <Sparkles className="mr-2 h-4 w-4" />
          Εξερευνήστε Προϊόντα
        </Link>
      </Button>
    </div>
  );

  // Cart item component
  const CartItemComponent = ({ item }: { item: CartItem }) => {
    const itemId = idToString(item.id);
    const isRemoving = removingItems.has(itemId);
    const isLastAdded = lastAddedItem?.id === item.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: 20 }}
        animate={{ 
          opacity: isRemoving ? 0 : 1, 
          x: isRemoving ? -20 : 0,
          scale: isLastAdded ? [1, 1.02, 1] : 1
        }}
        exit={{ opacity: 0, x: -20, height: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex gap-4 py-4",
          isRemoving && "pointer-events-none"
        )}
      >
        {/* Product Image */}
        <div className="relative">
          <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted border">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.productName}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {isLastAdded && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="absolute -top-1 -right-1"
            >
              <Badge variant="success" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                <Plus className="h-3 w-3" />
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <Link
              href={isProductCartItem(item) ? `/products/${item.slug}` : isAdoptionCartItem(item) ? `/adoptions/${item.slug}` : '#'}
              onClick={close}
              className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
            >
              {item.productName}
              {isAdoptionCartItem(item) && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  🌿 {item.duration}μ
                </Badge>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive ml-2 flex-shrink-0"
              onClick={() => handleRemoveItem(itemId)}
              disabled={isLoading || isRemoving}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* Producer */}
          {isProductCartItem(item) && item?.product?.producer?.name && (
            <p className="text-xs text-muted-foreground mb-2">
              από {item.product.producer.name}
            </p>
          )}
          {isAdoptionCartItem(item) && item.producer && (
            <p className="text-xs text-muted-foreground mb-2">
              από {item.producer}
            </p>
          )}
          {item.producer && !isProductCartItem(item) && !isAdoptionCartItem(item) && (
            <p className="text-xs text-muted-foreground mb-2">
              από {item.producer}
            </p>
          )}

          {/* Price and Quantity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                disabled={isLoading || isRemoving}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {item.quantity}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                disabled={isLoading || isRemoving}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="text-right">
              <p className="font-semibold text-sm">
                {formatPriceValue(item.subtotal)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatPriceValue(item.price)} / τεμ.
              </p>
            </div>
          </div>

          {/* Stock Warning */}
          {isProductCartItem(item) && 
           item.product && 
           'stock_quantity' in item.product && 
           typeof item.product.stock_quantity === 'number' && 
           item.product.stock_quantity < item.quantity && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2"
            >
              <Badge variant="warning" className="text-xs">
                Περιορισμένο απόθεμα: {item.product && 'stock_quantity' in item.product && typeof item.product.stock_quantity === 'number' ? item.product.stock_quantity : 0} διαθέσιμα
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent 
        side="right" 
        className={cn("w-full sm:max-w-lg flex flex-col", className)}
      >
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Καλάθι Αγορών
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {itemCount} {itemCount === 1 ? 'προϊόν' : 'προϊόντα'}
              </Badge>
            )}
          </SheetTitle>
          {itemCount > 0 && (
            <SheetDescription>
              {itemCount} {itemCount === 1 ? 'προϊόν' : 'προϊόντα'} στο καλάθι σας
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Cart Content */}
        <div className="flex-1 overflow-hidden">
          {!cart || !cart.items || cart.items.length === 0 ? (
            <EmptyCartState />
          ) : (
            <div className="h-full overflow-y-auto pr-2">
              <div className="space-y-0">
                <AnimatePresence mode="popLayout">
                  {cart.items.map((item, index) => (
                    <React.Fragment key={idToString(item.id)}>
                      <CartItemComponent item={item} />
                      {index < cart.items.length - 1 && (
                        <Separator className="my-0" />
                      )}
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Totals and Actions */}
        {cart && cart.items && cart.items.length > 0 && (
          <SheetFooter className="flex-col space-y-4 pt-4 border-t">
            {/* Clear Cart Option */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                disabled={isLoading}
                className="text-muted-foreground hover:text-destructive h-8"
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Άδειασμα καλαθιού
              </Button>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Υποσύνολο</span>
                <span>{formatPriceValue(subtotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Σύνολο</span>
                <span className="text-primary">{formatPriceValue(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Τα έξοδα αποστολής θα υπολογιστούν στο checkout
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout" onClick={close}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Ολοκλήρωση Παραγγελίας
                </Link>
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild onClick={close}>
                  <Link href="/cart">
                    <Eye className="mr-2 h-3 w-3" />
                    Καλάθι
                  </Link>
                </Button>
                <Button variant="outline" onClick={close}>
                  <Sparkles className="mr-2 h-3 w-3" />
                  Συνέχεια
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}