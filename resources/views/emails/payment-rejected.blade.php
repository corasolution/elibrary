<x-mail::message>
# Payment Submission Not Approved

Dear **{{ $tenantName }}**,

We regret to inform you that your recent payment submission has not been approved.

## Submission Details

- **Plan:** {{ $planName }}
- **Amount:** {{ $currency }} ${{ number_format($amount, 2) }}
- **Submitted:** {{ $submittedAt }}
- **Status:** Rejected

## Reason for Rejection

{{ $reason }}

## What You Need to Do

Please review the reason above and submit a new payment with the correct information or proof of payment. Here are some common issues to check:

1. **Payment proof clarity** - Ensure the transaction screenshot or receipt is clear and shows all details
2. **Amount mismatch** - Verify the payment amount matches the plan price
3. **Correct account** - Make sure you transferred to the correct bank account/QR code
4. **Transaction reference** - Include the transaction reference number if available

<x-mail::button :url="config('app.url') . '/payments/submit'">
Submit New Payment
</x-mail::button>

## Need Help?

If you have any questions about this rejection or need assistance with your payment submission, please contact our support team. We're here to help!

Best regards,<br>
{{ config('app.name') }} Team
</x-mail::message>
