import { useState, useRef, useEffect } from 'react';
import {
    Search, BookOpen, User, CheckCircle, AlertCircle,
    RefreshCw, LogOut, RotateCcw, Loader2, X, Clock,
    WifiOff, ListChecks,
} from 'lucide-react';
import OfflineQueue from './OfflineQueue';

export default function CheckoutCore({ fullscreen = false, offline = null }) {
    const [tab, setTab]           = useState('checkout');
    const [showQueue, setShowQueue] = useState(false);

    const queueTotal = offline ? offline.queue.length + offline.failedQueue.length : 0;

    const inputSz = fullscreen ? 'py-3.5' : 'py-2.5';
    const panelCls = fullscreen
        ? 'bg-white rounded-xl border border-gray-200 p-6 space-y-6'
        : 'bg-white rounded-b-xl border border-t-0 border-gray-200 p-5 space-y-5';

    return (
        <div className="relative">
            {/* Tab Bar + Queue button (normal mode) */}
            <div className={`flex items-center border-b border-gray-200 bg-white ${fullscreen ? 'rounded-xl mb-4' : 'rounded-t-xl mb-0'} overflow-hidden`}>
                <TabBtn active={tab === 'checkout'} onClick={() => setTab('checkout')} icon={BookOpen} label="Check Out" fullscreen={fullscreen} />
                <TabBtn active={tab === 'checkin'}  onClick={() => setTab('checkin')}  icon={LogOut}   label="Check In"  fullscreen={fullscreen} />

                {!fullscreen && queueTotal > 0 && (
                    <button onClick={() => setShowQueue(true)}
                        className="ml-auto mr-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100">
                        <ListChecks className="w-3.5 h-3.5" />
                        Queue ({queueTotal})
                    </button>
                )}
            </div>

            {tab === 'checkout'
                ? <CheckOutPanel panelCls={panelCls} inputSz={inputSz} offline={offline} />
                : <CheckInPanel  panelCls={panelCls} inputSz={inputSz} offline={offline} />
            }

            {/* Kiosk floating queue button */}
            {fullscreen && queueTotal > 0 && (
                <button onClick={() => setShowQueue(true)}
                    className="fixed bottom-6 right-6 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg">
                    <ListChecks className="w-4 h-4" />
                    Queue ({queueTotal})
                </button>
            )}

            {showQueue && offline && (
                <OfflineQueue offline={offline} onClose={() => setShowQueue(false)} />
            )}
        </div>
    );
}

// ─── Check Out Panel ──────────────────────────────────────────────────────────
function CheckOutPanel({ panelCls, inputSz, offline }) {
    const [patronBarcode, setPatronBarcode] = useState('');
    const [patron, setPatron]               = useState(null);
    const [patronError, setPatronError]     = useState('');
    const [patronLoading, setPatronLoading] = useState(false);

    const [itemBarcode, setItemBarcode]     = useState('');
    const [item, setItem]                   = useState(null);
    const [itemError, setItemError]         = useState('');
    const [itemLoading, setItemLoading]     = useState(false);

    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [lastLoan, setLastLoan]               = useState(null);
    const [renewLoading, setRenewLoading]       = useState(null);

    const patronRef = useRef();
    const itemRef   = useRef();

    useEffect(() => { patronRef.current?.focus(); }, []);
    useEffect(() => { if (patron) itemRef.current?.focus(); }, [patron]);

    const lookupPatron = async (e) => {
        e.preventDefault();
        if (!patronBarcode.trim()) return;
        setPatronLoading(true);
        setPatronError('');
        setPatron(null);
        setItem(null);
        setLastLoan(null);

        try {
            const res = await fetch(route('admin.circulation.lookup-patron'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ barcode: patronBarcode.trim() }),
            });
            const json = await res.json();
            if (!res.ok) { setPatronError(json.error ?? 'Not found.'); return; }
            offline?.cachePatron(patronBarcode.trim(), json.patron);
            setPatron(json.patron);
        } catch {
            if (offline && !offline.isOnline) {
                const cached = offline.getCachedPatron(patronBarcode.trim());
                if (cached) {
                    setPatron({ ...cached, fromCache: true });
                } else {
                    setPatronError('Offline — patron not in cache. Look up this patron while online first.');
                }
            } else {
                setPatronError('Network error.');
            }
        } finally {
            setPatronLoading(false);
        }
    };

    const lookupItem = async (e) => {
        e.preventDefault();
        if (!itemBarcode.trim()) return;
        setItemLoading(true);
        setItemError('');
        setItem(null);

        try {
            const res = await fetch(route('admin.circulation.lookup-item'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ barcode: itemBarcode.trim() }),
            });
            const json = await res.json();
            if (!res.ok) { setItemError(json.error ?? 'Not found.'); return; }
            if (!json.item.available) {
                setItemError(`Item is not available (status: ${json.item.status}).`);
                return;
            }
            offline?.cacheItem(itemBarcode.trim(), json.item);
            setItem(json.item);
        } catch {
            if (offline && !offline.isOnline) {
                const cached = offline.getCachedItem(itemBarcode.trim());
                if (cached) {
                    if (!cached.available) {
                        setItemError(`Item is not available (status: ${cached.status}).`);
                        return;
                    }
                    setItem({ ...cached, fromCache: true });
                } else {
                    setItemError('Offline — item not in cache. Scan this item while online first.');
                }
            } else {
                setItemError('Network error.');
            }
        } finally {
            setItemLoading(false);
        }
    };

    const confirmCheckout = async () => {
        if (!patron || !item) return;

        // Offline path
        if (offline && !offline.isOnline) {
            const fakeLoan = offline.enqueueCheckout(
                patron.id, item.id,
                patronBarcode.trim(),
                patron.name, item.title, item.barcode
            );
            setLastLoan(fakeLoan);
            setItem(null);
            setItemBarcode('');
            setPatron(p => ({ ...p, active_loans: p.active_loans + 1 }));
            itemRef.current?.focus();
            return;
        }

        setCheckoutLoading(true);
        try {
            const res = await fetch(route('admin.circulation.checkout'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ patron_id: patron.id, item_id: item.id }),
            });
            const json = await res.json();
            if (!res.ok) { setItemError(json.error ?? 'Checkout failed.'); return; }
            setLastLoan(json.loan);
            setItem(null);
            setItemBarcode('');
            setPatron(p => ({ ...p, active_loans: p.active_loans + 1 }));
            itemRef.current?.focus();
        } catch {
            setItemError('Network error.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const renewLoan = async (loanId) => {
        setRenewLoading(loanId);
        try {
            const res = await fetch(route('admin.circulation.renew', loanId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
            });
            const json = await res.json();
            if (!res.ok) { alert(json.error ?? 'Renewal failed.'); return; }
            setPatron(p => ({
                ...p,
                active_loans_list: p.active_loans_list.map(l =>
                    l.id === loanId
                        ? { ...l, due_date: json.loan.due_date, renewals_count: json.loan.renewals_count }
                        : l
                ),
            }));
        } catch {
            alert('Network error.');
        } finally {
            setRenewLoading(null);
        }
    };

    const reset = () => {
        setPatron(null); setPatronBarcode(''); setPatronError('');
        setItem(null);   setItemBarcode('');   setItemError('');
        setLastLoan(null);
        patronRef.current?.focus();
    };

    return (
        <div className={panelCls}>
            {/* Step 1: Patron */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    1. Patron Card / Email
                </label>
                <form onSubmit={lookupPatron} className="flex gap-2">
                    <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            ref={patronRef}
                            value={patronBarcode}
                            onChange={e => setPatronBarcode(e.target.value)}
                            placeholder="Scan card or type patron number / email"
                            className={`w-full pl-9 pr-3 ${inputSz} text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            disabled={!!patron}
                        />
                    </div>
                    {!patron ? (
                        <button type="submit" disabled={patronLoading}
                            className={`px-4 ${inputSz} bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2`}>
                            {patronLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Find
                        </button>
                    ) : (
                        <button type="button" onClick={reset}
                            className={`px-4 ${inputSz} bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 flex items-center gap-2`}>
                            <RotateCcw className="w-4 h-4" /> Reset
                        </button>
                    )}
                </form>
                {patronError && <ErrorMsg>{patronError}</ErrorMsg>}
            </div>

            {/* Patron Card */}
            {patron && (
                <div className={`rounded-xl border-2 p-4 ${patron.can_borrow ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                                {patron.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{patron.name}</span>
                                    {patron.fromCache && (
                                        <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
                                            From cache
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">{patron.patron_number} · {patron.category ?? 'No category'}</div>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <StatusBadge ok={patron.can_borrow} label={patron.can_borrow ? 'Can Borrow' : 'Cannot Borrow'} />
                            <div className="text-xs text-gray-500 mt-1">{patron.active_loans} active loan{patron.active_loans !== 1 ? 's' : ''}</div>
                        </div>
                    </div>

                    {patron.fromCache && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
                            <WifiOff className="w-3.5 h-3.5" />
                            Availability data is from cache and may be stale.
                        </div>
                    )}

                    {!patron.can_borrow && (
                        <ErrorMsg>{patron.status !== 'active' ? `Account status: ${patron.status}` : 'Loan limit reached.'}</ErrorMsg>
                    )}

                    {patron.active_loans_list?.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-gray-600 mb-1.5">Current Loans</div>
                            <div className="space-y-1">
                                {patron.active_loans_list.map(loan => (
                                    <div key={loan.id} className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 text-xs border border-gray-100">
                                        <span className="flex-1 truncate text-gray-800">{loan.title}</span>
                                        <span className={`flex-shrink-0 font-mono ${loan.is_overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                            {loan.due_date}
                                        </span>
                                        {loan.renewals_count < loan.max_renewals ? (
                                            <button onClick={() => renewLoan(loan.id)} disabled={renewLoading === loan.id}
                                                className="flex-shrink-0 px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center gap-1">
                                                {renewLoading === loan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                Renew
                                            </button>
                                        ) : (
                                            <span className="flex-shrink-0 text-gray-300 text-xs">Max renewals</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Item */}
            {patron && patron.can_borrow && (
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        2. Scan Item Barcode
                    </label>
                    <form onSubmit={lookupItem} className="flex gap-2">
                        <div className="relative flex-1">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={itemRef}
                                value={itemBarcode}
                                onChange={e => setItemBarcode(e.target.value)}
                                placeholder="Scan item barcode"
                                className={`w-full pl-9 pr-3 ${inputSz} text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        <button type="submit" disabled={itemLoading}
                            className={`px-4 ${inputSz} bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2`}>
                            {itemLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Find
                        </button>
                    </form>
                    {itemError && <ErrorMsg>{itemError}</ErrorMsg>}
                </div>
            )}

            {/* Item Preview + Confirm */}
            {item && (
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{item.title}</span>
                                {item.fromCache && (
                                    <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
                                        From cache
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                {item.barcode} · {item.call_number} · {item.type}
                            </div>
                            {item.fromCache && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                                    <WifiOff className="w-3 h-3" /> Verify item is physically in hand
                                </div>
                            )}
                        </div>
                        <button onClick={() => { setItem(null); setItemBarcode(''); }} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={confirmCheckout}
                        disabled={checkoutLoading}
                        className="mt-3 w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2">
                        {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        {offline && !offline.isOnline ? 'Queue Checkout (Offline)' : 'Confirm Checkout'}
                    </button>
                </div>
            )}

            {/* Last checkout confirmation */}
            {lastLoan && (
                <div className={`rounded-xl border p-4 text-sm ${lastLoan.offline ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
                    {lastLoan.offline ? (
                        <div className="flex items-center gap-2 text-amber-700 font-semibold">
                            <Clock className="w-4 h-4" /> Queued — will sync when online
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <CheckCircle className="w-4 h-4" /> Checked out successfully
                        </div>
                    )}
                    <div className="mt-1 text-gray-700">
                        <strong>{lastLoan.title}</strong> · Due <strong>{lastLoan.due_date}</strong>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Check In Panel ───────────────────────────────────────────────────────────
function CheckInPanel({ panelCls, inputSz, offline }) {
    const [barcode, setBarcode]           = useState('');
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState('');
    const [returnedToday, setReturnedToday] = useState([]);
    const inputRef = useRef();

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleReturn = async (e) => {
        e.preventDefault();
        if (!barcode.trim()) return;

        // Offline path
        if (offline && !offline.isOnline) {
            const cached  = offline.getCachedItem(barcode.trim());
            const fakeLoan = offline.enqueueCheckin(barcode.trim(), cached?.title);
            setReturnedToday(prev => [fakeLoan, ...prev]);
            setBarcode('');
            inputRef.current?.focus();
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(route('admin.circulation.checkin'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ barcode: barcode.trim() }),
            });
            const json = await res.json();
            if (!res.ok) { setError(json.error ?? 'Return failed.'); return; }
            setReturnedToday(prev => [json.loan, ...prev]);
            setBarcode('');
            inputRef.current?.focus();
        } catch {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={panelCls}>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Scan Item Barcode to Return
                </label>
                <form onSubmit={handleReturn} className="flex gap-2">
                    <div className="relative flex-1">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            ref={inputRef}
                            value={barcode}
                            onChange={e => setBarcode(e.target.value)}
                            placeholder="Scan or type item barcode"
                            className={`w-full pl-9 pr-3 ${inputSz} text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>
                    <button type="submit" disabled={loading}
                        className={`px-4 ${inputSz} bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2`}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        {offline && !offline.isOnline ? 'Queue Return' : 'Return'}
                    </button>
                </form>
                {error && <ErrorMsg>{error}</ErrorMsg>}
            </div>

            {returnedToday.length > 0 && (
                <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Returned This Session ({returnedToday.length})
                    </div>
                    <div className="space-y-2">
                        {returnedToday.map((loan, i) => (
                            <div key={i} className={`flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm border ${loan.offline ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
                                <div className="flex items-center gap-2 min-w-0">
                                    {loan.offline
                                        ? <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        : <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    }
                                    <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{loan.title}</div>
                                        <div className="text-xs text-gray-500">
                                            {loan.patron_name}
                                            {loan.offline && <span className="ml-1 text-amber-600 font-medium">(pending sync)</span>}
                                            {!loan.offline && ` · ${loan.returned_at}`}
                                        </div>
                                    </div>
                                </div>
                                {!loan.offline && loan.fine_amount > 0 && (
                                    <span className="flex-shrink-0 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                        Fine: ${loan.fine_amount.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label, fullscreen }) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-2 ${fullscreen ? 'px-6 py-4 text-base' : 'px-5 py-3.5 text-sm'} font-medium border-b-2 transition-colors -mb-px
                ${active
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 bg-gray-50'
                }`}>
            <Icon className={fullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
            {label}
        </button>
    );
}

function StatusBadge({ ok, label }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {ok ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {label}
        </span>
    );
}

function ErrorMsg({ children }) {
    return (
        <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {children}
        </div>
    );
}

function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}
