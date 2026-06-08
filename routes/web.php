<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Opac\CatalogController;
use App\Http\Controllers\Opac\ReaderController;
use App\Http\Controllers\Opac\AccountController;
use App\Http\Controllers\Opac\OpacAIController;
use App\Http\Controllers\Auth\PatronAuthController;
use App\Http\Controllers\Central\TenantRegistrationController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Central\CentralAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AICatalogController;
use App\Http\Controllers\Admin\AIUsageController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\OaiPmhController;

// NOTE: Central Admin routes are loaded in routes/central.php
// NOTE: Tenant Admin routes are loaded in routes/admin.php
// This file contains only: Landing pages, Registration, and Tenant OPAC routes

// ─── Marketing / Landing (Central) ───────────────────────────────────────────
Route::get('/', fn () => Inertia::render('Landing/Home'))->name('home');
Route::get('/features', fn () => Inertia::render('Landing/Features'))->name('features');
Route::get('/pricing', [LandingController::class, 'pricing'])->name('pricing');
Route::get('/about', fn () => Inertia::render('Landing/About'))->name('about');
Route::get('/contact', fn () => Inertia::render('Landing/Contact'))->name('contact');
Route::get('/demo', fn () => Inertia::render('Landing/Demo'))->name('demo');

// ─── Tenant Registration (Central) ────────────────────────────────────────────
Route::middleware('web')->group(function () {
    Route::get('/register', [TenantRegistrationController::class, 'showForm'])->name('register');
    Route::post('/register', [TenantRegistrationController::class, 'register'])->name('register.submit');
    Route::get('/registration-pending', [TenantRegistrationController::class, 'pending'])->name('register.pending');
});

// ─── Per-Library OPAC  (/{slug}/...) ──────────────────────────────────────────
// Note: This route group must come AFTER landing pages to avoid conflicts
// Note: Excludes 'central' which is reserved for central admin routes
Route::prefix('{slug}')
    ->middleware(['web', 'tenant.slug'])
    ->name('library.')
    ->where(['slug' => '(?!central)[a-z0-9\-]+']) // Exclude 'central' from slugs
    ->group(function () {

        // OPAC public
        Route::get('/', [CatalogController::class, 'home'])->name('opac.home');

        Route::prefix('catalog')->name('opac.catalog.')->group(function () {
            Route::get('/', [CatalogController::class, 'search'])->name('search');
            Route::get('/{id}', [CatalogController::class, 'show'])->name('show');
        });

        Route::get('/catalog/{id}/cite/{format}', [CatalogController::class, 'citation'])->name('opac.catalog.cite');
        Route::get('/reader/{resourceId}', [ReaderController::class, 'show'])->name('opac.reader');
        Route::get('/download/{resourceId}', [ReaderController::class, 'download'])->name('opac.download');

        // AI-powered search (public)
        Route::prefix('ai')->name('opac.ai.')->group(function () {
            Route::post('/parse-query', [OpacAIController::class, 'parseQuery'])->name('parse-query');
            Route::post('/expand-query', [OpacAIController::class, 'expandQuery'])->name('expand-query');
            Route::post('/suggest', [OpacAIController::class, 'suggest'])->name('suggest');
        });

        // OAI-PMH 2.0 Provider (public, no auth required)
        Route::get('/oai', [OaiPmhController::class, 'handle'])->name('oai');

        // Patron auth
        Route::get('/login', [PatronAuthController::class, 'showLogin'])->name('opac.login');
        Route::post('/login', [PatronAuthController::class, 'login'])->name('opac.login.post');
        Route::post('/logout', [PatronAuthController::class, 'logout'])->name('opac.logout');
        Route::get('/register', [PatronAuthController::class, 'showRegister'])->name('opac.register');
        Route::post('/register', [PatronAuthController::class, 'register'])->name('opac.register.post');

        // Patron account (auth required)
        Route::middleware('auth:patron')->prefix('account')->name('opac.account.')->group(function () {
            Route::get('/', [AccountController::class, 'index'])->name('index');
            Route::get('/loans', [AccountController::class, 'loans'])->name('loans');
            Route::get('/history', [AccountController::class, 'history'])->name('history');
            Route::get('/reservations', [AccountController::class, 'reservations'])->name('reservations');
            Route::post('/reserve', [AccountController::class, 'reserve'])->name('reserve');
            Route::delete('/reservations/{id}', [AccountController::class, 'cancelReservation'])->name('reservations.cancel');
        });
    });
