<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Due Date Reminder — {{ config('app.name') }}</title>
<style>
  body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
  .wrapper { max-width: 520px; margin: 32px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
  .header { background: #d97706; padding: 24px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 18px; font-weight: 700; }
  .header p { color: #fde68a; margin: 4px 0 0; font-size: 13px; }
  .body { padding: 28px; }
  .item-card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 13px; }
  .item-card .title { font-weight: 600; color: #0f172a; font-size: 14px; }
  .item-card .meta { color: #64748b; margin-top: 6px; }
  .days-badge { display: inline-block; background: #fef3c7; color: #b45309; font-weight: 700; padding: 3px 10px; border-radius: 999px; font-size: 13px; }
  .cta { text-align: center; margin: 24px 0; }
  .cta a { background: #d97706; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>📚 Alpha eLibrary</h1>
    <p>Due Date Reminder</p>
  </div>

  <div class="body">
    <p style="font-size:15px;font-weight:600;color:#0f172a;margin:0 0 8px;">Dear {{ $patron->first_name }} {{ $patron->last_name }},</p>
    <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 16px;">
      This is a friendly reminder that you have a library item due in
      <span class="days-badge">{{ $daysLeft }} {{ $daysLeft == 1 ? 'day' : 'days' }}</span>.
      Please return or renew it before the due date to avoid fines.
    </p>

    <div class="item-card">
      <div class="title">{{ $loan->item->bibliographicRecord->title }}</div>
      <div class="meta">
        Due Date: <strong style="color:#b45309;">{{ \Carbon\Carbon::parse($loan->due_date)->format('d M Y') }}</strong>
        &nbsp;·&nbsp; Barcode: <code>{{ $loan->item->barcode }}</code>
      </div>
    </div>

    <p style="font-size:13px;color:#475569;margin:0 0 20px;">
      You can renew this item online from your account (if renewals are available and no one else has it reserved).
    </p>

    <div class="cta">
      <a href="{{ url('/account/loans') }}">Renew Online</a>
    </div>

    <p style="font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;margin:0;">
      If you have already returned this item, please ignore this message.
    </p>
  </div>

  <div class="footer">
    {{ config('app.name') }} &nbsp;·&nbsp; Powered by Corasoft 🇰🇭
  </div>
</div>
</body>
</html>
