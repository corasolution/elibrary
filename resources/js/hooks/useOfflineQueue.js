import { useState, useEffect, useRef, useCallback } from 'react';

const QUEUE_KEY  = 'circ_offline_queue';
const FAILED_KEY = 'circ_failed_queue';

function loadQueue()  { try { return JSON.parse(localStorage.getItem(QUEUE_KEY)  ?? '[]'); } catch { return []; } }
function loadFailed() { try { return JSON.parse(localStorage.getItem(FAILED_KEY) ?? '[]'); } catch { return []; } }
function saveQueue(arr)  { localStorage.setItem(QUEUE_KEY,  JSON.stringify(arr)); }
function saveFailed(arr) { localStorage.setItem(FAILED_KEY, JSON.stringify(arr)); }

function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

// ─── SessionStorage cache helpers ────────────────────────────────────────────
function cacheKey(type, barcode) { return `circ_cache_${type}_${barcode}`; }

function cachePatron(barcode, data) {
    try { sessionStorage.setItem(cacheKey('patron', barcode), JSON.stringify(data)); } catch {}
}
function getCachedPatron(barcode) {
    try { const s = sessionStorage.getItem(cacheKey('patron', barcode)); return s ? JSON.parse(s) : null; } catch { return null; }
}
function updateCachedPatron(barcode, updater) {
    const cached = getCachedPatron(barcode);
    if (cached) cachePatron(barcode, updater(cached));
}

function cacheItem(barcode, data) {
    try { sessionStorage.setItem(cacheKey('item', barcode), JSON.stringify(data)); } catch {}
}
function getCachedItem(barcode) {
    try { const s = sessionStorage.getItem(cacheKey('item', barcode)); return s ? JSON.parse(s) : null; } catch { return null; }
}
function updateCachedItem(barcode, updater) {
    const cached = getCachedItem(barcode);
    if (cached) cacheItem(barcode, updater(cached));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export default function useOfflineQueue() {
    const [isOnline,    setIsOnline]    = useState(() => navigator.onLine);
    const [syncStatus,  setSyncStatus]  = useState('idle');
    const [queue,       setQueue]       = useState(loadQueue);
    const [failedQueue, setFailedQueue] = useState(loadFailed);

    const isSyncingRef = useRef(false);
    const queueRef     = useRef(queue);
    const failedRef    = useRef(failedQueue);

    // Keep refs in sync so triggerSync always has fresh data
    useEffect(() => { queueRef.current  = queue; },       [queue]);
    useEffect(() => { failedRef.current = failedQueue; }, [failedQueue]);

    const triggerSync = useCallback(async () => {
        if (isSyncingRef.current) return;
        const pending = loadQueue(); // read fresh from storage
        if (pending.length === 0) return;

        isSyncingRef.current = true;
        setSyncStatus('syncing');

        const remaining = [...pending];
        const newFailed = loadFailed();

        for (const tx of [...pending]) {
            try {
                let res;
                if (tx.type === 'checkout') {
                    res = await fetch(route('admin.circulation.checkout'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                        body: JSON.stringify({ patron_id: tx.patron_id, item_id: tx.item_id }),
                    });
                } else {
                    res = await fetch(route('admin.circulation.checkin'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                        body: JSON.stringify({ barcode: tx.barcode }),
                    });
                }

                const idx = remaining.findIndex(r => r.id === tx.id);
                if (res.ok) {
                    if (idx !== -1) remaining.splice(idx, 1);
                } else {
                    let reason = 'Server error';
                    if (res.status === 419) {
                        reason = 'Session expired — reload the page and retry';
                    } else {
                        try { const j = await res.json(); reason = j.error ?? reason; } catch {}
                    }
                    if (idx !== -1) remaining.splice(idx, 1);
                    newFailed.push({ ...tx, failReason: reason, failedAt: new Date().toISOString() });
                }
            } catch {
                // Network dropped mid-sync — keep remaining, stop loop
                break;
            }
        }

        setQueue(remaining);
        saveQueue(remaining);
        setFailedQueue(newFailed);
        saveFailed(newFailed);
        isSyncingRef.current = false;

        const status = remaining.length === 0 && newFailed.length === 0 ? 'done' : 'partial';
        setSyncStatus(status);
        setTimeout(() => setSyncStatus('idle'), 4000);
    }, []);

    // Connection event listeners
    useEffect(() => {
        const goOnline  = () => { setIsOnline(true);  triggerSync(); };
        const goOffline = () => setIsOnline(false);
        window.addEventListener('online',  goOnline);
        window.addEventListener('offline', goOffline);

        // Auto-sync on mount if we came back online with a queue
        if (navigator.onLine && loadQueue().length > 0) {
            triggerSync();
        }

        return () => {
            window.removeEventListener('online',  goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, [triggerSync]);

    // ─── Enqueue helpers ──────────────────────────────────────────────────────

    const enqueueCheckout = useCallback((patronId, itemId, patronBarcode, patronName, itemTitle, itemBarcode) => {
        const tx = {
            id:           crypto.randomUUID(),
            type:         'checkout',
            createdAt:    new Date().toISOString(),
            patron_id:    patronId,
            item_id:      itemId,
            patronBarcode,
            patronName,
            itemTitle,
            itemBarcode,
        };
        const next = [...loadQueue(), tx];
        setQueue(next);
        saveQueue(next);

        // Update cached patron active_loans count
        updateCachedPatron(patronBarcode, p => ({ ...p, active_loans: (p.active_loans ?? 0) + 1 }));
        // Mark item unavailable in cache
        updateCachedItem(itemBarcode, i => ({ ...i, available: false, status: 'checked_out' }));

        return { offline: true, due_date: '(synced when online)', title: itemTitle, barcode: itemBarcode };
    }, []);

    const enqueueCheckin = useCallback((barcode, titleHint) => {
        const tx = {
            id:        crypto.randomUUID(),
            type:      'checkin',
            createdAt: new Date().toISOString(),
            barcode,
        };
        const next = [...loadQueue(), tx];
        setQueue(next);
        saveQueue(next);

        // Mark item available in cache
        updateCachedItem(barcode, i => ({ ...i, available: true, status: 'available' }));

        return {
            offline:      true,
            title:        titleHint ?? barcode,
            barcode,
            patron_name:  '(pending sync)',
            returned_at:  new Date().toLocaleString(),
            fine_amount:  0,
        };
    }, []);

    const dismissFailed = useCallback((id) => {
        const next = loadFailed().filter(t => t.id !== id);
        setFailedQueue(next);
        saveFailed(next);
    }, []);

    const retryFailed = useCallback((id) => {
        const all    = loadFailed();
        const item   = all.find(t => t.id === id);
        if (!item) return;
        const { failReason, failedAt, ...tx } = item;
        const nextFailed = all.filter(t => t.id !== id);
        const nextQueue  = [...loadQueue(), tx];
        setFailedQueue(nextFailed);
        saveFailed(nextFailed);
        setQueue(nextQueue);
        saveQueue(nextQueue);
    }, []);

    const clearAllFailed = useCallback(() => {
        setFailedQueue([]);
        saveFailed([]);
    }, []);

    return {
        isOnline,
        syncStatus,
        queue,
        failedQueue,
        triggerSync,
        enqueueCheckout,
        enqueueCheckin,
        cachePatron,
        getCachedPatron,
        cacheItem,
        getCachedItem,
        dismissFailed,
        retryFailed,
        clearAllFailed,
    };
}
