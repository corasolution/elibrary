<?php

namespace App\Http\Controllers\Admin;

use App\Exports\CatalogExport;
use App\Exports\CatalogImportErrorExport;
use App\Exports\CatalogTemplateExport;
use App\Http\Controllers\Controller;
use App\Imports\CatalogImport;
use App\Models\Tenant\MaterialType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Maatwebsite\Excel\Facades\Excel;

class CatalogExcelController extends Controller
{
    // ─── Export ───────────────────────────────────────────────────────────────

    public function exportAll()
    {
        set_time_limit(300);
        $filename = 'catalog_export_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new CatalogExport([]), $filename);
    }

    public function exportFiltered(Request $request)
    {
        set_time_limit(300);
        $filters  = $request->only(['q', 'material_type_id', 'language', 'year_from', 'year_to']);
        $filename = 'catalog_filtered_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new CatalogExport($filters), $filename);
    }

    // ─── Template ─────────────────────────────────────────────────────────────

    public function downloadTemplate()
    {
        $filename = 'catalog_import_template.xlsx';
        return Excel::download(new CatalogTemplateExport(), $filename);
    }

    // ─── Import: Phase 1 — Upload & Count ────────────────────────────────────

    public function importUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:20480',
        ]);

        try {
            $path  = $request->file('file')->store('imports/catalog', 'local');
            $jobId = (string) Str::uuid();

            // Count rows by loading only heading + data (no processing)
            $totalRows = $this->countDataRows(Storage::path($path));

            Cache::put("catalog_import_{$jobId}", [
                'status'       => 'pending',
                'file_path'    => $path,
                'processed'    => 0,
                'total'        => $totalRows,
                'created'      => 0,
                'updated'      => 0,
                'errors_count' => 0,
                'failures'     => [],
                'error_message'=> null,
            ], now()->addHours(2));

            return response()->json([
                'job_id'     => $jobId,
                'total_rows' => $totalRows,
            ]);
        } catch (\Throwable $e) {
            Log::error('CatalogImport upload error: ' . $e->getMessage());
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 422);
        }
    }

    // ─── Import: Phase 2 — Process One Chunk ─────────────────────────────────

    public function importProcess(Request $request)
    {
        $request->validate([
            'job_id'       => 'required|string',
            'chunk_offset' => 'required|integer|min:0',
        ]);

        $jobId       = $request->input('job_id');
        $chunkOffset = (int) $request->input('chunk_offset');

        $progress = Cache::get("catalog_import_{$jobId}");
        if (! $progress) {
            return response()->json(['error' => 'Import job not found or expired.'], 404);
        }
        if ($progress['status'] === 'done') {
            return response()->json($progress);
        }

        try {
            $materialTypeMap = MaterialType::pluck('id', 'code')->toArray();
            $import = new CatalogImport(
                $jobId,
                $progress['total'],
                $chunkOffset,
                $materialTypeMap,
            );

            Excel::import($import, Storage::path($progress['file_path']));

            $updated = Cache::get("catalog_import_{$jobId}", $progress);

            // Clean up temp file on final chunk
            if ($updated['status'] === 'done') {
                Storage::delete($progress['file_path']);
                Cache::put("catalog_import_{$jobId}", array_merge($updated, [
                    'file_path' => null,
                ]), now()->addHours(2));
                $updated['file_path'] = null;
            }

            return response()->json($updated);
        } catch (\Throwable $e) {
            Log::error("CatalogImport process error (job {$jobId}): " . $e->getMessage());

            Cache::put("catalog_import_{$jobId}", array_merge($progress, [
                'status'        => 'error',
                'error_message' => $e->getMessage(),
            ]), now()->addHours(2));

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ─── Import: Progress Polling ─────────────────────────────────────────────

    public function importProgress(Request $request)
    {
        $jobId    = $request->input('job_id');
        $progress = Cache::get("catalog_import_{$jobId}");

        if (! $progress) {
            return response()->json(['status' => 'not_found'], 404);
        }

        return response()->json($progress);
    }

    // ─── Import: Error Report Download ────────────────────────────────────────

    public function importErrors(Request $request)
    {
        $jobId    = $request->input('job_id');
        $progress = Cache::get("catalog_import_{$jobId}");

        if (! $progress || empty($progress['failures'])) {
            return response()->json(['error' => 'No errors found for this import.'], 404);
        }

        $filename = 'catalog_import_errors_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(
            new CatalogImportErrorExport($progress['failures']),
            $filename
        );
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function countDataRows(string $filePath): int
    {
        try {
            $reader     = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
            $reader->setReadDataOnly(true);
            $spreadsheet = $reader->load($filePath);
            $sheet       = $spreadsheet->getActiveSheet();
            $highestRow  = $sheet->getHighestDataRow();
            // Row 1 = heading, row 2 = first data row
            // Subtract 2 because row 1 is heading and we count data rows only
            // Also skip hint rows starting with #
            $count = 0;
            for ($row = 2; $row <= $highestRow; $row++) {
                $titleCell = $sheet->getCell('A' . $row)->getValue();
                $title     = trim((string) $titleCell);
                if ($title !== '' && ! str_starts_with($title, '#')) {
                    $count++;
                }
            }
            return max(0, $count);
        } catch (\Throwable) {
            // Fallback: just subtract 2 from total rows (heading + hint row)
            return 0;
        }
    }
}
