import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock recent orders data
    const mockData = {
      recent_orders: [
        {
          id: '1',
          order_number: 'ORD-2024-001',
          created_at: '2024-01-15T10:30:00Z',
          status: 'delivered',
          total_amount: 125.50,
          items_count: 8,
          supplier_name: 'Ελαιώνες Καλαμάτας'
        },
        {
          id: '2',
          order_number: 'ORD-2024-002',
          created_at: '2024-01-14T14:20:00Z',
          status: 'shipped',
          total_amount: 89.30,
          items_count: 5,
          supplier_name: 'Μελισσοκομείο Βλάχος'
        },
        {
          id: '3',
          order_number: 'ORD-2024-003',
          created_at: '2024-01-13T09:15:00Z',
          status: 'processing',
          total_amount: 156.75,
          items_count: 12,
          supplier_name: 'Τυροκομείο Ζήση'
        }
      ]
    };
    
    return NextResponse.json(mockData);
    
  } catch (error) {
    logger.error('B2B Recent Orders API Error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ recent_orders: [] });
  }
}