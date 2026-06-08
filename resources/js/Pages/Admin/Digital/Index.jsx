import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Monitor, Search, Plus, Eye, Download, Pencil, Trash2, Archive } from 'lucide-react';

const ACCESS_COLORS = {
    open_access:  'badge-green',
    registered:   'badge-blue',
    restricted:   'badge-amber',
    embargo:      'badge-red',
};

export default function DigitalIndex({ resources, filters = {} }) {
    const list = resources?.data ?? [];
    const [q, setQ] = useState(filters.q ?? '');

    const search = (e) => {
        e.preventDefault();
        router.get(route('admin.digital.index'), { q }, { preserveState: true });
    };

    return (
        <AdminLayout title="Digital Resources">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <form onSubmit={search} className="flex gap-2 flex-1 max-w-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={q} onChange={e => setQ(e.target.value)}
                                placeholder="Search title, format…"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Search</button>
                    </form>
                    <Link href={route('admin.digital.trash')} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 border border-gray-300">
                        <Archive className="w-4 h-4" /> View Trash
                    </Link>
                    <Link href={route('admin.digital.create')} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4" /> Add Resource
                    </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-blue-500" />
                        <h2 className="text-sm font-semibold text-gray-700">Digital Resources</h2>
                        <span className="ml-auto text-xs text-gray-400">{resources?.total ?? 0} total</span>
                    </div>

                    {list.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Title</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Format</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Size</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Access</th>
                                            <th className="text-right py-2 px-4 font-medium text-gray-600">Views</th>
                                            <th className="text-right py-2 px-4 font-medium text-gray-600">Downloads</th>
                                            <th className="py-2 px-4" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.map(res => (
                                            <tr key={res.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                <td className="py-2 px-4 max-w-xs">
                                                    <div className="truncate font-medium text-gray-800">{res.bibliographic_record?.title ?? '—'}</div>
                                                    <div className="text-xs text-gray-400 truncate">{res.original_filename}</div>
                                                </td>
                                                <td className="py-2 px-4">
                                                    <span className="badge badge-blue uppercase text-xs">{res.format ?? '—'}</span>
                                                </td>
                                                <td className="py-2 px-4 text-gray-600 text-xs">{res.file_size_human ?? formatBytes(res.file_size_bytes)}</td>
                                                <td className="py-2 px-4">
                                                    <span className={`badge capitalize ${ACCESS_COLORS[res.access_type] ?? 'badge-blue'}`}>
                                                        {(res.access_type ?? 'restricted').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 text-right text-gray-600">{res.view_count ?? 0}</td>
                                                <td className="py-2 px-4 text-right text-gray-600">{res.download_count ?? 0}</td>
                                                <td className="py-2 px-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <Link href={route('admin.digital.edit', res.id)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <DeleteButton id={res.id} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={resources?.links} />
                        </>
                    ) : (
                        <div className="text-center py-16 text-sm text-gray-400">
                            <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            No digital resources yet.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function DeleteButton({ id }) {
    const { delete: destroy, processing } = useForm();
    const confirm = () => {
        if (window.confirm('Move this digital resource to trash? It will be permanently deleted after 30 days.')) destroy(route('admin.digital.destroy', id));
    };
    return (
        <button onClick={confirm} disabled={processing} className="p-1.5 text-gray-400 hover:text-red-600 rounded disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}

function formatBytes(bytes) {
    if (!bytes) return '—';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
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
