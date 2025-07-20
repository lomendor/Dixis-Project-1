<?php

namespace App\Services\Integrations;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

abstract class BaseIntegrationService
{
    protected array $config;
    
    public function __construct()
    {
        $this->config = $this->getServiceConfig();
    }
    
    /**
     * Get service-specific configuration
     */
    abstract protected function getServiceConfig(): array;
    
    /**
     * Log integration activity
     */
    protected function logActivity(string $operation, array $data = [], string $status = 'info'): void
    {
        if (!config('integrations.logging_enabled', true)) {
            return;
        }
        
        Log::channel('integrations')->{$status}("Integration activity: {$operation}", [
            'service' => static::class,
            'operation' => $operation,
            'data' => $data,
            'timestamp' => now(),
            'user_id' => auth()->id()
        ]);
    }
    
    /**
     * Make HTTP request with retry logic
     */
    protected function makeRequest(string $method, string $url, array $data = [], array $headers = []): array
    {
        $attempts = config('integrations.retry_attempts', 3);
        $delay = config('integrations.retry_delay', 60);
        
        for ($i = 0; $i < $attempts; $i++) {
            try {
                $response = Http::timeout(config('integrations.timeout', 30))
                    ->connectTimeout(config('integrations.connect_timeout', 10))
                    ->withHeaders($headers)
                    ->{$method}($url, $data);
                
                if ($response->successful()) {
                    return [
                        'success' => true,
                        'data' => $response->json(),
                        'status_code' => $response->status()
                    ];
                }
                
                if ($response->clientError()) {
                    // Don't retry client errors
                    break;
                }
                
            } catch (\Exception $e) {
                $this->logActivity('http_request_failed', [
                    'method' => $method,
                    'url' => $url,
                    'attempt' => $i + 1,
                    'error' => $e->getMessage()
                ], 'error');
                
                if ($i === $attempts - 1) {
                    throw $e;
                }
                
                sleep($delay);
            }
        }
        
        return [
            'success' => false,
            'error' => 'Request failed after ' . $attempts . ' attempts',
            'status_code' => $response->status() ?? 0
        ];
    }
    
    /**
     * Store integration log
     */
    protected function storeLog(string $operation, $model, array $requestData = [], array $responseData = [], string $status = 'success', ?string $errorMessage = null, ?int $responseTime = null): void
    {
        \DB::table('integration_logs')->insert([
            'service_name' => static::class,
            'operation' => $operation,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'request_data' => json_encode($requestData),
            'response_data' => json_encode($responseData),
            'status' => $status,
            'error_message' => $errorMessage,
            'response_time_ms' => $responseTime,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
