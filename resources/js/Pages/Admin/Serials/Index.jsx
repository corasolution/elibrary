import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Newspaper, Plus, Search, Pencil, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const STATUS_COLORS = { active: 'badge-green', expiring_soon: 'badge-amber', expired: 'badge-red' };

export default function SerialsIndex({ serials, filters = {} }) {
    const list = serials?.data ?? [];
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');

    const search = (e) => {
        e.preventDefault();
        router.get(route('admin.serials.index'), { q, status }, { preserveState: true });
    };

    return (
        <AdminLayout title="Serials & Subscriptions">
            <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <form onSubmit={search} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search title or ISSN…"
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="expiring">Expiring Soon</option>
                            <option value="expired">Expired</option>
                        </select>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Filter</button>
                    </form>
                    <Link href={route('admin.serials.create')} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4" /> New Subscription
                    </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-blue-500" />
                        <h2 className="text-sm font-semibold text-gray-700">Subscriptions</h2>
                        <span className="ml-auto text-xs text-gray-400">{serials?.total ?? 0} total</span>
                    </div>

                    {list.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Title</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Frequency</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Expiry</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Status</th>
                                            <th className="text-center py-2 px-4 font-medium text-gray-600">Issues</th>
                                            <th className="py-2 px-4" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.map(s => {
                                            const statusKey = s.subscription_expiry
                                                ? (new Date(s.subscription_expiry) < new Date() ? 'expired'
                                                    : (new Date(s.subscription_expiry) - new Date() < 30 * 86400000 ? 'expiring_soon' : 'active'))
                                                : 'active';
                                            return (
                                                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2 px-4">
                                                        <Link href={route('admin.serials.show', s.id)} className="font-medium text-blue-600 hover:underline">
                                                            {s.bibliographic_record?.title ?? 'Untitled'}
                                                        </Link>
                                                        {s.bibliographic_record?.issn && <div className="text-xs text-gray-400">ISSN: {s.bibliographic_record.issn}</div>}
                                                    </td>
                                                    <td className="py-2 px-4 capitalize text-gray-600">{s.frequency}</td>
                                                    <td className="py-2 px-4 text-gray-600">{s.subscription_expiry ?? '—'}</td>
                                                    <td className="py-2 px-4">
                                                        <span className={`badge capitalize ${STATUS_COLORS[statusKey] ?? 'badge-blue'}`}>
                                                            {statusKey.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 text-center">
                                                        <IssueStats stats={s.stats} />
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <div className="flex gap-2 justify-end">
                                                            <Link href={route('admin.serials.show', s.id)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="View issues">
                                                                <Newspaper className="w-3.5 h-3.5" />
                                                            </Link>
                                                            <Link href={route('admin.serials.edit', s.id)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={serials?.links} />
                        </>
                    ) : (
                        <div className="text-center py-16 text-sm text-gray-400">
                            <Newspaper className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            No subscriptions found.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function IssueStats({ stats }) {
    if (!stats) return <span className="text-gray-400">—</span>;
    return (
        <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-green-600 font-medium" title="Received">{stats.received}✓</span>
            {stats.late > 0 && <span className="text-amber-600 font-medium" title="Late">{stats.late}!</span>}
            {stats.missing > 0 && <span className="text-red-600 font-medium" title="Missing">{stats.missing}✗</span>}
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
