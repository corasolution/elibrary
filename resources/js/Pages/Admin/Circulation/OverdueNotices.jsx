import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import {
    Mail, AlertTriangle, Users, CheckCircle2, XCircle, Loader2,
    ArrowLeft, Send, Clock, DollarSign, UserX
} from 'lucide-react';

export default function OverdueNotices({ stats = {}, loans = [] }) {
    const [sending, setSending] = useState(false);
    const [result, setResult]   = useState(null);

    const sendNotices = async () => {
        setSending(true);
        setResult(null);
        try {
            const res = await axios.post(route('admin.loans.send-overdue-notices'));
            setResult({ success: true, sent: res.data.sent, message: res.data.message });
        } catch (e) {
            setResult({ success: false, message: e.response?.data?.error ?? 'Failed to send notices.' });
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminLayout title="Overdue Notices">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.get(route('admin.loans.overdue'))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Bulk Overdue Notices</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Send email reminders to all patrons with overdue items</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Overdue Loans', value: stats.total_loans ?? 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50', border: 'border-red-100' },
                        { label: 'Patrons Affected', value: stats.unique_patrons ?? 0, icon: Users, color: 'text-orange-600 bg-orange-50', border: 'border-orange-100' },
                        { label: 'Have Email', value: stats.with_email ?? 0, icon: Mail, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
                        { label: 'No Email on File', value: stats.without_email ?? 0, icon: UserX, color: 'text-gray-600 bg-gray-50', border: 'border-gray-200' },
                    ].map(({ label, value, icon: Icon, color, border }) => (
                        <div key={label} className={`bg-white border ${border} rounded-2xl p-4 shadow-sm`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="text-2xl font-black text-gray-900">{value}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Send action */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50 flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                            <Send className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">Send Notices</div>
                            <div className="text-xs text-gray-500">One email per patron (even if they have multiple overdue items)</div>
                        </div>
                    </div>
                    <div className="p-6">
                        {result ? (
                            <div className={`flex items-start gap-3 p-4 rounded-xl border ${result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                {result.success
                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                                <div>
                                    <p className={`text-sm font-semibold ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                                        {result.success ? `${result.sent} notice(s) sent` : 'Error'}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>{result.message}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Ready to send overdue notices to <span className="font-bold text-red-700">{stats.with_email ?? 0} patron(s)</span> with email addresses.
                                    </p>
                                    {(stats.without_email ?? 0) > 0 && (
                                        <p className="text-xs text-amber-600 mt-1">{stats.without_email} patron(s) without email will be skipped.</p>
                                    )}
                                </div>
                                <button
                                    onClick={sendNotices}
                                    disabled={sending || (stats.with_email ?? 0) === 0}
                                    className="ml-4 flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Send {stats.with_email ?? 0} Notice(s)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Overdue loans table */}
                {loans.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="text-sm font-bold text-gray-900">Overdue Loans Preview</div>
                            <span className="text-xs text-gray-400">{loans.length >= 100 ? 'Showing first 100' : `${loans.length} loans`}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patron</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Days Overdue</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fine</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loans.map(loan => (
                                        <tr key={loan.id} className="hover:bg-gray-50/50">
                                            <td className="py-3 px-4">
                                                <div className="text-xs font-semibold text-gray-800">{loan.patron_name}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">#{loan.patron_number}</div>
                                            </td>
                                            <td className="py-3 px-4 max-w-xs">
                                                <div className="text-xs text-gray-700 truncate">{loan.title ?? '—'}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    {loan.due_date}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                    loan.days_overdue >= 14 ? 'bg-red-100 text-red-700' :
                                                    loan.days_overdue >= 7  ? 'bg-orange-100 text-orange-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {loan.days_overdue}d
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {loan.fine_amount > 0 ? (
                                                    <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                                                        <DollarSign className="w-3 h-3" />
                                                        {parseFloat(loan.fine_amount).toFixed(2)}
                                                    </span>
                                                ) : <span className="text-xs text-gray-300">—</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                {loan.patron_email ? (
                                                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                                                        <Mail className="w-3 h-3" /> {loan.patron_email}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                                        <UserX className="w-3 h-3" /> No email
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
            </div>
        </AdminLayout>
    );
}
