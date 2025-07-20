<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\Api\RecommendedProductsController;
use Illuminate\Http\Request;
use Tests\TestCase;

class RecommendedProductsControllerTest extends TestCase
{
    public function test_controller_exists()
    {
        $recommendationService = $this->createMock(\App\Services\RecommendationService::class);
        $controller = new RecommendedProductsController($recommendationService);
        $this->assertInstanceOf(RecommendedProductsController::class, $controller);
    }
}
