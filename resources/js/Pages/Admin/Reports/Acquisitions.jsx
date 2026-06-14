import { useTranslation } from 'react-i18next';
import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { ShoppingCart, DollarSign, Package, Clock } from 'lucide-react';
import { Link } from '@inertiajs/react';

const STATUS_COLORS = {
    pending:   'badge-amber',
    ordered:   'badge-blue',
    partial:   'badge-purple',
    received:  'badge-green',
    cancelled: 'badge-red',
};

export default function AcquisitionsReport({ orders, byStatus, summary, from, to }) {
    const { t } = useTranslation();
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo,   setDateTo]   = useState(to);
    const orderList = orders?.data ?? [];

    const apply = () => router.get(route('admin.reports.acquisitions'), { from: dateFrom, to: dateTo }, { preserveState: true });

    return (
        <AdminLayout title={t('admin.reports_ui.acquisitions_report')}>
            <div className="space-y-6">
                {/* Date filter */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.reports_ui.date_from')}</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.reports_ui.date_to')}</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                    <button onClick={apply}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        {t('admin.reports_ui.apply_filter')}
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card icon={ShoppingCart} color="blue"   label={t('admin.reports_ui.total_orders')}   value={summary.total_orders} />
                    <Card icon={DollarSign}   color="green"  label={t('admin.reports_ui.total_spent')}    value={`$${Number(summary.total_spent ?? 0).toFixed(2)}`} />
                    <Card icon={Package}      color="indigo" label={t('admin.reports_ui.items_ordered')}  value={summary.total_items} />
                    <Card icon={Clock}        color="amber"  label={t('admin.reports_ui.pending_orders')} value={summary.pending_orders} />
                </div>

                {/* By status breakdown */}
                {(byStatus ?? []).length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.reports_ui.orders_by_status')}</h2>
                        <div className="flex flex-wrap gap-4">
                            {byStatus.map(s => (
                                <div key={s.status} className="flex items-center gap-2 text-sm">
                                    <span className={`badge capitalize ${STATUS_COLORS[s.status] ?? 'badge-blue'}`}>{s.status}</span>
                                    <span className="font-semibold text-gray-900">{s.count} {t('admin.reports_ui.orders_count')}</span>
                                    <span className="text-gray-400">(${Number(s.total ?? 0).toFixed(2)})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700">{t('admin.reports_ui.order_list')}</h2>
                    </div>
                    {orderList.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.reports_ui.col_order_no')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.reports_ui.col_supplier')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.reports_ui.col_order_date')}</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">{t('admin.reports_ui.col_status')}</th>
                                            <th className="text-right py-2 px-4 font-medium text-gray-600">{t('admin.reports_ui.total')}</th>
                                            <th className="text-right py-2 px-4 font-medium text-gray-600">{t('admin.reports_ui.col_items')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderList.map(order => (
                                            <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                <td className="py-2 px-4 font-mono text-xs text-gray-700">{order.order_number}</td>
                                                <td className="py-2 px-4 text-gray-800">{order.supplier || '—'}</td>
                                                <td className="py-2 px-4 text-gray-600">{order.order_date}</td>
                                                <td className="py-2 px-4">
                                                    <span className={`badge capitalize ${STATUS_COLORS[order.status] ?? 'badge-blue'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 text-right font-medium">
                                                    ${Number(order.total_amount ?? 0).toFixed(2)}
                                                </td>
                                                <td className="py-2 px-4 text-right text-gray-600">
                                                    {order.items?.length ?? 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {orders?.last_page > 1 && (
                                <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 justify-end text-sm">
                                    {orders.links?.map((link, i) => (
                                        link.url ? (
                                            <Link key={i} href={link.url}
                                                className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span key={i} className="px-3 py-1 text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-sm text-gray-400">{t('admin.reports_ui.no_orders')}</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function Card({ icon: Icon, color, label, value }) {
    const cls = {
        blue:   'bg-blue-50 text-blue-600 ring-blue-100',
        green:  'bg-green-50 text-green-600 ring-green-100',
        indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
        amber:  'bg-amber-50 text-amber-600 ring-amber-100',
    }[color];
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg ring-1 flex items-center justify-center ${cls}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900">{value ?? 0}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
        </div>
    );
}
