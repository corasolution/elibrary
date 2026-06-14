import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fmtDate } from '@/utils/date';

export default function Overdue({ loans }) {
    const loanList = loans?.data ?? [];
    const { t } = useTranslation();

    return (
        <AdminLayout title={t('admin.loans_ui.overdue_title')}>
            <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <h2 className="text-sm font-semibold text-gray-700">{t('admin.loans_ui.overdue_title')}</h2>
                        <span className="ml-auto text-xs text-gray-400">{loans?.total ?? 0} {t('common.items')}</span>
                    </div>

                    {loanList.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.loans_ui.col_patron')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.catalog.col_title')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.loans_ui.col_barcode')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.loans_ui.col_due_date')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.loans_ui.col_days_overdue')}</th>
                                            <th className="text-right py-2 px-4 font-medium text-gray-600">{t('admin.loans_ui.col_fine')}</th>
                                            <th className="py-2 px-4" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loanList.map(loan => {
                                            const daysOverdue = Math.floor((Date.now() - new Date(loan.due_date)) / 86400000);
                                            return (
                                                <tr key={loan.id} className="border-t border-gray-100 hover:bg-red-50/40">
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
                                                    <td className="py-2 px-4 text-red-600 font-medium">{fmtDate(loan.due_date)}</td>
                                                    <td className="py-2 px-4">
                                                        <span className={`badge ${daysOverdue > 30 ? 'badge-red' : daysOverdue > 7 ? 'badge-amber' : 'badge-orange'}`}>
                                                            {daysOverdue}d
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 text-right font-medium text-red-600">
                                                        ${Number(loan.fine_amount ?? 0).toFixed(2)}
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <ReturnButton loanId={loan.id} />
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
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
                            {t('admin.loans_ui.no_overdue')}
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
