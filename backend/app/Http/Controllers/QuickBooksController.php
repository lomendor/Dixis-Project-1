<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class QuickBooksController extends Controller
{
    /**
     * Display QuickBooks integration dashboard.
     */
    public function index()
    {
        return view('admin.integrations.quickbooks.index', [
            'status' => 'not_configured',
            'message' => 'QuickBooks integration not configured'
        ]);
    }

    /**
     * Sync order with QuickBooks.
     */
    public function syncOrder(Request $request, $order)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Order sync not implemented yet'
        ]);
    }

    /**
     * Sync customer with QuickBooks.
     */
    public function syncCustomer(Request $request, $customer)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Customer sync not implemented yet'
        ]);
    }
}
