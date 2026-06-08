import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';
import {
    BookOpen, RefreshCw, AlertCircle, Users,
    TrendingUp, Monitor, BarChart2,
} from 'lucide-react';

export default function Dashboard({ stats, recentLoans = [], overdueLoans = [] }) {
    const cards = [
        { label: 'Loans Today',   value: stats.loansToday,   icon: BookOpen,    color: 'blue' },
        { label: 'Returns Today', value: stats.returnsToday, icon: RefreshCw,   color: 'green' },
        { label: 'Overdue',       value: stats.overdue,      icon: AlertCircle, color: 'red' },
        { label: 'New Patrons',   value: stats.newPatrons,   icon: Users,       color: 'purple' },
        { label: 'Total Titles',  value: stats.totalTitles,  icon: BarChart2,   color: 'indigo' },
        { label: 'Total Patrons', value: stats.totalPatrons, icon: TrendingUp,  color: 'teal' },
        { label: 'Digital Views', value: stats.digitalViews, icon: Monitor,     color: 'orange' },
    ];

    const colorMap = {
        blue:   'bg-blue-50 text-blue-600 ring-blue-100',
        green:  'bg-green-50 text-green-600 ring-green-100',
        red:    'bg-red-50 text-red-600 ring-red-100',
        purple: 'bg-purple-50 text-purple-600 ring-purple-100',
        indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
        teal:   'bg-teal-50 text-teal-600 ring-teal-100',
        orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    };

    return (
        <AdminLayout title="Dashboard">
            <div className="space-y-6">
                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {cards.map(card => {
                        const Icon = card.icon;
                        const cls = colorMap[card.color];
                        return (
                            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
                                <div className={`w-9 h-9 rounded-lg ring-1 flex items-center justify-center ${cls}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{card.value ?? 0}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent loans + Overdue */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Loans */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700">Recent Active Loans</h2>
                            <Link href={route('admin.loans.index')} className="text-xs text-blue-600 hover:underline">View all</Link>
                        </div>
                        {recentLoans.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {recentLoans.map(loan => (
                                    <li key={loan.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50">
                                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                            {loan.patron?.first_name?.[0] ?? '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-800 truncate">
                                                {loan.item?.bibliographic_record?.title ?? '—'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {loan.patron?.first_name} {loan.patron?.last_name} · Due {loan.due_date}
                                            </div>
                                        </div>
                                        <ReturnButton loanId={loan.id} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-sm text-gray-400">No active loans.</div>
                        )}
                    </div>

                    {/* Overdue Items */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-red-400" /> Overdue Items
                            </h2>
                            <Link href={route('admin.loans.overdue')} className="text-xs text-blue-600 hover:underline">View all</Link>
                        </div>
                        {overdueLoans.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {overdueLoans.map(loan => {
                                    const daysOverdue = Math.floor((Date.now() - new Date(loan.due_date)) / 86400000);
                                    return (
                                        <li key={loan.id} className="px-5 py-3 flex items-center gap-3 hover:bg-red-50/40">
                                            <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                                {loan.patron?.first_name?.[0] ?? '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-800 truncate">
                                                    {loan.item?.bibliographic_record?.title ?? '—'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {loan.patron?.first_name} {loan.patron?.last_name}
                                                </div>
                                            </div>
                                            <span className="badge badge-red text-xs flex-shrink-0">{daysOverdue}d</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-sm text-gray-400">No overdue items.</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function ReturnButton({ loanId }) {
    const { post, processing } = useForm();
    return (
        <button
            onClick={() => post(route('admin.loans.return', loanId))}
            disabled={processing}
            className="flex-shrink-0 px-2.5 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 font-medium"
        >
            Return
        </button>
    );
}
