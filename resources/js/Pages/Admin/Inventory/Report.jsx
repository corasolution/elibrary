import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import {
    FileText, CheckCircle2, XCircle, AlertTriangle, BookOpen, MapPin,
    Clock, BarChart3, ArrowLeft, Download, Calendar
} from 'lucide-react';

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function InventoryReport({ session, scansByStatus = {}, missingItems, wrongLocation = [] }) {
    const found     = scansByStatus.found          ?? 0;
    const onLoan    = scansByStatus.checked_out    ?? 0;
    const wrong     = scansByStatus.wrong_location ?? 0;
    const unknown   = scansByStatus.not_found      ?? 0;
    const missing   = session.missing_count        ?? 0;
    const total     = session.scanned_count        ?? 0;
    const expected  = session.expected_count       ?? 0;
    const pct       = expected > 0 ? Math.min(100, Math.round(total / expected * 100)) : 0;

    const duration = session.closed_at && session.started_at
        ? Math.round((new Date(session.closed_at) - new Date(session.started_at)) / 60000)
        : null;

    return (
        <AdminLayout title="Inventory Report">
            <div className="space-y-6">

                {/* Header */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-6 py-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                                    <FileText className="w-3.5 h-3.5" /> Inventory Report
                                </div>
                                <h1 className="text-white font-bold text-xl">{session.name}</h1>
                                <div className="flex items-center gap-4 mt-2 text-slate-300 text-xs flex-wrap">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Started {fmtDate(session.started_at)}</span>
                                    {session.closed_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Closed {fmtDate(session.closed_at)}</span>}
                                    {duration !== null && <span>{duration} min duration</span>}
                                    {session.collection?.name && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{session.collection.name}</span>}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-4xl font-black text-white">{pct}%</div>
                                <div className="text-slate-400 text-xs mt-0.5">coverage</div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-5 h-2.5 bg-slate-600 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                            <span>{total} scanned</span>
                            <span>{expected} expected</span>
                        </div>
                    </div>

                    {/* 4 stat tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
                        <ReportStat icon={CheckCircle2} label="Found on Shelf" value={found}   color="emerald" />
                        <ReportStat icon={BookOpen}     label="On Loan"        value={onLoan}  color="blue" />
                        <ReportStat icon={MapPin}       label="Wrong Location" value={wrong}   color="amber" />
                        <ReportStat icon={XCircle}      label="Not in DB"      value={unknown} color="red" />
                    </div>
                </div>

                {/* Missing items */}
                {missing > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100 bg-red-50/50">
                            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-red-800">Missing Items <span className="font-normal text-red-600">({missing})</span></h2>
                                <p className="text-xs text-red-500">These items were not scanned and have been flagged as missing</p>
                            </div>
                        </div>
                        {missingItems?.data?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/70 border-b border-gray-100">
                                            <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Barcode Scanned</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {missingItems.data.map(s => (
                                            <tr key={s.id} className="hover:bg-red-50/30">
                                                <td className="py-3 px-5 font-mono text-sm text-gray-700">{s.barcode_scanned}</td>
                                                <td className="py-3 px-4 text-xs text-gray-400">{s.notes ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-xs text-gray-400">No unscanned barcodes recorded.</div>
                        )}
                    </div>
                )}

                {/* Wrong location */}
                {wrongLocation.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-amber-100 bg-amber-50/50">
                            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-amber-800">Wrong Location <span className="font-normal text-amber-600">({wrongLocation.length})</span></h2>
                                <p className="text-xs text-amber-500">These items were found but belong in a different collection or location</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/70 border-b border-gray-100">
                                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Call No.</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actual Collection</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Scanned At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {wrongLocation.map(s => (
                                        <tr key={s.id} className="hover:bg-amber-50/30">
                                            <td className="py-3 px-5">
                                                <div className="font-mono text-xs text-gray-700">{s.barcode_scanned}</div>
                                                {s.item?.bibliographic_record?.title && (
                                                    <div className="text-xs text-gray-400 truncate max-w-xs">{s.item.bibliographic_record.title}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-xs font-mono text-gray-600">{s.item?.call_number ?? '—'}</td>
                                            <td className="py-3 px-4 text-xs text-amber-700 font-medium">{s.item?.collection?.name ?? '—'}</td>
                                            <td className="py-3 px-4 text-xs text-gray-400">{fmtDate(s.scanned_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" /> Summary
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <SummaryRow label="Total items expected"  value={expected} />
                        <SummaryRow label="Items scanned"         value={total} />
                        <SummaryRow label="Coverage"              value={`${pct}%`} />
                        <SummaryRow label="Found on shelf"        value={found} />
                        <SummaryRow label="Currently on loan"     value={onLoan} />
                        <SummaryRow label="Wrong location"        value={wrong} color={wrong > 0 ? 'text-amber-700' : ''} />
                        <SummaryRow label="Unknown barcodes"      value={unknown} color={unknown > 0 ? 'text-red-600' : ''} />
                        <SummaryRow label="Missing (not found)"   value={missing} color={missing > 0 ? 'text-red-600 font-bold' : ''} />
                        <SummaryRow label="Duration"              value={duration !== null ? `${duration} min` : '—'} />
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex items-center gap-3 pb-4">
                    <Link href={route('admin.inventory.index')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                        <ArrowLeft className="w-4 h-4" /> All Sessions
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}

const RCOLOR = {
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', num: 'text-emerald-700' },
    blue:    { bg: 'bg-blue-100',    icon: 'text-blue-600',    num: 'text-blue-700' },
    amber:   { bg: 'bg-amber-100',   icon: 'text-amber-600',   num: 'text-amber-700' },
    red:     { bg: 'bg-red-100',     icon: 'text-red-600',     num: 'text-red-700' },
};

function ReportStat({ icon: Icon, label, value, color }) {
    const c = RCOLOR[color] ?? RCOLOR.blue;
    return (
        <div className="px-6 py-5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                <Icon className={`w-4 h-4 ${c.icon}`} />
            </div>
            <div>
                <div className={`text-2xl font-black ${c.num}`}>{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, color = '' }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-xs text-gray-500">{label}</span>
            <span className={`text-sm font-semibold text-gray-800 ${color}`}>{value}</span>
        </div>
    );
}
