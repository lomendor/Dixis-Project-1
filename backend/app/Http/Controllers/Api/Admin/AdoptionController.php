<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Adoption;
use App\Models\AdoptableItem;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdoptionController extends Controller
{
    /**
     * Display a listing of the adoptions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Adoption::with([
            'user:id,name,email',
            'adoptableItem:id,name,type,producer_id',
            'adoptableItem.producer:id,business_name'
        ]);

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by adoptable item
        if ($request->has('adoptable_item_id')) {
            $query->where('adoptable_item_id', $request->adoptable_item_id);
        }

        // Filter by producer
        if ($request->has('producer_id')) {
            $query->whereHas('adoptableItem', function ($q) use ($request) {
                $q->where('producer_id', $request->producer_id);
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        // Sort
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate
        $perPage = $request->input('per_page', 15);
        $adoptions = $query->paginate($perPage);

        return response()->json($adoptions);
    }

    /**
     * Display the specified adoption.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $adoption = Adoption::with([
            'user:id,name,email',
            'adoptableItem',
            'adoptableItem.producer:id,business_name',
            'updates',
            'payments'
        ])->findOrFail($id);

        return response()->json($adoption);
    }

    /**
     * Update the specified adoption.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $adoption = Adoption::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|required|string|in:active,expired,cancelled',
            'payment_status' => 'sometimes|required|string|in:pending,paid,failed,refunded',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after:start_date',
            'price_paid' => 'sometimes|required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update fields
        $fillable = [
            'status', 'payment_status', 'start_date', 'end_date', 'price_paid', 'notes'
        ];

        foreach ($fillable as $field) {
            if ($request->has($field)) {
                $adoption->$field = $request->$field;
            }
        }

        $adoption->save();

        return response()->json($adoption);
    }

    /**
     * Cancel the specified adoption.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancel($id)
    {
        $adoption = Adoption::findOrFail($id);

        if ($adoption->status === 'cancelled') {
            return response()->json([
                'message' => 'Adoption is already cancelled'
            ], 422);
        }

        $adoption->status = 'cancelled';
        $adoption->save();

        // Update the adoptable item status if it was adopted
        if ($adoption->adoptableItem->status === 'adopted') {
            $adoption->adoptableItem->status = 'available';
            $adoption->adoptableItem->save();
        }

        return response()->json($adoption);
    }

    /**
     * Renew the specified adoption.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function renew(Request $request, $id)
    {
        $adoption = Adoption::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'duration_months' => 'required|integer|min:1',
            'price_paid' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Calculate new end date
        $startDate = Carbon::now();
        $endDate = $startDate->copy()->addMonths($request->duration_months);

        // Update adoption
        $adoption->status = 'active';
        $adoption->payment_status = 'pending';
        $adoption->start_date = $startDate;
        $adoption->end_date = $endDate;
        $adoption->price_paid = $request->price_paid;
        $adoption->save();

        // Update the adoptable item status
        $adoption->adoptableItem->status = 'adopted';
        $adoption->adoptableItem->save();

        return response()->json($adoption);
    }

    /**
     * Get adoption statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats()
    {
        // Total adoptions
        $totalAdoptions = Adoption::count();

        // Active adoptions
        $activeAdoptions = Adoption::where('status', 'active')->count();

        // Expired adoptions
        $expiredAdoptions = Adoption::where('status', 'expired')->count();

        // Cancelled adoptions
        $cancelledAdoptions = Adoption::where('status', 'cancelled')->count();

        // Total revenue
        $totalRevenue = Adoption::where('payment_status', 'paid')->sum('price_paid');

        // Adoptions by month (last 6 months)
        $adoptionsByMonth = [];
        for ($i = 0; $i < 6; $i++) {
            $month = Carbon::now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            $count = Adoption::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
            $adoptionsByMonth[$month->format('M Y')] = $count;
        }

        // Revenue by month (last 6 months)
        $revenueByMonth = [];
        for ($i = 0; $i < 6; $i++) {
            $month = Carbon::now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            $revenue = Adoption::where('payment_status', 'paid')
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('price_paid');

            $revenueByMonth[$month->format('M Y')] = $revenue;
        }

        // Top adoptable items
        $topItems = Adoption::select('adoptable_item_id')
            ->selectRaw('COUNT(*) as adoption_count')
            ->with('adoptableItem:id,name,type')
            ->groupBy('adoptable_item_id')
            ->orderByDesc('adoption_count')
            ->limit(5)
            ->get();

        // Top users
        $topUsers = Adoption::select('user_id')
            ->selectRaw('COUNT(*) as adoption_count')
            ->with('user:id,name,email')
            ->groupBy('user_id')
            ->orderByDesc('adoption_count')
            ->limit(5)
            ->get();

        return response()->json([
            'total_adoptions' => $totalAdoptions,
            'active_adoptions' => $activeAdoptions,
            'expired_adoptions' => $expiredAdoptions,
            'cancelled_adoptions' => $cancelledAdoptions,
            'total_revenue' => $totalRevenue,
            'adoptions_by_month' => $adoptionsByMonth,
            'revenue_by_month' => $revenueByMonth,
            'top_items' => $topItems,
            'top_users' => $topUsers,
        ]);
    }
}
