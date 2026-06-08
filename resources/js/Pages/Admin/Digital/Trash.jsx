import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { ChevronRight, Monitor, RotateCcw, Trash2, AlertTriangle, FileText } from 'lucide-react';

export default function DigitalTrash({ resources }) {
    const data = resources?.data ?? [];

    const restore = (id, title) => {
        if (!confirm(`Restore "${title}" back to active resources?`)) return;
        router.post(route('admin.digital.restore', id));
    };

    const forceDelete = (id, title) => {
        if (!confirm(`Permanently delete "${title}"? This cannot be undone and will delete the file from storage.`)) return;
        router.delete(route('admin.digital.force-delete', id));
    };

    const daysUntilPurge = (deletedAt) => {
        if (!deletedAt) return 30;
        const days = Math.floor((new Date(deletedAt) - new Date()) / 86400000) + 30;
        return Math.max(0, days);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '—';
        const kb = bytes / 1024;
        const mb = kb / 1024;
        const gb = mb / 1024;
        if (gb >= 1) return `${gb.toFixed(2)} GB`;
        if (mb >= 1) return `${mb.toFixed(2)} MB`;
        return `${kb.toFixed(2)} KB`;
    };

    return (
        <AdminLayout title="Digital Resources Trash">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <Link href={route('admin.digital.index')} className="hover:text-gray-700">Digital Resources</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium">Trash</span>
            </nav>

            {/* Banner */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                <span>Digital resources in trash are permanently deleted after <strong>30 days</strong>. Restore a resource to bring it back. Files will be deleted from cloud storage on permanent deletion.</span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
                    {resources?.total ?? 0} {(resources?.total ?? 0) === 1 ? 'resource' : 'resources'} in trash
                </div>

                {data.length === 0 ? (
                    <div className="py-16 text-center">
                        <Trash2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Trash is empty.</p>
                        <Link href={route('admin.digital.index')}
                            className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-600 hover:underline">
                            Back to Digital Resources
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Format</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Size</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Deleted</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Auto-purge</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.map(resource => {
                                    const days = daysUntilPurge(resource.deleted_at);
                                    const urgent = days <= 7;
                                    const title = resource.bibliographic_record?.title || resource.original_filename || 'Untitled';

                                    return (
                                        <tr key={resource.id} className="hover:bg-gray-50 group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-start gap-2.5">
                                                    {resource.thumbnail_path ? (
                                                        <img src={resource.thumbnail_path} alt=""
                                                            className="w-8 h-10 object-cover rounded flex-shrink-0 bg-gray-100 opacity-60" />
                                                    ) : (
                                                        <div className="w-8 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-700 line-clamp-2 leading-snug">{title}</div>
                                                        {resource.bibliographic_record?.subtitle && (
                                                            <div className="text-xs text-gray-400 truncate">{resource.bibliographic_record.subtitle}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                {resource.format ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 uppercase">
                                                        {resource.format}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                                                {formatFileSize(resource.file_size_bytes)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                                                {resource.deleted_at
                                                    ? new Date(resource.deleted_at).toLocaleDateString()
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
                                                        onClick={() => restore(resource.id, title)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                                                        title="Restore">
                                                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                                                    </button>
                                                    <button
                                                        onClick={() => forceDelete(resource.id, title)}
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
                {resources?.last_page > 1 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                        <span>Page {resources.current_page} of {resources.last_page}</span>
                        <div className="flex gap-2">
                            {resources.prev_page_url && (
                                <Link href={resources.prev_page_url}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Previous
                                </Link>
                            )}
                            {resources.next_page_url && (
                                <Link href={resources.next_page_url}
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
