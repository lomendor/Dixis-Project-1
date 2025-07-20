<?php

namespace App\Helpers;

class ApiResponse
{
    /**
     * Return a success JSON response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $status
     * @return \Illuminate\Http\JsonResponse
     */
    public static function success($data = null, $message = 'Success', $status = 200)
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $status);
    }
    
    /**
     * Return an error JSON response.
     *
     * @param string $message
     * @param mixed $errors
     * @param int $status
     * @return \Illuminate\Http\JsonResponse
     */
    public static function error($message = 'Error', $errors = null, $status = 400)
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'errors' => $errors
        ], $status);
    }
    
    /**
     * Return a validation error JSON response.
     *
     * @param mixed $errors
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function validationError($errors, $message = 'Validation failed')
    {
        return self::error($message, $errors, 422);
    }
    
    /**
     * Return a not found JSON response.
     *
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function notFound($message = 'Resource not found')
    {
        return self::error($message, null, 404);
    }
    
    /**
     * Return an unauthorized JSON response.
     *
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function unauthorized($message = 'Unauthorized')
    {
        return self::error($message, null, 403);
    }
    
    /**
     * Return an unauthenticated JSON response.
     *
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function unauthenticated($message = 'Unauthenticated')
    {
        return self::error($message, null, 401);
    }
    
    /**
     * Return a server error JSON response.
     *
     * @param string $message
     * @param mixed $errors
     * @return \Illuminate\Http\JsonResponse
     */
    public static function serverError($message = 'Server Error', $errors = null)
    {
        return self::error($message, $errors, 500);
    }
}