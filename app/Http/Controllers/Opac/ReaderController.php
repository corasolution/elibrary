<?php

namespace App\Http\Controllers\Opac;

use App\Http\Controllers\Controller;
use App\Models\Tenant\DigitalResource;
use App\Services\DigitalAssetService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReaderController extends Controller
{
    public function __construct(private readonly DigitalAssetService $assetService) {}

    public function show(Request $request, string $resourceId): \Inertia\Response|\Illuminate\Http\RedirectResponse
    {
        $resource = DigitalResource::with('bibliographicRecord')->findOrFail($request->route('resourceId', $resourceId));
        $patronId = $request->user('patron')?->id;

        if (! $this->assetService->canAccess($resource, $patronId)) {
            $slug = $request->segment(1);
            return redirect()->route('library.opac.login', ['slug' => $slug])
                ->with('error', 'You must be logged in to access this resource.');
        }

        $this->assetService->logAccess($resource, $request, 'view');

        $url = $this->assetService->signedUrl($resource, expiryMinutes: 120);

        return Inertia::render('Opac/Reader', [
            'resource' => $resource,
            'record'   => $resource->bibliographicRecord,
            'url'      => $url,
        ]);
    }

    public function download(Request $request, string $resourceId): \Illuminate\Http\RedirectResponse
    {
        $resource = DigitalResource::findOrFail($request->route('resourceId', $resourceId));
        $patronId = $request->user('patron')?->id;

        if (! $this->assetService->canAccess($resource, $patronId)) {
            abort(403, 'Access denied.');
        }

        $this->assetService->logAccess($resource, $request, 'download');

        $url = $this->assetService->signedUrl($resource, expiryMinutes: 5);

        return redirect($url);
    }
}
