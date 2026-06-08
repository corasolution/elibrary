<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Password Reset</title></head>
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="color:#1e40af;">Reset Your Password</h2>
    <p>Hi {{ $patron->first_name }},</p>
    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
    <p style="text-align:center;margin:24px 0;">
        <a href="{{ $resetUrl }}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
    </p>
    <p style="color:#6b7280;font-size:0.875rem;">If you did not request a password reset, you can ignore this email. The link expires in 60 minutes.</p>
    <p style="color:#6b7280;font-size:0.875rem;">— {{ config('app.name') }}</p>
</body>
</html>
