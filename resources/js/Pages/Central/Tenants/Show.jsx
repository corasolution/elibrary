import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import CentralLayout from '@/Layouts/CentralLayout';
import {
    ArrowLeft,
    Building2,
    Edit,
    ExternalLink,
    Users,
    BookOpen,
    HardDrive,
    Cpu,
    UserCheck,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Crown,
    KeyRound,
    Copy,
    Loader2,
} from 'lucide-react';

const fmtNumber = (n) => Number(n ?? 0).toLocaleString();

const fmtBytes = (bytes) => {
    if (bytes === null || bytes === undefined) return '—';
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const fmtMonth = (ym) => {
    const [y, m] = ym.split('-');
    return new Date(y, m - 1).toLocaleString('en', { month: 'short', year: 'numeric' });
};

const STATUS_BADGES = {
    active:    { icon: CheckCircle, cls: 'bg-green-100 text-green-700',  label: 'Active' },
    pending:   { icon: Clock,       cls: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    suspended: { icon: AlertCircle, cls: 'bg-orange-100 text-orange-700', label: 'Suspended' },
    cancelled: { icon: XCircle,     cls: 'bg-red-100 text-red-700',     label: 'Cancelled' },
};

function StatusBadge({ status }) {
    const s = STATUS_BADGES[status] ?? STATUS_BADGES.pending;
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>
            <Icon className="w-3.5 h-3.5" />
            {s.label}
        </span>
    );
}

function AdminRow({ admin, tenantId }) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);   // { email, password }
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const submit = async () => {
        setBusy(true);
        setError('');
        try {
            const res = await fetch(route('central.tenants.admins.reset-password', [tenantId, admin.id]), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({ password: password || null }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                setError(data.error || 'Reset failed.');
                return;
            }
            setResult(data);
            setOpen(false);
            setPassword('');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const copy = () => {
        navigator.clipboard?.writeText(result.password).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <li className="px-6 py-3">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium">
                    {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{admin.name}</p>
                    <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                    since {new Date(admin.created_at).toLocaleDateString()}
                </span>
                <button
                    type="button"
                    onClick={() => { setOpen(o => !o); setResult(null); setError(''); }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                    <KeyRound className="w-3.5 h-3.5" /> Reset Password
                </button>
            </div>

            {/* Reset form */}
            {open && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">New password</label>
                    <div className="flex flex-wrap gap-2">
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to auto-generate"
                            className="flex-1 min-w-[180px] text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="button" onClick={submit} disabled={busy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                            Reset
                        </button>
                        <button type="button" onClick={() => { setOpen(false); setPassword(''); setError(''); }}
                            className="px-3 py-1.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">
                            Cancel
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Minimum 8 characters. The password is shown once after reset.</p>
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
            )}

            {/* One-time result */}
            {result && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-800 mb-1.5">Password reset — copy and share securely (shown once):</p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{result.email}</span>
                        <code className="px-2 py-1 bg-white border border-green-200 rounded font-mono text-gray-900">{result.password}</code>
                        <button type="button" onClick={copy}
                            className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-900">
                            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
}

function StatCard({ icon: Icon, label, value, sub }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
            </div>
        </div>
    );
}

export default function TenantShow({ tenant, admins, catalog, totals, storageBytes, aiUsage, tenantError }) {
    const maxCatalog = Math.max(1, ...(catalog ?? []).map(c => Number(c.total)));

    return (
        <CentralLayout>
            <Head title={`${tenant.name} — Library Detail`} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back */}
                <Link
                    href={route('central.tenants.index')}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Tenants
                </Link>

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-semibold">
                                {tenant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                                    <StatusBadge status={tenant.status} />
                                    {tenant.plan && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            <Crown className="w-3.5 h-3.5" />
                                            {tenant.plan.name}
                                        </span>
                                    )}
                                </div>
                                <a
                                    href={`/${tenant.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mt-1"
                                >
                                    {window.location.host}/{tenant.slug}
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('central.tenants.edit', tenant.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tenant DB error banner */}
                {tenantError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-700">Could not read tenant database</p>
                            <p className="text-xs text-red-500 mt-0.5">{tenantError}</p>
                        </div>
                    </div>
                )}

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard icon={BookOpen}  label="Catalog Records" value={fmtNumber(totals?.records)} />
                    <StatCard icon={Users}     label="Patrons"         value={fmtNumber(totals?.patrons)} />
                    <StatCard icon={UserCheck} label="Staff Users"     value={fmtNumber(totals?.staff)} />
                    <StatCard icon={HardDrive} label="Storage Used"    value={fmtBytes(storageBytes)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Admins */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-gray-900">Library Admins</h2>
                        </div>
                        {(admins ?? []).length === 0 ? (
                            <p className="px-6 py-8 text-sm text-gray-400 text-center">No admin users found.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {admins.map(admin => (
                                    <AdminRow key={admin.id} admin={admin} tenantId={tenant.id} />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Catalog by type */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-gray-900">Catalog by Material Type</h2>
                        </div>
                        {(catalog ?? []).length === 0 ? (
                            <p className="px-6 py-8 text-sm text-gray-400 text-center">No catalog records yet.</p>
                        ) : (
                            <div className="px-6 py-4 space-y-3">
                                {catalog.map(item => (
                                    <div key={item.type}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-700">{item.type}</span>
                                            <span className="text-gray-500 font-medium tabular-nums">{fmtNumber(item.total)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                                style={{ width: `${(Number(item.total) / maxCatalog) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* AI usage */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-gray-400" />
                        <h2 className="text-sm font-semibold text-gray-900">AI Token Usage (last 6 months)</h2>
                    </div>
                    {(aiUsage ?? []).length === 0 ? (
                        <p className="px-6 py-8 text-sm text-gray-400 text-center">No AI usage recorded for this library.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-6 py-3 font-medium">Month</th>
                                        <th className="px-6 py-3 font-medium text-right">API Calls</th>
                                        <th className="px-6 py-3 font-medium text-right">Input Tokens</th>
                                        <th className="px-6 py-3 font-medium text-right">Output Tokens</th>
                                        <th className="px-6 py-3 font-medium text-right">Billed (USD)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {aiUsage.map(row => (
                                        <tr key={row.month} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium text-gray-900">{fmtMonth(row.month)}</td>
                                            <td className="px-6 py-3 text-right tabular-nums text-gray-600">{fmtNumber(row.calls)}</td>
                                            <td className="px-6 py-3 text-right tabular-nums text-gray-600">{fmtNumber(row.input_tokens)}</td>
                                            <td className="px-6 py-3 text-right tabular-nums text-gray-600">{fmtNumber(row.output_tokens)}</td>
                                            <td className="px-6 py-3 text-right tabular-nums text-gray-900 font-medium">
                                                ${Number(row.billed_usd ?? 0).toFixed(4)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </CentralLayout>
    );
}
