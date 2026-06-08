import AdminLayout from '@/Layouts/AdminLayout';
import { Link, usePage, useForm } from '@inertiajs/react';
import {
    BookOpen, RefreshCw, AlertCircle, Users,
    TrendingUp, Monitor, BarChart2, Plus, ArrowRight,
    Library, Clock, CalendarDays,
} from 'lucide-react';

export default function Dashboard({ stats, recentLoans = [], overdueLoans = [] }) {
    const { auth } = usePage().props;
    const userName = auth?.user?.name ?? 'there';

    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    // Primary operational metrics (highlighted row)
    const primary = [
        { label: 'Loans Today',   value: stats.loansToday,   icon: BookOpen,    from: 'from-blue-500',    to: 'to-blue-600',    soft: 'bg-blue-50',    text: 'text-blue-600' },
        { label: 'Returns Today', value: stats.returnsToday, icon: RefreshCw,   from: 'from-emerald-500', to: 'to-emerald-600', soft: 'bg-emerald-50', text: 'text-emerald-600' },
        { label: 'Overdue',       value: stats.overdue,      icon: AlertCircle, from: 'from-rose-500',    to: 'to-rose-600',    soft: 'bg-rose-50',    text: 'text-rose-600' },
        { label: 'New Patrons',   value: stats.newPatrons,   icon: Users,       from: 'from-violet-500',  to: 'to-violet-600',  soft: 'bg-violet-50',  text: 'text-violet-600' },
    ];

    // Collection-wide totals (secondary row)
    const secondary = [
        { label: 'Total Titles',  value: stats.totalTitles,  icon: Library,     text: 'text-indigo-600', soft: 'bg-indigo-50' },
        { label: 'Total Patrons', value: stats.totalPatrons, icon: TrendingUp,  text: 'text-teal-600',   soft: 'bg-teal-50' },
        { label: 'Digital Views', value: stats.digitalViews, icon: Monitor,     text: 'text-amber-600',  soft: 'bg-amber-50' },
    ];

    const fmtDate = (d) => {
        if (!d) return '—';
        const date = new Date(d);
        return isNaN(date) ? d : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const nf = (n) => (n ?? 0).toLocaleString();

    return (
        <AdminLayout title="Dashboard">
            <div className="space-y-6">
                {/* ── Welcome header ─────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 py-7 sm:px-8 shadow-lg">
                    <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5" />
                    <div className="absolute right-20 bottom-0 h-28 w-28 rounded-full bg-white/5" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-200/80 text-xs font-medium">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {today}
                            </div>
                            <h1 className="mt-1.5 text-2xl font-bold text-white">
                                Welcome back, <span className="capitalize">{userName}</span> 👋
                            </h1>
                            <p className="mt-1 text-sm text-slate-300">
                                Here’s what’s happening across your library today.
                            </p>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                            <Link
                                href={route('admin.catalog.create')}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                            >
                                <Plus className="h-4 w-4" /> Add Title
                            </Link>
                            <Link
                                href={route('admin.loans.index')}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/20"
                            >
                                Manage Loans
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Primary metrics ────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {primary.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.from} ${card.to}`} />
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-3xl font-bold tracking-tight text-gray-900">{nf(card.value)}</div>
                                        <div className="mt-1 text-sm font-medium text-gray-500">{card.label}</div>
                                    </div>
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.soft} ${card.text} transition-transform group-hover:scale-110`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Secondary totals ───────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {secondary.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
                            >
                                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${card.soft} ${card.text}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold tracking-tight text-gray-900">{nf(card.value)}</div>
                                    <div className="text-sm text-gray-500">{card.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Loans + Overdue ────────────────────────────── */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {/* Recent Active Loans */}
                    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
                        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-800">Recent Active Loans</h2>
                            </div>
                            <Link href={route('admin.loans.index')} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                                View all <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </header>
                        {recentLoans.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                                {recentLoans.map((loan) => (
                                    <li key={loan.id} className="flex items-center gap-3 px-6 py-3.5 transition hover:bg-slate-50">
                                        <Avatar name={loan.patron?.first_name} tone="blue" />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium text-gray-800">
                                                {loan.item?.bibliographic_record?.title ?? '—'}
                                            </div>
                                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                                                <span className="truncate">{loan.patron?.first_name} {loan.patron?.last_name}</span>
                                                <span className="text-gray-300">·</span>
                                                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                                    <Clock className="h-3 w-3" /> Due {fmtDate(loan.due_date)}
                                                </span>
                                            </div>
                                        </div>
                                        <ReturnButton loanId={loan.id} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState icon={BookOpen} text="No active loans right now." />
                        )}
                    </section>

                    {/* Overdue Items */}
                    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
                        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                    <AlertCircle className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-800">Overdue Items</h2>
                            </div>
                            <Link href={route('admin.loans.overdue')} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                                View all <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </header>
                        {overdueLoans.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                                {overdueLoans.map((loan) => {
                                    const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(loan.due_date)) / 86400000));
                                    const severe = daysOverdue >= 7;
                                    return (
                                        <li key={loan.id} className="flex items-center gap-3 px-6 py-3.5 transition hover:bg-rose-50/40">
                                            <Avatar name={loan.patron?.first_name} tone="rose" />
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium text-gray-800">
                                                    {loan.item?.bibliographic_record?.title ?? '—'}
                                                </div>
                                                <div className="mt-0.5 truncate text-xs text-gray-400">
                                                    {loan.patron?.first_name} {loan.patron?.last_name}
                                                </div>
                                            </div>
                                            <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${severe ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                <Clock className="h-3 w-3" /> {daysOverdue}d
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <EmptyState icon={AlertCircle} text="No overdue items. Great job! 🎉" />
                        )}
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}

function Avatar({ name, tone = 'blue' }) {
    const tones = {
        blue: 'bg-gradient-to-br from-blue-500 to-indigo-500',
        rose: 'bg-gradient-to-br from-rose-500 to-pink-500',
    };
    return (
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${tones[tone]}`}>
            {name?.[0]?.toUpperCase() ?? '?'}
        </div>
    );
}

function EmptyState({ icon: Icon, text }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-gray-400">{text}</p>
        </div>
    );
}

function ReturnButton({ loanId }) {
    const { post, processing } = useForm();
    return (
        <button
            onClick={() => post(route('admin.loans.return', loanId))}
            disabled={processing}
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 transition hover:bg-emerald-100 disabled:opacity-50"
        >
            <RefreshCw className={`h-3 w-3 ${processing ? 'animate-spin' : ''}`} /> Return
        </button>
    );
}
