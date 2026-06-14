import { Head, Link } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import {
    Building2,
    Cpu,
    HardDrive,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

const fmtNumber = (n) => Number(n ?? 0).toLocaleString();

const fmtBytes = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const STATUS_META = {
    active:    { icon: CheckCircle, cls: 'text-green-600',  label: 'Active' },
    pending:   { icon: Clock,       cls: 'text-yellow-600', label: 'Pending' },
    suspended: { icon: AlertCircle, cls: 'text-orange-600', label: 'Suspended' },
    cancelled: { icon: XCircle,     cls: 'text-red-600',    label: 'Cancelled' },
};

function StatCard({ icon: Icon, iconBg, label, value, sub }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
            </div>
        </div>
    );
}

export default function CentralDashboard({ libraries, monthlyRevenue, ai, storage, pendingRequests = 0 }) {
    const maxTenantBytes = Math.max(1, ...(storage?.per_tenant ?? []).map(t => t.bytes));

    return (
        <CentralLayout>
            <Head title="Platform Overview" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
                    <p className="text-gray-500">What's happening across all libraries</p>
                </div>

                {/* Pending registration requests */}
                {pendingRequests > 0 && (
                    <Link
                        href={route('central.registration-requests.index')}
                        className="flex items-center justify-between gap-3 mb-6 px-5 py-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                                {pendingRequests} library registration {pendingRequests === 1 ? 'request' : 'requests'} awaiting review
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-blue-700">Review →</span>
                    </Link>
                )}

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={Building2}
                        iconBg="bg-gradient-to-br from-blue-500 to-indigo-500"
                        label="Total Libraries"
                        value={fmtNumber(libraries?.total)}
                        sub={`${fmtNumber(libraries?.by_status?.active)} active`}
                    />
                    <StatCard
                        icon={Cpu}
                        iconBg="bg-gradient-to-br from-purple-500 to-fuchsia-500"
                        label="AI Calls This Month"
                        value={fmtNumber(ai?.month?.calls)}
                        sub={`${fmtNumber(ai?.month?.tokens)} tokens · $${Number(ai?.month?.billed ?? 0).toFixed(2)} billed`}
                    />
                    <StatCard
                        icon={HardDrive}
                        iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
                        label="Storage Used"
                        value={fmtBytes(storage?.bytes)}
                        sub={`${fmtNumber(storage?.files)} digital files`}
                    />
                    <StatCard
                        icon={DollarSign}
                        iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
                        label="Monthly Revenue (est.)"
                        value={`$${Number(monthlyRevenue ?? 0).toFixed(2)}`}
                        sub="from active subscriptions"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent libraries */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900">Recent Libraries</h2>
                            <Link
                                href={route('central.tenants.index')}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                View all
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        {(libraries?.recent ?? []).length === 0 ? (
                            <p className="px-6 py-8 text-sm text-gray-400 text-center">No libraries yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {libraries.recent.map(lib => {
                                    const meta = STATUS_META[lib.status] ?? STATUS_META.pending;
                                    const StatusIcon = meta.icon;
                                    return (
                                        <li key={lib.id}>
                                            <Link
                                                href={route('central.tenants.show', lib.id)}
                                                className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50"
                                            >
                                                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                                                    {lib.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{lib.name}</p>
                                                    <p className="text-xs text-gray-500">/{lib.slug} · {lib.plan?.name ?? 'No plan'}</p>
                                                </div>
                                                <span className={`flex items-center gap-1 text-xs ${meta.cls}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {meta.label}
                                                </span>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(lib.created_at).toLocaleDateString()}
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* AI by provider */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-gray-900">AI Usage by Provider</h2>
                        </div>
                        {(ai?.by_provider ?? []).length === 0 ? (
                            <p className="px-6 py-8 text-sm text-gray-400 text-center">No AI usage this month.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {ai.by_provider.map(p => (
                                    <li key={p.provider} className="px-6 py-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-900 capitalize">{p.provider}</span>
                                            <span className="text-xs text-gray-500">${Number(p.billed ?? 0).toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {fmtNumber(p.calls)} calls · {fmtNumber(p.tokens)} tokens
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Storage per tenant */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <h2 className="text-sm font-semibold text-gray-900">Top Libraries by Storage</h2>
                    </div>
                    {(storage?.per_tenant ?? []).length === 0 ? (
                        <p className="px-6 py-8 text-sm text-gray-400 text-center">No storage used yet.</p>
                    ) : (
                        <div className="px-6 py-4 space-y-3">
                            {storage.per_tenant.map(t => (
                                <div key={t.id}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <Link
                                            href={route('central.tenants.show', t.id)}
                                            className="text-gray-700 hover:text-blue-600"
                                        >
                                            {t.name}
                                        </Link>
                                        <span className="text-gray-500 tabular-nums">
                                            {fmtBytes(t.bytes)} · {fmtNumber(t.files)} files
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                            style={{ width: `${(t.bytes / maxTenantBytes) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CentralLayout>
    );
}
