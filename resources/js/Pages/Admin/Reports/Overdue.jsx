import AdminLayout from '@/Layouts/AdminLayout';
import { AlertCircle, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function OverdueReport({ loans, byDays, totalFines }) {
    const loanList = loans?.data ?? [];

    return (
        <AdminLayout title="Overdue Report">
            <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                        <div className="w-9 h-9 rounded-lg ring-1 bg-red-50 text-red-600 ring-red-100 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{loans?.total ?? 0}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Overdue Items</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                        <div className="w-9 h-9 rounded-lg ring-1 bg-amber-50 text-amber-600 ring-amber-100 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">${Number(totalFines ?? 0).toFixed(2)}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Total Fines Outstanding</div>
                        </div>
                    </div>
                    {/* Overdue by range */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="text-xs font-semibold text-gray-600 mb-3">By Days Overdue</div>
                        {(byDays ?? []).length > 0 ? (
                            <div className="space-y-2">
                                {byDays.map(r => (
                                    <div key={r.range} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{r.range}</span>
                                        <span className="font-semibold text-gray-900">{r.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="text-xs text-gray-400">No overdue items.</div>}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700">Overdue Loans</h2>
                    </div>
                    {loanList.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Patron</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Title</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Due Date</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Days Overdue</th>
                                            <th className="text-right py-2 px-4 font-medium text-gray-600">Fine</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loanList.map(loan => {
                                            const daysOverdue = Math.floor((new Date() - new Date(loan.due_date)) / 86400000);
                                            return (
                                                <tr key={loan.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2 px-4">
                                                        <div className="font-medium text-gray-900">
                                                            {loan.patron?.first_name} {loan.patron?.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-400">{loan.patron?.patron_number}</div>
                                                    </td>
                                                    <td className="py-2 px-4 max-w-xs">
                                                        <div className="truncate text-gray-800">{loan.item?.bibliographic_record?.title ?? '—'}</div>
                                                        <div className="text-xs text-gray-400">{loan.item?.call_number}</div>
                                                    </td>
                                                    <td className="py-2 px-4 text-red-600 font-medium">{loan.due_date}</td>
                                                    <td className="py-2 px-4">
                                                        <span className={`badge ${daysOverdue > 30 ? 'badge-red' : daysOverdue > 7 ? 'badge-amber' : 'badge-orange'}`}>
                                                            {daysOverdue}d
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 text-right font-medium">
                                                        ${Number(loan.fine_amount ?? 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {loans?.last_page > 1 && (
                                <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 justify-end text-sm">
                                    {loans.links?.map((link, i) => (
                                        link.url ? (
                                            <Link key={i} href={link.url}
                                                className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span key={i} className="px-3 py-1 text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-sm text-gray-400">No overdue items.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
