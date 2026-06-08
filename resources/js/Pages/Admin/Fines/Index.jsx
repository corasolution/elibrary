import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { DollarSign, Search, CheckCircle, XCircle } from 'lucide-react';

export default function FinesIndex({ loans, filters = {}, summary }) {
    const list = loans?.data ?? [];
    const [q, setQ] = useState(filters.q ?? '');
    const [paid, setPaid] = useState(filters.paid ?? '');

    const search = (e) => {
        e.preventDefault();
        router.get(route('admin.fines.index'), { q, paid }, { preserveState: true });
    };

    return (
        <AdminLayout title="Fines & Payments">
            <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard color="red"   label="Outstanding"  value={`$${Number(summary.total_outstanding ?? 0).toFixed(2)}`} sub={`${summary.count_outstanding} loans`} />
                    <SummaryCard color="green" label="Collected"    value={`$${Number(summary.total_collected ?? 0).toFixed(2)}`} />
                    <SummaryCard color="gray"  label="Waived"       value={`$${Number(summary.total_waived ?? 0).toFixed(2)}`} />
                    <SummaryCard color="blue"  label="Total Fines"  value={`$${(Number(summary.total_outstanding ?? 0) + Number(summary.total_collected ?? 0) + Number(summary.total_waived ?? 0)).toFixed(2)}`} />
                </div>

                {/* Filters */}
                <form onSubmit={search} className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search patron…"
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <select value={paid} onChange={e => setPaid(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Fines</option>
                        <option value="0">Unpaid</option>
                        <option value="1">Paid</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Filter</button>
                </form>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-500" />
                        <h2 className="text-sm font-semibold text-gray-700">Loans with Fines</h2>
                        <span className="ml-auto text-xs text-gray-400">{loans?.total ?? 0} total</span>
                    </div>

                    {list.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Patron</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Title</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Due Date</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Returned</th>
                                            <th className="text-right py-2 px-4 font-medium text-gray-600">Fine</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Status</th>
                                            <th className="py-2 px-4" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.map(loan => (
                                            <tr key={loan.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                <td className="py-2 px-4">
                                                    <Link href={route('admin.patrons.show', loan.patron?.id)} className="font-medium text-blue-600 hover:underline">
                                                        {loan.patron?.first_name} {loan.patron?.last_name}
                                                    </Link>
                                                    <div className="text-xs text-gray-400">{loan.patron?.patron_number}</div>
                                                </td>
                                                <td className="py-2 px-4 max-w-xs">
                                                    <div className="truncate text-gray-800">{loan.item?.bibliographic_record?.title ?? '—'}</div>
                                                </td>
                                                <td className="py-2 px-4 text-gray-600">{loan.due_date}</td>
                                                <td className="py-2 px-4 text-gray-600">{loan.returned_at ? loan.returned_at.substring(0,10) : <span className="text-red-500">Not returned</span>}</td>
                                                <td className="py-2 px-4 text-right font-semibold text-red-600">
                                                    ${Number(loan.fine_amount).toFixed(2)}
                                                </td>
                                                <td className="py-2 px-4">
                                                    {loan.fine_waived ? (
                                                        <span className="badge badge-gray">Waived</span>
                                                    ) : loan.fine_paid ? (
                                                        <span className="badge badge-green flex items-center gap-1 w-fit">
                                                            <CheckCircle className="w-3 h-3" /> Paid
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-red">Unpaid</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-4">
                                                    {!loan.fine_paid && !loan.fine_waived && (
                                                        <div className="flex gap-2 justify-end">
                                                            <MarkPaidButton loanId={loan.id} />
                                                            <WaiveButton loanId={loan.id} />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={loans?.links} />
                        </>
                    ) : (
                        <div className="text-center py-16 text-sm text-gray-400">
                            <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            No fines found.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function MarkPaidButton({ loanId }) {
    const { post, processing } = useForm();
    return (
        <button onClick={() => post(route('admin.fines.paid', loanId))} disabled={processing}
            className="px-2.5 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Paid
        </button>
    );
}

function WaiveButton({ loanId }) {
    const { post, processing } = useForm();
    return (
        <button onClick={() => { if (confirm('Waive this fine?')) post(route('admin.fines.waive', loanId)); }}
            disabled={processing}
            className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Waive
        </button>
    );
}

function SummaryCard({ color, label, value, sub }) {
    const cls = { red: 'text-red-600', green: 'text-green-600', gray: 'text-gray-500', blue: 'text-blue-600' }[color];
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`text-xl font-bold ${cls}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
    );
}

function Pagination({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="px-5 py-3 border-t border-gray-100 flex gap-1 justify-end text-sm">
            {links.map((link, i) => (
                link.url
                    ? <Link key={i} href={link.url} className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                    : <span key={i} className="px-3 py-1 text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
            ))}
        </div>
    );
}
