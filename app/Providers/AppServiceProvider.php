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
}
