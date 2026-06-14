import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, BookOpen, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = {
    available:   'bg-green-100 text-green-700',
    checked_out: 'bg-amber-100 text-amber-700',
    on_hold:     'bg-blue-100 text-blue-700',
    in_repair:   'bg-orange-100 text-orange-700',
    lost:        'bg-red-100 text-red-700',
    withdrawn:   'bg-gray-100 text-gray-600',
};

const STATUS_OPTIONS = ['available', 'checked_out', 'on_hold', 'in_repair', 'lost', 'withdrawn'];

export default function ItemsIndex({ items, filters, collections = [] }) {
    const [search, setSearch] = useState(filters?.q ?? '');
    const { t } = useTranslation();

    const applyFilters = (patch) => {
        router.get(route('admin.items.index'), { ...filters, ...patch, q: search }, {
            preserveState: true, replace: true,
        });
    };

    const doSearch = (e) => {
        e.preventDefault();
        applyFilters({ q: search });
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('admin.items.index'), {}, { preserveState: false });
    };

    const deleteItem = (id) => {
        if (!confirm(t('admin.items_ui.delete_confirm'))) return;
        router.delete(route('admin.items.destroy', id));
    };

    const data = items?.data ?? [];
    const total = items?.total ?? 0;

    return (
        <AdminLayout title={t('admin.items_ui.page_title')}>
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
                                placeholder={t('admin.items_ui.search_placeholder')}
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
                            {t('common.search')}
                        </button>
                    </form>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                            value={filters?.item_status ?? ''}
                            onChange={e => applyFilters({ item_status: e.target.value || undefined })}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">{t('common.all_statuses')}</option>
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{t(`admin.items_ui.status_${s}`, { defaultValue: s.replace('_', ' ') })}</option>
                            ))}
                        </select>

                        {collections.length > 0 && (
                            <select
                                value={filters?.collection_id ?? ''}
                                onChange={e => applyFilters({ collection_id: e.target.value || undefined })}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">{t('common.all_collections')}</option>
                                {collections.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}

                        <Link href={route('admin.items.create')}
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                            <Plus className="w-4 h-4" /> {t('admin.items_ui.new_item')}
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
                        {total.toLocaleString()} {total === 1 ? t('admin.items_ui.item_singular') : t('admin.items_ui.item_plural')}
                    </div>

                    {data.length === 0 ? (
                        <div className="py-16 text-center">
                            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">{t('admin.items_ui.no_items')}</p>
                            <Link href={route('admin.items.create')}
                                className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-600 hover:underline">
                                <Plus className="w-4 h-4" /> {t('admin.items_ui.add_first')}
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t('admin.items_ui.col_barcode')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t('admin.items_ui.col_title')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">{t('admin.items_ui.col_call_no')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">{t('admin.items_ui.col_collection')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t('admin.items_ui.col_status')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">{t('admin.items_ui.col_condition')}</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 group">
                                            <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                                {item.barcode ?? <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.bibliographic_record ? (
                                                    <Link href={route('admin.catalog.show', item.bibliographic_record.id)}
                                                        className="text-gray-800 hover:text-blue-600 line-clamp-2 leading-snug">
                                                        {item.bibliographic_record.title}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">{t('common.no_record')}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                                                {item.call_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                                                {item.collection?.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.item_status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {t(`admin.items_ui.status_${item.item_status}`, { defaultValue: item.item_status?.replace('_', ' ') ?? '—' })}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 capitalize hidden xl:table-cell">
                                                {item.condition ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link href={route('admin.items.edit', item.id)}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Edit">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteItem(item.id)}
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
                    {items?.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                            <span>{t('common.page_of', { current: items.current_page, last: items.last_page })}</span>
                            <div className="flex gap-2">
                                {items.prev_page_url && (
                                    <Link href={items.prev_page_url}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        {t('common.previous')}
                                    </Link>
                                )}
                                {items.next_page_url && (
                                    <Link href={items.next_page_url}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        {t('common.next')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
