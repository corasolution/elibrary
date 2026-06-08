import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, Eye, BookOpen, FileText, X, Upload } from 'lucide-react';
import { useState } from 'react';
import ExcelExportButton from '@/Components/Catalog/ExcelExportButton';
import ExcelImportModal from '@/Components/Catalog/ExcelImportModal';

export default function CatalogIndex({ records, filters, trashCount = 0 }) {
    const [search, setSearch]           = useState(filters?.q ?? '');
    const [showImportModal, setShowImportModal] = useState(false);

    const doSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.catalog.index'), { q: search }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('admin.catalog.index'), {}, { preserveState: false });
    };

    const deleteRecord = (id, title) => {
        if (!confirm(`Move "${title}" to trash? It will be permanently deleted after 30 days.`)) return;
        router.delete(route('admin.catalog.destroy', id));
    };

    const data = records?.data ?? [];
    const total = records?.total ?? 0;

    return (
        <AdminLayout title="Catalog">
            <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <form onSubmit={doSearch} className="flex gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search title, author, ISBN…"
                                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {search && (
                                <button type="button" onClick={clearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        <button type="submit"
                            className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300">
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={route('admin.catalog.trash')}
                            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
                            <Trash2 className="w-4 h-4" />
                            Trash
                            {trashCount > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                                    {trashCount}
                                </span>
                            )}
                        </Link>

                        {/* Excel export dropdown */}
                        <ExcelExportButton filters={filters ?? {}} />

                        {/* Excel import button */}
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 bg-white"
                        >
                            <Upload className="w-4 h-4 text-blue-600" />
                            Import
                        </button>

                        <Link href={route('admin.catalog.create')}
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                            <Plus className="w-4 h-4" /> New Record
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Count */}
                    <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
                        {total.toLocaleString()} {total === 1 ? 'record' : 'records'}
                        {filters?.q && <span className="ml-1">matching <strong>"{filters.q}"</strong></span>}
                    </div>

                    {data.length === 0 ? (
                        <div className="py-16 text-center">
                            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">
                                {filters?.q ? 'No records match your search.' : 'No catalog records yet.'}
                            </p>
                            {!filters?.q && (
                                <Link href={route('admin.catalog.create')}
                                    className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-600 hover:underline">
                                    <Plus className="w-4 h-4" /> Add the first record
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Author</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Type</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Year</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">ISBN</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-600">Copies</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50 group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-start gap-2.5">
                                                    {record.cover_image_url ? (
                                                        <img src={record.cover_image_url} alt=""
                                                            className="w-8 h-10 object-cover rounded flex-shrink-0 bg-gray-100" />
                                                    ) : (
                                                        <div className="w-8 h-10 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                            <BookOpen className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <Link href={route('admin.catalog.show', record.id)}
                                                            className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2 leading-snug">
                                                            {record.title}
                                                        </Link>
                                                        {record.subtitle && (
                                                            <div className="text-xs text-gray-400 truncate">{record.subtitle}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                                                {primaryAuthor(record.authors)}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                {record.material_type && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                        {record.material_type.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                                                {record.publication_year}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden xl:table-cell">
                                                {record.isbn}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <CopiesCell record={record} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link href={route('admin.catalog.show', record.id)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link href={route('admin.catalog.edit', record.id)}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Edit">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteRecord(record.id, record.title)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <ExcelImportModal
                    onClose={() => setShowImportModal(false)}
                    onComplete={() => {
                        setShowImportModal(false);
                        router.reload();
                    }}
                />
            )}
        </AdminLayout>
    );
}

function CopiesCell({ record }) {
    const physical = record.physical_items?.length ?? 0;
    const digital  = record.digital_resources?.length ?? 0;

    if (physical === 0 && digital === 0) {
        return <span className="text-gray-300 text-xs">—</span>;
    }
    return (
        <div className="flex items-center justify-center gap-1.5">
            {physical > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                    <BookOpen className="w-3 h-3" />{physical}
                </span>
            )}
            {digital > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-xs">
                    <FileText className="w-3 h-3" />{digital}
                </span>
            )}
        </div>
    );
}

function primaryAuthor(authors) {
    if (!authors?.length) return '—';
    return authors[0]?.name ?? '—';
}
