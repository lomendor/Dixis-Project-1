<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
// Removed duplicate Illuminate\Foundation\Application import
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CheckUserRole; // Import the new middleware
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\InputValidation;
use App\Http\Middleware\ApiRateLimit;
use App\Http\Middleware\SessionSecurity;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        App\Providers\EventServiceProvider::class,
    ])
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // Using clean API with Greek market integration
        apiPrefix: 'api', // Standard API prefix
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Add global security middleware
        $middleware->web(append: [
            SecurityHeaders::class,
            SessionSecurity::class,
        ]);

        // Add API middleware
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->api(append: [
            SecurityHeaders::class,
            InputValidation::class,
        ]);

        // Define middleware aliases
        $middleware->alias([
            'role' => CheckUserRole::class,
            'rate.limit' => ApiRateLimit::class,
            'input.validation' => InputValidation::class,
            'security.headers' => SecurityHeaders::class,
            'session.security' => SessionSecurity::class,
        ]);

        // Exclude API routes from CSRF protection if using token/Sanctum auth
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        // Trust proxies if running behind a load balancer or reverse proxy (common in Docker setups)
        // $middleware->trustProxies(at: '*'); // Uncomment if needed

        // Note: HandleCors is typically added globally by default in recent Laravel versions.
        // Configuration is usually handled via config/cors.php or environment variables.
        // We will configure via .env in the next step.
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Customize exception handling if needed
    })->create();
