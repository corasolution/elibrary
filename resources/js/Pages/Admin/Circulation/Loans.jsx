import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Search, RefreshCw, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fmtDate } from '@/utils/date';

export default function Loans({ loans, filters = {} }) {
    const loanList = loans?.data ?? [];
    const [q, setQ] = useState(filters.q ?? '');
    const { t } = useTranslation();

    const search = (e) => {
        e.preventDefault();
        router.get(route('admin.loans.index'), { q }, { preserveState: true });
    };

    return (
        <AdminLayout title={t('admin.loans_ui.page_title')}>
            <div className="space-y-4">
                {/* Search */}
                <form onSubmit={search} className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder={t('admin.patrons_ui.search_placeholder')}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">{t('common.search')}</button>
                </form>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-700">{t('admin.loans_ui.page_title')}</h2>
                        <span className="text-xs text-gray-400">{loans?.total ?? 0} {t('common.total')}</span>
                    </div>

                    {loanList.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.loans_ui.col_patron')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.loans_ui.col_item')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.loans_ui.col_barcode')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.nav.collections_locations')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.loans_ui.col_due_date')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('common.renewals')}</th>
                                            <th className="py-2 px-4" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loanList.map(loan => {
                                            const isOverdue = new Date(loan.due_date) < new Date();
                                            return (
                                                <tr key={loan.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2 px-4">
                                                        <Link href={route('admin.patrons.show', loan.patron?.id)} className="font-medium text-blue-600 hover:underline">
                                                            {loan.patron?.first_name} {loan.patron?.last_name}
                                                        </Link>
                                                        <div className="text-xs text-gray-400">{loan.patron?.patron_number}</div>
                                                    </td>
                                                    <td className="py-2 px-4 max-w-xs">
                                                        <div className="truncate text-gray-800">{loan.item?.bibliographic_record?.title ?? '—'}</div>
                                                    </td>
                                                    <td className="py-2 px-4 font-mono text-xs text-gray-600">{loan.item?.barcode ?? '—'}</td>
                                                    <td className="py-2 px-4 text-gray-600">{loan.item?.collection?.name ?? '—'}</td>
                                                    <td className="py-2 px-4">
                                                        <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                                                            {fmtDate(loan.due_date)}
                                                        </span>
                                                        {isOverdue && <span className="ml-1 badge badge-red text-xs">{t('admin.nav.overdue')}</span>}
                                                    </td>
                                                    <td className="py-2 px-4 text-gray-600">{loan.renewals_count ?? 0}</td>
                                                    <td className="py-2 px-4">
                                                        <div className="flex gap-2 justify-end">
                                                            <ReturnButton loanId={loan.id} />
                                                            <RenewButton loanId={loan.id} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={loans?.links} />
                        </>
                    ) : (
                        <div className="text-center py-16 text-sm text-gray-400">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            {t('admin.loans_ui.no_loans')}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function ReturnButton({ loanId }) {
    const { post, processing } = useForm();
    const { t } = useTranslation();
    return (
        <button
            onClick={() => post(route('admin.loans.return', loanId))}
            disabled={processing}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 font-medium"
        >
            {t('admin.loans_ui.return_btn')}
        </button>
    );
}

function RenewButton({ loanId }) {
    const { post, processing } = useForm();
    const { t } = useTranslation();
    return (
        <button
            onClick={() => post(route('admin.loans.renew', loanId))}
            disabled={processing}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 font-medium"
        >
            {t('admin.loans_ui.renew_btn')}
        </button>
    );
}

function Pagination({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-1 justify-end text-sm">
            {links.map((link, i) => (
                link.url ? (
                    <Link key={i} href={link.url}
                        className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                    <span key={i} className="px-3 py-1 text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                )
            ))}
        </div>
    );
}
