<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The contact message instance.
     *
     * @var \App\Models\ContactMessage
     */
    public $contactMessage;

    /**
     * Create a new message instance.
     *
     * @param  \App\Models\ContactMessage  $contactMessage
     * @return void
     */
    public function __construct(ContactMessage $contactMessage)
    {
        $this->contactMessage = $contactMessage;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Νέο μήνυμα επικοινωνίας: ' . $this->contactMessage->subject)
                    ->markdown('emails.contact-form')
                    ->with([
                        'name' => $this->contactMessage->name,
                        'email' => $this->contactMessage->email,
                        'phone' => $this->contactMessage->phone,
                        'subject' => $this->contactMessage->subject,
                        'messageContent' => $this->contactMessage->message,
                    ]);
    }
}
