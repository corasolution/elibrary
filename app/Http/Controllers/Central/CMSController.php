<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\CMSTranslation;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CMSController extends Controller
{
    public function __construct(
        private TranslationService $translationService
    ) {}

    /**
     * List all translations with filters
     */
    public function index(Request $request)
    {
        $query = CMSTranslation::query()
            ->with(['creator:id,name'])
            ->orderBy('section')
            ->orderBy('key');

        // Filters
        if ($section = $request->get('section')) {
            $query->where('section', $section);
        }

        if ($status = $request->get('status')) {
            if ($status === 'needs_translation') {
                $query->needsTranslation();
            } else {
                $query->where('translation_status', $status);
            }
        }

        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('en_value', 'like', "%{$search}%")
                  ->orWhere('km_value', 'like', "%{$search}%");
            });
        }

        $translations = $query->paginate(50)->through(function ($t) {
            return [
                'id' => $t->id,
                'section' => $t->section,
                'key' => $t->key,
                'en_value' => $t->en_value,
                'km_value' => $t->km_value,
                'translation_status' => $t->translation_status,
                'is_published' => $t->is_published,
                'is_active' => $t->is_active,
                'updated_at' => $t->updated_at->format('Y-m-d H:i'),
            ];
        });

        $sections = CMSTranslation::select('section')
            ->distinct()
            ->orderBy('section')
            ->pluck('section');

        return Inertia::render('Central/CMS/Index', [
            'translations' => $translations,
            'sections' => $sections,
            'filters' => $request->only(['section', 'status', 'q']),
            'stats' => [
                'total' => CMSTranslation::count(),
                'published' => CMSTranslation::where('is_published', true)->count(),
                'active' => CMSTranslation::active()->count(),
                'inactive' => CMSTranslation::inactive()->count(),
                'needs_translation' => CMSTranslation::needsTranslation()->count(),
            ],
        ]);
    }

    /**
     * Create/Edit form
     */
    public function form(?int $id = null)
    {
        $translation = $id ? CMSTranslation::with('versions')->findOrFail($id) : null;

        return Inertia::render('Central/CMS/Form', [
            'translation' => $translation,
            'sections' => ['landing', 'home', 'pricing', 'about', 'contact', 'demo', 'features'],
        ]);
    }

    /**
     * Store new translation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'section' => 'required|string|max:50',
            'key' => 'required|string|max:100|unique:cms_translations,key',
            'en_value' => 'required|string',
            'km_value' => 'nullable|string',
            'description' => 'nullable|string',
            'is_published' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth('central')->id();
        $validated['updated_by'] = auth('central')->id();
        $validated['translation_status'] = $validated['km_value'] ? 'manual' : 'pending';

        $translation = CMSTranslation::create($validated);

        return redirect()->route('central.cms.index')
            ->with('success', "Translation key created: {$translation->key}");
    }

    /**
     * Update translation
     */
    public function update(Request $request, int $id)
    {
        $translation = CMSTranslation::findOrFail($id);

        $validated = $request->validate([
            'section' => 'required|string|max:50',
            'key' => "required|string|max:100|unique:cms_translations,key,{$id}",
            'en_value' => 'required|string',
            'km_value' => 'nullable|string',
            'description' => 'nullable|string',
            'is_published' => 'boolean',
            'is_active' => 'boolean',
            'change_note' => 'nullable|string',
        ]);

        // Save version before updating if content changed
        if ($translation->en_value !== $validated['en_value'] ||
            $translation->km_value !== $validated['km_value']) {
            $translation->saveVersion($validated['change_note'] ?? 'Updated via CMS');
        }

        $translation->update([
            'section' => $validated['section'],
            'key' => $validated['key'],
            'en_value' => $validated['en_value'],
            'km_value' => $validated['km_value'],
            'description' => $validated['description'] ?? null,
            'is_published' => $validated['is_published'] ?? $translation->is_published,
            'updated_by' => auth('central')->id(),
            'translation_status' => $validated['km_value'] ? 'manual' : 'pending',
        ]);

        return back()->with('success', 'Translation updated successfully.');
    }

    /**
     * Translate single key via API
     */
    public function translate(Request $request, int $id)
    {
        $translation = CMSTranslation::findOrFail($id);

        $result = $this->translationService->translateToKhmer(
            $translation->en_value,
            $translation->id
        );

        if ($result['success']) {
            $translation->update([
                'km_value' => $result['translation'],
                'translation_status' => 'auto',
                'translation_method' => 'gemini',
                'updated_by' => auth('central')->id(),
            ]);

            return back()->with('success', 'Translation completed successfully.');
        }

        return back()->withErrors(['translation' => $result['error']]);
    }

    /**
     * Batch translate missing Khmer translations
     */
    public function batchTranslate(Request $request)
    {
        $section = $request->get('section');

        $query = CMSTranslation::needsTranslation();
        if ($section) {
            $query->section($section);
        }

        $pending = $query->get();

        if ($pending->isEmpty()) {
            return back()->with('info', 'No translations need to be processed.');
        }

        $success = 0;
        $failed = 0;

        foreach ($pending as $translation) {
            $result = $this->translationService->translateToKhmer(
                $translation->en_value,
                $translation->id
            );

            if ($result['success']) {
                $translation->update([
                    'km_value' => $result['translation'],
                    'translation_status' => 'auto',
                    'translation_method' => 'gemini',
                ]);
                $success++;
            } else {
                $failed++;
            }

            // Rate limiting: wait 500ms between requests
            usleep(500000);
        }

        $message = "Translated {$success} keys successfully.";
        if ($failed > 0) {
            $message .= " {$failed} failed.";
        }

        return back()->with('success', $message);
    }

    /**
     * Publish translations (export to JSON files)
     */
    public function publish()
    {
        try {
            $this->translationService->exportToFiles();

            return back()->with('success', 'Translations published successfully. Rebuild frontend to apply changes.');
        } catch (\Throwable $e) {
            return back()->withErrors(['publish' => $e->getMessage()]);
        }
    }

    /**
     * Import translations from JSON files
     */
    public function import()
    {
        try {
            $count = $this->translationService->importFromFiles();

            return back()->with('success', "Imported {$count} translation keys.");
        } catch (\Throwable $e) {
            return back()->withErrors(['import' => $e->getMessage()]);
        }
    }

    /**
     * Toggle active status (show/hide from public)
     */
    public function toggleActive(int $id)
    {
        $translation = CMSTranslation::findOrFail($id);

        $translation->update([
            'is_active' => !$translation->is_active,
            'updated_by' => auth('central')->id(),
        ]);

        $status = $translation->is_active ? 'active' : 'inactive';

        return back()->with('success', "Translation is now {$status}.");
    }

    /**
     * Delete translation
     */
    public function destroy(int $id)
    {
        $translation = CMSTranslation::findOrFail($id);
        $key = $translation->key;
        $translation->delete();

        return back()->with('success', "Translation '{$key}' deleted.");
    }
}
