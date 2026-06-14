import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import {
    BookOpen, MapPin, User, Calendar, Hash, CheckCircle2, Loader2,
    ArrowLeft, Package, AlertCircle, ChevronRight, Barcode
} from 'lucide-react';

export default function HoldsToPull({ holds = [], totalCount = 0 }) {
    const [pulling, setPulling] = useState(null);
    const [done, setDone]       = useState(new Set());

    const pull = async (reservationId) => {
        setPulling(reservationId);
        try {
            await axios.post(route('admin.reservations.pull', reservationId));
            setDone(prev => new Set([...prev, reservationId]));
        } catch (e) {
            alert(e.response?.data?.error ?? 'Failed to pull hold.');
        } finally {
            setPulling(null);
        }
    };

    const pending = holds.filter(h => !done.has(h.reservation_id));

    return (
        <AdminLayout title="Holds to Pull">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.get(route('admin.reservations.index'))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-black text-gray-900">Holds to Pull</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Items on shelf with patrons waiting — pull and notify</p>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2">
                        <Package className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-800">{pending.length} to pull</span>
                        {done.size > 0 && <span className="text-xs text-emerald-600 font-medium">· {done.size} done</span>}
                    </div>
                </div>

                {/* Empty state */}
                {holds.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">All caught up!</h3>
                        <p className="text-gray-500 text-sm mt-1">No pending holds have available copies right now.</p>
                    </div>
                )}

                {/* Holds list */}
                {pending.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Package className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">Pull List</div>
                                <div className="text-xs text-gray-500">Retrieve these items from the shelf and check them in to notify patrons</div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {pending.map((hold) => (
                                <HoldRow
                                    key={hold.reservation_id}
                                    hold={hold}
                                    pulling={pulling === hold.reservation_id}
                                    onPull={() => pull(hold.reservation_id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed */}
                {done.size > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <p className="text-sm text-emerald-700">
                            <span className="font-bold">{done.size} hold(s) pulled</span> — patrons have been notified and have 7 days to pick up.
                        </p>
                    </div>
                )}

                {/* How it works */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">How it works</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { n: '1', title: 'Locate the item', desc: 'Find the item on the shelf using the call number and location shown.' },
                            { n: '2', title: 'Pull the item', desc: 'Click "Pull & Notify" — the system marks it ready and emails the patron.' },
                            { n: '3', title: 'Place on hold shelf', desc: 'Put the item on your hold shelf. Patron has 7 days to collect.' },
                        ].map(({ n, title, desc }) => (
                            <div key={n} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{n}</div>
                                <div>
                                    <div className="text-xs font-semibold text-gray-800">{title}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function HoldRow({ hold, pulling, onPull }) {
    const daysWaiting = Math.floor((Date.now() - new Date(hold.reserved_at)) / 86400000);
    const urgent = daysWaiting >= 7;

    return (
        <div className="p-5 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
                {/* Book icon */}
                <div className="w-10 h-14 bg-gradient-to-b from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">{hold.title}</h3>
                        {hold.isbn && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">{hold.isbn}</span>}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="font-medium">{hold.patron_name}</span>
                            <span className="text-gray-400">#{hold.patron_number}</span>
                        </span>
                        {hold.queue_position && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Hash className="w-3 h-3 text-indigo-400" />
                                Queue position: <span className="font-semibold text-indigo-700">{hold.queue_position}</span>
                            </span>
                        )}
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${urgent ? 'text-amber-700' : 'text-gray-500'}`}>
                            <Calendar className="w-3 h-3" />
                            Waiting {daysWaiting}d
                            {urgent && <AlertCircle className="w-3 h-3 text-amber-500" />}
                        </span>
                    </div>

                    {/* Item location */}
                    {hold.call_number && (
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono">
                                <Barcode className="w-3 h-3" />
                                {hold.call_number}
                            </span>
                            {hold.collection && (
                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    {hold.collection}{hold.location ? ` · ${hold.location}` : ''}{hold.shelf ? ` · Shelf: ${hold.shelf}` : ''}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Action */}
                <button
                    onClick={onPull}
                    disabled={pulling}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                    {pulling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    Pull & Notify
                </button>
            </div>
        </div>
    );
}
