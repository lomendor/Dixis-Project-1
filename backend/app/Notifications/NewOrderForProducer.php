<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderForProducer extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The order instance.
     *
     * @var \App\Models\Order
     */
    protected $order;

    /**
     * The producer's items in this order.
     *
     * @var \Illuminate\Support\Collection
     */
    protected $producerItems;

    /**
     * Create a new notification instance.
     *
     * @param  \App\Models\Order  $order
     * @param  \Illuminate\Support\Collection  $producerItems
     * @return void
     */
    public function __construct(Order $order, $producerItems)
    {
        $this->order = $order;
        $this->producerItems = $producerItems;
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
        $orderUrl = url('/producer/orders/' . $this->order->id);
        $totalAmount = $this->producerItems->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });
        $totalItems = $this->producerItems->sum('quantity');

        $message = (new MailMessage)
            ->subject('Νέα Παραγγελία #' . $this->order->order_number)
            ->greeting('Γεια σας ' . $notifiable->name . ',')
            ->line('Έχετε λάβει μια νέα παραγγελία για τα προϊόντα σας!')
            ->line('**Στοιχεία Παραγγελίας:**')
            ->line('Αριθμός Παραγγελίας: #' . $this->order->order_number)
            ->line('Ημερομηνία: ' . $this->order->created_at->format('d/m/Y H:i'))
            ->line('Πελάτης: ' . $this->order->user->name)
            ->line('Συνολικά Προϊόντα: ' . $totalItems . ' τεμάχια')
            ->line('Συνολική Αξία: €' . number_format($totalAmount, 2))
            ->line('')
            ->line('**Προϊόντα που παραγγέλθηκαν:**');

        foreach ($this->producerItems as $item) {
            $message->line('• ' . $item->product->name . ' - Ποσότητα: ' . $item->quantity . ' - €' . number_format($item->unit_price * $item->quantity, 2));
        }

        $message->line('')
               ->line('**Διεύθυνση Αποστολής:**')
               ->line($this->order->shipping_address['first_name'] . ' ' . $this->order->shipping_address['last_name'])
               ->line($this->order->shipping_address['address'])
               ->line($this->order->shipping_address['city'] . ', ' . $this->order->shipping_address['postal_code'])
               ->line($this->order->shipping_address['country']);

        if (isset($this->order->shipping_address['phone'])) {
            $message->line('Τηλέφωνο: ' . $this->order->shipping_address['phone']);
        }

        $message->action('Προβολή Παραγγελίας', $orderUrl)
               ->line('Παρακαλούμε προετοιμάστε τα προϊόντα για αποστολή το συντομότερο δυνατό.')
               ->line('Μπορείτε να ενημερώσετε την κατάσταση της παραγγελίας από τον παραπάνω σύνδεσμο.')
               ->line('Ευχαριστούμε για τη συνεργασία!');

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
        $totalAmount = $this->producerItems->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });
        $totalItems = $this->producerItems->sum('quantity');

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $this->order->user->name,
            'total_items' => $totalItems,
            'total_amount' => $totalAmount,
            'created_at' => $this->order->created_at,
            'message' => 'Νέα παραγγελία #' . $this->order->order_number . ' με ' . $totalItems . ' προϊόντα.',
        ];
    }
}
