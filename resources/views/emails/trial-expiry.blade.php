<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Trial Expiring</title></head>
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="color:#dc2626;">Your Trial is Expiring Soon</h2>
    <p>Hi {{ $libraryName }},</p>
    <p>Your CoraLibrary free trial ends on <strong>{{ \Carbon\Carbon::parse($trialEndsAt)->format('d M Y') }}</strong>.</p>
    <p>Upgrade to a paid plan to continue using all features without interruption.</p>
    <p style="text-align:center;margin:24px 0;">
        <a href="{{ config('app.url') }}/pricing" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Plans</a>
    </p>
    <p style="color:#6b7280;font-size:0.875rem;">— CoraLibrary by Corasoft</p>
</body>
</html>
