<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .stats { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stats-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .stats-row:last-child { border-bottom: none; }
        .stats-label { font-weight: 600; color: #6b7280; }
        .stats-value { font-weight: bold; color: #111827; }
        .progress-bar { background: #e5e7eb; height: 24px; border-radius: 12px; overflow: hidden; margin: 15px 0; }
        .progress-fill { background: #f59e0b; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚠️ AI Budget Alert</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">{{ $percentage }}% of Monthly Budget Used</p>
    </div>

    <div class="content">
        <p>Hello {{ $libraryName }} Admin,</p>

        <div class="alert-box">
            <strong>⚠️ Budget Alert:</strong> Your library has used <strong>{{ $percentage }}%</strong> of your monthly AI budget.
        </div>

        <div class="stats">
            <div class="stats-row">
                <span class="stats-label">Current Usage:</span>
                <span class="stats-value">${{ $currentUsage }}</span>
            </div>
            <div class="stats-row">
                <span class="stats-label">Monthly Budget:</span>
                <span class="stats-value">${{ $budgetLimit }}</span>
            </div>
            <div class="stats-row">
                <span class="stats-label">Remaining:</span>
                <span class="stats-value">${{ $remaining }}</span>
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: {{ min($percentage, 100) }}%;">
                {{ $percentage }}%
            </div>
        </div>

        <p><strong>What's Next?</strong></p>
        <ul>
            <li>Monitor your AI usage closely for the rest of the month</li>
            <li>Consider increasing your budget if needed</li>
            <li>Review which AI features are used most frequently</li>
            <li>AI features will auto-disable if budget reaches 100% (if enabled)</li>
        </ul>

        <a href="{{ url('/admin/settings/ai-usage') }}" class="button">
            View Usage Dashboard
        </a>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Tip:</strong> You can adjust your monthly budget or disable auto-disable in the AI Usage settings.
        </p>
    </div>

    <div class="footer">
        <p>Alpha eLibrary - AI-Powered Library Management<br>
        <a href="{{ url('/admin/settings/ai-usage') }}" style="color: #7c3aed;">Manage AI Settings</a></p>
    </div>
</body>
</html>
