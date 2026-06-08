import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import {
    ChevronRight, Edit2, Trash2, User, Mail, Phone, MapPin,
    Calendar, CreditCard, BookOpen, Clock, AlertCircle, Hash,
} from 'lucide-react';

const STATUS_COLORS = {
    active:    'bg-green-100 text-green-700',
    expired:   'bg-yellow-100 text-yellow-700',
    suspended: 'bg-orange-100 text-orange-700',
    blocked:   'bg-red-100 text-red-700',
};

const LOAN_STATUS_COLORS = {
    active:   'bg-blue-100 text-blue-700',
    overdue:  'bg-red-100 text-red-700',
    returned: 'bg-gray-100 text-gray-600',
};

export default function PatronShow({ patron }) {
    const deletePatron = () => {
        if (!confirm(`Delete patron "${patron.first_name} ${patron.last_name}"? This cannot be undone.`)) return;
        router.delete(route('admin.patrons.destroy', patron.id));
    };

    const isOverdue = (loan) => !loan.returned_at && new Date(loan.due_date) < new Date();

    const activeLoans = patron.active_loans_count ?? patron.active_loans?.length ?? 0;
    const totalLoans  = patron.loans_count ?? 0;

    return (
        <AdminLayout title={`${patron.first_name} ${patron.last_name}`}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <Link href={route('admin.patrons.index')} className="hover:text-gray-700">Patrons</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium">{patron.first_name} {patron.last_name}</span>
            </nav>

            <div className="grid lg:grid-cols-3 gap-5">
                {/* ── Left / Main ──────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Header card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold flex-shrink-0">
                                    {patron.first_name?.[0]?.toUpperCase()}{patron.last_name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {patron.first_name} {patron.last_name}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {patron.patron_number}
                                        </span>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[patron.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {patron.status}
                                        </span>
                                        {patron.category && (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                                {patron.category.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <Link href={route('admin.patrons.edit', patron.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                </Link>
                                <button onClick={deletePatron}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
                            <Stat label="Active Loans" value={activeLoans} highlight={activeLoans > 0} />
                            <Stat label="Total Loans"  value={totalLoans} />
                            <Stat label="Membership"
                                value={patron.membership_expiry
                                    ? new Date(patron.membership_expiry).toLocaleDateString()
                                    : 'No expiry'}
                                small
                            />
                        </div>
                    </div>

                    {/* Active Loans */}
                    {patron.active_loans?.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">
                                    Active Loans ({patron.active_loans.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {patron.active_loans.map(loan => {
                                    const overdue = isOverdue(loan);
                                    return (
                                        <div key={loan.id} className="px-5 py-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-800 truncate">
                                                        {loan.item?.bibliographic_record?.title ?? loan.item?.biblio?.title ?? loan.item?.barcode ?? '—'}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-mono">
                                                        {loan.item?.barcode}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0 text-right">
                                                <div>
                                                    <div className="text-xs text-gray-400">Due</div>
                                                    <div className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                                                        {new Date(loan.due_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                {overdue && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                        <AlertCircle className="w-3 h-3" /> Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Loan history */}
                    {patron.loans?.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Recent Loan History</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left px-4 py-2.5 font-medium text-gray-600">Item</th>
                                            <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Checked Out</th>
                                            <th className="text-left px-4 py-2.5 font-medium text-gray-600">Due</th>
                                            <th className="text-left px-4 py-2.5 font-medium text-gray-600">Returned</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {patron.loans.map(loan => (
                                            <tr key={loan.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2.5 font-mono text-xs text-gray-600">
                                                    {loan.item?.barcode ?? loan.item_id?.slice(0, 8) ?? '—'}
                                                </td>
                                                <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">
                                                    {new Date(loan.checked_out_at).toLocaleDateString()}
                                                </td>
                                                <td className={`px-4 py-2.5 ${!loan.returned_at && isOverdue(loan) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                    {new Date(loan.due_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {loan.returned_at ? (
                                                        <span className="text-green-600 text-xs">
                                                            {new Date(loan.returned_at).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isOverdue(loan) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {isOverdue(loan) ? 'Overdue' : 'Active'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* No loans at all */}
                    {!patron.active_loans?.length && !patron.loans?.length && (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No loan history yet.</p>
                        </div>
                    )}
                </div>

                {/* ── Right Sidebar ─────────────────────────────────────────── */}
                <div className="space-y-5">
                    {/* Contact */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Contact Details
                        </h2>
                        <dl className="space-y-3 text-sm">
                            {patron.email && (
                                <div className="flex items-start gap-2">
                                    <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 break-all">{patron.email}</span>
                                </div>
                            )}
                            {patron.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-700">{patron.phone}</span>
                                </div>
                            )}
                            {(patron.address || patron.city) && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">
                                        {[patron.address, patron.city].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}
                            {patron.date_of_birth && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-700">
                                        {new Date(patron.date_of_birth).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {patron.gender && (
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-700 capitalize">{patron.gender}</span>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Membership */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Membership
                        </h2>
                        <dl className="space-y-2.5 text-sm">
                            <DetailRow label="Card No."  value={patron.patron_number} mono />
                            <DetailRow label="Category"  value={patron.category?.name} />
                            <DetailRow label="Status"    value={patron.status} />
                            <DetailRow label="Expiry"
                                value={patron.membership_expiry
                                    ? new Date(patron.membership_expiry).toLocaleDateString()
                                    : null}
                            />
                        </dl>
                    </div>

                    {/* Notes */}
                    {patron.notes && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Hash className="w-4 h-4" /> Notes
                            </h2>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{patron.notes}</p>
                        </div>
                    )}

                    {/* Record info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Record Info</h2>
                        <dl className="space-y-2 text-sm">
                            <DetailRow label="ID"      value={patron.id?.slice(0, 8) + '…'} mono />
                            <DetailRow label="Created" value={patron.created_at ? new Date(patron.created_at).toLocaleDateString() : null} />
                            <DetailRow label="Updated" value={patron.updated_at ? new Date(patron.updated_at).toLocaleDateString() : null} />
                        </dl>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function Stat({ label, value, highlight = false, small = false }) {
    return (
        <div className="text-center">
            <div className={`font-bold ${small ? 'text-base' : 'text-2xl'} ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
                {value}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
        </div>
    );
}

function DetailRow({ label, value, mono = false }) {
    if (!value) return null;
    return (
        <div className="flex gap-2">
            <dt className="text-gray-400 w-20 flex-shrink-0">{label}</dt>
            <dd className={`text-gray-800 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
        </div>
    );
}
