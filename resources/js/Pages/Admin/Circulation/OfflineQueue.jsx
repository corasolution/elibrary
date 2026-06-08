import { X, RefreshCw, Trash2, WifiOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function OfflineQueue({ offline, onClose }) {
    const { queue, failedQueue, isOnline, syncStatus, triggerSync, dismissFailed, retryFailed, clearAllFailed } = offline;

    const total = queue.length + failedQueue.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Offline Transaction Queue</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{total} transaction{total !== 1 ? 's' : ''} pending</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-5 space-y-5">
                    {/* Pending Sync */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Pending Sync ({queue.length})
                            </h3>
                            {isOnline && queue.length > 0 && (
                                <button
                                    onClick={triggerSync}
                                    disabled={syncStatus === 'syncing'}
                                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">
                                    {syncStatus === 'syncing'
                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                        : <RefreshCw className="w-3 h-3" />}
                                    Sync Now
                                </button>
                            )}
                        </div>

                        {queue.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">No pending transactions.</p>
                        ) : (
                            <div className="space-y-2">
                                {queue.map(tx => (
                                    <div key={tx.id} className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                                        <span className={`mt-0.5 flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded ${tx.type === 'checkout' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {tx.type === 'checkout' ? 'OUT' : 'IN'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-900 truncate">
                                                {tx.itemTitle ?? tx.barcode}
                                            </div>
                                            {tx.patronName && (
                                                <div className="text-xs text-gray-500">{tx.patronName}</div>
                                            )}
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {new Date(tx.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isOnline && queue.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
                                <WifiOff className="w-3.5 h-3.5" />
                                Will sync automatically when connected.
                            </div>
                        )}
                    </section>

                    {/* Failed Transactions */}
                    {failedQueue.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Failed ({failedQueue.length})
                                </h3>
                                <button onClick={clearAllFailed} className="text-xs text-red-500 hover:text-red-700 font-medium">
                                    Clear All
                                </button>
                            </div>
                            <div className="space-y-2">
                                {failedQueue.map(tx => (
                                    <div key={tx.id} className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium text-gray-900 truncate">
                                                    {tx.itemTitle ?? tx.barcode}
                                                </div>
                                                {tx.patronName && (
                                                    <div className="text-xs text-gray-500">{tx.patronName}</div>
                                                )}
                                                <div className="text-xs text-red-600 mt-0.5">{tx.failReason}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => retryFailed(tx.id)}
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-white border border-blue-200 rounded">
                                                <RefreshCw className="w-3 h-3" /> Retry
                                            </button>
                                            <button onClick={() => dismissFailed(tx.id)}
                                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-white border border-red-200 rounded">
                                                <Trash2 className="w-3 h-3" /> Dismiss
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
