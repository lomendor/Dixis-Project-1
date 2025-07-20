'use client';

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, stringToContext, toError } from '@/lib/utils/errorUtils';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { isProductCartItem, isAdoptionCartItem } from '@/lib/api/models/cart/types';
import { useCreateOrder } from '@/lib/api/services/order/useOrders';
import { idToString } from '@/lib/api/client/apiTypes';
import {
  CreateOrderData,
  ShippingAddress,
  BillingAddress,
  ShippingMethod,
  PaymentMethod
} from '@/lib/api/models/order/types';
import CheckoutSteps from './CheckoutSteps';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import OrderSummary from './OrderSummary';
import {
  CheckIcon,
  TruckIcon,
  CreditCardIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

interface CheckoutProcessProps {
  className?: string;
}

export default function CheckoutProcess({ className = '' }: CheckoutProcessProps) {
  const router = useRouter();
  const { user, requireAuth } = useAuthStore();
  const { cart, clearCart } = useCartStore();

  const items = cart?.items || [];
  const total = cart?.total || 0;
  const createOrderMutation = useCreateOrder();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<Partial<ShippingAddress>>({});
  const [billingAddress, setBillingAddress] = useState<Partial<BillingAddress>>({});
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(ShippingMethod.STANDARD);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);
  const [paymentData, setPaymentData] = useState<any>({});
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [taxLoading, setTaxLoading] = useState<boolean>(false);

  // Require authentication
  useEffect(() => {
    if (!requireAuth()) {
      return;
    }
  }, [requireAuth]);

  // Check if cart is empty
  useEffect(() => {
    if (!items || items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Auto-fill user data if available
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setShippingAddress({
        firstName: defaultAddress.firstName,
        lastName: defaultAddress.lastName,
        company: defaultAddress.company,
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
        phone: defaultAddress.phone,
      });
    } else if (user) {
      setShippingAddress({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      });
    }
  }, [user]);

  // Update billing address when shipping changes
  useEffect(() => {
    if (useSameAddress) {
      setBillingAddress({
        ...shippingAddress,
        isBusinessAddress: false,
      });
    }
  }, [shippingAddress, useSameAddress]);

  // Calculate tax when items change
  useEffect(() => {
    const calculateTaxForItems = async () => {
      if (!items || items.length === 0) return;
      
      setTaxLoading(true);
      try {
        const calculatedTax = await calculateTax(items);
        setTaxAmount(calculatedTax);
      } catch (error) {
        logger.error('Failed to calculate tax', toError(error), errorToContext(error));
        // Fallback calculation
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTaxAmount(subtotal * 0.13);
      } finally {
        setTaxLoading(false);
      }
    };

    calculateTaxForItems();
  }, [items]);

  const steps = [
    {
      id: 1,
      name: 'Στοιχεία Αποστολής',
      icon: TruckIcon,
      description: 'Διεύθυνση παράδοσης',
    },
    {
      id: 2,
      name: 'Πληρωμή',
      icon: CreditCardIcon,
      description: 'Τρόπος πληρωμής',
    },
    {
      id: 3,
      name: 'Επιβεβαίωση',
      icon: DocumentCheckIcon,
      description: 'Έλεγχος παραγγελίας',
    },
  ];

  const calculateShippingCost = (method: ShippingMethod): number => {
    switch (method) {
      case ShippingMethod.STANDARD: return 5.00;
      case ShippingMethod.EXPRESS: return 10.00;
      case ShippingMethod.OVERNIGHT: return 20.00;
      case ShippingMethod.PICKUP: return 0.00;
      case ShippingMethod.SAME_DAY: return 15.00;
      default: return 5.00;
    }
  };

  const calculateTax = async (items: any[]): Promise<number> => {
    try {
      // Use the Greek tax calculation API
      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.productId || item.id,
            name: item?.product?.name || item.name || 'Προϊόν',
            price: item?.product?.price || item.price,
            quantity: item.quantity,
            category: item?.product?.category || 'Φρέσκα Λαχανικά',
            vatCategory: 'reduced' // Default for agricultural products
          })),
          isBusinessCustomer: false, // TODO: Add accountType to User interface
          customerCountry: 'GR'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.data.vatAmount;
      } else {
        // Fallback to simple calculation
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return subtotal * 0.13; // 13% reduced VAT for agricultural products
      }
    } catch (error) {
      logger.error('Tax calculation failed, using fallback', toError(error), errorToContext(error));
      // Fallback calculation
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return subtotal * 0.13; // 13% reduced VAT for agricultural products
    }
  };

  const shippingCost = calculateShippingCost(shippingMethod);
  const finalTotal = total + shippingCost + taxAmount;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          shippingAddress.firstName &&
          shippingAddress.lastName &&
          shippingAddress.addressLine1 &&
          shippingAddress.city &&
          shippingAddress.postalCode &&
          shippingAddress.country
        );
      case 2:
        if (paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
          return true;
        } else if (paymentMethod === PaymentMethod.CREDIT_CARD) {
          return paymentData.isValid && (paymentCompleted || paymentData.isCompleted);
        } else if (paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT) {
          return paymentData.isValid && (paymentCompleted || paymentData.isCompleted);
        }
        return false;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(currentStep) || !user) return;

    setIsProcessing(true);

    try {
      const orderData: CreateOrderData = {
        items: (items || []).map(item => {
          if (isProductCartItem(item)) {
            return {
              productId: item?.product?.id || item.productId,
              quantity: item.quantity,
              unitPrice: item?.product?.price || item.price,
            };
          } else if (isAdoptionCartItem(item)) {
            return {
              productId: item.adoptableItemId, // Use adoptable item ID for adoption orders
              quantity: item.quantity,
              unitPrice: item.price,
              // Could add adoption-specific fields here
              adoptionPlanId: item.adoptionPlanId,
              duration: item.duration,
            };
          } else {
            // Fallback for unknown types - cast to any to handle dynamic type
            const fallbackItem = item as any;
            return {
              productId: fallbackItem.id || fallbackItem.productId,
              quantity: fallbackItem.quantity || 1,
              unitPrice: fallbackItem.price || fallbackItem.unitPrice || 0,
            };
          }
        }),
        shippingAddress: shippingAddress as ShippingAddress,
        billingAddress: billingAddress as BillingAddress,
        shippingMethod,
        paymentMethod,
      };

      const order = await createOrderMutation.mutateAsync(orderData);
      setOrderId(parseInt(idToString(order.id)));

      // For credit card and SEPA, payment will be handled by Stripe
      // For cash on delivery, complete the order immediately
      if (paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
        // Generate and send invoice automatically
        await generateAndSendInvoice(parseInt(idToString(order.id)));
        
        // Clear cart after successful order
        clearCart();
        // Redirect to order confirmation
        router.push(`/orders/${order.id}/confirmation`);
      }
      // For credit card and SEPA, stay on payment step until payment is completed

    } catch (error) {
      logger.error('Order placement failed', toError(error), errorToContext(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAndSendInvoice = async (orderIdNumber: number) => {
    try {
      // Generate and send invoice automatically
      await fetch('/api/invoices/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderIdNumber,
          subject: 'Το τιμολόγιό σας από Dixis Fresh',
          customMessage: 'Ευχαριστούμε για την παραγγελία σας! Θα σας ενημερώσουμε για την πορεία της.'
        }),
      });
      
      logger.info('Invoice generated and sent automatically', { orderId: orderIdNumber });
    } catch (error) {
      logger.error('Failed to generate/send invoice automatically', toError(error), errorToContext(error));
      // Don't throw error - invoice generation shouldn't block order completion
    }
  };

  const handlePaymentSuccess = async (paymentResult: any) => {
    logger.info('Payment successful', { paymentResult });
    setPaymentCompleted(true);
    
    // Generate and send invoice automatically after successful payment
    if (orderId) {
      await generateAndSendInvoice(orderId);
    }
    
    // Clear cart after successful payment
    clearCart();

    // Redirect to order confirmation
    if (orderId) {
      router.push(`/orders/${orderId}/confirmation?payment=success`);
    }
  };

  const handlePaymentError = (error: string) => {
    logger.error('Payment error', stringToContext(error, 'error'));
    // Handle payment error (show error message, etc.)
    // For now, just log it - you might want to show a toast or alert
  };

  if (!user || !items || items.length === 0) {
    return null;
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ολοκλήρωση Παραγγελίας</h1>
        <p className="text-gray-600">Συμπληρώστε τα στοιχεία σας για να ολοκληρώσετε την παραγγελία</p>
      </div>

      {/* Steps */}
      <CheckoutSteps steps={steps} currentStep={currentStep} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <ShippingForm
                shippingAddress={shippingAddress}
                billingAddress={billingAddress}
                useSameAddress={useSameAddress}
                shippingMethod={shippingMethod}
                onShippingAddressChange={setShippingAddress}
                onBillingAddressChange={setBillingAddress}
                onUseSameAddressChange={setUseSameAddress}
                onShippingMethodChange={setShippingMethod}
              />
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <PaymentForm
                paymentMethod={paymentMethod}
                paymentData={paymentData}
                onPaymentMethodChange={setPaymentMethod}
                onPaymentDataChange={setPaymentData}
                orderId={orderId || undefined}
                total={finalTotal}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Επιβεβαίωση Παραγγελίας</h3>

                {/* Order Items */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Προϊόντα</h4>
                  <div className="space-y-3">
                    {(items || []).map((item) => {
                      const itemAny = item as any; // Cast to handle various item types
                      return (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <img
                              src={itemAny?.product?.imageUrl || itemAny?.product?.image || itemAny.image || '/placeholder-product.jpg'}
                              alt={itemAny?.product?.name || itemAny.productName || 'Product'}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{itemAny?.product?.name || itemAny.productName || 'Product'}</p>
                              <p className="text-sm text-gray-500">Ποσότητα: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium text-gray-900">
                            €{((itemAny?.product?.price || item.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Διεύθυνση Αποστολής</h4>
                    <div className="text-sm text-gray-600">
                      <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      <p>{shippingAddress.addressLine1}</p>
                      {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                      <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                      <p>{shippingAddress.country}</p>
                      {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Διεύθυνση Χρέωσης</h4>
                    <div className="text-sm text-gray-600">
                      {useSameAddress ? (
                        <p className="text-gray-500">Ίδια με τη διεύθυνση αποστολής</p>
                      ) : (
                        <>
                          <p>{billingAddress.firstName} {billingAddress.lastName}</p>
                          <p>{billingAddress.addressLine1}</p>
                          {billingAddress.addressLine2 && <p>{billingAddress.addressLine2}</p>}
                          <p>{billingAddress.city}, {billingAddress.postalCode}</p>
                          <p>{billingAddress.country}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Τρόπος Πληρωμής</h4>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === PaymentMethod.CREDIT_CARD && 'Πιστωτική Κάρτα'}
                    {paymentMethod === PaymentMethod.DEBIT_CARD && 'Χρεωστική Κάρτα'}
                    {paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT && 'Τραπεζικό Έμβασμα SEPA'}
                    {paymentMethod === PaymentMethod.PAYPAL && 'PayPal'}
                    {paymentMethod === PaymentMethod.CASH_ON_DELIVERY && 'Αντικαταβολή'}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`
                  px-6 py-2 border border-gray-300 rounded-md text-sm font-medium
                  ${currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                Προηγούμενο
              </button>

              {currentStep < steps.length ? (
                <button
                  onClick={currentStep === 2 && (paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT) && !orderId ? handlePlaceOrder : handleNextStep}
                  disabled={!validateStep(currentStep) || (currentStep === 2 && (paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT) && isProcessing)}
                  className={`
                    px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white
                    ${validateStep(currentStep) && !(currentStep === 2 && (paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT) && isProcessing)
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {currentStep === 2 && (paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT) && isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
                      Δημιουργία παραγγελίας...
                    </>
                  ) : currentStep === 2 && (paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT) && !orderId ? (
                    'Συνέχεια στην πληρωμή'
                  ) : paymentCompleted ? (
                    'Επόμενο'
                  ) : (
                    'Επόμενο'
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={!validateStep(currentStep) || isProcessing}
                  className={`
                    px-8 py-2 border border-transparent rounded-md text-sm font-medium text-white
                    ${validateStep(currentStep) && !isProcessing
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
                      Επεξεργασία...
                    </>
                  ) : (
                    'Ολοκλήρωση Παραγγελίας'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={items}
            subtotal={total}
            shippingCost={shippingCost}
            taxAmount={taxAmount}
            total={finalTotal}
            currency="EUR"
          />
        </div>
      </div>
    </div>
  );
}
