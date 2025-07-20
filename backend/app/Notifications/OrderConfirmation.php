<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmation extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('Επιβεβαίωση Παραγγελίας #' . $this->order->order_number)
            ->markdown('emails.order-confirmation', [
                'order' => $this->order,
                'user' => $notifiable,
                'paymentMethod' => $this->getPaymentMethodText(),
                'shippingMethod' => $this->getShippingMethodText(),
            ]);
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
            'total_amount' => $this->order->total_amount,
            'status' => $this->order->status,
            'message' => 'Η παραγγελία σας #' . $this->order->order_number . ' έχει επιβεβαιωθεί.',
        ];
    }

    /**
     * Get payment method text in Greek.
     *
     * @return string
     */
    private function getPaymentMethodText()
    {
        $methods = [
            'credit_card' => 'Πιστωτική Κάρτα',
            'cash_on_delivery' => 'Αντικαταβολή',
            'bank_transfer' => 'Τραπεζική Μεταφορά',
            'paypal' => 'PayPal',
        ];

        return $methods[$this->order->payment_method] ?? $this->order->payment_method;
    }

    /**
     * Get shipping method text in Greek.
     *
     * @return string
     */
    private function getShippingMethodText()
    {
        $methods = [
            'standard' => 'Κανονική Αποστολή (3-5 εργάσιμες ημέρες)',
            'express' => 'Ταχεία Αποστολή (1-2 εργάσιμες ημέρες)',
            'pickup' => 'Παραλαβή από κατάστημα',
            'courier' => 'Courier',
        ];

        return $methods[$this->order->shipping_method] ?? $this->order->shipping_method;
    }
}
