import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, Eye, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = {
    active:    'bg-green-100 text-green-700',
    expired:   'bg-yellow-100 text-yellow-700',
    suspended: 'bg-orange-100 text-orange-700',
    blocked:   'bg-red-100 text-red-700',
};

export default function PatronsIndex({ patrons, filters }) {
    const [search, setSearch] = useState(filters?.q ?? '');
    const { t } = useTranslation();

    const doSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.patrons.index'), { q: search }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('admin.patrons.index'), {}, { preserveState: false });
    };

    const deletePatron = (id, name) => {
        if (!confirm(t('admin.patrons_ui.delete_confirm', { name }))) return;
        router.delete(route('admin.patrons.destroy', id));
    };

    const data  = patrons?.data ?? [];
    const total = patrons?.total ?? 0;

    return (
        <AdminLayout title={t('admin.nav.patrons')}>
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
                                placeholder={t('admin.patrons_ui.search_placeholder')}
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

                    <Link href={route('admin.patrons.create')}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex-shrink-0">
                        <Plus className="w-4 h-4" /> {t('admin.patrons_ui.new_patron')}
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
                        {total.toLocaleString()} {total === 1 ? t('admin.patrons_ui.patron_singular') : t('admin.patrons_ui.patron_plural')}
                    </div>

                    {data.length === 0 ? (
                        <div className="py-16 text-center">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">
                                {filters?.q ? t('admin.patrons_ui.no_search_results') : t('admin.patrons_ui.no_patrons')}
                            </p>
                            {!filters?.q && (
                                <Link href={route('admin.patrons.create')}
                                    className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-600 hover:underline">
                                    <Plus className="w-4 h-4" /> {t('admin.patrons_ui.add_first')}
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t('admin.patrons_ui.col_name')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">{t('admin.patrons_ui.col_card')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">{t('admin.patrons_ui.col_email')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">{t('admin.patrons_ui.col_category')}</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-600">{t('admin.patrons_ui.col_loans')}</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t('admin.patrons_ui.col_status')}</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.map(patron => (
                                        <tr key={patron.id} className="hover:bg-gray-50 group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                                                        {patron.first_name?.[0]?.toUpperCase()}{patron.last_name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <Link href={route('admin.patrons.show', patron.id)}
                                                            className="font-medium text-gray-900 hover:text-blue-600">
                                                            {patron.first_name} {patron.last_name}
                                                        </Link>
                                                        {patron.phone && (
                                                            <div className="text-xs text-gray-400">{patron.phone}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 hidden md:table-cell">
                                                {patron.patron_number}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell truncate max-w-[180px]">
                                                {patron.email ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                                                {patron.category?.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-700">
                                                {patron.active_loans ?? 0}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[patron.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {t(`admin.patrons_ui.status_${patron.status}`, { defaultValue: patron.status })}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link href={route('admin.patrons.show', patron.id)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link href={route('admin.patrons.edit', patron.id)}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deletePatron(patron.id, `${patron.first_name} ${patron.last_name}`)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
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

                    {patrons?.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                            <span>{t('common.page_of', { current: patrons.current_page, last: patrons.last_page })}</span>
                            <div className="flex gap-2">
                                {patrons.prev_page_url && (
                                    <Link href={patrons.prev_page_url}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        {t('common.previous')}
                                    </Link>
                                )}
                                {patrons.next_page_url && (
                                    <Link href={patrons.next_page_url}
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
