@component('mail::message')
# Επιβεβαίωση Παραγγελίας #{{ $order->order_number }}

Γεια σας {{ $user->name }},

Ευχαριστούμε για την παραγγελία σας! Η παραγγελία σας έχει επιβεβαιωθεί και θα επεξεργαστεί σύντομα.

## Στοιχεία Παραγγελίας

**Αριθμός Παραγγελίας:** #{{ $order->order_number }}  
**Ημερομηνία:** {{ $order->created_at->format('d/m/Y H:i') }}  
**Κατάσταση:** {{ $order->status }}  

## Προϊόντα

@foreach($order->items as $item)
- **{{ $item->product->name }}**  
  Ποσότητα: {{ $item->quantity }} × €{{ number_format($item->unit_price, 2) }} = €{{ number_format($item->quantity * $item->unit_price, 2) }}
@endforeach

---

**Υποσύνολο:** €{{ number_format($order->subtotal ?? 0, 2) }}  
**Μεταφορικά:** €{{ number_format($order->shipping_cost ?? 0, 2) }}  
**ΦΠΑ:** €{{ number_format($order->tax_amount ?? 0, 2) }}  
**Σύνολο:** €{{ number_format($order->total_amount, 2) }}

## Στοιχεία Αποστολής

@if($order->shipping_address)
{{ $order->shipping_address['first_name'] }} {{ $order->shipping_address['last_name'] }}  
{{ $order->shipping_address['address'] }}  
{{ $order->shipping_address['city'] }}, {{ $order->shipping_address['postal_code'] }}  
{{ $order->shipping_address['country'] }}  
@if(isset($order->shipping_address['phone']))
Τηλέφωνο: {{ $order->shipping_address['phone'] }}
@endif
@endif

## Πληρωμή & Αποστολή

**Μέθοδος Πληρωμής:** {{ $paymentMethod }}  
**Μέθοδος Αποστολής:** {{ $shippingMethod }}

@component('mail::button', ['url' => url('/orders/' . $order->id)])
Προβολή Παραγγελίας
@endcomponent

Μπορείτε να παρακολουθήσετε την πρόοδο της παραγγελίας σας στον παραπάνω σύνδεσμο.

Θα λάβετε ενημέρωση όταν η παραγγελία σας αποσταλεί.

Ευχαριστούμε που επιλέξατε την Dixis!

Με εκτίμηση,  
{{ config('app.name') }}

---

**Χρειάζεστε βοήθεια;**  
Επικοινωνήστε μαζί μας στο [support@dixis.io](mailto:support@dixis.io) ή στο 210 123 4567.

@endcomponent
