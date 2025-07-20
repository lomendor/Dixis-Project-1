<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\User;
use App\Notifications\OrderConfirmation;
use App\Notifications\OrderShipped;
use App\Notifications\NewOrderForProducer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {type=all} {--user-id=} {--order-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email notifications for orders';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $type = $this->argument('type');
        $userId = $this->option('user-id');
        $orderId = $this->option('order-id');

        // Get test user
        $user = $userId ? User::find($userId) : User::first();
        if (!$user) {
            $this->error('No user found. Please create a user first or specify --user-id');
            return 1;
        }

        // Get test order
        $order = $orderId ? Order::find($orderId) : Order::with('items.product')->first();
        if (!$order) {
            $this->error('No order found. Please create an order first or specify --order-id');
            return 1;
        }

        $this->info("Testing email notifications...");
        $this->info("User: {$user->name} ({$user->email})");
        $this->info("Order: #{$order->id}");
        $this->line('');

        try {
            switch ($type) {
                case 'confirmation':
                    $this->testOrderConfirmation($user, $order);
                    break;
                    
                case 'shipped':
                    $this->testOrderShipped($user, $order);
                    break;
                    
                case 'producer':
                    $this->testProducerNotification($order);
                    break;
                    
                case 'all':
                    $this->testOrderConfirmation($user, $order);
                    $this->testOrderShipped($user, $order);
                    $this->testProducerNotification($order);
                    break;
                    
                default:
                    $this->error("Unknown type: {$type}. Use: confirmation, shipped, producer, or all");
                    return 1;
            }

            $this->info('');
            $this->info('✅ Email notifications sent successfully!');
            $this->info('Check your mail logs or email provider dashboard.');
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error("Failed to send email notifications: {$e->getMessage()}");
            return 1;
        }
    }

    /**
     * Test order confirmation email.
     *
     * @param User $user
     * @param Order $order
     */
    private function testOrderConfirmation(User $user, Order $order)
    {
        $this->info('📧 Sending order confirmation email...');
        $user->notify(new OrderConfirmation($order));
        $this->line("   → Order confirmation sent to {$user->email}");
    }

    /**
     * Test order shipped email.
     *
     * @param User $user
     * @param Order $order
     */
    private function testOrderShipped(User $user, Order $order)
    {
        $this->info('📦 Sending order shipped email...');
        $trackingNumber = 'TEST-' . strtoupper(uniqid());
        $user->notify(new OrderShipped($order, $trackingNumber));
        $this->line("   → Order shipped notification sent to {$user->email}");
        $this->line("   → Tracking number: {$trackingNumber}");
    }

    /**
     * Test producer notification email.
     *
     * @param Order $order
     */
    private function testProducerNotification(Order $order)
    {
        $this->info('👨‍🌾 Sending producer notification emails...');
        
        // Group items by producer
        $itemsByProducer = $order->items->groupBy(function ($item) {
            return $item->product->producer_id ?? 1; // Default to user ID 1 if no producer
        });

        foreach ($itemsByProducer as $producerId => $items) {
            $producer = User::find($producerId);
            
            if ($producer) {
                $producer->notify(new NewOrderForProducer($order, $items));
                $this->line("   → Producer notification sent to {$producer->name} ({$producer->email})");
                $this->line("   → Items: {$items->count()} products");
            } else {
                $this->warn("   → Producer not found for ID: {$producerId}");
            }
        }
    }
}
