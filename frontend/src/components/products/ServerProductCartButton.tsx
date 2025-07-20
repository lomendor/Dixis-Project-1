'use client'

import ModernCartButton from '@/components/cart/ModernCartButton';

interface ServerProductCartButtonProps {
  productId: number;
  productName: string;
  price: number;
  maxQuantity: number;
}

export default function ServerProductCartButton({
  productId,
  productName,
  price,
  maxQuantity
}: ServerProductCartButtonProps) {
  return (
    <ModernCartButton
      productId={productId}
      productName={productName}
      price={price}
      maxQuantity={maxQuantity}
      variant="primary"
      size="md"
      className="w-full bg-green-600 hover:bg-green-700 text-white"
      showQuantityControls={true}
    />
  );
}