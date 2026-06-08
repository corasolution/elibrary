<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .stats { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stats-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .stats-row:last-child { border-bottom: none; }
        .stats-label { font-weight: 600; color: #6b7280; }
        .stats-value { font-weight: bold; color: #111827; }
        .overage { color: #dc2626; }
        .disabled-notice { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚨 AI Budget Exceeded</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Monthly Limit Reached - Action Required</p>
    </div>

    <div class="content">
        <p>Hello {{ $libraryName }} Admin,</p>

        <div class="alert-box">
            <strong>🚨 Budget Exceeded:</strong> Your library has exceeded its monthly AI budget limit.
        </div>

        <div class="stats">
            <div class="stats-row">
                <span class="stats-label">Monthly Budget:</span>
                <span class="stats-value">${{ $budgetLimit }}</span>
            </div>
            <div class="stats-row">
                <span class="stats-label">Current Usage:</span>
                <span class="stats-value">${{ $currentUsage }}</span>
            </div>
            <div class="stats-row">
                <span class="stats-label">Over Budget:</span>
                <span class="stats-value overage">+${{ $overageAmount }}</span>
            </div>
        </div>

        @if($autoDisabled)
        <div class="disabled-notice">
            <strong>⚠️ AI Features Temporarily Disabled</strong><br>
            <span style="font-size: 14px; color: #92400e;">
                AI-powered features have been automatically disabled to prevent further costs.
                You can re-enable them by increasing your budget.
            </span>
        </div>
        @endif

        <p><strong>What Should You Do?</strong></p>
        <ol>
            <li><strong>Increase Your Budget:</strong> Adjust your monthly AI budget to accommodate your usage</li>
            <li><strong>Review Usage:</strong> Check which AI features are consuming the most budget</li>
            <li><strong>Optimize:</strong> Consider reducing AI usage or relying more on manual cataloging</li>
            @if($autoDisabled)
            <li><strong>Re-enable AI:</strong> Update your budget to resume AI-powered features</li>
            @endif
        </ol>

        <a href="{{ url('/admin/settings/ai-usage') }}" class="button">
            Manage Budget & Settings
        </a>

        <p style="margin-top: 30px; padding: 15px; background: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 4px;">
            <strong>💡 Cost Optimization Tips:</strong><br>
            <span style="font-size: 14px; color: #0c4a6e;">
                • Batch catalog entries together<br>
                • Use AI selectively for complex records<br>
                • Leverage the 70%+ cache hit rate by searching similar records<br>
                • Consider a higher budget for peak cataloging months
            </span>
        </p>
    </div>

    <div class="footer">
        <p>Alpha eLibrary - AI-Powered Library Management<br>
        <a href="{{ url('/admin/settings/ai-usage') }}" style="color: #dc2626;">Update Budget Settings</a> |
        <a href="{{ url('/admin/settings/ai-usage/export') }}" style="color: #dc2626;">Download Usage Report</a></p>
    </div>
</body>
</html>
