import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { ChevronRight, BookOpen, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';

export default function CatalogTrash({ records, staffMap = {} }) {
    const data = records?.data ?? [];

    const restore = (id, title) => {
        if (!confirm(`Restore "${title}" back to the catalog?`)) return;
        router.post(route('admin.catalog.restore', id));
    };

    const forceDelete = (id, title) => {
        if (!confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
        router.delete(route('admin.catalog.force-delete', id));
    };

    const daysUntilPurge = (deletedAt) => {
        if (!deletedAt) return 30;
        const days = Math.floor((new Date(deletedAt) - new Date()) / 86400000) + 30;
        return Math.max(0, days);
    };

    return (
        <AdminLayout title="Catalog Trash">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <Link href={route('admin.catalog.index')} className="hover:text-gray-700">Catalog</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium">Trash</span>
            </nav>

            {/* Banner */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                <span>Records in trash are permanently deleted after <strong>30 days</strong>. Restore a record to bring it back to the active catalog.</span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
                    {records?.total ?? 0} {(records?.total ?? 0) === 1 ? 'record' : 'records'} in trash
                </div>

                {data.length === 0 ? (
                    <div className="py-16 text-center">
                        <Trash2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Trash is empty.</p>
                        <Link href={route('admin.catalog.index')}
                            className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-600 hover:underline">
                            Back to Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Type</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Deleted</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Deleted by</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Auto-purge</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.map(record => {
                                    const days = daysUntilPurge(record.deleted_at);
                                    const urgent = days <= 7;
                                    return (
                                        <tr key={record.id} className="hover:bg-gray-50 group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-start gap-2.5">
                                                    {record.cover_image_url ? (
                                                        <img src={record.cover_image_url} alt=""
                                                            className="w-8 h-10 object-cover rounded flex-shrink-0 bg-gray-100 opacity-60" />
                                                    ) : (
                                                        <div className="w-8 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            <BookOpen className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-700 line-clamp-2 leading-snug">{record.title}</div>
                                                        {record.subtitle && (
                                                            <div className="text-xs text-gray-400 truncate">{record.subtitle}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                {record.material_type && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        {record.material_type.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                                                {record.deleted_at
                                                    ? new Date(record.deleted_at).toLocaleDateString()
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                                                {record.deleted_by
                                                    ? (staffMap[record.deleted_by] ?? 'Unknown staff')
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 hidden xl:table-cell">
                                                <span className={`text-xs font-medium ${urgent ? 'text-red-600' : 'text-gray-500'}`}>
                                                    {days === 0 ? 'Today' : `${days}d`}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button
                                                        onClick={() => restore(record.id, record.title)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                                                        title="Restore">
                                                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                                                    </button>
                                                    <button
                                                        onClick={() => forceDelete(record.id, record.title)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                                                        title="Delete permanently">
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {records?.last_page > 1 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                        <span>Page {records.current_page} of {records.last_page}</span>
                        <div className="flex gap-2">
                            {records.prev_page_url && (
                                <Link href={records.prev_page_url}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Previous
                                </Link>
                            )}
                            {records.next_page_url && (
                                <Link href={records.next_page_url}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
