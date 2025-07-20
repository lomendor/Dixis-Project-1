<?php

namespace App\Listeners;

use App\Events\OrderStatusChanged;
use App\Notifications\OrderShipped;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendOrderStatusEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\OrderStatusChanged  $event
     * @return void
     */
    public function handle(OrderStatusChanged $event)
    {
        try {
            $order = $event->order;
            $oldStatus = $event->oldStatus;
            $newStatus = $event->newStatus;

            // Only send emails for significant status changes
            if (!$this->shouldSendEmail($oldStatus, $newStatus)) {
                return;
            }

            if (!$order->user) {
                Log::warning('Order has no user, skipping status email', [
                    'order_id' => $order->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus
                ]);
                return;
            }

            // Send specific notification based on new status
            $notification = $this->getNotificationForStatus($order, $newStatus);
            
            if ($notification) {
                $order->user->notify($notification);
                
                Log::info('Order status email sent', [
                    'order_id' => $order->id,
                    'user_id' => $order->user->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'notification_type' => get_class($notification)
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to send order status email', [
                'order_id' => $event->order->id,
                'old_status' => $event->oldStatus,
                'new_status' => $event->newStatus,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Determine if an email should be sent for this status change.
     *
     * @param  string  $oldStatus
     * @param  string  $newStatus
     * @return bool
     */
    private function shouldSendEmail($oldStatus, $newStatus)
    {
        // Don't send emails for these transitions
        $skipTransitions = [
            'pending' => ['confirmed'], // Confirmation is handled by OrderCreated event
            'confirmed' => ['processing'], // Internal status, not customer-facing
        ];

        if (isset($skipTransitions[$oldStatus]) && in_array($newStatus, $skipTransitions[$oldStatus])) {
            return false;
        }

        // Send emails for these important statuses
        $importantStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
        
        return in_array($newStatus, $importantStatuses);
    }

    /**
     * Get the appropriate notification for the status.
     *
     * @param  \App\Models\Order  $order
     * @param  string  $status
     * @return \Illuminate\Notifications\Notification|null
     */
    private function getNotificationForStatus($order, $status)
    {
        switch ($status) {
            case 'shipped':
                // Get tracking number from order metadata or shipping info
                $trackingNumber = $order->tracking_number ?? null;
                return new OrderShipped($order, $trackingNumber);
                
            case 'delivered':
            case 'cancelled':
            case 'refunded':
                return new OrderStatusUpdated($order);
                
            default:
                return null;
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  \App\Events\OrderStatusChanged  $event
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(OrderStatusChanged $event, $exception)
    {
        Log::error('Order status email job failed permanently', [
            'order_id' => $event->order->id,
            'old_status' => $event->oldStatus,
            'new_status' => $event->newStatus,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Could send admin notification here
        // Or add to a manual review queue
    }
}
