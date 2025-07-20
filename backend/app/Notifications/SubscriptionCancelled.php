<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionCancelled extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The subscription instance.
     *
     * @var Subscription
     */
    protected $subscription;

    /**
     * Create a new notification instance.
     *
     * @param Subscription $subscription
     * @return void
     */
    public function __construct(Subscription $subscription)
    {
        $this->subscription = $subscription;
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
        $planName = $this->subscription->plan->name;
        $endDate = $this->subscription->end_date->format('d/m/Y');

        return (new MailMessage)
            ->subject('Η συνδρομή σας ακυρώθηκε')
            ->greeting('Γεια σας!')
            ->line('Η συνδρομή σας στο πακέτο ' . $planName . ' ακυρώθηκε.')
            ->line('Θα συνεχίσετε να έχετε πρόσβαση στα οφέλη του πακέτου μέχρι την ημερομηνία λήξης: ' . $endDate)
            ->line('Μετά από αυτή την ημερομηνία, θα μεταβείτε αυτόματα στο βασικό πακέτο.')
            ->action('Διαχείριση Συνδρομών', url('/account/subscriptions'))
            ->line('Αν ακυρώσατε κατά λάθος τη συνδρομή σας ή αν θέλετε να εγγραφείτε ξανά, μπορείτε να το κάνετε οποιαδήποτε στιγμή από τη σελίδα διαχείρισης συνδρομών.')
            ->line('Ευχαριστούμε που χρησιμοποιήσατε την πλατφόρμα μας!');
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
            'subscription_id' => $this->subscription->id,
            'plan_name' => $this->subscription->plan->name,
            'end_date' => $this->subscription->end_date->format('Y-m-d'),
            'message' => 'Η συνδρομή σας στο πακέτο ' . $this->subscription->plan->name . ' ακυρώθηκε.',
            'type' => 'subscription_cancelled',
        ];
    }
}
