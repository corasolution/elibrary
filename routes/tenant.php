<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Opac\CatalogController;
use App\Http\Controllers\Opac\ReaderController;
use App\Http\Controllers\Opac\AccountController;
use App\Http\Controllers\Auth\PatronAuthController;

// All routes here are tenant-aware (stancl/tenancy initializes DB context)

// ─── OPAC — Public ────────────────────────────────────────────────────────────
Route::get('/', [CatalogController::class, 'home'])->name('opac.home');

Route::prefix('catalog')->name('opac.catalog.')->group(function () {
    Route::get('/', [CatalogController::class, 'search'])->name('search');
    Route::get('/{id}', [CatalogController::class, 'show'])->name('show');
});

Route::get('/reader/{resourceId}', [ReaderController::class, 'show'])->name('opac.reader');
Route::get('/download/{resourceId}', [ReaderController::class, 'download'])->name('opac.download');

// ─── Patron Auth ──────────────────────────────────────────────────────────────
Route::prefix('login')->name('opac.')->group(function () {
    Route::get('/', [PatronAuthController::class, 'showLogin'])->name('login');
    Route::post('/', [PatronAuthController::class, 'login']);
    Route::post('/logout', [PatronAuthController::class, 'logout'])->name('logout');
});

Route::prefix('register')->name('opac.')->group(function () {
    Route::get('/', [PatronAuthController::class, 'showRegister'])->name('register');
    Route::post('/', [PatronAuthController::class, 'register']);
});

// ─── Patron Account (auth required) ──────────────────────────────────────────
Route::middleware('auth:patron')->prefix('account')->name('opac.account.')->group(function () {
    Route::get('/', [AccountController::class, 'index'])->name('index');
    Route::get('/loans', [AccountController::class, 'loans'])->name('loans');
    Route::get('/history', [AccountController::class, 'history'])->name('history');
    Route::get('/reservations', [AccountController::class, 'reservations'])->name('reservations');
});

// Redirect /account → named route
Route::redirect('/account', '/account/')->name('opac.account');
