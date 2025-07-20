<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Adoption;
use App\Models\AdoptionUpdate;
use App\Services\AdoptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdoptionController extends Controller
{
    /**
     * The adoption service instance.
     *
     * @var AdoptionService
     */
    protected $adoptionService;

    /**
     * Create a new controller instance.
     *
     * @param AdoptionService $adoptionService
     * @return void
     */
    public function __construct(AdoptionService $adoptionService)
    {
        $this->adoptionService = $adoptionService;
    }

    /**
     * Display a listing of the user's adoptions.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $filters = $request->only(['status', 'per_page']);
        
        $adoptions = $this->adoptionService->getUserAdoptions($user, $filters);
        
        return response()->json($adoptions);
    }
    
    /**
     * Display a listing of the producer's adoptions.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function producerAdoptions(Request $request)
    {
        $user = Auth::user();
        $producer = $user->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }
        
        $filters = $request->only(['status', 'per_page']);
        $adoptions = $this->adoptionService->getProducerAdoptions($user, $filters);
        
        return response()->json($adoptions);
    }

    /**
     * Store a newly created adoption.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validatedData = $request->validate([
            'adoptable_item_id' => 'required|integer|exists:adoptable_items,id',
            'adoption_plan_id' => 'required|integer|exists:adoption_plans,id',
            'payment_method' => 'required|string|in:stripe,paypal,bank_transfer,cod',
            'notes' => 'nullable|string',
        ]);
        
        try {
            $adoption = $this->adoptionService->createAdoption($user, $validatedData);
            
            return response()->json($adoption, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified adoption.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id)
    {
        $user = Auth::user();
        $adoption = Adoption::with(['adoptableItem', 'adoptionPlan', 'updates' => function ($query) {
            $query->where('status', 'published')->orderBy('published_at', 'desc');
        }])->findOrFail($id);
        
        // Check if the adoption belongs to the user or the producer
        if ($adoption->user_id !== $user->id && 
            (!$user->producer || $adoption->adoptableItem->producer_id !== $user->producer->id)) {
            return response()->json(['message' => 'You do not have permission to view this adoption.'], 403);
        }
        
        return response()->json($adoption);
    }

    /**
     * Cancel the specified adoption.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancel(int $id)
    {
        $user = Auth::user();
        $adoption = Adoption::findOrFail($id);
        
        // Check if the adoption belongs to the user or the producer
        if ($adoption->user_id !== $user->id && 
            (!$user->producer || $adoption->adoptableItem->producer_id !== $user->producer->id)) {
            return response()->json(['message' => 'You do not have permission to cancel this adoption.'], 403);
        }
        
        try {
            $adoption = $this->adoptionService->cancelAdoption($adoption);
            
            return response()->json($adoption);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Renew the specified adoption.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function renew(Request $request, int $id)
    {
        $user = Auth::user();
        $adoption = Adoption::findOrFail($id);
        
        // Check if the adoption belongs to the user
        if ($adoption->user_id !== $user->id) {
            return response()->json(['message' => 'You do not have permission to renew this adoption.'], 403);
        }
        
        $validatedData = $request->validate([
            'adoption_plan_id' => 'nullable|integer|exists:adoption_plans,id',
            'payment_method' => 'required|string|in:stripe,paypal,bank_transfer,cod',
        ]);
        
        try {
            $adoption = $this->adoptionService->renewAdoption($adoption, $validatedData);
            
            return response()->json($adoption);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Process a payment for the specified adoption.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function processPayment(Request $request, int $id)
    {
        $user = Auth::user();
        $adoption = Adoption::findOrFail($id);
        
        // Check if the adoption belongs to the user
        if ($adoption->user_id !== $user->id) {
            return response()->json(['message' => 'You do not have permission to process payment for this adoption.'], 403);
        }
        
        $validatedData = $request->validate([
            'payment_method' => 'required|string|in:stripe,paypal,bank_transfer,cod',
            'payment_method_id' => 'nullable|string', // For Stripe
        ]);
        
        try {
            $payment = $this->adoptionService->processAdoptionPayment(
                $adoption, 
                $validatedData['payment_method'],
                $request->only(['payment_method_id'])
            );
            
            return response()->json($payment);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Display a listing of updates for the specified adoption.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updates(Request $request, int $id)
    {
        $user = Auth::user();
        $adoption = Adoption::findOrFail($id);
        
        // Check if the adoption belongs to the user or the producer
        if ($adoption->user_id !== $user->id && 
            (!$user->producer || $adoption->adoptableItem->producer_id !== $user->producer->id)) {
            return response()->json(['message' => 'You do not have permission to view updates for this adoption.'], 403);
        }
        
        $filters = $request->only(['status', 'per_page']);
        $updates = $this->adoptionService->getAdoptionUpdates($adoption, $filters);
        
        return response()->json($updates);
    }

    /**
     * Store a newly created update for the specified adoption.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeUpdate(Request $request, int $id)
    {
        $user = Auth::user();
        $adoption = Adoption::findOrFail($id);
        
        // Check if the user is the producer of the adoptable item
        if (!$user->producer || $adoption->adoptableItem->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'You do not have permission to create updates for this adoption.'], 403);
        }
        
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'images.*' => 'nullable|image|max:2048',
            'status' => 'nullable|in:draft,published',
            'notify_adopter' => 'nullable|boolean',
        ]);
        
        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('adoption_updates', 'public');
            }
        }
        
        $validatedData['images'] = $imagePaths;
        
        try {
            $update = $this->adoptionService->createAdoptionUpdate($adoption, $validatedData);
            
            return response()->json($update, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified update.
     *
     * @param int $id
     * @param int $updateId
     * @return \Illuminate\Http\JsonResponse
     */
    public function showUpdate(int $id, int $updateId)
    {
        $user = Auth::user();
        $adoption = Adoption::findOrFail($id);
        
        // Check if the adoption belongs to the user or the producer
        if ($adoption->user_id !== $user->id && 
            (!$user->producer || $adoption->adoptableItem->producer_id !== $user->producer->id)) {
            return response()->json(['message' => 'You do not have permission to view this update.'], 403);
        }
        
        $update = AdoptionUpdate::where('adoption_id', $id)
            ->where('id', $updateId)
            ->firstOrFail();
        
        // If the user is the adopter, only show published updates
        if ($adoption->user_id === $user->id && $update->status !== 'published') {
            return response()->json(['message' => 'Update not found.'], 404);
        }
        
        return response()->json($update);
    }

    /**
     * Update the specified update.
     *
     * @param Request $request
     * @param int $id
     * @param int $updateId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUpdate(Request $request, int $id, int $updateId)
    {
        $user = Auth::user();
        $adoption = Adoption::findOrFail($id);
        
        // Check if the user is the producer of the adoptable item
        if (!$user->producer || $adoption->adoptableItem->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'You do not have permission to update this update.'], 403);
        }
        
        $update = AdoptionUpdate::where('adoption_id', $id)
            ->where('id', $updateId)
            ->firstOrFail();
        
        $validatedData = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'images.*' => 'nullable|image|max:2048',
            'status' => 'nullable|in:draft,published',
            'notify_adopter' => 'nullable|boolean',
        ]);
        
        // Handle image uploads
        if ($request->hasFile('images')) {
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('adoption_updates', 'public');
            }
            $validatedData['images'] = $imagePaths;
        }
        
        // If status is changing from draft to published, set published_at
        if ($update->status === 'draft' && ($validatedData['status'] ?? null) === 'published') {
            $validatedData['published_at'] = now();
            
            // Notify the adopter if requested
            if (($validatedData['notify_adopter'] ?? $update->notify_adopter) && $adoption->user) {
                // Use the notification service to notify the adopter
                app(NotificationService::class)->createNotification(
                    $adoption->user,
                    'adoption_update',
                    'Νέα Ενημέρωση Υιοθεσίας',
                    "Υπάρχει μια νέα ενημέρωση για την υιοθεσία του {$adoption->adoptableItem->name}: {$update->title}",
                    ['adoption_id' => $adoption->id, 'update_id' => $update->id]
                );
            }
        }
        
        $update->update($validatedData);
        
        return response()->json($update);
    }

    /**
     * Remove the specified update.
     *
     * @param int $id
     * @param int $updateId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroyUpdate(int $id, int $updateId)
    {
        $user = Auth::user();
        $adoption = Adoption::findOrFail($id);
        
        // Check if the user is the producer of the adoptable item
        if (!$user->producer || $adoption->adoptableItem->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'You do not have permission to delete this update.'], 403);
        }
        
        $update = AdoptionUpdate::where('adoption_id', $id)
            ->where('id', $updateId)
            ->firstOrFail();
        
        // Delete images
        if ($update->images) {
            foreach ($update->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }
        
        $update->delete();
        
        return response()->json(['message' => 'Update deleted successfully.']);
    }
}
