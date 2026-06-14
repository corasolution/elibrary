<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Response;
use App\Jobs\ProcessDigitalFile;
use App\Jobs\SendOverdueNotice;
use App\Jobs\GenerateDailyStats;
use App\Jobs\GenerateBibliographicEmbedding;
use App\Models\Tenant\BibliographicRecord;
use App\Observers\BibliographicRecordObserver;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind FineCalculator as singleton
        $this->app->singleton(\App\Services\FineCalculator::class);
        $this->app->singleton(\App\Services\CatalogService::class);
        $this->app->singleton(\App\Services\CirculationService::class);
        $this->app->singleton(\App\Services\DigitalAssetService::class);
    }

    public function boot(): void
    {
        // Laravel 13: centralized queue routing
        Queue::route(ProcessDigitalFile::class, connection: 'redis', queue: 'digital-processing');
        Queue::route(SendOverdueNotice::class,  connection: 'redis', queue: 'notifications');
        Queue::route(GenerateDailyStats::class, connection: 'redis', queue: 'stats');
        Queue::route(GenerateBibliographicEmbedding::class, connection: 'redis', queue: 'ai-processing');

        // Register observers
        BibliographicRecord::observe(BibliographicRecordObserver::class);

        // Wire the platform R2 settings (saved via Central Admin → Storage)
        // into the default_r2 disk used by all tenant uploads.
        $this->configureDefaultR2FromPlatformSettings();

        // Register XML response macro for OAI-PMH (uses DOMDocument for namespace support)
        Response::macro('xml', function ($data, $status = 200) {
            $dom = new \DOMDocument('1.0', 'UTF-8');
            $dom->formatOutput = true;

            $rootKey = array_key_first($data);
            $rootData = $data[$rootKey];

            // Recursive function to build DOM elements
            $build = function (\DOMElement $parent, $data) use (&$build, $dom) {
                foreach ($data as $key => $value) {
                    if ($key === '@attributes') {
                        foreach ($value as $attrKey => $attrValue) {
                            $parent->setAttribute($attrKey, (string) $attrValue);
                        }
                    } elseif ($key === '@value') {
                        $parent->appendChild($dom->createTextNode((string) $value));
                    } elseif ($key === '@raw') {
                        // Insert raw XML fragment
                        $fragment = $dom->createDocumentFragment();
                        @$fragment->appendXML($value);
                        if ($fragment->hasChildNodes()) {
                            $parent->appendChild($fragment);
                        }
                    } elseif (is_array($value)) {
                        // Indexed array = repeated elements
                        if (array_is_list($value)) {
                            foreach ($value as $item) {
                                $child = $dom->createElement($key);
                                if (is_array($item)) {
                                    $build($child, $item);
                                } else {
                                    $child->appendChild($dom->createTextNode((string) $item));
                                }
                                $parent->appendChild($child);
                            }
                        } else {
                            // Associative array = single nested element
                            $child = $dom->createElement($key);
                            $build($child, $value);
                            $parent->appendChild($child);
                        }
                    } else {
                        $child = $dom->createElement($key);
                        $child->appendChild($dom->createTextNode((string) $value));
                        $parent->appendChild($child);
                    }
                }
            };

            $root = $dom->createElement($rootKey);
            $dom->appendChild($root);
            $build($root, $rootData);

            return response($dom->saveXML(), $status)
                ->header('Content-Type', 'application/xml; charset=UTF-8');
        });
    }

    /**
     * Override the default_r2 disk with credentials saved in platform_settings.
     * Falls back silently to .env values when the central DB is unavailable
     * (fresh install, migrations running, artisan package:discover, etc.).
     */
    private function configureDefaultR2FromPlatformSettings(): void
    {
        try {
            $settings = \Illuminate\Support\Facades\Cache::remember('platform.r2_config', 300, function () {
                return [
                    'key'        => \App\Models\Central\PlatformSetting::get('r2_access_key'),
                    'secret'     => \App\Models\Central\PlatformSetting::get('r2_secret_key'),
                    'account_id' => \App\Models\Central\PlatformSetting::get('r2_account_id'),
                    'bucket'     => \App\Models\Central\PlatformSetting::get('r2_bucket'),
                    'url'        => \App\Models\Central\PlatformSetting::get('r2_public_url'),
                ];
            });

            if (!empty($settings['key']) && !empty($settings['secret']) && !empty($settings['account_id'])) {
                config([
                    'filesystems.disks.default_r2.key'      => $settings['key'],
                    'filesystems.disks.default_r2.secret'   => $settings['secret'],
                    'filesystems.disks.default_r2.bucket'   => $settings['bucket'] ?: config('filesystems.disks.default_r2.bucket'),
                    'filesystems.disks.default_r2.endpoint' => "https://{$settings['account_id']}.r2.cloudflarestorage.com",
                    'filesystems.disks.default_r2.url'      => $settings['url'] ?: config('filesystems.disks.default_r2.url'),
                ]);
                \Illuminate\Support\Facades\Storage::forgetDisk('default_r2');
            }
        } catch (\Throwable) {
            // Central DB not reachable — keep .env-based config.
        }
    }
}
