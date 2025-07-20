/**
 * Order Management System Types
 */

import { ID } from '../../client/apiTypes';
import { User } from '../auth/types';
import { Product } from '../product/types';

/**
 * Order status enumeration
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

/**
 * Payment status enumeration
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Payment method enumeration
 */
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  SEPA_DIRECT_DEBIT = 'sepa_direct_debit',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

/**
 * Shipping method enumeration
 */
export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  PICKUP = 'pickup',
  SAME_DAY = 'same_day',
}

/**
 * Order item interface
 */
export interface OrderItem {
  id: ID;
  orderId: ID;
  productId: ID;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  customizations?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shipping address interface
 */
export interface ShippingAddress {
  id?: ID;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  address?: string; // Compatibility property
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  instructions?: string;
}

/**
 * Billing address interface
 */
export interface BillingAddress extends ShippingAddress {
  isBusinessAddress: boolean;
  taxId?: string;
  vatNumber?: string;
}

/**
 * Order totals interface
 */
export interface OrderTotals {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
}

/**
 * Order tracking information
 */
export interface OrderTracking {
  id: ID;
  orderId: ID;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Tracking event interface
 */
export interface TrackingEvent {
  id: ID;
  timestamp: string;
  status: string;
  description: string;
  location?: string;
  carrier?: string;
}

/**
 * Payment information interface
 */
export interface PaymentInfo {
  id: ID;
  orderId: ID;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Main Order interface
 */
export interface Order {
  id: ID;
  orderNumber: string;
  userId: ID;
  user?: User;
  
  // Order items
  items: OrderItem[];
  
  // Addresses
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  
  // Shipping & delivery
  shippingMethod: ShippingMethod;
  shippingCost: number;
  estimatedDelivery?: string;
  actualDelivery?: string;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentInfo?: PaymentInfo;
  
  // Totals
  totals: OrderTotals;

  // Compatibility properties (aliases for totals)
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;

  // Status & tracking
  status: OrderStatus;
  tracking?: OrderTracking;
  
  // Metadata
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  
  // Timestamps
  placedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order creation data
 */
export interface CreateOrderData {
  items: Array<{
    productId: ID;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
  shippingAddress: Omit<ShippingAddress, 'id'>;
  billingAddress: Omit<BillingAddress, 'id'>;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string;
}

/**
 * Order update data
 */
export interface UpdateOrderData {
  status?: OrderStatus;
  shippingAddress?: Partial<ShippingAddress>;
  billingAddress?: Partial<BillingAddress>;
  shippingMethod?: ShippingMethod;
  notes?: string;
  internalNotes?: string;
  tags?: string[];
}

/**
 * Order filters for listing
 */
export interface OrderFilters {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  paymentMethod?: PaymentMethod[];
  shippingMethod?: ShippingMethod[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  userId?: ID;
  producerId?: ID;
}

/**
 * Order statistics
 */
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentStatus: Record<PaymentStatus, number>;
  recentOrders: Order[];
  topProducts: Array<{
    product: Product;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

/**
 * Checkout session data
 */
export interface CheckoutSession {
  id: ID;
  userId?: ID;
  items: Array<{
    productId: ID;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress?: Partial<ShippingAddress>;
  billingAddress?: Partial<BillingAddress>;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
  couponCode?: string;
  totals?: Partial<OrderTotals>;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order notification types
 */
export enum OrderNotificationType {
  ORDER_PLACED = 'order_placed',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
}

/**
 * Order notification interface
 */
export interface OrderNotification {
  id: ID;
  orderId: ID;
  userId: ID;
  type: OrderNotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
}

/**
 * Refund information
 */
export interface RefundInfo {
  id: ID;
  orderId: ID;
  paymentId: ID;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  refundMethod: PaymentMethod;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order invoice interface
 */
export interface OrderInvoice {
  id: ID;
  orderId: ID;
  invoiceNumber: string;
  issuedAt: string;
  dueAt?: string;
  paidAt?: string;
  amount: number;
  currency: string;
  taxAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}
