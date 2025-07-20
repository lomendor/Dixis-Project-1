<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The order instance.
     *
     * @var Order
     */
    protected $order;

    /**
     * Create a new notification instance.
     *
     * @param Order $order
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param mixed $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $statusText = $this->getStatusText();
        
        return (new MailMessage)
            ->subject("Η παραγγελία σας #{$this->order->order_number} {$statusText}")
            ->greeting("Γεια σας {$notifiable->name},")
            ->line("Η παραγγελία σας #{$this->order->order_number} {$statusText}.")
            ->line("Κατάσταση παραγγελίας: {$this->order->status}")
            ->line("Κατάσταση πληρωμής: {$this->order->payment_status}")
            ->action('Προβολή Παραγγελίας', url("/account/orders/{$this->order->id}"))
            ->line('Ευχαριστούμε που επιλέξατε το Dixis!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->order->status,
            'payment_status' => $this->order->payment_status,
            'message' => $this->getStatusText(),
        ];
    }

    /**
     * Get the status text based on the order status.
     *
     * @return string
     */
    protected function getStatusText()
    {
        if ($this->order->payment_status === 'paid') {
            return 'έχει πληρωθεί και είναι σε επεξεργασία';
        }

        switch ($this->order->status) {
            case 'pending':
                return 'είναι σε εκκρεμότητα';
            case 'processing':
                return 'είναι σε επεξεργασία';
            case 'shipped':
                return 'έχει αποσταλεί';
            case 'delivered':
                return 'έχει παραδοθεί';
            case 'cancelled':
                return 'έχει ακυρωθεί';
            default:
                return 'έχει ενημερωθεί';
        }
    }
}
