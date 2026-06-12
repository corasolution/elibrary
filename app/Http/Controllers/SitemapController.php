<?php

namespace App\Http\Controllers;

use App\Models\Central\Tenant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $xml = Cache::remember('sitemap_xml', 3600, function () {
            $baseUrl = rtrim(config('app.url'), '/');
            $now     = now()->toAtomString();

            $staticPages = [
                ['url' => $baseUrl . '/',           'priority' => '1.0', 'changefreq' => 'daily',   'lastmod' => $now],
                ['url' => $baseUrl . '/pricing',    'priority' => '0.9', 'changefreq' => 'weekly',  'lastmod' => $now],
                ['url' => $baseUrl . '/features',   'priority' => '0.8', 'changefreq' => 'weekly',  'lastmod' => $now],
                ['url' => $baseUrl . '/demo',       'priority' => '0.7', 'changefreq' => 'weekly',  'lastmod' => $now],
                ['url' => $baseUrl . '/libraries',  'priority' => '0.7', 'changefreq' => 'weekly',  'lastmod' => $now],
                ['url' => $baseUrl . '/about',      'priority' => '0.6', 'changefreq' => 'monthly', 'lastmod' => $now],
                ['url' => $baseUrl . '/contact',    'priority' => '0.6', 'changefreq' => 'monthly', 'lastmod' => $now],
            ];

            $tenantPages = [];
            try {
                $tenants = Tenant::where('status', 'active')->get(['slug', 'updated_at']);
                foreach ($tenants as $tenant) {
                    $tenantPages[] = [
                        'url'        => "https://{$tenant->slug}.bannalai.com/",
                        'priority'   => '0.5',
                        'changefreq' => 'weekly',
                        'lastmod'    => $tenant->updated_at?->toAtomString() ?? $now,
                    ];
                }
            } catch (\Throwable) {
                // Central DB unavailable — skip tenant URLs
            }

            $pages = array_merge($staticPages, $tenantPages);

            $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
            $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

            foreach ($pages as $page) {
                $xml .= "  <url>\n";
                $xml .= "    <loc>" . htmlspecialchars($page['url']) . "</loc>\n";
                $xml .= "    <lastmod>{$page['lastmod']}</lastmod>\n";
                $xml .= "    <changefreq>{$page['changefreq']}</changefreq>\n";
                $xml .= "    <priority>{$page['priority']}</priority>\n";
                // Hreflang alternates for the main landing pages
                if (str_starts_with($page['url'], $baseUrl)) {
                    $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"" . htmlspecialchars($page['url']) . "\"/>\n";
                    $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"km\" href=\"" . htmlspecialchars($page['url']) . "\"/>\n";
                    $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"" . htmlspecialchars($page['url']) . "\"/>\n";
                }
                $xml .= "  </url>\n";
            }

            $xml .= '</urlset>';
            return $xml;
        });

        return response($xml, 200, [
            'Content-Type'  => 'application/xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
