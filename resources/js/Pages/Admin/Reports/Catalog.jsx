import { useTranslation } from 'react-i18next';
import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Boxes, DollarSign, Archive, AlertTriangle, Download, Filter } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const money = (n) => '$' + Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CatalogReport({
    weeding = [], neverCount = 0, byCollection = [], byLocation = [], accession = [],
    dataQuality = {}, summary = {}, collections = [], collectionId, acquiredBefore,
}) {
    const { t } = useTranslation();
    const [coll, setColl] = useState(collectionId ?? '');
    const [before, setBefore] = useState(acquiredBefore ?? '');

    const apply = () => router.get(route('admin.reports.catalog'), { collection_id: coll, acquired_before: before }, { preserveState: true, replace: true });
    const exportUrl = (section) => route('admin.reports.catalog.export', { section, collection_id: coll, acquired_before: before });

    return (
        <AdminLayout title={t('admin.reports_ui.catalog_analysis')}>
            <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card icon={Boxes}         color="blue"  label={t('admin.reports_ui.physical_items')}  value={(summary.total_items ?? 0).toLocaleString()} />
                    <Card icon={DollarSign}    color="green" label={t('admin.reports_ui.holdings_value')}  value={money(summary.holdings_value)} />
                    <Card icon={Archive}       color="amber" label={t('admin.reports_ui.never_borrowed')}  value={(summary.never_borrowed ?? 0).toLocaleString()} />
                    <Card icon={AlertTriangle} color="red"   label={t('admin.reports_ui.lost_withdrawn')}  value={(summary.lost_withdrawn ?? 0).toLocaleString()} />
                </div>

                {/* Holdings + accession */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <Panel title={t('admin.reports_ui.holdings_by_collection')} action={<ExportLink href={exportUrl('holdings')} label={t('admin.reports_ui.export_csv')} />}>
                        {byCollection.length ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={byCollection} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v, n) => n === 'value' ? money(v) : v} />
                                    <Bar dataKey="items" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState text={t('admin.reports_ui.no_data')} />}
                        {byLocation.length > 0 && (
                            <div className="mt-3 text-xs text-gray-500">
                                {t('admin.reports_ui.branches_locations')}: {byLocation.map(l => `${l.name} (${l.items})`).join(' · ')}
                            </div>
                        )}
                    </Panel>

                    <Panel title={t('admin.reports_ui.accession_by_month')} action={<ExportLink href={exportUrl('accession')} label={t('admin.reports_ui.export_csv')} />}>
                        {accession.length ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={accession} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="ym" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="items" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState text={t('admin.reports_ui.no_data')} />}
                    </Panel>
                </div>

                {/* Data quality */}
                <Panel title={t('admin.reports_ui.data_quality')}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QualityCard label={t('admin.reports_ui.no_items_quality')}  value={dataQuality.no_items}          href={exportUrl('no_items')} />
                        <QualityCard label={t('admin.reports_ui.no_barcode')}         value={dataQuality.no_barcode}        href={exportUrl('no_barcode')} />
                        <QualityCard label={t('admin.reports_ui.no_classification')}  value={dataQuality.no_classification} />
                        <QualityCard label={t('admin.reports_ui.no_subjects')}        value={dataQuality.no_subjects} />
                    </div>
                </Panel>

                {/* Weeding */}
                <Panel
                    title={`${t('admin.reports_ui.weeding_title')} (${neverCount.toLocaleString()})`}
                    action={<ExportLink href={exportUrl('weeding')} label={t('admin.reports_ui.export_list')} />}
                >
                    {/* Filters */}
                    <div className="flex flex-wrap items-end gap-3 mb-4">
                        <label className="text-xs text-gray-500">
                            <span className="block mb-1">{t('admin.reports_ui.col_collection')}</span>
                            <select value={coll} onChange={e => setColl(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
                                <option value="">{t('admin.reports_ui.all_collections')}</option>
                                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </label>
                        <label className="text-xs text-gray-500">
                            <span className="block mb-1">{t('admin.reports_ui.acquired_before')}</span>
                            <input type="date" value={before} onChange={e => setBefore(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg" />
                        </label>
                        <button onClick={apply} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300">
                            <Filter className="w-3.5 h-3.5" /> {t('admin.reports_ui.apply_filter')}
                        </button>
                    </div>

                    {weeding.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-gray-600 border-b border-gray-100">
                                        <th className="px-3 py-2 font-medium">{t('admin.reports_ui.col_barcode')}</th>
                                        <th className="px-3 py-2 font-medium">{t('admin.reports_ui.col_title')}</th>
                                        <th className="px-3 py-2 font-medium">{t('admin.reports_ui.col_collection')}</th>
                                        <th className="px-3 py-2 font-medium">{t('admin.reports_ui.col_acquired')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {weeding.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-mono text-xs text-gray-500">{r.barcode ?? '—'}</td>
                                            <td className="px-3 py-2 text-gray-800 truncate max-w-[320px]">{r.title}</td>
                                            <td className="px-3 py-2 text-gray-500">{r.collection}</td>
                                            <td className="px-3 py-2 text-gray-500">{r.acquired_date ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {neverCount > weeding.length && (
                                <p className="text-xs text-gray-400 mt-3">
                                    {t('admin.reports_ui.showing_first', { count: weeding.length, total: neverCount.toLocaleString() })}
                                </p>
                            )}
                        </div>
                    ) : <EmptyState text={t('admin.reports_ui.no_data')} />}
                </Panel>
            </div>
        </AdminLayout>
    );
}

function Card({ icon: Icon, color, label, value }) {
    const cls = {
        blue: 'bg-blue-50 text-blue-600 ring-blue-100', green: 'bg-green-50 text-green-600 ring-green-100',
        amber: 'bg-amber-50 text-amber-600 ring-amber-100', red: 'bg-red-50 text-red-600 ring-red-100',
    }[color];
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg ring-1 flex items-center justify-center ${cls}`}><Icon className="w-4 h-4" /></div>
            <div><div className="text-2xl font-bold text-gray-900">{value}</div><div className="text-xs text-gray-500 mt-0.5">{label}</div></div>
        </div>
    );
}
function Panel({ title, action, children }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}
function ExportLink({ href, label }) {
    return <a href={href} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"><Download className="w-3.5 h-3.5" /> {label}</a>;
}
function QualityCard({ label, value, href }) {
    const { t } = useTranslation();
    return (
        <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-gray-900">{(value ?? 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            {href && value > 0 && <a href={href} className="text-[11px] text-blue-600 hover:underline mt-1 inline-block">{t('admin.reports_ui.export_list')}</a>}
        </div>
    );
}
function EmptyState({ text }) {
    return <div className="text-center py-8 text-sm text-gray-400">{text}</div>;
}
