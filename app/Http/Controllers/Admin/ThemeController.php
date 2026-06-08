<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TemplateService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ThemeController extends Controller
{
    public function __construct(protected TemplateService $templateService)
    {
    }

    public function index()
    {
        $currentTheme = $this->templateService->getCurrent();
        $templates = $this->templateService->all();

        return Inertia::render('Admin/Settings/Theme', [
            'currentTheme' => $currentTheme,
            'templates' => $templates,
            'googleFonts' => $this->getGoogleFonts(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'template' => 'required|string',
            'colors' => 'nullable|array',
            'colors.primary' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'colors.secondary' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'colors.accent' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'colors.success' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'colors.warning' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'colors.danger' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'fonts' => 'nullable|array',
            'fonts.heading' => 'nullable|string',
            'fonts.body' => 'nullable|string',
        ]);

        try {
            // Apply the template
            $this->templateService->apply($validated['template']);

            // Apply custom colors if provided
            if (!empty($validated['colors'])) {
                $this->templateService->customizeColors($validated['colors']);
            }

            // Apply custom fonts if provided
            if (!empty($validated['fonts'])) {
                $this->templateService->customizeFonts($validated['fonts']);
            }

            return redirect()
                ->route('admin.settings.theme.index')
                ->with('success', 'Theme updated successfully.');
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to update theme: ' . $e->getMessage()]);
        }
    }

    public function reset()
    {
        try {
            $this->templateService->resetToDefault();

            return redirect()
                ->route('admin.settings.theme.index')
                ->with('success', 'Theme reset to default.');
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to reset theme: ' . $e->getMessage()]);
        }
    }

    private function getGoogleFonts(): array
    {
        return [
            'Inter',
            'Roboto',
            'Open Sans',
            'Lato',
            'Montserrat',
            'Poppins',
            'Source Sans Pro',
            'Raleway',
            'PT Sans',
            'Merriweather',
            'Noto Sans',
            'Noto Sans Khmer',
            'Playfair Display',
            'Ubuntu',
            'Nunito',
        ];
    }
}
