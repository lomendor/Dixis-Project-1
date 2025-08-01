import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { createApiResponse } from '@/lib/api/production';

// This endpoint will be called when a new order is created
// It sends notifications to relevant producers

interface OrderNotificationData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    producerId: string;
    producerEmail: string;
    producerName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderNotificationData = await request.json();

    // Validate required fields
    if (!orderData.orderId || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'VALIDATION_ERROR',
          message: 'Order ID and items are required',
        }),
        { status: 400 }
      );
    }

    // Group items by producer
    const producerOrders = new Map<string, {
      producerInfo: {
        id: string;
        email: string;
        name: string;
      };
      items: Array<any>;
      totalAmount: number;
    }>();

    orderData.items.forEach(item => {
      const producerId = item.producerId;
      
      if (!producerOrders.has(producerId)) {
        producerOrders.set(producerId, {
          producerInfo: {
            id: item.producerId,
            email: item.producerEmail,
            name: item.producerName,
          },
          items: [],
          totalAmount: 0
        });
      }

      const producerOrder = producerOrders.get(producerId)!;
      producerOrder.items.push(item);
      producerOrder.totalAmount += item.totalPrice;
    });

    const notificationResults = [];

    // Send notifications to each producer
    for (const [producerId, producerOrder] of producerOrders) {
      try {
        // 1. Send email notification
        const emailResult = await sendProducerEmailNotification({
          orderData,
          producerOrder,
        });

        // 2. Create in-app notification
        const dashboardResult = await createDashboardNotification({
          producerId,
          orderData,
          producerOrder,
        });

        // 3. Send SMS for high-value orders (optional)
        let smsResult = null;
        if (producerOrder.totalAmount > 100) {
          smsResult = await sendSMSNotification({
            producerPhone: '+30 123 456 789', // Would come from producer profile
            orderData,
            producerOrder,
          });
        }

        notificationResults.push({
          producerId,
          producerName: producerOrder.producerInfo.name,
          email: emailResult,
          dashboard: dashboardResult,
          sms: smsResult,
          orderValue: producerOrder.totalAmount,
        });

        logger.info('Producer notifications sent', {
          orderId: orderData.orderId,
          producerId,
          totalAmount: producerOrder.totalAmount,
          itemCount: producerOrder.items.length,
        });

      } catch (error) {
        logger.error('Failed to send producer notification', error instanceof Error ? error : new Error(String(error)), {
          orderId: orderData.orderId,
          producerId,
        });

        notificationResults.push({
          producerId,
          producerName: producerOrder.producerInfo.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          orderValue: producerOrder.totalAmount,
        });
      }
    }

    const response = createApiResponse({
      orderId: orderData.orderId,
      notificationsSent: notificationResults.length,
      results: notificationResults,
      summary: {
        totalProducers: producerOrders.size,
        totalOrderValue: orderData.totalAmount,
        successfulNotifications: notificationResults.filter(r => !r.error).length,
      }
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    logger.error('Order notification processing failed:', error instanceof Error ? error : new Error(String(error)));

    const response = createApiResponse(undefined, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to process order notifications',
    });

    return NextResponse.json(response, { status: 500 });
  }
}

// Email notification function
async function sendProducerEmailNotification({ orderData, producerOrder }: {
  orderData: OrderNotificationData;
  producerOrder: any;
}): Promise<{ success: boolean; message: string }> {
  try {
    // In production, this would use a real email service like SendGrid, Mailgun, etc.
    // For now, we'll simulate the email and log it

    const emailContent = generateProducerEmailContent(orderData, producerOrder);
    
    // Simulate email sending
    console.log('📧 EMAIL TO PRODUCER:', producerOrder.producerInfo.email);
    console.log('Subject: 🎉 Νέα Παραγγελία στο Dixis!');
    console.log('Content Preview:', emailContent.substring(0, 200) + '...');

    // In production:
    // await emailService.send({
    //   to: producerOrder.producerInfo.email,
    //   subject: '🎉 Νέα Παραγγελία στο Dixis!',
    //   html: emailContent,
    // });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Email sending failed' };
  }
}

// Dashboard notification function
async function createDashboardNotification({ producerId, orderData, producerOrder }: {
  producerId: string;
  orderData: OrderNotificationData;
  producerOrder: any;
}): Promise<{ success: boolean; message: string }> {
  try {
    // Store notification in database/cache for dashboard display
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      producerId,
      type: 'new_order',
      title: 'Νέα Παραγγελία!',
      message: `Νέα παραγγελία ${orderData.orderNumber} - €${producerOrder.totalAmount.toFixed(2)}`,
      data: {
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        totalAmount: producerOrder.totalAmount,
        itemCount: producerOrder.items.length,
      },
      createdAt: new Date().toISOString(),
      read: false,
      urgent: producerOrder.totalAmount > 50, // Orders over €50 are urgent
    };

    // In production, store in database:
    // await db.notifications.create(notification);
    
    console.log('🔔 DASHBOARD NOTIFICATION FOR PRODUCER:', producerId);
    console.log('Notification:', notification);

    return { success: true, message: 'Dashboard notification created' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Dashboard notification failed' };
  }
}

// SMS notification function (for high-value orders)
async function sendSMSNotification({ producerPhone, orderData, producerOrder }: {
  producerPhone: string;
  orderData: OrderNotificationData;
  producerOrder: any;
}): Promise<{ success: boolean; message: string }> {
  try {
    const smsMessage = `🎉 Dixis: Νέα παραγγελία ${orderData.orderNumber} αξίας €${producerOrder.totalAmount.toFixed(2)}! Δείτε λεπτομέρειες στο dashboard σας.`;
    
    // In production, use SMS service like Twilio:
    // await smsService.send({
    //   to: producerPhone,
    //   message: smsMessage,
    // });

    console.log('📱 SMS TO PRODUCER:', producerPhone);
    console.log('Message:', smsMessage);

    return { success: true, message: 'SMS sent successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'SMS sending failed' };
  }
}

// Generate email content for producers
function generateProducerEmailContent(orderData: OrderNotificationData, producerOrder: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Νέα Παραγγελία - Dixis</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Νέα Παραγγελία!</h1>
        <p style="margin: 10px 0 0; font-size: 18px;">Συγχαρητήρια ${producerOrder.producerInfo.name}!</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Στοιχεία Παραγγελίας</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Αριθμός Παραγγελίας:</td>
            <td style="padding: 8px 0;">${orderData.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Πελάτης:</td>
            <td style="padding: 8px 0;">${orderData.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Ημερομηνία:</td>
            <td style="padding: 8px 0;">${new Date(orderData.createdAt).toLocaleDateString('el-GR')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Σύνολο για εσάς:</td>
            <td style="padding: 8px 0; color: #16a34a; font-weight: bold; font-size: 18px;">€${producerOrder.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-top: 0;">Προϊόντα σας:</h3>
        ${producerOrder.items.map((item: any) => `
          <div style="border-bottom: 1px solid #f3f4f6; padding: 12px 0;">
            <div style="font-weight: bold; color: #1f2937;">${item.productName}</div>
            <div style="color: #6b7280; margin-top: 4px;">
              Ποσότητα: ${item.quantity} × €${item.unitPrice.toFixed(2)} = €${item.totalPrice.toFixed(2)}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #92400e; margin-top: 0;">⏰ Επόμενα Βήματα</h3>
        <ul style="color: #92400e; margin: 0; padding-left: 20px;">
          <li>Επιβεβαιώστε τη διαθεσιμότητα των προϊόντων εντός 4 ωρών</li>
          <li>Προετοιμάστε την παραγγελία για αποστολή</li>
          <li>Ενημερώστε τον κωδικό παρακολούθησης όταν αποστείλετε</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/producer/orders/${orderData.orderId}" 
           style="background: #16a34a; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Δείτε την Παραγγελία
        </a>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Χρειάζεστε βοήθεια; Επικοινωνήστε μαζί μας στο producers@dixis.io ή 210 123 4567</p>
        <p style="margin: 5px 0 0;">© 2025 Dixis Fresh - Marketplace Ελληνικών Προϊόντων</p>
      </div>
    </body>
    </html>
  `;
}