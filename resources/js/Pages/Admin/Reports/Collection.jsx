import { useTranslation } from 'react-i18next';
import AdminLayout from '@/Layouts/AdminLayout';
import { BookOpen, Boxes, Monitor, Archive } from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];

export default function CollectionReport({ byMaterialType, byLanguage, byYear, itemStatus, summary }) {
    const { t } = useTranslation();

    return (
        <AdminLayout title={t('admin.reports_ui.collection_analysis')}>
            <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card icon={BookOpen} color="blue"   label={t('admin.reports_ui.total_titles')}          value={summary.total_titles} />
                    <Card icon={Boxes}    color="indigo" label={t('admin.reports_ui.physical_items')}        value={summary.total_items} />
                    <Card icon={Archive}  color="green"  label={t('admin.reports_ui.available_items')}       value={summary.available_items} />
                    <Card icon={Monitor}  color="purple" label={t('admin.reports_ui.digital_resources_count')} value={summary.digital_resources} />
                </div>

                {/* Material type + language pie */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.reports_ui.by_material_type')}</h2>
                        {(byMaterialType ?? []).length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={byMaterialType} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {byMaterialType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <EmptyState text={t('admin.reports_ui.no_data')} />}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.reports_ui.by_language')}</h2>
                        {(byLanguage ?? []).length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={byLanguage} dataKey="count" nameKey="language" cx="50%" cy="50%" outerRadius={90} label={({ language, percent }) => `${(language ?? 'unknown').toUpperCase()} ${(percent * 100).toFixed(0)}%`}>
                                        {byLanguage.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <EmptyState text={t('admin.reports_ui.no_data')} />}
                    </div>
                </div>

                {/* Publication year + item status */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.reports_ui.by_pub_year')}</h2>
                        {(byYear ?? []).length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={[...(byYear ?? [])].reverse()} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="publication_year" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState text={t('admin.reports_ui.no_data')} />}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.reports_ui.item_status_breakdown')}</h2>
                        {(itemStatus ?? []).length > 0 ? (
                            <div className="space-y-3 mt-2">
                                {itemStatus.map((s, i) => (
                                    <div key={s.item_status} className="flex items-center gap-3 text-sm">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="flex-1 capitalize text-gray-700">{(s.item_status ?? 'unknown').replace('_', ' ')}</span>
                                        <span className="font-semibold text-gray-900">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState text={t('admin.reports_ui.no_data')} />}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function Card({ icon: Icon, color, label, value }) {
    const cls = {
        blue:   'bg-blue-50 text-blue-600 ring-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
        green:  'bg-green-50 text-green-600 ring-green-100',
        purple: 'bg-purple-50 text-purple-600 ring-purple-100',
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

function EmptyState({ text }) {
    return <div className="text-center py-8 text-sm text-gray-400">{text}</div>;
}
