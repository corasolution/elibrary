import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Scan, CheckCircle2, XCircle, AlertTriangle, BookOpen, Clock,
    X, MapPin, Lock, BarChart3, Loader2, ChevronRight
} from 'lucide-react';

const SCAN_STATUS_META = {
    found:          { icon: CheckCircle2,  bg: 'bg-emerald-50',  border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', label: 'Found' },
    checked_out:    { icon: BookOpen,      bg: 'bg-blue-50',     border: 'border-blue-300',    text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700',     label: 'On Loan' },
    wrong_location: { icon: MapPin,        bg: 'bg-amber-50',    border: 'border-amber-300',   text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',   label: 'Wrong Location' },
    not_found:      { icon: XCircle,       bg: 'bg-red-50',      border: 'border-red-300',     text: 'text-red-700',    badge: 'bg-red-100 text-red-700',       label: 'Unknown' },
    duplicate:      { icon: AlertTriangle, bg: 'bg-violet-50',   border: 'border-violet-300',  text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700', label: 'Duplicate' },
};

function fmtTime(d) {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function InventorySession({ session: initialSession, recentScans: initialScans }) {
    const [session, setSession]       = useState(initialSession);
    const [scans, setScans]           = useState(initialScans ?? []);
    const [barcode, setBarcode]       = useState('');
    const [scanning, setScanning]     = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [showClose, setShowClose]   = useState(false);
    const [closing, setClosing]       = useState(false);
    const [flagMissing, setFlagMissing] = useState(true);
    const inputRef = useRef(null);

    // Keep input focused
    useEffect(() => { inputRef.current?.focus(); }, []);

    const pct = session.expected_count > 0
        ? Math.min(100, Math.round(session.scanned_count / session.expected_count * 100))
        : 0;

    const handleScan = useCallback(async (e) => {
        e.preventDefault();
        const b = barcode.trim();
        if (!b || scanning) return;

        setScanning(true);
        setBarcode('');

        try {
            const res = await axios.post(route('admin.inventory.scan', session.id), { barcode: b });
            const data = res.data;
            const status = data.status;

            setLastResult({ ...data, barcode: b });

            if (status !== 'duplicate') {
                // Prepend to scans list
                setScans(prev => [{
                    id:          Date.now(),
                    barcode:     b,
                    scan_status: status,
                    scanned_at:  new Date().toISOString(),
                    title:       data.title ?? null,
                    call_number: data.call_number ?? null,
                    item_status: data.item_status ?? null,
                }, ...prev.slice(0, 49)]);

                // Update live counters
                setSession(prev => ({
                    ...prev,
                    scanned_count: data.status === 'not_found'
                        ? prev.scanned_count + 1
                        : prev.scanned_count + 1,
                    unknown_count: data.status === 'not_found'
                        ? prev.unknown_count + 1
                        : prev.unknown_count,
                }));
            }
        } catch (err) {
            const msg = err.response?.data?.error ?? 'Scan failed';
            setLastResult({ status: 'error', message: msg, barcode: b });
        } finally {
            setScanning(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [barcode, scanning, session.id]);

    const handleClose = async () => {
        setClosing(true);
        try {
            await axios.post(route('admin.inventory.close', session.id), { flag_missing: flagMissing });
            router.visit(route('admin.inventory.report', session.id));
        } catch {
            setClosing(false);
        }
    };

    const feedbackStyle = lastResult ? (SCAN_STATUS_META[lastResult.status] ?? SCAN_STATUS_META.not_found) : null;

    return (
        <AdminLayout title={`Inventory: ${session.name}`}>
            <div className="grid lg:grid-cols-3 gap-6 items-start">

                {/* ── Left: scanner (2/3) ──────────────────────────── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Scan input */}
                    <div className="bg-white border-2 border-blue-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                <Scan className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-sm">Barcode Scanner</h2>
                                <p className="text-blue-200 text-xs">Scan or type a barcode, then press Enter</p>
                            </div>
                            {scanning && <Loader2 className="w-5 h-5 text-white animate-spin ml-auto" />}
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleScan} className="flex gap-3">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={barcode}
                                    onChange={e => setBarcode(e.target.value)}
                                    placeholder="Scan barcode here…"
                                    disabled={scanning || !session.status === 'open'}
                                    className="flex-1 text-lg font-mono px-4 py-3 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded-xl transition-colors"
                                    autoComplete="off"
                                />
                                <button type="submit" disabled={scanning || !barcode.trim()}
                                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
                                    {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                                </button>
                            </form>

                            {/* Last result feedback */}
                            {lastResult && feedbackStyle && (
                                <div className={`mt-4 flex items-start gap-3 p-4 rounded-xl border-2 ${feedbackStyle.bg} ${feedbackStyle.border}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${feedbackStyle.badge}`}>
                                        <feedbackStyle.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-bold ${feedbackStyle.text}`}>{feedbackStyle.label}: <span className="font-mono">{lastResult.barcode}</span></div>
                                        {lastResult.title && <div className="text-xs text-gray-600 mt-0.5 truncate">{lastResult.title}</div>}
                                        <div className={`text-xs mt-0.5 ${feedbackStyle.text}`}>{lastResult.message}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent scans */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-700">Recent Scans</span>
                            <span className="ml-auto text-xs text-gray-400">{scans.length} shown</span>
                        </div>
                        {scans.length > 0 ? (
                            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                {scans.map((s, i) => {
                                    const sm = SCAN_STATUS_META[s.scan_status] ?? SCAN_STATUS_META.not_found;
                                    const Icon = sm.icon;
                                    return (
                                        <div key={s.id ?? i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${sm.badge}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono text-gray-700">{s.barcode}</span>
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sm.badge}`}>{sm.label}</span>
                                                </div>
                                                {s.title && <div className="text-xs text-gray-400 truncate mt-0.5">{s.title}</div>}
                                            </div>
                                            <span className="text-[10px] text-gray-400 flex-shrink-0">{fmtTime(s.scanned_at)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-xs text-gray-400">
                                <Scan className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                No scans yet — start scanning items
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: stats + close (1/3) ───────────────────── */}
                <div className="space-y-4 sticky top-4">

                    {/* Progress card */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 px-5 py-5">
                            <h3 className="text-white font-bold text-sm">{session.name}</h3>
                            {session.collection?.name && (
                                <p className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />{session.collection.name}
                                </p>
                            )}
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
                                    <span>Progress</span><span>{pct}%</span>
                                </div>
                                <div className="h-2 bg-indigo-900/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                            <Stat label="Expected" value={session.expected_count} color="text-gray-800" />
                            <Stat label="Scanned"  value={session.scanned_count}  color="text-blue-700" />
                            <Stat label="Remaining" value={Math.max(0, session.expected_count - session.scanned_count)} color="text-amber-700" />
                            <Stat label="Unknown"  value={session.unknown_count ?? 0} color="text-red-600" />
                        </div>
                    </div>

                    {/* Status counts */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Scan Results</div>
                        {Object.entries(SCAN_STATUS_META).filter(([k]) => k !== 'duplicate').map(([key, sm]) => {
                            const count = scans.filter(s => s.scan_status === key).length;
                            const Icon = sm.icon;
                            return (
                                <div key={key} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${sm.badge}`}>
                                        <Icon className="w-3 h-3" />
                                    </div>
                                    <span className="text-xs text-gray-600 flex-1">{sm.label}</span>
                                    <span className={`text-xs font-bold ${count > 0 ? sm.text : 'text-gray-300'}`}>{count}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Close session */}
                    {!showClose ? (
                        <button onClick={() => setShowClose(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-sm font-semibold rounded-xl transition-colors">
                            <Lock className="w-4 h-4" /> Close Session
                        </button>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-red-700">
                                    <p className="font-bold">Close this session?</p>
                                    <p className="mt-0.5">This action cannot be undone.</p>
                                </div>
                            </div>

                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input type="checkbox" checked={flagMissing} onChange={e => setFlagMissing(e.target.checked)}
                                    className="w-4 h-4 rounded border-red-300 accent-red-600" />
                                <span className="text-xs text-red-700 font-medium">
                                    Flag unscanned items as <strong>missing</strong>
                                </span>
                            </label>

                            <div className="flex gap-2">
                                <button onClick={handleClose} disabled={closing}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors">
                                    {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    Confirm Close
                                </button>
                                <button onClick={() => setShowClose(false)}
                                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-medium rounded-xl">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function Stat({ label, value, color }) {
    return (
        <div className="p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
        </div>
    );
}
