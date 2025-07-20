<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The order instance.
     *
     * @var \App\Models\Order
     */
    protected $order;

    /**
     * Create a new notification instance.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $statusLabels = [
            'pending' => 'Σε εκκρεμότητα',
            'processing' => 'Σε επεξεργασία',
            'shipped' => 'Απεστάλη',
            'delivered' => 'Παραδόθηκε',
            'cancelled' => 'Ακυρώθηκε',
        ];

        $statusLabel = $statusLabels[$this->order->status] ?? $this->order->status;
        $orderUrl = url('/account/orders/' . $this->order->id);

        return (new MailMessage)
            ->subject('Η κατάσταση της παραγγελίας σας άλλαξε')
            ->greeting('Γεια σας ' . $notifiable->name . ',')
            ->line('Η κατάσταση της παραγγελίας σας #' . $this->order->order_number . ' άλλαξε σε "' . $statusLabel . '".')
            ->action('Προβολή Παραγγελίας', $orderUrl)
            ->line('Ευχαριστούμε που επιλέξατε την Dixis!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->order->status,
            'message' => 'Η κατάσταση της παραγγελίας σας #' . $this->order->order_number . ' άλλαξε σε "' . $this->order->status . '".',
        ];
    }
}
