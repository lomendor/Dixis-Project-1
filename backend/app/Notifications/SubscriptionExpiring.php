<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionExpiring extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The subscription instance.
     *
     * @var Subscription
     */
    protected $subscription;

    /**
     * The days until expiration.
     *
     * @var int
     */
    protected $daysUntilExpiration;

    /**
     * Create a new notification instance.
     *
     * @param Subscription $subscription
     * @param int $daysUntilExpiration
     * @return void
     */
    public function __construct(Subscription $subscription, int $daysUntilExpiration)
    {
        $this->subscription = $subscription;
        $this->daysUntilExpiration = $daysUntilExpiration;
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
        $daysText = $this->daysUntilExpiration === 1 ? 'ημέρα' : 'ημέρες';

        return (new MailMessage)
            ->subject('Η συνδρομή σας λήγει σύντομα')
            ->greeting('Γεια σας!')
            ->line('Η συνδρομή σας στο πακέτο ' . $planName . ' λήγει σε ' . $this->daysUntilExpiration . ' ' . $daysText . '.')
            ->line('Ημερομηνία λήξης: ' . $endDate)
            ->line($this->subscription->auto_renew 
                ? 'Η συνδρομή σας θα ανανεωθεί αυτόματα κατά την ημερομηνία λήξης.' 
                : 'Η συνδρομή σας δεν είναι ρυθμισμένη για αυτόματη ανανέωση. Παρακαλούμε ανανεώστε τη συνδρομή σας για να συνεχίσετε να απολαμβάνετε τα οφέλη της.')
            ->action('Διαχείριση Συνδρομής', url('/account/subscriptions'))
            ->line('Ευχαριστούμε που επιλέξατε την πλατφόρμα μας!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        $daysText = $this->daysUntilExpiration === 1 ? 'ημέρα' : 'ημέρες';
        
        return [
            'subscription_id' => $this->subscription->id,
            'plan_name' => $this->subscription->plan->name,
            'end_date' => $this->subscription->end_date->format('Y-m-d'),
            'days_until_expiration' => $this->daysUntilExpiration,
            'message' => 'Η συνδρομή σας στο πακέτο ' . $this->subscription->plan->name . ' λήγει σε ' . $this->daysUntilExpiration . ' ' . $daysText . '.',
            'type' => 'subscription_expiring',
        ];
    }
}
