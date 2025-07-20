<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailed extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The payment instance.
     *
     * @var Payment
     */
    protected $payment;

    /**
     * Create a new notification instance.
     *
     * @param Payment $payment
     * @return void
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
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
        $amount = number_format($this->payment->amount, 2) . ' ' . $this->payment->currency;
        $errorDetails = isset($this->payment->details['error']) ? $this->payment->details['error']['message'] : 'Άγνωστο σφάλμα';

        return (new MailMessage)
            ->subject('Αποτυχία Πληρωμής')
            ->greeting('Γεια σας!')
            ->line('Δυστυχώς, η πληρωμή σας απέτυχε.')
            ->line('Λεπτομέρειες πληρωμής:')
            ->line('- Ποσό: ' . $amount)
            ->line('- Ημερομηνία: ' . $this->payment->payment_date->format('d/m/Y H:i'))
            ->line('- Αιτία αποτυχίας: ' . $errorDetails)
            ->line('Παρακαλούμε ελέγξτε τα στοιχεία της κάρτας σας και προσπαθήστε ξανά.')
            ->action('Προσπαθήστε Ξανά', url('/account/payments'))
            ->line('Αν συνεχίσετε να αντιμετωπίζετε προβλήματα, παρακαλούμε επικοινωνήστε με την υποστήριξη πελατών.');
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
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'currency' => $this->payment->currency,
            'payment_date' => $this->payment->payment_date->format('Y-m-d H:i:s'),
            'message' => 'Η πληρωμή σας ύψους ' . number_format($this->payment->amount, 2) . ' ' . $this->payment->currency . ' απέτυχε.',
            'type' => 'payment_failed',
        ];
    }
}
