import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Users, BookOpen, Clock, RefreshCw, Bookmark, DollarSign, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EMPTY = { name: '', name_km: '', loan_limit: 5, loan_period_days: 14, renewals_allowed: 2, reservation_limit: 3, fine_rate_per_day: '0.10' };

const CARD_COLORS = [
    { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-600', text: 'text-blue-700' },
    { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'bg-violet-100 text-violet-600', badge: 'bg-violet-600', text: 'text-violet-700' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-600', text: 'text-emerald-700' },
    { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-500', text: 'text-amber-700' },
    { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'bg-rose-100 text-rose-600', badge: 'bg-rose-600', text: 'text-rose-700' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'bg-cyan-100 text-cyan-600', badge: 'bg-cyan-600', text: 'text-cyan-700' },
];

export default function PatronCategoriesIndex({ categories }) {
    const [editing, setEditing] = useState(null);
    const [showNew, setShowNew] = useState(false);
    const { t } = useTranslation();

    return (
        <AdminLayout title={t('admin.categories_ui.page_title')}>
            <div className="space-y-6">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('admin.categories_ui.page_title')}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{t('admin.categories_ui.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => { setEditing(null); setShowNew(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> {t('admin.categories_ui.new_category')}
                    </button>
                </div>

                {/* New category form */}
                {showNew && !editing && (
                    <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Plus className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-800">{t('admin.categories_ui.new_category')}</h3>
                            </div>
                            <button onClick={() => setShowNew(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <CategoryForm initial={EMPTY} onCancel={() => setShowNew(false)} onSaved={() => setShowNew(false)} isNew />
                    </div>
                )}

                {/* Category cards */}
                {categories.length > 0 ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {categories.map((cat, idx) => {
                            const color = CARD_COLORS[idx % CARD_COLORS.length];
                            const isEditing = editing?.id === cat.id;
                            return (
                                <div key={cat.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${isEditing ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                                    {/* Card header */}
                                    <div className={`px-5 pt-5 pb-4 ${isEditing ? 'bg-blue-50/60' : ''}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.icon}`}>
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{cat.name}</div>
                                                    {cat.name_km && <div className="text-xs text-gray-400 font-khmer mt-0.5">{cat.name_km}</div>}
                                                </div>
                                            </div>
                                            <div className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white ${color.badge}`}>
                                                {cat.patrons_count ?? 0} {t('admin.patrons_ui.patron_plural')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Edit form */}
                                    {isEditing ? (
                                        <div className="px-5 pb-5">
                                            <CategoryForm
                                                initial={editing}
                                                onCancel={() => setEditing(null)}
                                                onSaved={() => setEditing(null)}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            {/* Stats grid */}
                                            <div className="px-5 pb-4 grid grid-cols-3 gap-2">
                                                <Stat icon={BookOpen} label={t('admin.categories_ui.col_loan_limit')} value={cat.loan_limit} color={color.text} />
                                                <Stat icon={Clock} label={t('admin.categories_ui.days')} value={cat.loan_period_days} color={color.text} />
                                                <Stat icon={RefreshCw} label={t('admin.categories_ui.col_renewals')} value={cat.renewals_allowed} color={color.text} />
                                                <Stat icon={Bookmark} label={t('admin.categories_ui.holds')} value={cat.reservation_limit} color={color.text} />
                                                <Stat
                                                    icon={DollarSign}
                                                    label={t('admin.categories_ui.col_fine_rate')}
                                                    value={`$${Number(cat.fine_rate_per_day).toFixed(2)}`}
                                                    color={Number(cat.fine_rate_per_day) === 0 ? 'text-gray-400' : 'text-rose-600'}
                                                />
                                            </div>

                                            {/* Actions */}
                                            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setShowNew(false); setEditing(cat); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" /> {t('common.edit')}
                                                </button>
                                                <DeleteButton id={cat.id} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-7 h-7 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">{t('admin.categories_ui.no_categories')}</p>
                        <button
                            onClick={() => setShowNew(true)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" /> {t('admin.categories_ui.new_category')}
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function Stat({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-xs text-gray-500">{label}</span>
            </div>
            <div className="text-sm font-bold text-gray-800">{value}</div>
        </div>
    );
}

function CategoryForm({ initial, onCancel, onSaved, isNew = false }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({ ...initial });
    const { t } = useTranslation();

    const submit = (e) => {
        e.preventDefault();
        if (isNew) {
            post(route('admin.patron-categories.store'), { onSuccess: () => { reset(); onSaved(); } });
        } else {
            put(route('admin.patron-categories.update', initial.id), { onSuccess: onSaved });
        }
    };

    const fields = [
        { key: 'loan_limit',        label: t('admin.categories_ui.col_loan_limit'), icon: BookOpen },
        { key: 'loan_period_days',  label: t('admin.categories_ui.col_loan_period'), icon: Clock },
        { key: 'renewals_allowed',  label: t('admin.categories_ui.col_renewals'), icon: RefreshCw },
        { key: 'reservation_limit', label: t('admin.categories_ui.holds'), icon: Bookmark },
        { key: 'fine_rate_per_day', label: t('admin.categories_ui.col_fine_rate'), icon: DollarSign, step: '0.01' },
    ];

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.categories_ui.col_name')} *</label>
                    <input value={data.name} onChange={e => setData('name', e.target.value)} required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.categories_ui.col_name_km')}</label>
                    <input value={data.name_km} onChange={e => setData('name_km', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-khmer focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fields.map(f => (
                    <div key={f.key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                            <f.icon className="w-3 h-3" />{f.label}
                        </label>
                        <input type="number" min="0" step={f.step ?? '1'} value={data[f.key]}
                            onChange={e => setData(f.key, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                ))}
            </div>
            <div className="flex gap-2 pt-1">
                <button type="submit" disabled={processing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    <Check className="w-3.5 h-3.5" />
                    {processing ? t('common.loading') : (isNew ? t('admin.categories_ui.create_category') : t('common.save'))}
                </button>
                <button type="button" onClick={onCancel}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50">
                    <X className="w-3.5 h-3.5" /> {t('common.cancel')}
                </button>
            </div>
        </form>
    );
}

function DeleteButton({ id }) {
    const { delete: destroy, processing } = useForm();
    const { t } = useTranslation();
    return (
        <button
            onClick={() => { if (confirm(t('admin.categories_ui.delete_confirm', { name: '' }))) destroy(route('admin.patron-categories.destroy', id)); }}
            disabled={processing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
            <Trash2 className="w-3.5 h-3.5" /> {t('common.delete')}
        </button>
    );
}
