<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }
    
    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $exception)
    {
        // API exception handling
        if ($request->wantsJson() || $request->is('api/*')) {
            
            // Not found exception
            if ($exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Resource not found',
                    'error' => 'The requested resource could not be found'
                ], 404);
            }
            
            // Validation exception
            if ($exception instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $exception->validator->errors()->toArray()
                ], 422);
            }
            
            // Authentication exception
            if ($exception instanceof \Illuminate\Auth\AuthenticationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthenticated',
                    'error' => 'You are not authenticated'
                ], 401);
            }
            
            // Authorization exception
            if ($exception instanceof \Illuminate\Auth\Access\AuthorizationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                    'error' => 'You are not authorized to perform this action'
                ], 403);
            }
            
            // Query exception
            if ($exception instanceof \Illuminate\Database\QueryException) {
                // Log the full exception
                \Illuminate\Support\Facades\Log::error('Database query error: ' . $exception->getMessage());
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Database error',
                    'error' => !app()->environment('production') ? $exception->getMessage() : 'A database error occurred'
                ], 500);
            }
            
            // General exceptions (only in non-production)
            if (!app()->environment('production')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Server error',
                    'error' => $exception->getMessage(),
                    'trace' => $exception->getTrace()
                ], 500);
            }
            
            // Generic error in production
            return response()->json([
                'status' => 'error',
                'message' => 'Server error',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
        
        // Default handling for web requests
        return parent::render($request, $exception);
    }
}