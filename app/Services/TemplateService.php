<?php

namespace App\Services;

use App\Models\Tenant\LibrarySetting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class TemplateService
{
    protected string $templatesPath;
    protected int $cacheTtl = 300; // 5 minutes

    public function __construct()
    {
        $this->templatesPath = resource_path('templates');
    }

    /**
     * Get all available templates
     */
    public function all(): Collection
    {
        return Cache::remember('templates.all', $this->cacheTtl, function () {
            $templates = collect();

            if (!File::exists($this->templatesPath)) {
                return $templates;
            }

            $files = File::files($this->templatesPath);

            foreach ($files as $file) {
                if ($file->getExtension() === 'json') {
                    $content = File::get($file->getPathname());
                    $template = json_decode($content, true);

                    if ($template && isset($template['id'])) {
                        $templates->push($template);
                    }
                }
            }

            return $templates->sortBy('name');
        });
    }

    /**
     * Get a specific template by ID
     */
    public function get(string $id): ?array
    {
        $template = $this->all()->firstWhere('id', $id);

        return $template;
    }

    /**
     * Get the current active template for the tenant
     */
    public function getCurrent(): array
    {
        return Cache::remember('template.current', $this->cacheTtl, function () {
            // Get active template ID from settings
            $templateId = LibrarySetting::get('active_template', 'elibrary-modern');

            // Get base template
            $template = $this->get($templateId);

            // Fallback to default if template not found
            if (!$template) {
                $template = $this->get('elibrary-modern') ?? $this->get('modern-minimal');
            }

            // Apply custom color overrides
            $customColors = LibrarySetting::get('custom_colors');
            if ($customColors) {
                $customColors = json_decode($customColors, true);
                if (is_array($customColors) && !empty($customColors)) {
                    $template['colors'] = array_merge($template['colors'], $customColors);
                }
            }

            // Apply custom font overrides
            $customFonts = LibrarySetting::get('custom_fonts');
            if ($customFonts) {
                $customFonts = json_decode($customFonts, true);
                if (is_array($customFonts) && !empty($customFonts)) {
                    $template['fonts'] = array_merge($template['fonts'], $customFonts);
                }
            }

            // Apply custom CSS if exists
            $customCss = LibrarySetting::get('custom_css');
            if ($customCss) {
                $template['custom_css'] = $customCss;
            }

            return $template;
        });
    }

    /**
     * Apply a template to the current tenant
     */
    public function apply(string $templateId): bool
    {
        $template = $this->get($templateId);

        if (!$template) {
            return false;
        }

        LibrarySetting::set('active_template', $templateId);

        // Clear cache
        $this->clearCache();

        return true;
    }

    /**
     * Customize colors for the current template
     */
    public function customizeColors(array $colors): bool
    {
        // Validate hex colors
        foreach ($colors as $key => $value) {
            if (!$this->isValidHexColor($value)) {
                return false;
            }
        }

        LibrarySetting::set('custom_colors', json_encode($colors));

        // Clear cache
        $this->clearCache();

        return true;
    }

    /**
     * Customize fonts for the current template
     */
    public function customizeFonts(array $fonts): bool
    {
        // Basic validation - fonts should have heading and/or body
        if (!isset($fonts['heading']) && !isset($fonts['body'])) {
            return false;
        }

        LibrarySetting::set('custom_fonts', json_encode($fonts));

        // Clear cache
        $this->clearCache();

        return true;
    }

    /**
     * Set custom CSS
     */
    public function setCustomCss(string $css): bool
    {
        // Sanitize CSS (basic sanitization)
        $css = $this->sanitizeCss($css);

        LibrarySetting::set('custom_css', $css);

        // Clear cache
        $this->clearCache();

        return true;
    }

    /**
     * Reset template to default (remove customizations)
     */
    public function resetToDefault(): bool
    {
        LibrarySetting::set('custom_colors', json_encode([]));
        LibrarySetting::set('custom_fonts', json_encode([]));
        LibrarySetting::set('custom_css', '');

        // Clear cache
        $this->clearCache();

        return true;
    }

    /**
     * Generate CSS custom properties from template config
     */
    public function generateCSS(array $config): string
    {
        $css = ":root {\n";

        // Colors
        foreach ($config['colors'] as $key => $value) {
            $css .= "  --color-{$key}: {$value};\n";
        }

        // Fonts
        $css .= "  --font-heading: '{$config['fonts']['heading']}', sans-serif;\n";
        $css .= "  --font-body: '{$config['fonts']['body']}', sans-serif;\n";

        // Styles
        if (isset($config['styles'])) {
            if (isset($config['styles']['borderRadius'])) {
                $css .= "  --border-radius: {$config['styles']['borderRadius']};\n";
            }
        }

        $css .= "}\n";

        // Custom CSS
        if (isset($config['custom_css']) && !empty($config['custom_css'])) {
            $css .= "\n/* Custom CSS */\n";
            $css .= $config['custom_css'];
        }

        return $css;
    }

    /**
     * Get list of available Google Fonts
     */
    public function getGoogleFonts(): array
    {
        return [
            'Inter' => 'Inter',
            'Poppins' => 'Poppins',
            'Roboto' => 'Roboto',
            'Open Sans' => 'Open Sans',
            'Lato' => 'Lato',
            'Montserrat' => 'Montserrat',
            'Merriweather' => 'Merriweather',
            'Lora' => 'Lora',
            'Playfair Display' => 'Playfair Display',
            'Crimson Text' => 'Crimson Text',
            'Space Mono' => 'Space Mono',
            'JetBrains Mono' => 'JetBrains Mono',
            'Nunito' => 'Nunito',
            'Quicksand' => 'Quicksand',
            'Comfortaa' => 'Comfortaa',
            'Space Grotesk' => 'Space Grotesk',
            'DM Sans' => 'DM Sans',
            'Raleway' => 'Raleway',
            'Source Sans Pro' => 'Source Sans Pro',
            'Ubuntu' => 'Ubuntu',
            'Noto Sans' => 'Noto Sans',
            'Noto Serif' => 'Noto Serif',
            'PT Sans' => 'PT Sans',
            'PT Serif' => 'PT Serif',
            'Oswald' => 'Oswald',
        ];
    }

    /**
     * Clear template cache
     */
    protected function clearCache(): void
    {
        Cache::forget('templates.all');
        Cache::forget('template.current');
    }

    /**
     * Validate hex color format
     */
    protected function isValidHexColor(string $color): bool
    {
        return preg_match('/^#[a-fA-F0-9]{6}$/', $color) === 1;
    }

    /**
     * Sanitize CSS to prevent XSS
     */
    protected function sanitizeCss(string $css): string
    {
        // Remove script tags and javascript: protocols
        $css = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $css);
        $css = preg_replace('/javascript:/i', '', $css);
        $css = preg_replace('/on\w+\s*=\s*["\'].*?["\']/i', '', $css);

        // Limit to reasonable length
        if (strlen($css) > 10000) {
            $css = substr($css, 0, 10000);
        }

        return trim($css);
    }
}
