import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock B2B dashboard stats
    const stats = {
      totalOrders: 47,
      totalSpent: 2847.50,
      pendingOrders: 3,
      averageOrderValue: 60.59,
      recentOrders: [
        {
          id: 'ORD-2024-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 125.50,
          supplier: 'Ελαιώνες Καλαμάτας',
          items: 8
        },
        {
          id: 'ORD-2024-002',
          date: '2024-01-14',
          status: 'shipped',
          total: 89.30,
          supplier: 'Μελισσοκομείο Βλάχος',
          items: 5
        },
        {
          id: 'ORD-2024-003',
          date: '2024-01-13',
          status: 'processing',
          total: 156.80,
          supplier: 'Τυροκομείο Ζήση',
          items: 12
        }
      ]
    };

    return NextResponse.json(stats);

  } catch (error) {
    logger.error('B2B Dashboard Stats API Error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Σφάλμα φόρτωσης στατιστικών' },
      { status: 500 }
    );
  }
}