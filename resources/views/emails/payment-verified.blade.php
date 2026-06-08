<x-mail::message>
# Payment Verified ✓

Dear **{{ $tenantName }}**,

We're pleased to confirm that your payment has been successfully verified!

## Payment Details

- **Invoice Number:** {{ $invoiceNumber }}
- **Plan:** {{ $planName }}
- **Amount:** {{ $currency }} ${{ number_format($amount, 2) }}
- **Date:** {{ $invoiceDate }}
- **Status:** Paid

Your subscription is now active and you can start using all the features of your plan immediately.

## What's Next?

You can now access your library dashboard and begin:
- Cataloging your materials
- Managing patrons
- Setting up your digital library
- Customizing your library settings

The official tax invoice is attached to this email for your records.

<x-mail::button :url="config('app.url')">
Access Your Dashboard
</x-mail::button>

If you have any questions or need assistance, please don't hesitate to contact our support team.

Thank you for choosing Alpha eLibrary!

Best regards,<br>
{{ config('app.name') }} Team
</x-mail::message>
