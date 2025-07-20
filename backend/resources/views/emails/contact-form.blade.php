@component('mail::message')
# Νέο μήνυμα επικοινωνίας

Έχετε λάβει ένα νέο μήνυμα επικοινωνίας από την ιστοσελίδα.

**Όνομα:** {{ $name }}

**Email:** {{ $email }}

@if($phone)
**Τηλέφωνο:** {{ $phone }}
@endif

**Θέμα:** {{ $subject }}

**Μήνυμα:**
{{ $messageContent }}

@component('mail::button', ['url' => config('app.url') . '/admin/contact-messages'])
Προβολή όλων των μηνυμάτων
@endcomponent

Ευχαριστούμε,<br>
{{ config('app.name') }}
@endcomponent
