<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;

class NotificationService
{
    /**
     * Create a new notification.
     *
     * @param User $user
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array|null $data
     * @return Notification
     */
    public function createNotification(User $user, string $type, string $title, string $message, ?array $data = null): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'is_read' => false,
        ]);
    }
    
    /**
     * Create a notification for a new order.
     *
     * @param Order $order
     * @return void
     */
    public function notifyNewOrder(Order $order): void
    {
        // Notify the customer
        $this->createNotification(
            $order->user,
            'new_order',
            'Η παραγγελία σας καταχωρήθηκε',
            "Η παραγγελία σας #{$order->order_number} καταχωρήθηκε με επιτυχία και βρίσκεται σε επεξεργασία.",
            ['order_id' => $order->id]
        );
        
        // Notify the producers
        $producerIds = [];
        foreach ($order->items as $item) {
            $producerId = $item->product->producer_id;
            if (!in_array($producerId, $producerIds)) {
                $producerIds[] = $producerId;
                $producer = $item->product->producer->user;
                
                $this->createNotification(
                    $producer,
                    'new_order',
                    'Νέα παραγγελία',
                    "Έχετε μια νέα παραγγελία #{$order->order_number} που περιλαμβάνει προϊόντα σας.",
                    ['order_id' => $order->id]
                );
            }
        }
    }
    
    /**
     * Create a notification for an order status change.
     *
     * @param Order $order
     * @param string $oldStatus
     * @param string $newStatus
     * @return void
     */
    public function notifyOrderStatusChanged(Order $order, string $oldStatus, string $newStatus): void
    {
        // Get status text
        $statusText = $this->getStatusText($newStatus);
        
        // Notify the customer
        $this->createNotification(
            $order->user,
            'order_status_changed',
            'Η κατάσταση της παραγγελίας σας άλλαξε',
            "Η παραγγελία σας #{$order->order_number} είναι τώρα σε κατάσταση: {$statusText}.",
            [
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus
            ]
        );
        
        // If the status is 'shipped', notify the customer with shipping details
        if ($newStatus === 'shipped') {
            $this->createNotification(
                $order->user,
                'order_shipped',
                'Η παραγγελία σας απεστάλη',
                "Η παραγγελία σας #{$order->order_number} έχει αποσταλεί και θα παραδοθεί σύντομα.",
                ['order_id' => $order->id]
            );
        }
        
        // If the status is 'delivered', notify the customer
        if ($newStatus === 'delivered') {
            $this->createNotification(
                $order->user,
                'order_delivered',
                'Η παραγγελία σας παραδόθηκε',
                "Η παραγγελία σας #{$order->order_number} έχει παραδοθεί. Ευχαριστούμε για την προτίμησή σας!",
                ['order_id' => $order->id]
            );
        }
    }
    
    /**
     * Get the human-readable status text.
     *
     * @param string $status
     * @return string
     */
    private function getStatusText(string $status): string
    {
        switch ($status) {
            case 'pending':
                return 'Σε εκκρεμότητα';
            case 'processing':
                return 'Σε επεξεργασία';
            case 'shipped':
                return 'Απεστάλη';
            case 'delivered':
                return 'Παραδόθηκε';
            case 'cancelled':
                return 'Ακυρώθηκε';
            case 'refunded':
                return 'Επιστροφή χρημάτων';
            default:
                return $status;
        }
    }
    
    /**
     * Get unread notifications for a user.
     *
     * @param User $user
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUnreadNotifications(User $user, int $limit = 10)
    {
        return Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
    
    /**
     * Get all notifications for a user.
     *
     * @param User $user
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getAllNotifications(User $user, int $perPage = 15)
    {
        return Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
    
    /**
     * Mark a notification as read.
     *
     * @param Notification $notification
     * @return void
     */
    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }
    
    /**
     * Mark all notifications as read for a user.
     *
     * @param User $user
     * @return void
     */
    public function markAllAsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);
    }
}
