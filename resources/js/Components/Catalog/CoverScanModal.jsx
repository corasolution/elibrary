import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Sparkles, RotateCcw, Check, AlertCircle } from 'lucide-react';

// Downscale an <img>/<video>/<canvas> source to a JPEG data URL suitable for OCR.
// 1280px max keeps cover text legible while keeping the upload small.
function sourceToDataUrl(source, sw, sh) {
    const maxDim = 1280;
    let w = sw, h = sh;
    if (w > h && w > maxDim) { h = Math.round((h / w) * maxDim); w = maxDim; }
    else if (h > maxDim)     { w = Math.round((w / h) * maxDim); h = maxDim; }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(source, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.82);
}

export default function CoverScanModal({ onApply, onClose }) {
    const [stage, setStage] = useState('idle');     // idle | camera | scanning | review | error
    const [errMsg, setErrMsg] = useState('');
    const [image, setImage] = useState(null);        // captured data URL
    const [result, setResult] = useState(null);      // AI-extracted record
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = async () => {
        setErrMsg('');
        setStage('camera');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }
        } catch (e) {
            setErrMsg('Could not access the camera. You can upload a photo instead.');
            setStage('idle');
        }
    };

    const capture = () => {
        const v = videoRef.current;
        if (!v) return;
        const dataUrl = sourceToDataUrl(v, v.videoWidth, v.videoHeight);
        stopCamera();
        scan(dataUrl);
    };

    const onFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => scan(sourceToDataUrl(img, img.width, img.height));
            img.onerror = () => { setErrMsg('Could not read that image.'); setStage('error'); };
            img.src = reader.result;
        };
        reader.onerror = () => { setErrMsg('Could not read that file.'); setStage('error'); };
        reader.readAsDataURL(file);
    };

    const scan = async (dataUrl) => {
        setImage(dataUrl);
        setStage('scanning');
        setErrMsg('');
        try {
            const res = await fetch(route('admin.catalog.scan-cover'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({ image: dataUrl }),
            });
            const r = await res.json();
            if (!res.ok || r.error) {
                setErrMsg(r.error || 'Scan failed. Try a clearer photo.');
                setStage('error');
                return;
            }
            setResult(r.result);
            setStage('review');
        } catch {
            setErrMsg('Network error. Please try again.');
            setStage('error');
        }
    };

    const retake = () => {
        setResult(null);
        setImage(null);
        startCamera();
    };

    const apply = () => {
        if (result) onApply(result);
        close();
    };

    const close = () => {
        stopCamera();
        onClose();
    };

    useEffect(() => () => stopCamera(), [stopCamera]);

    const authorsText = (result?.authors || []).map(a => a.name).filter(Boolean).join(', ');
    const subjectsText = (result?.subjects || []).map(s => s.term).filter(Boolean).join(', ');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={close}>
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden" onMouseDown={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <h2 className="text-sm font-semibold text-gray-800">Scan Book Cover with AI</h2>
                    </div>
                    <button type="button" onClick={close} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    {/* Idle */}
                    {stage === 'idle' && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <Camera className="w-10 h-10 text-blue-400" />
                            </div>
                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                Point your camera at a book cover. The AI will read the title, author, publisher and more,
                                then let you review before filling the form.
                            </p>
                            {errMsg && (
                                <div className="w-full flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errMsg}
                                </div>
                            )}
                            <div className="flex gap-3 w-full">
                                <button type="button" onClick={startCamera}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                                    <Camera className="w-4 h-4" /> Open Camera
                                </button>
                                <label className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 hover:border-blue-300 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer transition-colors">
                                    <Upload className="w-4 h-4" /> Upload Photo
                                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Camera */}
                    {stage === 'camera' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-full rounded-xl overflow-hidden bg-black aspect-[4/3]">
                                <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                            </div>
                            <div className="flex gap-3 w-full">
                                <button type="button" onClick={capture}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                                    <Camera className="w-4 h-4" /> Capture
                                </button>
                                <button type="button" onClick={() => { stopCamera(); setStage('idle'); }}
                                    className="px-5 py-2.5 border-2 border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-xl transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scanning */}
                    {stage === 'scanning' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            {image && <img src={image} alt="cover" className="max-h-48 rounded-lg shadow-sm" />}
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> Reading the cover…
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {stage === 'error' && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-full flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errMsg}
                            </div>
                            <button type="button" onClick={retake}
                                className="flex items-center gap-2 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                                <RotateCcw className="w-4 h-4" /> Try Again
                            </button>
                        </div>
                    )}

                    {/* Review */}
                    {stage === 'review' && result && (
                        <div className="grid sm:grid-cols-[140px_1fr] gap-5">
                            <div>
                                {image && <img src={image} alt="cover" className="w-full rounded-lg shadow-sm border border-gray-100" />}
                            </div>
                            <div className="space-y-2.5 text-sm">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Detected</p>
                                <Detail label="Title" value={result.title} />
                                {result.subtitle && <Detail label="Subtitle" value={result.subtitle} />}
                                <Detail label="Author(s)" value={authorsText} />
                                <Detail label="Publisher" value={result.publisher} />
                                <Detail label="Year" value={result.publication_year} />
                                {result.edition && <Detail label="Edition" value={result.edition} />}
                                {result.language && <Detail label="Language" value={result.language} />}
                                {result.isbn && <Detail label="ISBN" value={result.isbn} />}
                                {subjectsText && <Detail label="Subjects" value={subjectsText} />}

                                <div className="flex gap-3 pt-3">
                                    <button type="button" onClick={apply}
                                        className="flex items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                                        <Check className="w-4 h-4" /> Apply to Form
                                    </button>
                                    <button type="button" onClick={retake}
                                        className="flex items-center gap-2 py-2 px-4 border-2 border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-xl transition-colors">
                                        <RotateCcw className="w-4 h-4" /> Retake
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 pt-1">
                                    Review and edit the fields in the form after applying — AI reading can be imperfect.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex gap-2">
            <span className="text-gray-400 w-20 shrink-0">{label}</span>
            <span className="text-gray-800 font-medium">{value}</span>
        </div>
    );
}
