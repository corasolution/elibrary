import { useState, useEffect, useRef } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { ArrowLeft, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function Reader({ resource, record, url: signedUrl }) {
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';
    const format = resource?.format?.toLowerCase();

    // Build the file URL: prefer relative /storage path (avoids hostname mismatch),
    // fall back to signedUrl (S3 in production), then external url.
    const fileUrl = (() => {
        if (resource?.is_external && resource?.url) return resource.url;
        if (resource?.file_path) return `/storage/${resource.file_path}`;
        if (signedUrl) return signedUrl;
        return resource?.url ?? '';
    })();

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Top bar */}
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4 shrink-0">
                <Link href={`${base}/catalog/${record?.id}`}
                    className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{record?.title}</p>
                    <p className="text-gray-400 text-xs">{record?.authors?.[0]?.name}</p>
                </div>
                <a href={`${base}/download/${resource?.id}`}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-600 px-3 py-1.5 rounded-lg">
                    <Download className="w-3.5 h-3.5" /> Download
                </a>
            </header>

            {/* Viewer area */}
            <div className="flex-1 overflow-hidden">
                {format === 'pdf' && <PdfViewer src={fileUrl} />}
                {format === 'epub' && <EpubViewer src={fileUrl} />}
                {['mp3', 'wav', 'flac'].includes(format) && (
                    <AudioViewer src={fileUrl} title={record?.title} cover={resource?.thumbnail_path ? `/storage/${resource.thumbnail_path}` : null} />
                )}
                {['mp4', 'mkv', 'webm'].includes(format) && (
                    <VideoViewer src={fileUrl} title={record?.title} />
                )}
                {!['pdf', 'epub', 'mp3', 'wav', 'flac', 'mp4', 'mkv', 'webm'].includes(format) && (
                    <UnsupportedViewer resource={resource} base={base} />
                )}
            </div>
        </div>
    );
}

// ─── PDF Viewer (pdfjs-dist) ──────────────────────────────────────────────────
function PdfViewer({ src }) {
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [page, setPage]         = useState(1);
    const [scale, setScale]       = useState(1.2);
    const canvasRef    = useRef(null);
    const renderRef    = useRef(null);
    const pdfRef       = useRef(null);

    useEffect(() => {
        if (!src) return;
        let cancelled = false;
        import('pdfjs-dist').then(async (pdfjsLib) => {
            // Use CDN worker to avoid Vite bundling issues with web workers
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
            const pdf = await pdfjsLib.getDocument(src).promise;
            if (cancelled) return;
            pdfRef.current = pdf;
            setNumPages(pdf.numPages);
            setLoading(false);
        }).catch(err => {
            console.error('PDF load error:', err);
            if (!cancelled) { setError(err.message || 'Failed to load PDF'); setLoading(false); }
        });
        return () => { cancelled = true; };
    }, [src]);

    useEffect(() => {
        if (!pdfRef.current || loading) return;
        (async () => {
            if (renderRef.current) renderRef.current.cancel();
            const pdfPage  = await pdfRef.current.getPage(page);
            const viewport = pdfPage.getViewport({ scale });
            const canvas   = canvasRef.current;
            if (!canvas) return;
            canvas.height  = viewport.height;
            canvas.width   = viewport.width;
            renderRef.current = pdfPage.render({
                canvasContext: canvas.getContext('2d'), viewport,
            });
            await renderRef.current.promise.catch(() => {});
        })();
    }, [page, scale, loading]);

    return (
        <div className="flex flex-col h-full">
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-4 justify-center">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                    className="text-gray-400 hover:text-white disabled:opacity-30">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-gray-300 text-sm">Page {page} of {numPages ?? '…'}</span>
                <button onClick={() => setPage(p => Math.min(numPages ?? p, p + 1))} disabled={page >= (numPages ?? 1)}
                    className="text-gray-400 hover:text-white disabled:opacity-30">
                    <ChevronRight className="w-5 h-5" />
                </button>
                <div className="h-4 w-px bg-gray-600" />
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="text-gray-400 hover:text-white">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-gray-400 text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="text-gray-400 hover:text-white">
                    <ZoomIn className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-gray-900">
                {loading ? (
                    <div className="flex items-center gap-2 text-gray-400 mt-20">
                        <Loader2 className="w-5 h-5 animate-spin" /> Loading PDF…
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center gap-3 text-gray-400 mt-20">
                        <p className="text-red-400 font-medium">Failed to load PDF</p>
                        <p className="text-xs text-gray-500">{error}</p>
                        <a href={src} target="_blank" rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline">
                            Open file directly ↗
                        </a>
                    </div>
                ) : (
                    <canvas ref={canvasRef} className="shadow-2xl" />
                )}
            </div>
        </div>
    );
}

// ─── ePub Viewer (epub.js) ────────────────────────────────────────────────────
function EpubViewer({ src }) {
    const containerRef = useRef(null);
    const bookRef      = useRef(null);
    const rendRef      = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!src || !containerRef.current) return;
        import('epubjs').then(({ default: ePub }) => {
            bookRef.current = ePub(src);
            rendRef.current = bookRef.current.renderTo(containerRef.current, {
                width: '100%', height: '100%', spread: 'none',
            });
            rendRef.current.display().then(() => setLoading(false));
        }).catch(console.error);
        return () => bookRef.current?.destroy();
    }, [src]);

    return (
        <div className="flex flex-col h-full">
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-center gap-6">
                <button onClick={() => rendRef.current?.prev()}
                    className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
                    <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button onClick={() => rendRef.current?.next()}
                    className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
                    Next <ChevronRight className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 relative bg-white">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                )}
                <div ref={containerRef} className="h-full" />
            </div>
        </div>
    );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────
function AudioViewer({ src, title, cover }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
            <div className="w-48 h-48 rounded-2xl bg-gray-700 flex items-center justify-center overflow-hidden shadow-2xl">
                {cover
                    ? <img src={cover} alt={title} className="w-full h-full object-cover" />
                    : <svg className="w-24 h-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                    </svg>
                }
            </div>
            <p className="text-white font-semibold text-center max-w-sm text-lg">{title}</p>
            <audio controls src={src} className="w-full max-w-md"
                style={{ filter: 'invert(1) hue-rotate(180deg)' }} />
            <p className="text-gray-500 text-xs">Use the controls above to play the audio</p>
        </div>
    );
}

// ─── Video Player ─────────────────────────────────────────────────────────────
function VideoViewer({ src, title }) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-black p-4 gap-3">
            <video controls src={src} className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                autoPlay={false}>
                Your browser does not support the video tag.
            </video>
            {title && <p className="text-gray-400 text-sm">{title}</p>}
        </div>
    );
}

// ─── Unsupported ──────────────────────────────────────────────────────────────
function UnsupportedViewer({ resource, base }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <p className="text-lg">Preview not available for this format</p>
            <p className="text-sm">Format: <span className="font-mono">{resource?.format ?? 'unknown'}</span></p>
            {resource && (
                <a href={`${base}/download/${resource.id}`}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download File
                </a>
            )}
        </div>
    );
}
