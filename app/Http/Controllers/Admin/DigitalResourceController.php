<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessDigitalFile;
use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\DigitalResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DigitalResourceController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['q', 'format', 'access_type']);

        try {
            $resources = DigitalResource::with('bibliographicRecord:id,title')
                ->when($filters['q'] ?? null, function ($q, $search) {
                    $q->whereHas('bibliographicRecord', fn ($r) => $r->where('title', 'like', "%{$search}%"))
                      ->orWhere('original_filename', 'like', "%{$search}%");
                })
                ->when($filters['format'] ?? null, fn ($q, $f) => $q->where('format', $f))
                ->when($filters['access_type'] ?? null, fn ($q, $a) => $q->where('access_type', $a))
                ->latest()
                ->paginate(25);
        } catch (\Throwable) {
            $resources = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Digital/Index', compact('resources', 'filters'));
    }

    public function create()
    {
        return Inertia::render('Admin/Digital/Form', [
            'resource' => null,
            'biblios'  => $this->biblioOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'biblio_id'   => 'required|uuid|exists:bibliographic_records,id',
            'format'      => 'required|string|max:20',
            'access_type' => 'required|in:open_access,registered,restricted,embargo',
            'file'        => 'nullable|file|max:204800',
            'url'         => 'nullable|url',
        ]);

        try {
            $data = $request->only(['biblio_id', 'format', 'access_type', 'embargo_until', 'version', 'url', 'is_external']);
            $data['id'] = (string) Str::uuid();

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $storageService = app(\App\Services\StorageProviderService::class);
                $disk = $storageService->getActiveDisk();

                $path = $file->store("resources/{$data['id']}", $disk);
                $data['file_path']         = $path;
                $data['original_filename'] = $file->getClientOriginalName();
                $data['file_size_bytes']   = $file->getSize();
                $data['mime_type']         = $file->getMimeType();
                $data['is_external']       = false;
            }

            $resource = DigitalResource::create($data);

            if (!empty($data['file_path'])) {
                $activeDisk = app(\App\Services\StorageProviderService::class)->getActiveDisk();
                ProcessDigitalFile::dispatch($resource, $activeDisk)->onQueue('digital-processing');
            }
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.digital.index')->with('success', 'Digital resource created.');
    }

    public function edit(string $id)
    {
        try {
            $resource = DigitalResource::with('bibliographicRecord:id,title')->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        return Inertia::render('Admin/Digital/Form', [
            'resource' => $resource,
            'biblios'  => $this->biblioOptions(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'access_type' => 'required|in:open_access,registered,restricted,embargo',
        ]);

        try {
            $resource = DigitalResource::findOrFail($id);
            $resource->update($request->only(['format', 'access_type', 'embargo_until', 'version', 'url', 'is_external']));
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.digital.index')->with('success', 'Resource updated.');
    }

    public function destroy(string $id)
    {
        try {
            $resource = DigitalResource::findOrFail($id);
            // Soft delete only - storage files preserved for 30-day restore window
            $resource->delete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.digital.index')
            ->with('success', 'Resource moved to trash. It will be permanently deleted after 30 days.');
    }

    public function trash()
    {
        $resources = DigitalResource::onlyTrashed()
            ->with('bibliographicRecord')
            ->orderByDesc('deleted_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Digital/Trash', [
            'resources' => $resources,
        ]);
    }

    public function restore(string $id)
    {
        try {
            DigitalResource::onlyTrashed()->findOrFail($id)->restore();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.digital.trash')
            ->with('success', 'Digital resource restored successfully!');
    }

    public function forceDelete(string $id)
    {
        try {
            $resource = DigitalResource::onlyTrashed()->findOrFail($id);
            // Force delete triggers storage cleanup via model events
            $resource->forceDelete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.digital.trash')
            ->with('success', 'Digital resource permanently deleted.');
    }

    private function biblioOptions()
    {
        return rescue(fn () =>
            BibliographicRecord::where('record_status', 'active')
                ->orderBy('title')
                ->limit(500)
                ->get(['id', 'title']),
            collect()
        );
    }
}
