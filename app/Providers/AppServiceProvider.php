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

        // Register XML response macro for OAI-PMH
        Response::macro('xml', function ($data, $status = 200) {
            $xml = $this->arrayToXml($data);
            return response($xml, $status)->header('Content-Type', 'application/xml; charset=UTF-8');
        });
    }

    /**
     * Convert array to XML for OAI-PMH responses
     */
    private function arrayToXml(array $data, \SimpleXMLElement $xml = null): string
    {
        if ($xml === null) {
            $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><root/>');
        }

        foreach ($data as $key => $value) {
            if ($key === '@attributes') {
                foreach ($value as $attrKey => $attrValue) {
                    $xml->addAttribute($attrKey, $attrValue);
                }
            } elseif ($key === '@value') {
                $xml[0] = $value;
            } elseif ($key === '@raw') {
                // Insert raw XML content
                $dom = dom_import_simplexml($xml);
                $fragment = $dom->ownerDocument->createDocumentFragment();
                $fragment->appendXML($value);
                $dom->appendChild($fragment);
            } elseif (is_array($value)) {
                if (isset($value[0])) {
                    // Numeric array - multiple elements with same name
                    foreach ($value as $item) {
                        $subnode = $xml->addChild($key);
                        if (is_array($item)) {
                            $this->arrayToXml($item, $subnode);
                        } else {
                            $subnode[0] = $item;
                        }
                    }
                } else {
                    // Associative array - single element
                    $subnode = $xml->addChild($key);
                    $this->arrayToXml($value, $subnode);
                }
            } else {
                $xml->addChild($key, htmlspecialchars($value));
            }
        }

        return $xml->asXML();
    }
}
