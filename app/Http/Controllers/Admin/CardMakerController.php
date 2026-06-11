<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\CardTemplate;
use App\Models\Tenant\LibrarySetting;
use App\Models\Tenant\Patron;
use App\Models\Tenant\PatronCategory;
use App\Services\CardRenderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CardMakerController extends Controller
{
    /** Max patrons rendered synchronously in one batch PDF. */
    private const BATCH_CAP = 500;

    public function __construct(private readonly CardRenderService $cards)
    {
    }

    // ─── Card Maker workspace ────────────────────────────────────────────────
    public function index(Request $request)
    {
        $q        = $request->input('q', '');
        $status   = $request->input('status', '');
        $category = $request->input('category', '');

        try {
            $query = Patron::with('category')->orderBy('first_name');

            if ($q) {
                $like = config('database.default') === 'pgsql' ? 'ilike' : 'like';
                $query->where(function ($qb) use ($q, $like) {
                    $qb->where('first_name', $like, "%{$q}%")
                       ->orWhere('last_name', $like, "%{$q}%")
                       ->orWhere('email', $like, "%{$q}%")
                       ->orWhere('patron_number', $like, "%{$q}%");
                });
            }
            if ($status) {
                $query->where('status', $status);
            }
            if ($category) {
                $query->where('patron_category_id', $category);
            }

            $patrons = $query->paginate(25)->withQueryString();
        } catch (\Throwable) {
            $patrons = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Cards/Index', [
            'patrons'    => $patrons,
            'filters'    => compact('q', 'status', 'category'),
            'categories' => rescue(fn () => PatronCategory::orderBy('name')->get(['id', 'name']), []),
            'templates'  => $this->templateList(),
            'branding'   => $this->branding(),
            'fieldKeys'  => CardTemplate::FIELD_KEYS,
        ]);
    }

    // ─── Template management ─────────────────────────────────────────────────
    public function templatesIndex()
    {
        return Inertia::render('Admin/Cards/Templates/Index', [
            'templates' => rescue(fn () => CardTemplate::orderByDesc('is_default')
                ->orderBy('name')->get(), collect()),
            'branding'  => $this->branding(),
        ]);
    }

    public function templateCreate()
    {
        return Inertia::render('Admin/Cards/Templates/Editor', [
            'template'    => null,
            'defaultElements' => CardTemplate::DEFAULT_ELEMENTS,
            'fieldKeys'   => CardTemplate::FIELD_KEYS,
            'branding'    => $this->branding(),
            'samplePatron' => $this->samplePatronData(),
        ]);
    }

    public function templateEdit(string $id)
    {
        $template = CardTemplate::findOrFail($id);

        return Inertia::render('Admin/Cards/Templates/Editor', [
            'template'    => $template,
            'defaultElements' => CardTemplate::DEFAULT_ELEMENTS,
            'fieldKeys'   => CardTemplate::FIELD_KEYS,
            'branding'    => $this->branding(),
            'samplePatron' => $this->samplePatronData(),
        ]);
    }

    public function templateStore(Request $request)
    {
        $data = $this->validateTemplate($request);

        try {
            $template = CardTemplate::create($data);
            if ($request->boolean('is_default')) {
                $this->makeDefault($template);
            }
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.cards.templates.index')->with('success', 'Template created.');
    }

    public function templateUpdate(Request $request, string $id)
    {
        $template = CardTemplate::findOrFail($id);
        $data = $this->validateTemplate($request);

        try {
            $template->update($data);
            if ($request->boolean('is_default')) {
                $this->makeDefault($template);
            }
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.cards.templates.index')->with('success', 'Template updated.');
    }

    public function setDefault(string $id)
    {
        $template = CardTemplate::findOrFail($id);
        $this->makeDefault($template);

        return back()->with('success', 'Default template updated.');
    }

    public function templateDestroy(string $id)
    {
        try {
            CardTemplate::findOrFail($id)->delete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return back()->with('success', 'Template deleted.');
    }

    // ─── PDF generation (single or batch) ────────────────────────────────────
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'nullable|string',
            'patron_ids'  => 'nullable|array',
            'patron_ids.*'=> 'string',
            'select_all'  => 'nullable|boolean',
            'q'           => 'nullable|string',
            'status'      => 'nullable|string',
            'category'    => 'nullable',
        ]);

        $template = $this->resolveTemplate($validated['template_id'] ?? null);
        if (! $template) {
            return back()->withErrors(['general' => 'No card template available. Create one first.']);
        }

        $query = Patron::with('category')->orderBy('first_name');

        if (! empty($validated['select_all'])) {
            // Everyone matching the current filters
            if (! empty($validated['q'])) {
                $like = config('database.default') === 'pgsql' ? 'ilike' : 'like';
                $q = $validated['q'];
                $query->where(function ($qb) use ($q, $like) {
                    $qb->where('first_name', $like, "%{$q}%")
                       ->orWhere('last_name', $like, "%{$q}%")
                       ->orWhere('email', $like, "%{$q}%")
                       ->orWhere('patron_number', $like, "%{$q}%");
                });
            }
            if (! empty($validated['status'])) {
                $query->where('status', $validated['status']);
            }
            if (! empty($validated['category'])) {
                $query->where('patron_category_id', $validated['category']);
            }
        } else {
            $ids = $validated['patron_ids'] ?? [];
            if (empty($ids)) {
                return back()->withErrors(['general' => 'Select at least one patron.']);
            }
            $query->whereIn('id', $ids);
        }

        $patrons = $query->limit(self::BATCH_CAP)->get();

        if ($patrons->isEmpty()) {
            return back()->withErrors(['general' => 'No matching patrons to print.']);
        }

        $pdfBytes = $this->cards->renderPdf($patrons, $template);

        $filename = $patrons->count() === 1
            ? "library-card-{$patrons->first()->patron_number}.pdf"
            : 'library-cards-' . now()->format('Ymd-His') . '.pdf';

        return response($pdfBytes, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private function validateTemplate(Request $request): array
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:150',
            'width_mm'         => 'required|numeric|min:20|max:200',
            'height_mm'        => 'required|numeric|min:20|max:200',
            'background_color' => 'nullable|string|max:20',
            'elements'         => 'required|array',
        ]);
        $validated['background_color'] ??= '#ffffff';

        return $validated;
    }

    private function makeDefault(CardTemplate $template): void
    {
        DB::transaction(function () use ($template) {
            CardTemplate::where('id', '!=', $template->id)->update(['is_default' => false]);
            $template->update(['is_default' => true]);
        });
    }

    private function resolveTemplate(?string $id): ?CardTemplate
    {
        if ($id) {
            return CardTemplate::find($id);
        }

        return CardTemplate::where('is_default', true)->first()
            ?? CardTemplate::orderBy('created_at')->first();
    }

    private function templateList()
    {
        return rescue(fn () => CardTemplate::orderByDesc('is_default')->orderBy('name')
            ->get(['id', 'name', 'width_mm', 'height_mm', 'background_color', 'elements', 'is_default']),
            collect());
    }

    private function branding(): array
    {
        return [
            'library_name'  => LibrarySetting::get('library_name', 'Alpha eLibrary'),
            'logo_url'      => LibrarySetting::get('logo_url'),
            'primary_color' => LibrarySetting::get('primary_color', '#2563eb'),
        ];
    }

    /** A representative data bag so the editor preview shows realistic content. */
    private function samplePatronData(): array
    {
        $patron = rescue(fn () => Patron::with('category')->orderByDesc('created_at')->first());

        if ($patron) {
            return $this->cards->resolveFields($patron);
        }

        // Fallback when no patrons exist yet
        return [
            'patron_number'     => 'P00001',
            'full_name'         => 'Sok Dara',
            'full_name_km'      => 'សុខ ដារ៉ា',
            'first_name'        => 'Sok',
            'last_name'         => 'Dara',
            'category'          => 'Student',
            'membership_expiry' => now()->addYear()->format('Y-m-d'),
            'email'             => 'sok.dara@example.com',
            'phone'             => '012 345 678',
            'library_name'      => LibrarySetting::get('library_name', 'Alpha eLibrary'),
            'status'            => 'Active',
            'initials'          => 'SD',
            'avatar_color'      => '#1e3a8a',
            'barcode'           => $this->cards->barcodeDataUri('P00001'),
        ];
    }
}
