<?php

namespace App\Services;

use App\Models\Adoption;
use App\Models\AdoptableItem;
use App\Models\AdoptionPlan;
use App\Models\AdoptionUpdate;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdoptionService
{
    /**
     * The notification service instance.
     *
     * @var NotificationService
     */
    protected $notificationService;
    
    /**
     * The payment service instance.
     *
     * @var PaymentService
     */
    protected $paymentService;
    
    /**
     * Create a new service instance.
     *
     * @param NotificationService $notificationService
     * @param PaymentService $paymentService
     * @return void
     */
    public function __construct(NotificationService $notificationService, PaymentService $paymentService)
    {
        $this->notificationService = $notificationService;
        $this->paymentService = $paymentService;
    }
    
    /**
     * Create a new adoption.
     *
     * @param User $user
     * @param array $adoptionData
     * @return Adoption
     */
    public function createAdoption(User $user, array $adoptionData): Adoption
    {
        // Start a database transaction
        return DB::transaction(function () use ($user, $adoptionData) {
            // Get the adoptable item and adoption plan
            $adoptableItem = AdoptableItem::findOrFail($adoptionData['adoptable_item_id']);
            $adoptionPlan = AdoptionPlan::findOrFail($adoptionData['adoption_plan_id']);
            
            // Check if the adoptable item is available
            if ($adoptableItem->status !== 'available') {
                throw new \Exception('This item is not available for adoption.');
            }
            
            // Check if the adoption plan is active
            if (!$adoptionPlan->active) {
                throw new \Exception('This adoption plan is not active.');
            }
            
            // Calculate start and end dates
            $startDate = Carbon::now();
            $endDate = $startDate->copy()->addMonths($adoptionPlan->duration_months);
            
            // Generate a unique certificate number
            $certificateNumber = $this->generateCertificateNumber();
            
            // Create the adoption
            $adoption = new Adoption([
                'user_id' => $user->id,
                'adoptable_item_id' => $adoptableItem->id,
                'adoption_plan_id' => $adoptionPlan->id,
                'status' => 'active',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'price_paid' => $adoptionPlan->price,
                'payment_status' => 'pending',
                'certificate_number' => $certificateNumber,
                'notes' => $adoptionData['notes'] ?? null,
            ]);
            
            $adoption->save();
            
            // Update the adoptable item status
            $adoptableItem->status = 'adopted';
            $adoptableItem->save();
            
            // Create a payment for the adoption if not using Stripe
            if (($adoptionData['payment_method'] ?? 'cod') !== 'stripe') {
                $this->paymentService->createPayment($adoption, $adoptionData['payment_method'] ?? 'cod');
            }
            
            // Create a notification for the user
            $this->notificationService->createNotification(
                $user,
                'new_adoption',
                'Νέα Υιοθεσία',
                "Η υιοθεσία σας για {$adoptableItem->name} έχει καταχωρηθεί με επιτυχία.",
                ['adoption_id' => $adoption->id]
            );
            
            // Create a notification for the producer
            $this->notificationService->createNotification(
                $adoptableItem->producer->user,
                'new_adoption',
                'Νέα Υιοθεσία',
                "Ένας χρήστης υιοθέτησε το {$adoptableItem->name}.",
                ['adoption_id' => $adoption->id]
            );
            
            return $adoption;
        });
    }
    
    /**
     * Process a payment for an adoption.
     *
     * @param Adoption $adoption
     * @param string $paymentMethod
     * @param array $paymentData
     * @return \App\Models\Payment
     */
    public function processAdoptionPayment(Adoption $adoption, string $paymentMethod, array $paymentData = [])
    {
        $payment = $this->paymentService->createPayment($adoption, $paymentMethod, $paymentData);
        
        if ($payment->status === 'succeeded') {
            $adoption->payment_status = 'paid';
            $adoption->save();
            
            // Generate and store the certificate
            $this->generateAdoptionCertificate($adoption);
            
            // Notify the user
            $this->notificationService->createNotification(
                $adoption->user,
                'adoption_payment_confirmed',
                'Πληρωμή Υιοθεσίας Επιβεβαιώθηκε',
                "Η πληρωμή για την υιοθεσία του {$adoption->adoptableItem->name} έχει επιβεβαιωθεί.",
                ['adoption_id' => $adoption->id]
            );
        }
        
        return $payment;
    }
    
    /**
     * Generate a unique certificate number.
     *
     * @return string
     */
    protected function generateCertificateNumber(): string
    {
        $prefix = 'ADOPT-';
        $uniqueId = strtoupper(Str::random(8));
        
        return $prefix . $uniqueId;
    }
    
    /**
     * Generate and store an adoption certificate.
     *
     * @param Adoption $adoption
     * @return string|null
     */
    public function generateAdoptionCertificate(Adoption $adoption): ?string
    {
        // TODO: Implement certificate generation
        // This would typically involve generating a PDF certificate
        // and storing it in the storage directory
        
        return null;
    }
    
    /**
     * Cancel an adoption.
     *
     * @param Adoption $adoption
     * @return Adoption
     */
    public function cancelAdoption(Adoption $adoption): Adoption
    {
        // Check if the adoption can be cancelled
        if ($adoption->status !== 'active') {
            throw new \Exception('This adoption cannot be cancelled.');
        }
        
        // Update the adoption status
        $adoption->status = 'cancelled';
        $adoption->save();
        
        // Update the adoptable item status
        $adoption->adoptableItem->status = 'available';
        $adoption->adoptableItem->save();
        
        // Notify the user
        $this->notificationService->createNotification(
            $adoption->user,
            'adoption_cancelled',
            'Υιοθεσία Ακυρώθηκε',
            "Η υιοθεσία σας για {$adoption->adoptableItem->name} έχει ακυρωθεί.",
            ['adoption_id' => $adoption->id]
        );
        
        // Notify the producer
        $this->notificationService->createNotification(
            $adoption->adoptableItem->producer->user,
            'adoption_cancelled',
            'Υιοθεσία Ακυρώθηκε',
            "Η υιοθεσία για το {$adoption->adoptableItem->name} έχει ακυρωθεί.",
            ['adoption_id' => $adoption->id]
        );
        
        return $adoption;
    }
    
    /**
     * Renew an adoption.
     *
     * @param Adoption $adoption
     * @param array $renewalData
     * @return Adoption
     */
    public function renewAdoption(Adoption $adoption, array $renewalData): Adoption
    {
        // Check if the adoption can be renewed
        if ($adoption->status !== 'active' && $adoption->status !== 'expired') {
            throw new \Exception('This adoption cannot be renewed.');
        }
        
        // Get the adoption plan
        $adoptionPlan = $renewalData['adoption_plan_id'] 
            ? AdoptionPlan::findOrFail($renewalData['adoption_plan_id']) 
            : $adoption->adoptionPlan;
        
        // Calculate new end date
        $newEndDate = $adoption->end_date->isPast() 
            ? Carbon::now()->addMonths($adoptionPlan->duration_months)
            : $adoption->end_date->copy()->addMonths($adoptionPlan->duration_months);
        
        // Update the adoption
        $adoption->adoption_plan_id = $adoptionPlan->id;
        $adoption->status = 'active';
        $adoption->end_date = $newEndDate;
        $adoption->price_paid = $adoptionPlan->price;
        $adoption->payment_status = 'pending';
        $adoption->save();
        
        // Update the adoptable item status
        $adoption->adoptableItem->status = 'adopted';
        $adoption->adoptableItem->save();
        
        // Create a payment for the renewal if not using Stripe
        if (($renewalData['payment_method'] ?? 'cod') !== 'stripe') {
            $this->paymentService->createPayment($adoption, $renewalData['payment_method'] ?? 'cod');
        }
        
        // Notify the user
        $this->notificationService->createNotification(
            $adoption->user,
            'adoption_renewed',
            'Υιοθεσία Ανανεώθηκε',
            "Η υιοθεσία σας για {$adoption->adoptableItem->name} έχει ανανεωθεί.",
            ['adoption_id' => $adoption->id]
        );
        
        // Notify the producer
        $this->notificationService->createNotification(
            $adoption->adoptableItem->producer->user,
            'adoption_renewed',
            'Υιοθεσία Ανανεώθηκε',
            "Η υιοθεσία για το {$adoption->adoptableItem->name} έχει ανανεωθεί.",
            ['adoption_id' => $adoption->id]
        );
        
        return $adoption;
    }
    
    /**
     * Create an update for an adoption.
     *
     * @param Adoption $adoption
     * @param array $updateData
     * @return AdoptionUpdate
     */
    public function createAdoptionUpdate(Adoption $adoption, array $updateData): AdoptionUpdate
    {
        // Create the update
        $update = new AdoptionUpdate([
            'adoption_id' => $adoption->id,
            'title' => $updateData['title'],
            'content' => $updateData['content'],
            'images' => $updateData['images'] ?? null,
            'status' => $updateData['status'] ?? 'published',
            'notify_adopter' => $updateData['notify_adopter'] ?? true,
            'published_at' => $updateData['status'] === 'published' ? Carbon::now() : null,
        ]);
        
        $update->save();
        
        // Notify the adopter if requested
        if ($update->status === 'published' && $update->notify_adopter) {
            $this->notificationService->createNotification(
                $adoption->user,
                'adoption_update',
                'Νέα Ενημέρωση Υιοθεσίας',
                "Υπάρχει μια νέα ενημέρωση για την υιοθεσία του {$adoption->adoptableItem->name}: {$update->title}",
                ['adoption_id' => $adoption->id, 'update_id' => $update->id]
            );
        }
        
        return $update;
    }
    
    /**
     * Get adoptions for a user.
     *
     * @param User $user
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getUserAdoptions(User $user, array $filters = [])
    {
        $query = $user->adoptions()
            ->with(['adoptableItem', 'adoptionPlan'])
            ->orderBy('created_at', 'desc');
        
        // Apply filters
        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        }
        
        // Paginate results
        $perPage = $filters['per_page'] ?? 10;
        
        return $query->paginate($perPage);
    }
    
    /**
     * Get adoptions for a producer.
     *
     * @param User $producer
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getProducerAdoptions(User $producer, array $filters = [])
    {
        $adoptableItemIds = $producer->producer->adoptableItems()->pluck('id')->toArray();
        
        if (empty($adoptableItemIds)) {
            return collect([]);
        }
        
        $query = Adoption::whereIn('adoptable_item_id', $adoptableItemIds)
            ->with(['user', 'adoptableItem', 'adoptionPlan'])
            ->orderBy('created_at', 'desc');
        
        // Apply filters
        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        }
        
        // Paginate results
        $perPage = $filters['per_page'] ?? 10;
        
        return $query->paginate($perPage);
    }
    
    /**
     * Get updates for an adoption.
     *
     * @param Adoption $adoption
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getAdoptionUpdates(Adoption $adoption, array $filters = [])
    {
        $query = $adoption->updates()
            ->orderBy('published_at', 'desc');
        
        // Apply filters
        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        } else {
            // By default, only show published updates
            $query->where('status', 'published');
        }
        
        // Paginate results
        $perPage = $filters['per_page'] ?? 10;
        
        return $query->paginate($perPage);
    }
}
