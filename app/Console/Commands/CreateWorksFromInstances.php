<?php

namespace App\Console\Commands;

use App\Models\Tenant\Agent;
use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\Work;
use App\Models\Tenant\WorkContribution;
use App\Services\CatalogService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CreateWorksFromInstances extends Command
{
    protected $signature   = 'catalog:create-works {--dry-run : Preview without saving}';
    protected $description = 'Create BIBFRAME Work records for existing BibliographicRecords that have no work_id';

    public function handle(CatalogService $catalog): int
    {
        $dryRun = $this->option('dry-run');

        $instances = BibliographicRecord::whereNull('work_id')
            ->withTrashed()
            ->orderBy('cataloged_at')
            ->get();

        if ($instances->isEmpty()) {
            $this->info('All records already have a linked Work.');
            return 0;
        }

        $this->info("Found {$instances->count()} record(s) without a Work. " . ($dryRun ? '[DRY RUN]' : ''));

        $bar     = $this->output->createProgressBar($instances->count());
        $created = 0;
        $linked  = 0;
        $errors  = 0;

        foreach ($instances as $instance) {
            try {
                if ($dryRun) {
                    $bar->advance();
                    $created++;
                    continue;
                }

                DB::transaction(function () use ($instance, $catalog, &$created, &$linked) {
                    $work = $catalog->findOrCreateWork([
                        'title'          => $instance->title,
                        'title_km'       => $instance->title_km,
                        'language'       => $instance->language ?? 'en',
                        'content_type'   => $instance->content_type,
                        'issuance'       => $instance->issuance ?? 'mono',
                        'subjects'       => $instance->subjects ?? [],
                        'keywords'       => is_array($instance->keywords)
                            ? implode(', ', $instance->keywords)
                            : $instance->keywords,
                        'ddc_class'      => $instance->ddc_class,
                        'lcc_class'      => $instance->lcc_class,
                        'abstract'       => $instance->abstract,
                        'abstract_km'    => $instance->abstract_km,
                        'series_title'   => $instance->series_title,
                        'series_number'  => $instance->series_number,
                        'authors'        => $this->normalizeAuthors($instance->authors ?? []),
                        'lccn'           => $this->extractIdentifier($instance, 'lccn'),
                        'oclc_number'    => $this->extractIdentifier($instance, 'oclc'),
                    ]);

                    $wasNewWork = $work->wasRecentlyCreated;

                    $instance->updateQuietly(['work_id' => $work->id]);

                    if ($wasNewWork) {
                        $created++;
                    } else {
                        $linked++;
                    }
                });
            } catch (\Throwable $e) {
                $errors++;
                $this->newLine();
                $this->error("  ✗ [{$instance->id}] {$instance->title}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        if (! $dryRun) {
            $this->table(
                ['Created', 'Linked to existing', 'Errors'],
                [[$created, $linked, $errors]]
            );
            $this->info('Regenerating BIBFRAME snapshots on all Works...');
            Work::all()->each(fn ($w) => rescue(fn () => $catalog->regenerateWorkBibframeSnapshot($w)));
            $this->info('Done.');
        } else {
            $this->info("Would process {$created} records (dry run — no changes made).");
        }

        return $errors > 0 ? 1 : 0;
    }

    private function normalizeAuthors(array $authors): array
    {
        return collect($authors)->map(function ($author) {
            $name = is_array($author) ? ($author['name'] ?? '') : (string) $author;
            $role = is_array($author) ? ($author['role'] ?? 'aut') : 'aut';
            return ['name' => $name, 'role' => $role, 'agent_type' => 'person'];
        })->filter(fn ($a) => ! empty($a['name']))->values()->all();
    }

    private function extractIdentifier(BibliographicRecord $instance, string $type): ?string
    {
        $identifiers = $instance->identifiers ?? [];
        $match = collect($identifiers)->firstWhere('type', $type);
        return $match['value'] ?? null;
    }
}
