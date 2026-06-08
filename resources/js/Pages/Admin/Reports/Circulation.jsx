import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { BookOpen, RefreshCw, Users, DollarSign } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function CirculationReport({ dailyLoans, dailyReturns, topBorrowed, topPatrons, summary, from, to }) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo,   setDateTo]   = useState(to);

    const applyFilter = () => {
        router.get(route('admin.reports.circulation'), { from: dateFrom, to: dateTo }, { preserveState: true });
    };

    // Merge daily loans + returns into one chart dataset
    const chartData = (() => {
        const map = {};
        (dailyLoans ?? []).forEach(r => { map[r.date] = { date: r.date, Loans: r.loans, Returns: 0 }; });
        (dailyReturns ?? []).forEach(r => {
            if (map[r.date]) map[r.date].Returns = r.returns;
            else map[r.date] = { date: r.date, Loans: 0, Returns: r.returns };
        });
        return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    })();

    return (
        <AdminLayout title="Circulation Statistics">
            <div className="space-y-6">
                {/* Date filter */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                    <button onClick={applyFilter}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Apply
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard icon={BookOpen}    color="blue"   label="Total Loans"    value={summary.total_loans} />
                    <SummaryCard icon={RefreshCw}   color="green"  label="Total Returns"  value={summary.total_returns} />
                    <SummaryCard icon={Users}        color="purple" label="Unique Patrons" value={summary.unique_patrons} />
                    <SummaryCard icon={DollarSign}   color="amber"  label="Fines Accrued"  value={`$${Number(summary.total_fines ?? 0).toFixed(2)}`} />
                </div>

                {/* Daily chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Loans & Returns</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Loans"   fill="#3b82f6" radius={[4,4,0,0]} />
                                <Bar dataKey="Returns" fill="#22c55e" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState />}
                </div>

                {/* Top borrowed + top patrons side by side */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 10 Borrowed Titles</h2>
                        {(topBorrowed ?? []).length > 0 ? (
                            <ol className="space-y-2">
                                {topBorrowed.map((r, i) => (
                                    <li key={r.id} className="flex items-center gap-3 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                        <span className="flex-1 truncate text-gray-800">{r.title}</span>
                                        <span className="font-semibold text-gray-900">{r.checkout_count}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : <EmptyState />}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 10 Active Patrons</h2>
                        {(topPatrons ?? []).length > 0 ? (
                            <ol className="space-y-2">
                                {topPatrons.map((p, i) => (
                                    <li key={p.id} className="flex items-center gap-3 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                        <span className="flex-1 truncate text-gray-800">{p.first_name} {p.last_name}</span>
                                        <span className="text-xs text-gray-400">{p.patron_number}</span>
                                        <span className="font-semibold text-gray-900">{p.loan_count}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : <EmptyState />}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function SummaryCard({ icon: Icon, color, label, value }) {
    const cls = {
        blue:   'bg-blue-50 text-blue-600 ring-blue-100',
        green:  'bg-green-50 text-green-600 ring-green-100',
        purple: 'bg-purple-50 text-purple-600 ring-purple-100',
        amber:  'bg-amber-50 text-amber-600 ring-amber-100',
    }[color];
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg ring-1 flex items-center justify-center ${cls}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900">{value ?? 0}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
        </div>
    );
}

function EmptyState() {
    return <div className="text-center py-8 text-sm text-gray-400">No data for this period.</div>;
}
