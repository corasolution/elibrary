import { Head, Link, router } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Inbox, Search, Send, Eye } from 'lucide-react';
import { useState } from 'react';

const STATUS_STYLES = {
    pending:  'bg-blue-100 text-blue-700',
    reviewed: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const SIZE_LABELS = {
    'under-500': 'Under 500',
    '500-5000': '500–5,000',
    '5000-50000': '5,000–50,000',
    '50000-plus': '50,000+',
};

export default function RegistrationRequestsIndex({ requests, filters = {}, counts = {} }) {
    const [q, setQ] = useState(filters.q || '');
    const [status, setStatus] = useState(filters.status || '');

    const applyFilters = (e) => {
        e?.preventDefault();
        router.get(route('central.registration-requests.index'), { q, status }, { preserveState: true, replace: true });
    };

    return (
        <CentralLayout>
            <Head title="Registration Requests" />

            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Inbox className="w-6 h-6 text-blue-600" />
                        Registration Requests
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Library sign-up leads. Review the details, verify via Telegram, then create the library.
                        {counts.pending > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                {counts.pending} pending
                            </span>
                        )}
                    </p>
                </div>

                {/* Filters */}
                <form onSubmit={applyFilters} className="flex flex-wrap gap-2 mb-4">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search library, contact, email, telegram…"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg">
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Filter
                    </button>
                </form>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="text-left px-4 py-3">Library</th>
                                <th className="text-left px-4 py-3">Contact</th>
                                <th className="text-left px-4 py-3">Telegram</th>
                                <th className="text-left px-4 py-3">Titles</th>
                                <th className="text-left px-4 py-3">Plan</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-left px-4 py-3">Submitted</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center text-gray-400 py-12">No registration requests.</td>
                                </tr>
                            ) : requests.data.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <Link href={route('central.registration-requests.show', r.id)} className="font-medium text-gray-900 hover:text-blue-700">
                                            {r.library_name}
                                        </Link>
                                        {r.slug && <div className="text-xs text-gray-400">/{r.slug}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {r.contact_name}
                                        <div className="text-xs text-gray-400">{r.contact_email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 text-blue-600">
                                            <Send className="w-3.5 h-3.5" /> {r.telegram}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{SIZE_LABELS[r.collection_size] || r.collection_size || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.plan?.name || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={route('central.registration-requests.show', r.id)}
                                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                                            <Eye className="w-4 h-4" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {requests.links && requests.last_page > 1 && (
                    <div className="flex justify-center gap-1 mt-4">
                        {requests.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={`px-3 py-1.5 text-sm rounded-lg ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'} ${!link.url ? 'opacity-40 cursor-default' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CentralLayout>
    );
}
