<?php

namespace App\Services;

use App\Models\Tenant\AIUsageLog;
use App\Models\Tenant\LibrarySetting;
use App\Mail\BudgetAlertMail;
use App\Mail\BudgetExceededMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class BudgetMonitorService
{
    /**
     * Check budget and send alerts if thresholds are reached
     * Called after each AI API usage is logged
     */
    public function checkBudgetAndNotify(): void
    {
        // Get budget settings
        $budgetLimit = $this->getBudgetLimit();

        // Skip if unlimited budget (0 or null)
        if (!$budgetLimit || $budgetLimit <= 0) {
            return;
        }

        $currentUsage = $this->getCurrentMonthUsage();
        $percentage = ($currentUsage / $budgetLimit) * 100;

        // Get alert threshold (default 80%)
        $alertThreshold = $this->getAlertThreshold();
        $alertPercentage = $alertThreshold * 100;

        // Check if we've exceeded 100%
        if ($percentage >= 100) {
            $this->handleBudgetExceeded($currentUsage, $budgetLimit);
        }
        // Check if we've reached alert threshold (e.g., 80%)
        elseif ($percentage >= $alertPercentage) {
            $this->handleBudgetAlert($currentUsage, $budgetLimit, $percentage);
        }
    }

    /**
     * Handle budget alert (80% threshold)
     */
    private function handleBudgetAlert(float $currentUsage, float $budgetLimit, float $percentage): void
    {
        // Check if alert already sent this month
        if ($this->wasAlertSentThisMonth('80%')) {
            return;
        }

        // Get library admin emails
        $adminEmails = $this->getAdminEmails();

        if (empty($adminEmails)) {
            return;
        }

        // Get library name
        $libraryName = $this->getLibraryName();

        // Send email to all admins
        foreach ($adminEmails as $email) {
            try {
                Mail::to($email)->send(new BudgetAlertMail(
                    $libraryName,
                    $currentUsage,
                    $budgetLimit,
                    $percentage
                ));
            } catch (\Throwable $e) {
                Log::error("Failed to send budget alert email to {$email}: " . $e->getMessage());
            }
        }

        // Mark alert as sent
        $this->markAlertSent('80%');
    }

    /**
     * Handle budget exceeded (100%)
     */
    private function handleBudgetExceeded(float $currentUsage, float $budgetLimit): void
    {
        // Check if alert already sent this month
        if ($this->wasAlertSentThisMonth('100%')) {
            return;
        }

        // Check if auto-disable is enabled
        $autoDisable = $this->shouldAutoDisable();

        if ($autoDisable) {
            $this->disableAIFeatures();
        }

        // Get library admin emails
        $adminEmails = $this->getAdminEmails();

        if (empty($adminEmails)) {
            return;
        }

        // Get library name
        $libraryName = $this->getLibraryName();

        // Send email to all admins
        foreach ($adminEmails as $email) {
            try {
                Mail::to($email)->send(new BudgetExceededMail(
                    $libraryName,
                    $currentUsage,
                    $budgetLimit,
                    $autoDisable
                ));
            } catch (\Throwable $e) {
                Log::error("Failed to send budget exceeded email to {$email}: " . $e->getMessage());
            }
        }

        // Mark alert as sent
        $this->markAlertSent('100%');
    }

    /**
     * Get current month's total AI usage cost
     */
    private function getCurrentMonthUsage(): float
    {
        return (float) AIUsageLog::thisMonth()->sum('cost_usd');
    }

    /**
     * Get budget limit from settings
     */
    private function getBudgetLimit(): ?float
    {
        $setting = LibrarySetting::where('key', 'ai_monthly_budget')->first();
        return $setting ? (float) $setting->value : null;
    }

    /**
     * Get alert threshold from settings
     */
    private function getAlertThreshold(): float
    {
        $setting = LibrarySetting::where('key', 'ai_budget_alert_threshold')->first();
        return $setting ? (float) $setting->value : 0.80;
    }

    /**
     * Check if auto-disable is enabled
     */
    private function shouldAutoDisable(): bool
    {
        $setting = LibrarySetting::where('key', 'ai_auto_disable_on_budget')->first();
        return $setting ? $setting->value === 'true' : true;
    }

    /**
     * Disable AI features
     */
    private function disableAIFeatures(): void
    {
        LibrarySetting::updateOrCreate(
            ['key' => 'ai_features_enabled'],
            ['value' => 'false', 'group' => 'ai']
        );

        Log::info('AI features auto-disabled due to budget exceeded');
    }

    /**
     * Get admin email addresses
     */
    private function getAdminEmails(): array
    {
        // Get all users with admin/library_admin role
        return \App\Models\User::whereHas('roles', function($query) {
            $query->whereIn('name', ['admin', 'library_admin', 'super_admin']);
        })->pluck('email')->toArray();
    }

    /**
     * Get library name
     */
    private function getLibraryName(): string
    {
        // This will be the tenant's name
        // For now, use a default; in production this should come from tenant context
        return config('app.name', 'Your Library');
    }

    /**
     * Check if alert was already sent this month
     */
    private function wasAlertSentThisMonth(string $type): bool
    {
        $key = "ai_budget_alert_sent_{$type}_" . now()->format('Y-m');
        $setting = LibrarySetting::where('key', $key)->first();
        return $setting && $setting->value === 'true';
    }

    /**
     * Mark alert as sent for this month
     */
    private function markAlertSent(string $type): void
    {
        $key = "ai_budget_alert_sent_{$type}_" . now()->format('Y-m');
        LibrarySetting::updateOrCreate(
            ['key' => $key],
            ['value' => 'true', 'group' => 'ai']
        );
    }
}
