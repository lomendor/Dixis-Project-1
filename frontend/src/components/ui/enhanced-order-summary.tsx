'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  Receipt,
  Gift,
  AlertCircle,
  Check,
  Percent,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  slug?: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
  producer?: {
    id: string;
    name: string;
  };
  isOrganic?: boolean;
  weight?: number;
}

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description?: string;
}

interface EnhancedOrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  shippingCost?: number;
  taxAmount?: number;
  total: number;
  currency?: string;
  promoCode?: PromoCode;
  estimatedDelivery?: string;
  freeShippingThreshold?: number;
  onPromoCodeApply?: (code: string) => void;
  onPromoCodeRemove?: () => void;
  className?: string;
  isCollapsible?: boolean;
}

const OrderItemRow = ({ item }: { item: OrderItem }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-3"
    >
      <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        
        {item.quantity > 1 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {item.quantity}
          </Badge>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2 mb-1">
          {item.productName}
        </h4>
        
        <div className="flex items-center gap-2 mb-1">
          {item.producer && (
            <span className="text-xs text-muted-foreground">
              {item.producer.name}
            </span>
          )}
          {item.isOrganic && (
            <Badge variant="success" className="text-xs">
              ΒΙΟ
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatPrice(item.price)} × {item.quantity}
          </span>
          <span className="font-semibold text-sm">
            {formatPrice(item.subtotal)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const PromoCodeSection = ({ 
  promoCode, 
  onApply, 
  onRemove 
}: { 
  promoCode?: PromoCode;
  onApply?: (code: string) => void;
  onRemove?: () => void;
}) => {
  const [code, setCode] = React.useState('');
  const [isApplying, setIsApplying] = React.useState(false);

  const handleApply = async () => {
    if (!code.trim() || !onApply) return;
    
    setIsApplying(true);
    try {
      await onApply(code.trim().toUpperCase());
      setCode('');
    } catch (error) {
      logger.error('Error applying promo code:', toError(error), errorToContext(error));
    } finally {
      setIsApplying(false);
    }
  };

  if (promoCode) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="p-3 bg-green-50 border border-green-200 rounded-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {promoCode.code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-green-700">
              -{promoCode.type === 'percentage' ? `${promoCode.discount}%` : formatPrice(promoCode.discount)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
            >
              ×
            </Button>
          </div>
        </div>
        {promoCode.description && (
          <p className="text-xs text-green-600 mt-1">
            {promoCode.description}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Κωδικός έκπτωσης"
        className="flex-1 h-9 px-3 border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleApply();
          }
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleApply}
        disabled={!code.trim() || isApplying}
        className="px-3"
      >
        {isApplying ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-3 h-3 border border-current border-t-transparent rounded-full"
          />
        ) : (
          <Percent className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};

const FreeShippingProgress = ({ 
  current, 
  threshold, 
  currency = 'EUR' 
}: { 
  current: number;
  threshold: number;
  currency?: string;
}) => {
  const remaining = Math.max(0, threshold - current);
  const progress = Math.min((current / threshold) * 100, 100);

  if (remaining === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-3 bg-green-50 border border-green-200 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            Κερδίσατε δωρεάν αποστολή!
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Truck className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">
          Προσθέστε {formatPrice(remaining, currency)} για δωρεάν αποστολή
        </span>
      </div>
      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-blue-500 rounded-full"
        />
      </div>
    </div>
  );
};

export function EnhancedOrderSummary({
  items,
  subtotal,
  shippingCost = 0,
  taxAmount = 0,
  total,
  currency = 'EUR',
  promoCode,
  estimatedDelivery,
  freeShippingThreshold,
  onPromoCodeApply,
  onPromoCodeRemove,
  className,
  isCollapsible = false
}: EnhancedOrderSummaryProps) {
  const [isExpanded, setIsExpanded] = React.useState(!isCollapsible);

  const discountAmount = promoCode 
    ? promoCode.type === 'percentage' 
      ? (subtotal * promoCode.discount) / 100
      : promoCode.discount
    : 0;

  const finalSubtotal = subtotal - discountAmount;

  return (
    <Card className={cn("sticky top-4", className)}>
      <CardHeader 
        className={cn(
          "pb-3",
          isCollapsible && "cursor-pointer"
        )}
        onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            <span>Σύνοψη Παραγγελίας</span>
          </div>
          <Badge variant="secondary">
            {items.length} {items.length === 1 ? 'προϊόν' : 'προϊόντα'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={isCollapsible ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-4">
              {/* Items List */}
              <div className="space-y-0 max-h-64 overflow-y-auto">
                {items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <OrderItemRow item={item} />
                    {index < items.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
              </div>

              <Separator />

              {/* Promo Code Section */}
              {(onPromoCodeApply || promoCode) && (
                <div className="space-y-2">
                  <PromoCodeSection
                    promoCode={promoCode}
                    onApply={onPromoCodeApply}
                    onRemove={onPromoCodeRemove}
                  />
                </div>
              )}

              {/* Free Shipping Progress */}
              {freeShippingThreshold && shippingCost > 0 && (
                <FreeShippingProgress
                  current={subtotal}
                  threshold={freeShippingThreshold}
                  currency={currency}
                />
              )}

              <Separator />

              {/* Cost Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Υποσύνολο</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Έκπτωση ({promoCode?.code})</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    <span>Αποστολή</span>
                  </div>
                  <span>
                    {shippingCost === 0 ? (
                      <Badge variant="success" className="text-xs">
                        Δωρεάν
                      </Badge>
                    ) : (
                      formatPrice(shippingCost, currency)
                    )}
                  </span>
                </div>

                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>ΦΠΑ (24%)</span>
                    <span>{formatPrice(taxAmount, currency)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Σύνολο</span>
                  <span className="text-primary">
                    {formatPrice(total, currency)}
                  </span>
                </div>
              </div>

              {/* Delivery Estimate */}
              {estimatedDelivery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Εκτιμώμενη Παράδοση</p>
                    <p className="text-xs text-muted-foreground">{estimatedDelivery}</p>
                  </div>
                </motion.div>
              )}

              {/* Security Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 p-2 bg-green-50/50 rounded-lg"
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-xs text-green-700">
                  Ασφαλής πληρωμή με κρυπτογράφηση SSL
                </span>
              </motion.div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}