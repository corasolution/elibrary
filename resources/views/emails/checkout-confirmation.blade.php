<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Checkout Confirmation</title></head>
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="color:#1e40af;">Checkout Confirmation</h2>
    <p>Hi {{ $patron->first_name }},</p>
    <p>You have successfully checked out the following item:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
            <td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Title</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">{{ $item->bibliographicRecord->title }}</td>
        </tr>
        <tr>
            <td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Barcode</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">{{ $item->barcode }}</td>
        </tr>
        <tr>
            <td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Due Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;color:#dc2626;font-weight:600;">{{ \Carbon\Carbon::parse($loan->due_date)->format('d M Y') }}</td>
        </tr>
    </table>
    <p>Please return this item by the due date to avoid fines.</p>
    <p style="color:#6b7280;font-size:0.875rem;">— {{ config('app.name') }}</p>
</body>
</html>
