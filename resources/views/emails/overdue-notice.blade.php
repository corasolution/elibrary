<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Overdue Notice</title>
<style>
  body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
  .wrapper { max-width: 520px; margin: 32px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
  .header { background: #0369a1; padding: 24px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 18px; font-weight: 700; }
  .header p { color: #bae6fd; margin: 4px 0 0; font-size: 13px; }
  .body { padding: 28px; }
  .body h2 { font-size: 16px; color: #0f172a; margin: 0 0 8px; }
  .body p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }
  .item-card { background: #f1f5f9; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 13px; }
  .item-card .title { font-weight: 600; color: #0f172a; }
  .item-card .meta { color: #64748b; margin-top: 4px; }
  .fine-alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #b91c1c; }
  .cta { text-align: center; margin: 24px 0; }
  .cta a { background: #0369a1; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>📚 Alpha eLibrary</h1>
    <p>Library Overdue Notice</p>
  </div>

  <div class="body">
    <h2>Dear {{ $patron->fullName() }},</h2>
    <p>
      You have an overdue library item. Please return it as soon as possible to avoid additional fines.
    </p>

    <div class="item-card">
      <div class="title">{{ $loan->item->bibliographicRecord->title }}</div>
      <div class="meta">
        Due Date: <strong>{{ $loan->due_date->format('F j, Y') }}</strong> &nbsp;·&nbsp;
        Days Overdue: <strong>{{ $loan->daysOverdue() }}</strong>
      </div>
    </div>

    @if($loan->fine_amount > 0)
    <div class="fine-alert">
      ⚠️ Accumulated fine: <strong>${{ number_format($loan->fine_amount, 2) }}</strong>
    </div>
    @endif

    <p>
      You can return the item at the library circulation desk or renew it online if renewals are still available.
    </p>

    <div class="cta">
      <a href="{{ url('/account/loans') }}">View My Loans</a>
    </div>

    <p style="font-size:12px;color:#94a3b8;">
      If you have already returned this item, please disregard this notice.
      Contact us at <a href="mailto:{{ config('mail.from.address') }}" style="color:#0369a1;">{{ config('mail.from.address') }}</a> if you have questions.
    </p>
  </div>

  <div class="footer">
    {{ config('app.name') }} &nbsp;·&nbsp; Powered by Corasoft 🇰🇭
  </div>
</div>
</body>
</html>
