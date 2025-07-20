<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionCreated extends Notification implements ShouldQueue
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
        $price = number_format($this->subscription->plan->price, 2) . ' €';
        $commissionRate = $this->subscription->plan->commission_rate . '%';

        return (new MailMessage)
            ->subject('Η συνδρομή σας δημιουργήθηκε με επιτυχία')
            ->greeting('Γεια σας!')
            ->line('Η συνδρομή σας στο πακέτο ' . $planName . ' δημιουργήθηκε με επιτυχία.')
            ->line('Λεπτομέρειες συνδρομής:')
            ->line('- Πακέτο: ' . $planName)
            ->line('- Ημερομηνία λήξης: ' . $endDate)
            ->line('- Τιμή: ' . $price)
            ->line('- Προμήθεια: ' . $commissionRate)
            ->line('Ευχαριστούμε που επιλέξατε την πλατφόρμα μας!')
            ->action('Προβολή Συνδρομής', url('/account/subscriptions'))
            ->line('Αν έχετε οποιαδήποτε απορία, μη διστάσετε να επικοινωνήσετε μαζί μας.');
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
            'message' => 'Η συνδρομή σας στο πακέτο ' . $this->subscription->plan->name . ' δημιουργήθηκε με επιτυχία.',
            'type' => 'subscription_created',
        ];
    }
}
