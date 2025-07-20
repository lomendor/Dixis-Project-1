<?php

namespace App\Http\Controllers\Api\B2B;

use App\Http\Controllers\Controller;
use App\Models\BusinessUser;
use App\Models\B2B\CreditLimit;
use App\Models\B2B\CreditTransaction;
use App\Services\B2B\CreditLimitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CreditLimitController extends Controller
{
    protected CreditLimitService $creditLimitService;

    public function __construct(CreditLimitService $creditLimitService)
    {
        $this->creditLimitService = $creditLimitService;
    }

    /**
     * Get current credit limit and usage
     */
    public function getCreditStatus(): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json(['error' => 'Business profile not found'], 404);
        }

        $creditStatus = $this->creditLimitService->getCreditStatus($businessUser);

        return response()->json($creditStatus);
    }

    /**
     * Get credit transaction history
     */
    public function getCreditHistory(Request $request): JsonResponse
    {
        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json(['error' => 'Business profile not found'], 404);
        }

        $query = CreditTransaction::where('business_user_id', $businessUser->id)
            ->with(['order'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->paginate($request->get('per_page', 20));

        return response()->json($transactions);
    }

    /**
     * Request credit limit increase
     */
    public function requestCreditIncrease(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'requested_amount' => 'required|numeric|min:100|max:100000',
            'reason' => 'required|string|max:1000',
            'business_justification' => 'nullable|string|max:2000',
            'supporting_documents' => 'nullable|array',
            'supporting_documents.*' => 'file|mimes:pdf,jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $businessUser = $user->businessProfile;

        if (!$businessUser) {
            return response()->json(['error' => 'Business profile not found'], 404);
        }

        try {
            $request = $this->creditLimitService->requestCreditIncrease(
                $businessUser,
                $request->requested_amount,
                $request->reason,
                [
                    'business_justification' => $request->business_justification,
                    'supporting_documents' => $request->file('supporting_documents', [])
                ]
            );

            return response()->json($request, 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to submit credit increase request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get credit limit requests (admin only)
     */
    public function getCreditRequests(Request $request): JsonResponse
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = \App\Models\B2B\CreditLimitRequest::with(['businessUser.user'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('business_user_id')) {
            $query->where('business_user_id', $request->business_user_id);
        }

        $requests = $query->paginate($request->get('per_page', 15));

        return response()->json($requests);
    }

    /**
     * Approve/reject credit limit request (admin only)
     */
    public function processCreditRequest(Request $request, int $requestId): JsonResponse
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approve,reject',
            'approved_amount' => 'required_if:action,approve|numeric|min:0',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $creditRequest = \App\Models\B2B\CreditLimitRequest::findOrFail($requestId);

            if ($request->action === 'approve') {
                $result = $this->creditLimitService->approveCreditRequest(
                    $creditRequest,
                    $request->approved_amount,
                    $request->admin_notes
                );
            } else {
                $result = $this->creditLimitService->rejectCreditRequest(
                    $creditRequest,
                    $request->admin_notes
                );
            }

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process credit request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manual credit adjustment (admin only)
     */
    public function adjustCredit(Request $request): JsonResponse
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'business_user_id' => 'required|exists:business_users,id',
            'amount' => 'required|numeric',
            'type' => 'required|in:credit,debit,adjustment',
            'reason' => 'required|string|max:500',
            'reference' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $businessUser = BusinessUser::findOrFail($request->business_user_id);

            $transaction = $this->creditLimitService->adjustCredit(
                $businessUser,
                $request->amount,
                $request->type,
                $request->reason,
                $request->reference
            );

            return response()->json($transaction, 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to adjust credit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get credit utilization report (admin only)
     */
    public function getCreditUtilizationReport(Request $request): JsonResponse
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $report = $this->creditLimitService->getCreditUtilizationReport([
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
            'business_user_id' => $request->business_user_id
        ]);

        return response()->json($report);
    }
}