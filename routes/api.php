<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CatalogApiController;

// ─── Public API (rate limited) ────────────────────────────────────────────────
Route::middleware(['throttle:60,1'])->prefix('v1')->group(function () {
    // Catalog search
    Route::get('/catalog', [CatalogApiController::class, 'index']);
    Route::get('/catalog/search', [CatalogApiController::class, 'search']);
    Route::get('/catalog/{id}', [CatalogApiController::class, 'show']);
    Route::get('/catalog/isbn/{isbn}', [CatalogApiController::class, 'isbnLookup']);

    // Enhanced endpoints (new)
    Route::get('/catalog/{id}/bibframe', [CatalogApiController::class, 'bibframe']);
    Route::get('/catalog/{id}/marc', [CatalogApiController::class, 'marc']);
    Route::get('/catalog/{id}/dublincore', [CatalogApiController::class, 'dublinCore']);
    Route::get('/catalog/{id}/similar', [CatalogApiController::class, 'similar']);

    // Semantic search (if enabled)
    Route::post('/catalog/semantic-search', [CatalogApiController::class, 'semanticSearch']);
});

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
