import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import {
    ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle,
    BarChart3, ChevronRight, BookOpen, Calendar, Play, FileText, Lock
} from 'lucide-react';

const STATUS_META = {
    open:   { label: 'In Progress', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: Play },
    closed: { label: 'Completed',   bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400',    icon: Lock },
};

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InventoryIndex({ sessions, openSession }) {
    const list = sessions?.data ?? [];

    return (
        <AdminLayout title="Inventory">
            <div className="space-y-6">

                {/* Open session banner */}
                {openSession && (
                    <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Play className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-emerald-900">Session in progress: <span className="font-bold">{openSession.name}</span></p>
                            <p className="text-xs text-emerald-600 mt-0.5">
                                {openSession.scanned_count} of {openSession.expected_count} items scanned
                                &nbsp;·&nbsp; Started {fmtDate(openSession.started_at)}
                            </p>
                        </div>
                        <Link href={route('admin.inventory.session', openSession.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0">
                            Continue Scanning <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}

                {/* Main card */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                            <ClipboardList className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Inventory Sessions</h2>
                            <p className="text-xs text-gray-500">Koha-style physical stocktaking</p>
                        </div>
                        <div className="ml-auto">
                            <Link href={route('admin.inventory.create')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors">
                                <Plus className="w-3.5 h-3.5" /> New Session
                            </Link>
                        </div>
                    </div>

                    {list.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {list.map(s => {
                                const sm = STATUS_META[s.status] ?? STATUS_META.closed;
                                const StatusIcon = sm.icon;
                                const pct = s.expected_count > 0 ? Math.min(100, Math.round(s.scanned_count / s.expected_count * 100)) : 0;

                                return (
                                    <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sm.bg}`}>
                                            <StatusIcon className={`w-5 h-5 ${sm.text}`} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900 truncate">{s.name}</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sm.bg} ${sm.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                                                    {sm.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(s.started_at)}</span>
                                                {s.collection?.name && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{s.collection.name}</span>}
                                                <span>{s.scanned_count} / {s.expected_count} scanned</span>
                                                {s.missing_count > 0 && (
                                                    <span className="flex items-center gap-1 text-red-500">
                                                        <AlertTriangle className="w-3 h-3" />{s.missing_count} missing
                                                    </span>
                                                )}
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mt-2 h-1.5 bg-gray-100 rounded-full w-48 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${s.status === 'open' ? 'bg-emerald-500' : 'bg-blue-400'}`}
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-800">{pct}%</div>
                                                <div>complete</div>
                                            </div>
                                            {s.missing_count > 0 && (
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-red-600">{s.missing_count}</div>
                                                    <div>missing</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {s.status === 'open' ? (
                                                <Link href={route('admin.inventory.session', s.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl transition-colors">
                                                    <Play className="w-3 h-3" /> Scan
                                                </Link>
                                            ) : (
                                                <Link href={route('admin.inventory.report', s.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold rounded-xl transition-colors">
                                                    <FileText className="w-3 h-3" /> Report
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                                <ClipboardList className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-400">No inventory sessions yet</p>
                            <p className="text-xs text-gray-300">Create a session to start counting your physical collection</p>
                            <Link href={route('admin.inventory.create')}
                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl">
                                <Plus className="w-3.5 h-3.5" /> New Session
                            </Link>
                        </div>
                    )}
                </div>

                {/* How it works */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" /> How Inventory Works
                    </h3>
                    <div className="grid sm:grid-cols-4 gap-4">
                        {[
                            { n: '1', icon: Plus,          color: 'blue',    title: 'Create Session',  desc: 'Set a name and scope (all items, a collection, or a location)' },
                            { n: '2', icon: BookOpen,       color: 'violet',  title: 'Scan Barcodes',   desc: 'Walk the shelves and scan each item\'s barcode — like Koha' },
                            { n: '3', icon: AlertTriangle,  color: 'amber',   title: 'Review Results',  desc: 'See found, missing, wrong-location and unknown items in real time' },
                            { n: '4', icon: CheckCircle2,   color: 'emerald', title: 'Close Session',   desc: 'Missing items are flagged automatically; a full report is generated' },
                        ].map(({ n, icon: Ico, color, title, desc }) => (
                            <div key={n} className="flex gap-3">
                                <div className={`w-7 h-7 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Ico className={`w-3.5 h-3.5 text-${color}-600`} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-700">{title}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
