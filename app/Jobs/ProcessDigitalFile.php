<?php

namespace App\Jobs;

use App\Models\Tenant\DigitalResource;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Spatie\PdfToImage\Pdf;

class ProcessDigitalFile implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 300;

    public function __construct(
        public readonly DigitalResource $resource,
        public readonly string          $disk = 'default_r2',
        public readonly bool            $enableOcr = false,
    ) {
        $this->onQueue('digital-processing');
    }

    public function handle(): void
    {
        try {
            // File is already stored on cloud storage by the controller before dispatch.
            // This job handles post-processing: thumbnail generation and OCR.
            $filePath = $this->resource->file_path;
            $format   = $this->resource->format ?? pathinfo($filePath, PATHINFO_EXTENSION);

            // 1. Generate thumbnail
            $thumbnail = $this->generateThumbnail($filePath, $format);
            if ($thumbnail) {
                $this->resource->update(['thumbnail_path' => $thumbnail]);
            }

            // 2. OCR for PDFs
            if ($this->enableOcr && $format === 'pdf') {
                $this->runOcr($filePath);
            }

        } catch (\Throwable $e) {
            Log::error("ProcessDigitalFile failed for resource {$this->resource->id}: {$e->getMessage()}");
            throw $e;
        }
    }

    private function generateThumbnail(string $filePath, string $format): ?string
    {
        if ($format !== 'pdf') return null;

        try {
            $localPath  = tempnam(sys_get_temp_dir(), 'pdf_') . '.pdf';
            $thumbPath  = tempnam(sys_get_temp_dir(), 'thumb_') . '.jpg';

            // Download from configured storage
            file_put_contents($localPath, Storage::disk($this->disk)->get($filePath));

            $pdf = new Pdf($localPath);
            $pdf->setPage(1)->save($thumbPath);

            // Upload thumbnail to same storage
            $destKey = str_replace('.pdf', '_thumb.jpg', $filePath);
            Storage::disk($this->disk)->put($destKey, file_get_contents($thumbPath));

            unlink($localPath);
            unlink($thumbPath);

            return $destKey;
        } catch (\Throwable $e) {
            Log::warning("Thumbnail generation failed: {$e->getMessage()}");
            return null;
        }
    }

    private function runOcr(string $filePath): void
    {
        try {
            $localPath = tempnam(sys_get_temp_dir(), 'ocr_pdf_') . '.pdf';

            // Download from configured storage
            file_put_contents($localPath, Storage::disk($this->disk)->get($filePath));

            $text = shell_exec("pdftotext -enc UTF-8 {$localPath} -");

            if ($text) {
                $this->resource->update([
                    'ocr_text'         => trim($text),
                    'ocr_processed_at' => now(),
                ]);
            }

            unlink($localPath);
        } catch (\Throwable $e) {
            Log::warning("OCR failed: {$e->getMessage()}");
        }
    }
}
