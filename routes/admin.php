<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CatalogController;
use App\Http\Controllers\Admin\PhysicalItemController;
use App\Http\Controllers\Admin\DigitalResourceController;
use App\Http\Controllers\Admin\PatronController;
use App\Http\Controllers\Admin\LoanController;
use App\Http\Controllers\Admin\ReservationController;
use App\Http\Controllers\Admin\AcquisitionController;
use App\Http\Controllers\Admin\SerialController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\QuickCheckoutController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\FineController;
use App\Http\Controllers\Admin\PatronCategoryController;
use App\Http\Controllers\Admin\CollectionLocationController;
use App\Http\Controllers\Admin\CatalogExcelController;
use App\Http\Controllers\Admin\ThemeController;
use App\Http\Controllers\Admin\StorageController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\UserPreferenceController;

// TEST ROUTE
Route::get('/test-admin', function() {
    return 'Admin routes are working!';
});

// ─── Staff Auth ───────────────────────────────────────────────────────────────
Route::prefix('admin')->name('admin.')->group(function () {

    Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AdminAuthController::class, 'login'])->name('login.post');
    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout')->middleware('auth');

    // ─── Authenticated Staff Routes ───────────────────────────────────────────
    Route::middleware(['auth', 'role:super_admin|library_admin|cataloger|circulation_staff|reader_services'])
        ->group(function () {

            Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

            // User Preferences
            Route::patch('/preferences/language', [UserPreferenceController::class, 'updateLanguage'])
                ->name('preferences.language');

            // Catalog
            Route::prefix('catalog')->name('catalog.')->group(function () {
                Route::get('/', [CatalogController::class, 'index'])->name('index');
                Route::get('/create', [CatalogController::class, 'create'])->name('create');
                Route::post('/', [CatalogController::class, 'store'])->name('store');
                Route::get('/trash', [CatalogController::class, 'trash'])->name('trash');
                Route::get('/lookup-isbn/{isbn}', [CatalogController::class, 'lookupIsbn'])->name('isbn-lookup');
                Route::get('/import-search', [CatalogController::class, 'importSearch'])->name('import-search');

                // Excel import/export (must be before /{id} wildcard)
                Route::get('/excel/export',           [CatalogExcelController::class, 'exportAll'])->name('excel.export-all');
                Route::get('/excel/export-filtered',  [CatalogExcelController::class, 'exportFiltered'])->name('excel.export-filtered');
                Route::get('/excel/template',         [CatalogExcelController::class, 'downloadTemplate'])->name('excel.template');
                Route::post('/excel/import/upload',   [CatalogExcelController::class, 'importUpload'])->name('excel.import-upload');
                Route::post('/excel/import/process',  [CatalogExcelController::class, 'importProcess'])->name('excel.import-process');
                Route::get('/excel/import/progress',  [CatalogExcelController::class, 'importProgress'])->name('excel.import-progress');
                Route::get('/excel/import/errors',    [CatalogExcelController::class, 'importErrors'])->name('excel.import-errors');

                Route::get('/{id}', [CatalogController::class, 'show'])->name('show');
                Route::get('/{id}/edit', [CatalogController::class, 'edit'])->name('edit');
                Route::put('/{id}', [CatalogController::class, 'update'])->name('update');
                Route::delete('/{id}', [CatalogController::class, 'destroy'])->name('destroy');
                Route::post('/{id}/restore', [CatalogController::class, 'restore'])->name('restore');
                Route::delete('/{id}/force', [CatalogController::class, 'forceDelete'])->name('force-delete');
                Route::get('/{id}/bibframe.jsonld', [CatalogController::class, 'exportBibframe'])->name('export-bibframe');
                Route::get('/{id}/marc.xml', [CatalogController::class, 'exportMarc'])->name('export-marc');
            });

            // Physical Items
            Route::prefix('items')->name('items.')->group(function () {
                Route::get('/', [PhysicalItemController::class, 'index'])->name('index');
                Route::get('/create', [PhysicalItemController::class, 'create'])->name('create');
                Route::post('/', [PhysicalItemController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [PhysicalItemController::class, 'edit'])->name('edit');
                Route::put('/{id}', [PhysicalItemController::class, 'update'])->name('update');
                Route::delete('/{id}', [PhysicalItemController::class, 'destroy'])->name('destroy');
            });

            // Digital Resources
            Route::prefix('digital')->name('digital.')->group(function () {
                Route::get('/', [DigitalResourceController::class, 'index'])->name('index');
                Route::get('/trash', [DigitalResourceController::class, 'trash'])->name('trash');
                Route::get('/create', [DigitalResourceController::class, 'create'])->name('create');
                Route::post('/', [DigitalResourceController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [DigitalResourceController::class, 'edit'])->name('edit');
                Route::put('/{id}', [DigitalResourceController::class, 'update'])->name('update');
                Route::delete('/{id}', [DigitalResourceController::class, 'destroy'])->name('destroy');
                Route::post('/{id}/restore', [DigitalResourceController::class, 'restore'])->name('restore');
                Route::delete('/{id}/force', [DigitalResourceController::class, 'forceDelete'])->name('force-delete');
            });

            // Patrons
            Route::prefix('patrons')->name('patrons.')->group(function () {
                Route::get('/', [PatronController::class, 'index'])->name('index');
                Route::get('/create', [PatronController::class, 'create'])->name('create');
                Route::post('/', [PatronController::class, 'store'])->name('store');
                Route::get('/{id}', [PatronController::class, 'show'])->name('show');
                Route::get('/{id}/edit', [PatronController::class, 'edit'])->name('edit');
                Route::put('/{id}', [PatronController::class, 'update'])->name('update');
                Route::delete('/{id}', [PatronController::class, 'destroy'])->name('destroy');
            });

            // Circulation
            Route::prefix('circulation')->name('circulation.')->group(function () {
                Route::get('/quick-checkout', [QuickCheckoutController::class, 'index'])->name('quick-checkout');
                Route::get('/kiosk', [QuickCheckoutController::class, 'kiosk'])->name('kiosk');
                Route::post('/lookup-patron', [QuickCheckoutController::class, 'lookupPatron'])->name('lookup-patron');
                Route::post('/lookup-item', [QuickCheckoutController::class, 'lookupItem'])->name('lookup-item');
                Route::post('/checkout', [QuickCheckoutController::class, 'checkout'])->name('checkout');
                Route::post('/checkin', [QuickCheckoutController::class, 'checkin'])->name('checkin');
                Route::post('/renew/{loanId}', [QuickCheckoutController::class, 'renew'])->name('renew');
            });

            Route::prefix('loans')->name('loans.')->group(function () {
                Route::get('/', [LoanController::class, 'index'])->name('index');
                Route::get('/overdue', [LoanController::class, 'overdue'])->name('overdue');
                Route::post('/{id}/return', [LoanController::class, 'return'])->name('return');
                Route::post('/{id}/renew', [LoanController::class, 'renew'])->name('renew');
            });

            Route::prefix('reservations')->name('reservations.')->group(function () {
                Route::get('/', [ReservationController::class, 'index'])->name('index');
                Route::post('/{id}/cancel', [ReservationController::class, 'cancel'])->name('cancel');
                Route::post('/{id}/ready', [ReservationController::class, 'markReady'])->name('ready');
            });

            // Acquisitions
            Route::prefix('acquisitions')->name('acquisitions.')->group(function () {
                Route::get('/', [AcquisitionController::class, 'index'])->name('index');
                Route::get('/create', [AcquisitionController::class, 'create'])->name('create');
                Route::post('/', [AcquisitionController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [AcquisitionController::class, 'edit'])->name('edit');
                Route::put('/{id}', [AcquisitionController::class, 'update'])->name('update');
                Route::delete('/{id}', [AcquisitionController::class, 'destroy'])->name('destroy');
            });

            // Serials
            Route::prefix('serials')->name('serials.')->group(function () {
                Route::get('/', [SerialController::class, 'index'])->name('index');
                Route::get('/create', [SerialController::class, 'create'])->name('create');
                Route::post('/', [SerialController::class, 'store'])->name('store');
                Route::get('/{id}', [SerialController::class, 'show'])->name('show');
                Route::get('/{id}/edit', [SerialController::class, 'edit'])->name('edit');
                Route::put('/{id}', [SerialController::class, 'update'])->name('update');
                Route::delete('/{id}', [SerialController::class, 'destroy'])->name('destroy');
                Route::post('/{id}/generate-issues', [SerialController::class, 'generateIssues'])->name('generate-issues');
                Route::post('/{id}/issues/{issueId}/receive', [SerialController::class, 'receiveIssue'])->name('receive-issue');
                Route::post('/{id}/issues/{issueId}/claim', [SerialController::class, 'claimIssue'])->name('claim-issue');
                Route::post('/{id}/issues/{issueId}/missing', [SerialController::class, 'markMissing'])->name('mark-missing');
            });

            // Fines
            Route::prefix('fines')->name('fines.')->group(function () {
                Route::get('/', [FineController::class, 'index'])->name('index');
                Route::post('/{id}/paid', [FineController::class, 'markPaid'])->name('paid');
                Route::post('/{id}/waive', [FineController::class, 'waive'])->name('waive');
            });

            // Patron Categories
            Route::prefix('patron-categories')->name('patron-categories.')->group(function () {
                Route::get('/', [PatronCategoryController::class, 'index'])->name('index');
                Route::post('/', [PatronCategoryController::class, 'store'])->name('store');
                Route::put('/{id}', [PatronCategoryController::class, 'update'])->name('update');
                Route::delete('/{id}', [PatronCategoryController::class, 'destroy'])->name('destroy');
            });

            // Collections & Locations
            Route::prefix('collections-locations')->name('collections-locations.')->group(function () {
                Route::get('/', [CollectionLocationController::class, 'index'])->name('index');
                Route::post('/collections', [CollectionLocationController::class, 'storeCollection'])->name('collections.store');
                Route::put('/collections/{id}', [CollectionLocationController::class, 'updateCollection'])->name('collections.update');
                Route::delete('/collections/{id}', [CollectionLocationController::class, 'destroyCollection'])->name('collections.destroy');
                Route::post('/locations', [CollectionLocationController::class, 'storeLocation'])->name('locations.store');
                Route::put('/locations/{id}', [CollectionLocationController::class, 'updateLocation'])->name('locations.update');
                Route::delete('/locations/{id}', [CollectionLocationController::class, 'destroyLocation'])->name('locations.destroy');
            });

            // Reports
            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/circulation',  [ReportController::class, 'circulation'])->name('circulation');
                Route::get('/collection',   [ReportController::class, 'collection'])->name('collection');
                Route::get('/digital',      [ReportController::class, 'digital'])->name('digital');
                Route::get('/overdue',      [ReportController::class, 'overdue'])->name('overdue');
                Route::get('/acquisitions', [ReportController::class, 'acquisitions'])->name('acquisitions');
            });

            // Settings
            Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
            Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');

            // Theme Settings
            Route::prefix('settings/theme')->name('settings.theme.')->group(function () {
                Route::get('/', [ThemeController::class, 'index'])->name('index');
                Route::post('/', [ThemeController::class, 'update'])->name('update');
                Route::post('/reset', [ThemeController::class, 'reset'])->name('reset');
            });

            // Storage Settings
            Route::prefix('settings/storage')->name('settings.storage.')->group(function () {
                Route::get('/', [StorageController::class, 'index'])->name('index');
                Route::post('/', [StorageController::class, 'update'])->name('update');
                Route::post('/test', [StorageController::class, 'testConnection'])->name('test');
                Route::post('/migrate', [StorageController::class, 'startMigration'])->name('migrate');
                Route::get('/migrations', [StorageController::class, 'allMigrations'])->name('migrations');
                Route::get('/migrations/{id}', [StorageController::class, 'migrationProgress'])->name('migration-progress');
            });

            // Super Admin Routes (Tenants & Plans)
            Route::middleware('role:super_admin')->group(function () {
                // Tenants
                Route::prefix('tenants')->name('tenants.')->group(function () {
                    Route::get('/', [TenantController::class, 'index'])->name('index');
                    Route::get('/create', [TenantController::class, 'create'])->name('create');
                    Route::post('/', [TenantController::class, 'store'])->name('store');
                    Route::get('/{id}/edit', [TenantController::class, 'edit'])->name('edit');
                    Route::put('/{id}', [TenantController::class, 'update'])->name('update');
                    Route::delete('/{id}', [TenantController::class, 'destroy'])->name('destroy');
                });

                // Plans
                Route::prefix('plans')->name('plans.')->group(function () {
                    Route::get('/', [PlanController::class, 'index'])->name('index');
                    Route::get('/create', [PlanController::class, 'create'])->name('create');
                    Route::post('/', [PlanController::class, 'store'])->name('store');
                    Route::get('/{id}/edit', [PlanController::class, 'edit'])->name('edit');
                    Route::put('/{id}', [PlanController::class, 'update'])->name('update');
                    Route::delete('/{id}', [PlanController::class, 'destroy'])->name('destroy');
                });
            });
        });
});
