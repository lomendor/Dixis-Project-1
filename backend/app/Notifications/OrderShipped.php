<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderShipped extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The order instance.
     *
     * @var \App\Models\Order
     */
    protected $order;

    /**
     * The tracking number.
     *
     * @var string|null
     */
    protected $trackingNumber;

    /**
     * Create a new notification instance.
     *
     * @param  \App\Models\Order  $order
     * @param  string|null  $trackingNumber
     * @return void
     */
    public function __construct(Order $order, $trackingNumber = null)
    {
        $this->order = $order;
        $this->trackingNumber = $trackingNumber;
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
        $orderUrl = url('/orders/' . $this->order->id);
        $estimatedDelivery = $this->getEstimatedDeliveryDate();

        $message = (new MailMessage)
            ->subject('Η παραγγελία σας #' . $this->order->order_number . ' αποστάλθηκε!')
            ->greeting('Γεια σας ' . $notifiable->name . ',')
            ->line('Η παραγγελία σας έχει αποσταλεί και είναι καθ\' οδόν!')
            ->line('**Στοιχεία Αποστολής:**')
            ->line('Αριθμός Παραγγελίας: #' . $this->order->order_number)
            ->line('Ημερομηνία Αποστολής: ' . $this->order->shipped_at->format('d/m/Y H:i'))
            ->line('Εκτιμώμενη Παράδοση: ' . $estimatedDelivery);

        if ($this->trackingNumber) {
            $message->line('Αριθμός Παρακολούθησης: ' . $this->trackingNumber)
                   ->line('Μπορείτε να παρακολουθήσετε την αποστολή σας με τον παραπάνω αριθμό.');
        }

        $message->action('Προβολή Παραγγελίας', $orderUrl)
               ->line('Θα λάβετε ενημέρωση όταν η παραγγελία σας παραδοθεί.')
               ->line('Ευχαριστούμε που επιλέξατε την Dixis!');

        return $message;
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
            'tracking_number' => $this->trackingNumber,
            'shipped_at' => $this->order->shipped_at,
            'estimated_delivery' => $this->getEstimatedDeliveryDate(),
            'message' => 'Η παραγγελία σας #' . $this->order->order_number . ' αποστάλθηκε.',
        ];
    }

    /**
     * Get estimated delivery date based on shipping method.
     *
     * @return string
     */
    private function getEstimatedDeliveryDate()
    {
        $shippedAt = $this->order->shipped_at ?: now();
        
        $deliveryDays = match($this->order->shipping_method) {
            'express' => 2,
            'standard' => 5,
            'courier' => 1,
            default => 3,
        };

        // Add business days only (skip weekends)
        $estimatedDate = $shippedAt->copy();
        $addedDays = 0;
        
        while ($addedDays < $deliveryDays) {
            $estimatedDate->addDay();
            
            // Skip weekends
            if ($estimatedDate->isWeekday()) {
                $addedDays++;
            }
        }

        return $estimatedDate->format('d/m/Y');
    }
}
