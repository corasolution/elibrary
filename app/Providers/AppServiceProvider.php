<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Queue;
use App\Jobs\ProcessDigitalFile;
use App\Jobs\SendOverdueNotice;
use App\Jobs\GenerateDailyStats;

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
    }
}
