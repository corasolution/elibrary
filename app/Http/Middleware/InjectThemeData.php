<?php

namespace App\Http\Middleware;

use App\Services\TemplateService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class InjectThemeData
{
    protected TemplateService $templateService;

    public function __construct(TemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip theme injection for central admin routes (not in tenant context)
        if ($request->is('central') || $request->is('central/*')) {
            return $next($request);
        }

        // Share theme data with all Inertia pages
        Inertia::share('theme', function () {
            try {
                return $this->templateService->getCurrent();
            } catch (\Exception $e) {
                // Fallback to default theme if service fails
                return [
                    'id' => 'modern-minimal',
                    'name' => 'Modern Minimal',
                    'colors' => [
                        'primary' => '#2563eb',
                        'secondary' => '#64748b',
                        'accent' => '#f59e0b',
                        'background' => '#ffffff',
                        'text' => '#1e293b',
                        'muted' => '#94a3b8',
                    ],
                    'fonts' => [
                        'heading' => 'Inter',
                        'body' => 'Inter',
                    ],
                    'styles' => [
                        'layout' => 'centered',
                        'cardStyle' => 'shadow',
                        'navbarStyle' => 'solid',
                        'heroStyle' => 'gradient',
                        'borderRadius' => '0.5rem',
                        'buttonStyle' => 'rounded',
                    ],
                ];
            }
        });

        return $next($request);
    }
}
