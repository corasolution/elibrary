<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Item Ready for Pickup</title>
<style>
  body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
  .wrapper { max-width: 520px; margin: 32px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
  .header { background: #16a34a; padding: 24px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 18px; font-weight: 700; }
  .header p { color: #bbf7d0; margin: 4px 0 0; font-size: 13px; }
  .body { padding: 28px; }
  .item-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 13px; }
  .item-card .title { font-weight: 600; color: #0f172a; }
  .cta { text-align: center; margin: 24px 0; }
  .cta a { background: #16a34a; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>📚 Alpha eLibrary</h1>
    <p>Your Reserved Item is Ready!</p>
  </div>

  <div class="body">
    <h2 style="font-size:16px;color:#0f172a;">Dear {{ $patron->fullName() }},</h2>
    <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 16px;">
      Great news! The item you reserved is now available for pickup.
    </p>

    <div class="item-card">
      <div class="title">{{ $reservation->bibliographicRecord->title }}</div>
      <div style="color:#64748b;margin-top:4px;font-size:12px;">
        Please pick up by: <strong>{{ $reservation->expiry_date?->format('F j, Y') ?? 'Check with library' }}</strong>
      </div>
    </div>

    <p style="font-size:13px;color:#475569;">
      Please visit the circulation desk and present your library card to collect your item.
      This reservation will expire if not collected by the due date.
    </p>

    <div class="cta">
      <a href="{{ url('/account/reservations') }}">View My Reservations</a>
    </div>
  </div>

  <div class="footer">
    {{ config('app.name') }} &nbsp;·&nbsp; Powered by Corasoft 🇰🇭
  </div>
</div>
</body>
</html>
