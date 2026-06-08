import { useState, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    Upload, FileSpreadsheet, X, CheckCircle, AlertCircle,
    Download, Loader2, FileText, ChevronRight,
} from 'lucide-react';

const CHUNK_SIZE = 50;

export default function ExcelImportModal({ onClose, onComplete }) {
    const [phase, setPhase]       = useState('idle'); // idle|uploading|processing|done|error
    const [file, setFile]         = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [jobId, setJobId]       = useState(null);
    const [progress, setProgress] = useState({ processed: 0, total: 0, created: 0, updated: 0, errors_count: 0 });
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const csrfToken = () =>
        document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    // ─── File selection ───────────────────────────────────────────────────────

    const handleFile = useCallback((f) => {
        if (!f) return;
        if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
               'application/vnd.ms-excel'].includes(f.type) &&
            !f.name.match(/\.(xlsx|xls)$/i)) {
            setErrorMsg('Please upload an .xlsx or .xls file.');
            setPhase('error');
            return;
        }
        if (f.size > 20 * 1024 * 1024) {
            setErrorMsg('File is too large. Maximum size is 20 MB.');
            setPhase('error');
            return;
        }
        setFile(f);
        setErrorMsg('');
    }, []);

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    // ─── Upload (Phase 1) ─────────────────────────────────────────────────────

    const startUpload = async () => {
        if (!file) return;
        setPhase('uploading');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('_token', csrfToken());

        try {
            const res = await fetch(route('admin.catalog.excel.import-upload'), {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Upload failed (HTTP ${res.status})`);
            }
            const data = await res.json();
            setJobId(data.job_id);
            setProgress(prev => ({ ...prev, total: data.total_rows }));
            setPhase('processing');
            processChunks(data.job_id, data.total_rows);
        } catch (err) {
            setErrorMsg(err.message);
            setPhase('error');
        }
    };

    // ─── Chunked processing (Phase 2) ─────────────────────────────────────────

    const processChunks = async (jId, total) => {
        let offset = 0;

        while (offset < total) {
            try {
                const res = await fetch(route('admin.catalog.excel.import-process'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ job_id: jId, chunk_offset: offset }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || `Processing failed (HTTP ${res.status})`);
                }

                const data = await res.json();
                setProgress({
                    processed:    data.processed ?? offset + CHUNK_SIZE,
                    total:        data.total      ?? total,
                    created:      data.created     ?? 0,
                    updated:      data.updated     ?? 0,
                    errors_count: data.errors_count ?? 0,
                });

                if (data.status === 'done') {
                    setPhase('done');
                    return;
                }

                offset += CHUNK_SIZE;
            } catch (err) {
                setErrorMsg(err.message);
                setPhase('error');
                return;
            }
        }

        // Final fallback if loop ends without 'done' status
        setPhase('done');
    };

    // ─── Error report download ────────────────────────────────────────────────

    const downloadErrors = () => {
        window.location.href = route('admin.catalog.excel.import-errors') + '?job_id=' + jobId;
    };

    // ─── Reset ────────────────────────────────────────────────────────────────

    const reset = () => {
        setPhase('idle');
        setFile(null);
        setJobId(null);
        setProgress({ processed: 0, total: 0, created: 0, updated: 0, errors_count: 0 });
        setErrorMsg('');
    };

    // ─── Progress bar ─────────────────────────────────────────────────────────

    const pct = progress.total > 0
        ? Math.min(100, Math.round((progress.processed / progress.total) * 100))
        : 0;

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        <h2 className="text-base font-semibold text-gray-900">Import Catalog Records</h2>
                    </div>
                    {phase !== 'processing' && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-lg p-1">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {/* ── IDLE phase ── */}
                    {phase === 'idle' && (
                        <div className="space-y-4">
                            {/* Template download */}
                            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">New to importing?</p>
                                    <p className="text-xs text-blue-600 mt-0.5">Download the template with example data and valid dropdown values.</p>
                                </div>
                                <a
                                    href={route('admin.catalog.excel.template')}
                                    className="flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 border border-blue-300 rounded-lg px-3 py-1.5 bg-white flex-shrink-0 ml-3"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Template
                                </a>
                            </div>

                            {/* Drop zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                    dragOver
                                        ? 'border-blue-400 bg-blue-50'
                                        : file
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            >
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="w-10 h-10 text-green-500" />
                                        <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB — click to change</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload className="w-10 h-10 text-gray-400" />
                                        <p className="font-medium text-gray-700">Drop your Excel file here</p>
                                        <p className="text-xs text-gray-400">.xlsx or .xls · max 20 MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    onChange={e => handleFile(e.target.files[0])}
                                />
                            </div>

                            {errorMsg && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            {/* Info */}
                            <div className="text-xs text-gray-400 space-y-1">
                                <p>• Existing records matched by <strong>ISBN</strong> or <strong>record_id</strong> will be updated</p>
                                <p>• Rows with validation errors are skipped — a downloadable error report is generated</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button
                                    onClick={startUpload}
                                    disabled={!file}
                                    className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    <Upload className="w-4 h-4" /> Start Import
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── UPLOADING phase ── */}
                    {phase === 'uploading' && (
                        <div className="py-8 flex flex-col items-center gap-4 text-center">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="font-medium text-gray-900">Uploading file…</p>
                            <p className="text-sm text-gray-500">{file?.name}</p>
                        </div>
                    )}

                    {/* ── PROCESSING phase ── */}
                    {phase === 'processing' && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900">Processing records…</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Please keep this window open</p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                    <span>Row {progress.processed} of {progress.total}</span>
                                    <span className="font-medium text-blue-600">{pct}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>

                            {/* Live counters */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-green-50 rounded-xl p-3 text-center">
                                    <div className="text-xl font-bold text-green-700">{progress.created}</div>
                                    <div className="text-xs text-green-600 mt-0.5">Created</div>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                    <div className="text-xl font-bold text-blue-700">{progress.updated}</div>
                                    <div className="text-xs text-blue-600 mt-0.5">Updated</div>
                                </div>
                                <div className={`rounded-xl p-3 text-center ${progress.errors_count > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                    <div className={`text-xl font-bold ${progress.errors_count > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                                        {progress.errors_count}
                                    </div>
                                    <div className={`text-xs mt-0.5 ${progress.errors_count > 0 ? 'text-red-600' : 'text-gray-400'}`}>Errors</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── DONE phase ── */}
                    {phase === 'done' && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Import Complete</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{progress.total} rows processed</p>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-green-50 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-green-700">{progress.created}</div>
                                    <div className="text-xs text-green-600 mt-0.5">Created</div>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-700">{progress.updated}</div>
                                    <div className="text-xs text-blue-600 mt-0.5">Updated</div>
                                </div>
                                <div className={`rounded-xl p-3 text-center ${progress.errors_count > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                    <div className={`text-2xl font-bold ${progress.errors_count > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                                        {progress.errors_count}
                                    </div>
                                    <div className={`text-xs mt-0.5 ${progress.errors_count > 0 ? 'text-red-600' : 'text-gray-400'}`}>Errors</div>
                                </div>
                            </div>

                            {progress.errors_count > 0 && (
                                <button
                                    onClick={downloadErrors}
                                    className="w-full flex items-center justify-center gap-2 text-sm text-red-600 border border-red-200 rounded-xl py-2.5 hover:bg-red-50"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Error Report ({progress.errors_count} rows)
                                </button>
                            )}

                            <div className="flex gap-2 pt-1">
                                <button onClick={reset} className="flex-1 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Import Another File
                                </button>
                                <button
                                    onClick={() => { onComplete?.(); }}
                                    className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-1.5"
                                >
                                    View Catalog <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── ERROR phase ── */}
                    {phase === 'error' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 bg-red-50 rounded-xl p-4">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-red-900">Import failed</p>
                                    <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={reset} className="flex-1 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Try Again
                                </button>
                                <button onClick={onClose} className="flex-1 py-2 text-sm bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
