<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Notifications\OrderConfirmation;
use App\Notifications\NewOrderForProducer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\OrderCreated  $event
     * @return void
     */
    public function handle(OrderCreated $event)
    {
        try {
            $order = $event->order;

            // Send confirmation email to customer
            if ($order->user) {
                $order->user->notify(new OrderConfirmation($order));
                Log::info('Order confirmation email sent', [
                    'order_id' => $order->id,
                    'user_id' => $order->user->id,
                    'email' => $order->user->email
                ]);
            }

            // Send notification emails to producers
            $this->notifyProducers($order);

        } catch (\Exception $e) {
            Log::error('Failed to send order confirmation email', [
                'order_id' => $event->order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Notify producers about new orders for their products.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    private function notifyProducers($order)
    {
        // Group order items by producer
        $itemsByProducer = $order->items->groupBy(function ($item) {
            return $item->product->producer_id;
        });

        foreach ($itemsByProducer as $producerId => $items) {
            try {
                $producer = \App\Models\User::find($producerId);
                
                if ($producer && $producer->hasRole('producer')) {
                    $producer->notify(new NewOrderForProducer($order, $items));
                    
                    Log::info('Producer notification sent', [
                        'order_id' => $order->id,
                        'producer_id' => $producer->id,
                        'producer_email' => $producer->email,
                        'items_count' => $items->count()
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send producer notification', [
                    'order_id' => $order->id,
                    'producer_id' => $producerId,
                    'error' => $e->getMessage()
                ]);
                
                // Don't re-throw here to avoid failing the entire job
                // Producer notifications are less critical than customer confirmations
            }
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  \App\Events\OrderCreated  $event
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(OrderCreated $event, $exception)
    {
        Log::error('Order confirmation email job failed permanently', [
            'order_id' => $event->order->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Could send admin notification here
        // Or add to a manual review queue
    }
}
