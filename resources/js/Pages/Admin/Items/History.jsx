import AdminLayout from '@/Layouts/AdminLayout';
import { router, Link } from '@inertiajs/react';
import {
    ArrowLeft, BookOpen, User, Calendar, Clock, DollarSign,
    RefreshCw, CheckCircle2, AlertTriangle, Barcode, MapPin
} from 'lucide-react';

const STATUS_BADGE = {
    available:   'bg-emerald-100 text-emerald-700',
    checked_out: 'bg-blue-100 text-blue-700',
    in_repair:   'bg-amber-100 text-amber-700',
    lost:        'bg-red-100 text-red-700',
    missing:     'bg-orange-100 text-orange-700',
    withdrawn:   'bg-gray-100 text-gray-500',
    on_hold:     'bg-indigo-100 text-indigo-700',
};

export default function History({ item, loans, stats = {} }) {
    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
    const formatDateTime = (d) => d ? new Date(d).toLocaleString() : '—';

    return (
        <AdminLayout title="Item Checkout History">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.get(route('admin.items.index'))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Item Checkout History</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Full circulation record for this physical item</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: item info + stats */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Item card */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-5">
                                <div className="w-12 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto">
                                    <BookOpen className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-white text-sm font-bold text-center mt-3 leading-tight line-clamp-2">
                                    {item.bibliographic_record?.title ?? 'Untitled'}
                                </h2>
                                <p className="text-slate-300 text-xs text-center mt-1">
                                    {item.bibliographic_record?.isbn ?? ''}
                                </p>
                            </div>
                            <div className="p-4 space-y-3">
                                <InfoRow icon={Barcode} label="Barcode" value={item.barcode ?? '—'} mono />
                                <InfoRow icon={BookOpen} label="Accession No." value={item.accession_number ?? '—'} mono />
                                <InfoRow icon={MapPin} label="Call Number" value={item.call_number ?? '—'} />
                                <InfoRow icon={MapPin} label="Collection" value={item.collection?.name ?? '—'} />
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-xs text-gray-500">Current Status</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[item.item_status] ?? 'bg-gray-100 text-gray-500'}`}>
                                        {item.item_status?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lifetime Stats</div>
                            <StatRow icon={RefreshCw} label="Total Checkouts" value={stats.total_loans ?? 0} color="text-blue-600" />
                            <StatRow icon={AlertTriangle} label="Times Overdue" value={stats.total_overdue ?? 0} color="text-amber-600" />
                            <StatRow icon={DollarSign} label="Total Fines Generated" value={`$${parseFloat(stats.total_fines ?? 0).toFixed(2)}`} color="text-red-600" />
                            {stats.last_seen_at && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-gray-400" /> Last inventory scan
                                    </span>
                                    <span className="text-xs font-medium text-gray-700">{formatDate(stats.last_seen_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: loan history */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="text-sm font-bold text-gray-900">Loan History</div>
                                <span className="text-xs text-gray-400">{loans.total} record(s)</span>
                            </div>

                            {loans.data.length === 0 ? (
                                <div className="py-16 text-center">
                                    <CheckCircle2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm text-gray-400">No checkout history yet.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patron</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Checked Out</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Returned</th>
                                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fine</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {loans.data.map(loan => {
                                                    const returned = !!loan.returned_at;
                                                    const overdue = !returned && new Date(loan.due_date) < new Date();
                                                    const wasLate = returned && new Date(loan.returned_at) > new Date(loan.due_date + 'T23:59:59');
                                                    return (
                                                        <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 px-4">
                                                                {loan.patron ? (
                                                                    <Link href={route('admin.patrons.show', loan.patron.id)} className="group">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                                                                                {loan.patron.first_name?.charAt(0) ?? '?'}
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-xs font-semibold text-gray-800 group-hover:text-blue-700">
                                                                                    {loan.patron.first_name} {loan.patron.last_name}
                                                                                </div>
                                                                                <div className="text-[10px] text-gray-400 font-mono">#{loan.patron.patron_number}</div>
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                ) : <span className="text-xs text-gray-400 italic">Deleted patron</span>}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                                    {formatDate(loan.checked_out_at)}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`flex items-center gap-1.5 text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                                                    <Clock className={`w-3 h-3 ${overdue ? 'text-red-400' : 'text-gray-400'}`} />
                                                                    {formatDate(loan.due_date)}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`text-xs ${wasLate ? 'text-amber-600' : 'text-gray-600'}`}>
                                                                    {returned ? formatDate(loan.returned_at) : <span className="text-blue-600 font-medium">On loan</span>}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                {!returned && overdue ? (
                                                                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
                                                                ) : wasLate ? (
                                                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Returned Late</span>
                                                                ) : returned ? (
                                                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">On Time</span>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Active</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                {loan.fine_amount > 0 ? (
                                                                    <span className={`text-xs font-bold ${loan.fine_paid ? 'text-gray-400 line-through' : 'text-red-600'}`}>
                                                                        ${parseFloat(loan.fine_amount).toFixed(2)}
                                                                    </span>
                                                                ) : <span className="text-xs text-gray-300">—</span>}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {loans.last_page > 1 && (
                                        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-xs text-gray-400">
                                                Page {loans.current_page} of {loans.last_page}
                                            </span>
                                            <div className="flex gap-2">
                                                {loans.prev_page_url && (
                                                    <Link href={loans.prev_page_url}
                                                        className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                                        Previous
                                                    </Link>
                                                )}
                                                {loans.next_page_url && (
                                                    <Link href={loans.next_page_url}
                                                        className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                                        Next
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function InfoRow({ icon: Icon, label, value, mono = false }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <Icon className="w-3 h-3 text-gray-400" /> {label}
            </span>
            <span className={`text-xs font-semibold text-gray-700 ${mono ? 'font-mono' : ''}`}>{value}</span>
        </div>
    );
}

function StatRow({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <Icon className={`w-3 h-3 ${color}`} /> {label}
            </span>
            <span className={`text-sm font-black ${color}`}>{value}</span>
        </div>
    );
}
