<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Central\CentralAuthController;
use App\Http\Controllers\Central\TenantController;
use App\Http\Controllers\Central\PartnerController;
use App\Http\Controllers\Central\PartnerPortalController;
use App\Http\Controllers\Central\PlatformSettingsController;
use App\Http\Controllers\Central\PlanController;
use App\Http\Controllers\Central\PaymentController;
use App\Http\Controllers\Central\TeamController;
use App\Http\Controllers\Central\RoleController;
use App\Http\Controllers\Central\CMSController;
use App\Http\Controllers\Central\InvoiceController;

/*
|--------------------------------------------------------------------------
| Central Admin Routes
|--------------------------------------------------------------------------
|
| Platform-level administration routes for Super Admins and Partners.
| Uses 'central' authentication guard for separate session management.
|
*/

// Test route
Route::get('/test-central', function() {
    return 'Central routes are working!';
});

Route::prefix('central')
    ->name('central.')
    ->group(function () {

    // ========================================
    // Authentication Routes
    // ========================================
    Route::get('/login', [CentralAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [CentralAuthController::class, 'login']);

    // ========================================
    // Protected Routes (Authenticated central users)
    // ========================================
    Route::middleware(['auth:central'])->group(function () {

        // Logout
        Route::post('/logout', [CentralAuthController::class, 'logout'])->name('logout');

        // Dashboard - redirect based on role
        Route::get('/', function () {
            $user = auth('central')->user();

            // Partners and Sales Agents go to Partner Portal
            if ($user->isPartner() || $user->isSalesAgent()) {
                return redirect()->route('central.partner-portal.dashboard');
            }

            // Super Admins and others go to Libraries (Tenants) list
            return redirect()->route('central.tenants.index');
        })->name('dashboard');

        // ========================================
        // Partner Portal (for Partners & Sales Agents)
        // ========================================
        Route::prefix('portal')->name('partner-portal.')->group(function () {
            Route::get('/', [PartnerPortalController::class, 'dashboard'])->name('dashboard');
        });

        // ========================================
        // Subscription Plans (Super Admin only)
        // ========================================
        Route::prefix('plans')->name('plans.')->group(function () {
            Route::get('/', [PlanController::class, 'index'])->name('index');
            Route::get('/create', [PlanController::class, 'create'])->name('create');
            Route::post('/', [PlanController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [PlanController::class, 'edit'])->name('edit');
            Route::put('/{id}', [PlanController::class, 'update'])->name('update');
            Route::delete('/{id}', [PlanController::class, 'destroy'])->name('destroy');
        });

        // ========================================
        // Payment Verification (Super Admin only)
        // ========================================
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::get('/', [PaymentController::class, 'index'])->name('index');
            Route::post('/{id}/verify', [PaymentController::class, 'verify'])->name('verify');
            Route::post('/{id}/reject', [PaymentController::class, 'reject'])->name('reject');
        });

        // ========================================
        // Invoice Management (Super Admin only)
        // ========================================
        Route::prefix('invoices')->name('invoices.')->group(function () {
            Route::get('/', [InvoiceController::class, 'index'])->name('index');
            Route::get('/{id}/download', [InvoiceController::class, 'download'])->name('download');
            Route::get('/{id}/preview', [InvoiceController::class, 'preview'])->name('preview');
            Route::post('/{id}/regenerate', [InvoiceController::class, 'regenerate'])->name('regenerate');
            Route::post('/{id}/resend', [InvoiceController::class, 'resend'])->name('resend');
        });

        // ========================================
        // Tenants Management
        // (Accessible by all central users with scoping)
        // ========================================
        Route::prefix('tenants')->name('tenants.')->group(function () {
            Route::get('/', [TenantController::class, 'index'])->name('index');
            Route::get('/create', [TenantController::class, 'create'])->name('create');
            Route::post('/', [TenantController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [TenantController::class, 'edit'])->name('edit');
            Route::put('/{id}', [TenantController::class, 'update'])->name('update');
            Route::delete('/{id}', [TenantController::class, 'destroy'])->name('destroy');

            // Slug availability check
            Route::get('/check-slug/{slug}', [TenantController::class, 'checkSlug'])->name('check-slug');
        });

        // ========================================
        // Partner Management
        // (Super Admin only)
        // ========================================
        Route::prefix('partners')->name('partners.')->group(function () {
            Route::get('/', [PartnerController::class, 'index'])->name('index');
            Route::get('/create', [PartnerController::class, 'create'])->name('create');
            Route::post('/', [PartnerController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [PartnerController::class, 'edit'])->name('edit');
            Route::put('/{id}', [PartnerController::class, 'update'])->name('update');
            Route::delete('/{id}', [PartnerController::class, 'destroy'])->name('destroy');

            // Tenant Assignment
            Route::get('/{id}/assign-tenants', [PartnerController::class, 'showAssignTenants'])->name('assign-tenants.show');
            Route::post('/{id}/assign-tenants', [PartnerController::class, 'assignTenants'])->name('assign-tenants');
        });

        // ========================================
        // Team Members
        // (Super Admin only)
        // ========================================
        Route::prefix('team')->name('team.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Central\TeamController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Central\TeamController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Central\TeamController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [\App\Http\Controllers\Central\TeamController::class, 'edit'])->name('edit');
            Route::put('/{id}', [\App\Http\Controllers\Central\TeamController::class, 'update'])->name('update');
            Route::delete('/{id}', [\App\Http\Controllers\Central\TeamController::class, 'destroy'])->name('destroy');
        });

        // ========================================
        // Roles & Permissions
        // (Super Admin only)
        // ========================================
        Route::prefix('roles')->name('roles.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Central\RoleController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Central\RoleController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Central\RoleController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [\App\Http\Controllers\Central\RoleController::class, 'edit'])->name('edit');
            Route::put('/{id}', [\App\Http\Controllers\Central\RoleController::class, 'update'])->name('update');
            Route::delete('/{id}', [\App\Http\Controllers\Central\RoleController::class, 'destroy'])->name('destroy');
        });

        // ========================================
        // Content Management System (CMS)
        // (Super Admin only)
        // ========================================
        Route::prefix('cms')->name('cms.')->group(function () {
            Route::get('/', [CMSController::class, 'index'])->name('index');
            Route::get('/create', [CMSController::class, 'form'])->name('create');
            Route::post('/', [CMSController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [CMSController::class, 'form'])->name('edit');
            Route::put('/{id}', [CMSController::class, 'update'])->name('update');
            Route::delete('/{id}', [CMSController::class, 'destroy'])->name('destroy');

            // Translation actions
            Route::post('/{id}/translate', [CMSController::class, 'translate'])->name('translate');
            Route::post('/batch-translate', [CMSController::class, 'batchTranslate'])->name('batch-translate');
            Route::post('/{id}/toggle-active', [CMSController::class, 'toggleActive'])->name('toggle-active');

            // Publishing
            Route::post('/publish', [CMSController::class, 'publish'])->name('publish');
            Route::post('/import', [CMSController::class, 'import'])->name('import');
        });

        // ========================================
        // Platform Settings
        // (Super Admin only)
        // ========================================
        Route::prefix('settings')->name('settings.')->group(function () {
            // AI Settings
            Route::get('/ai', [PlatformSettingsController::class, 'aiSettings'])->name('ai');
            Route::post('/ai', [PlatformSettingsController::class, 'updateAISettings'])->name('ai.update');
            Route::post('/ai/test-connection', [PlatformSettingsController::class, 'testConnection'])->name('ai.test-connection');
            Route::get('/ai-usage', [PlatformSettingsController::class, 'aiUsage'])->name('ai-usage');

            // Storage Settings
            Route::get('/storage', [PlatformSettingsController::class, 'storageSettings'])->name('storage');
            Route::post('/storage', [PlatformSettingsController::class, 'updateStorageSettings'])->name('storage.update');
            Route::post('/storage/test-connection', [PlatformSettingsController::class, 'testStorageConnection'])->name('storage.test-connection');

            // Translation Settings
            Route::get('/translation', [PlatformSettingsController::class, 'translationSettings'])->name('translation');
            Route::post('/translation', [PlatformSettingsController::class, 'updateTranslationSettings'])->name('translation.update');

            // Payment Settings (QR Code)
            Route::get('/payment', [PlatformSettingsController::class, 'paymentSettings'])->name('payment');
            Route::post('/payment', [PlatformSettingsController::class, 'updatePaymentSettings'])->name('payment.update');

            // General Settings
            Route::get('/general', [PlatformSettingsController::class, 'generalSettings'])->name('general');
            Route::post('/general', [PlatformSettingsController::class, 'updateGeneralSettings'])->name('general.update');

            // Invoice Settings
            Route::get('/invoice', [PlatformSettingsController::class, 'invoiceSettings'])->name('invoice');
            Route::post('/invoice', [PlatformSettingsController::class, 'updateInvoiceSettings'])->name('invoice.update');
        });
    });
});
