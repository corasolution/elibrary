<?php

use Illuminate\Support\Facades\Route;

// ─── Public Catalog API ───────────────────────────────────────────────────────
// NOTE: Catalog endpoints are tenant-scoped and live under the {slug} group in
// routes/web.php (e.g. /{slug}/api/v1/catalog/...). They were moved out of this
// non-tenant file because catalog data lives in per-tenant databases — calling
// them here would query the central DB and return nothing.

// ─── Authenticated Patron API ─────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:120,1'])->prefix('v1')->group(function () {
    Route::get('/patron/me', fn () => response()->json(request()->user()));
    Route::get('/patron/loans', fn () => response()->json(
        request()->user()->activeLoans()->with('item.bibliographicRecord')->get()
    ));
    Route::get('/patron/reservations', fn () => response()->json(
        request()->user()->reservations()->with('bibliographicRecord')->get()
    ));
});
