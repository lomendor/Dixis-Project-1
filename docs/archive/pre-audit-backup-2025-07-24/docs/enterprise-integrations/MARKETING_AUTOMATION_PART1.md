# 📧 MARKETING AUTOMATION - PART 1

## 🎯 CORE SERVICE FOUNDATION

### **MarketingAutomationService - Foundation**

```php
<?php

namespace App\Services\Integrations\Marketing;

use App\Models\Customer;
use App\Models\EmailCampaign;
use App\Jobs\Integration\SendMarketingEmail;
use App\Services\Integrations\BaseIntegrationService;
use Illuminate\Support\Facades\Log;

class MarketingAutomationService extends BaseIntegrationService
{
    protected function getServiceConfig(): array
    {
        return config('integrations.marketing');
    }
    
    /**
     * Setup customer journey automation
     */
    public function setupCustomerJourney(Customer $customer): array
    {
        try {
            $journeySteps = [];
            
            // Welcome series
            $welcomeSteps = $this->scheduleWelcomeSeries($customer);
            $journeySteps['welcome'] = $welcomeSteps;
            
            // Behavioral triggers  
            $behavioralSteps = $this->setupBehavioralTriggers($customer);
            $journeySteps['behavioral'] = $behavioralSteps;
            
            // Segmentation
            $segmentationResult = $this->addToSegments($customer);
            $journeySteps['segmentation'] = $segmentationResult;
            
            return [
                'success' => true,
                'customer_id' => $customer->id,
                'journey_steps' => $journeySteps
            ];
```            
        } catch (\Exception $e) {
            Log::error('Customer journey setup failed', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception('Failed to setup customer journey');
        }
    }
    
    /**
     * Schedule welcome email series
     */
    public function scheduleWelcomeSeries(Customer $customer): array
    {
        try {
            $welcomeSteps = [];
            
            // Day 0: Welcome email (immediate)
            $welcomeJob = SendMarketingEmail::dispatch($customer, 'welcome', [
                'customer_name' => $customer->name,
                'discount_code' => $this->generateDiscountCode($customer, 10)
            ])->delay(now()->addMinutes(5));
            
            $welcomeSteps[] = [
                'type' => 'welcome_email',
                'scheduled_at' => now()->addMinutes(5),
                'template' => 'welcome'
            ];
            
            // Day 3: Product recommendations
            $recommendationJob = SendMarketingEmail::dispatch($customer, 'product_recommendations', [
                'recommended_products' => $this->getRecommendedProducts($customer),
                'customer_name' => $customer->name
            ])->delay(now()->addDays(3));
            
            $welcomeSteps[] = [
                'type' => 'product_recommendations',
                'scheduled_at' => now()->addDays(3),
                'template' => 'product_recommendations'
            ];
            
            return $welcomeSteps;
            
        } catch (\Exception $e) {
            Log::error('Welcome series scheduling failed');
            return [];
        }
    }
}
```