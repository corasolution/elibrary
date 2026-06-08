<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to {{ config('app.name') }}</title>
<style>
  body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
  .wrapper { max-width: 520px; margin: 32px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
  .header { background: #2563eb; padding: 28px 24px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
  .header p { color: #bfdbfe; margin: 4px 0 0; font-size: 13px; }
  .body { padding: 28px; }
  .info-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px; }
  .info-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #dbeafe; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #6b7280; }
  .info-value { font-weight: 600; color: #1e293b; font-family: monospace; }
  .cta { text-align: center; margin: 24px 0; }
  .cta a { background: #2563eb; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>📚 Welcome to {{ config('app.name') }}!</h1>
    <p>Your library account is ready</p>
  </div>

  <div class="body">
    <p style="font-size:15px;font-weight:600;color:#0f172a;margin:0 0 8px;">Hello, {{ $patron->first_name }}!</p>
    <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 20px;">
      Your patron account has been successfully created. You can now search the catalog, reserve items, download digital resources, and manage your loans online.
    </p>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Patron Number</span>
        <span class="info-value">{{ $patron->patron_number }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">{{ $patron->email }}</span>
      </div>
      @if($patron->category)
      <div class="info-row">
        <span class="info-label">Account Type</span>
        <span class="info-value">{{ $patron->category->name }}</span>
      </div>
      @endif
      @if($patron->membership_expiry)
      <div class="info-row">
        <span class="info-label">Valid Until</span>
        <span class="info-value">{{ \Carbon\Carbon::parse($patron->membership_expiry)->format('d M Y') }}</span>
      </div>
      @endif
    </div>

    <p style="font-size:13px;color:#475569;margin:0 0 20px;">
      Keep your patron number safe — you will need it at the circulation desk.
    </p>

    <div class="cta">
      <a href="{{ url('/account') }}">Go to My Account</a>
    </div>
  </div>

  <div class="footer">
    {{ config('app.name') }} &nbsp;·&nbsp; Powered by Corasoft 🇰🇭
  </div>
</div>
</body>
</html>
