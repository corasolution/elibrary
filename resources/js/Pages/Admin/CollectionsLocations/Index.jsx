import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Layers, MapPin, Clock, DollarSign, BookOpen, X, Check, GitBranch, Building2, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const COLLECTION_COLORS = [
    { bar: 'bg-blue-500',   soft: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-100' },
    { bar: 'bg-violet-500', soft: 'bg-violet-50',  text: 'text-violet-700', ring: 'ring-violet-100' },
    { bar: 'bg-amber-500',  soft: 'bg-amber-50',   text: 'text-amber-700',  ring: 'ring-amber-100' },
    { bar: 'bg-emerald-500',soft: 'bg-emerald-50', text: 'text-emerald-700',ring: 'ring-emerald-100' },
    { bar: 'bg-rose-500',   soft: 'bg-rose-50',    text: 'text-rose-700',   ring: 'ring-rose-100' },
    { bar: 'bg-cyan-500',   soft: 'bg-cyan-50',    text: 'text-cyan-700',   ring: 'ring-cyan-100' },
];

export default function CollectionsLocationsIndex({ collections, locations }) {
    const [editCol, setEditCol] = useState(null);
    const [showNewCol, setShowNewCol] = useState(false);
    const [editLoc, setEditLoc] = useState(null);
    const [showNewLoc, setShowNewLoc] = useState(false);
    const { t } = useTranslation();

    const branches = locations.filter(l => l.is_branch);
    const standalone = locations.filter(l => !l.is_branch && !l.parent_id);

    return (
        <AdminLayout title={t('admin.collections_ui.page_title')}>
            <div className="grid xl:grid-cols-2 gap-6 items-start">

                {/* ── Collections ─────────────────────────────────────── */}
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Layers className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">{t('admin.collections_ui.page_title').split('&')[0].trim()}</h2>
                                <p className="text-xs text-gray-500">{collections.length} {t('admin.collections_ui.collection_count')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setEditCol(null); setShowNewCol(v => !v); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> {t('common.add')}
                        </button>
                    </div>

                    {/* New form */}
                    {showNewCol && (
                        <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-semibold text-gray-800">{t('admin.collections_ui.new_collection')}</span>
                                <button onClick={() => setShowNewCol(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
                            </div>
                            <CollectionForm initial={null} onClose={() => setShowNewCol(false)} isNew />
                        </div>
                    )}

                    {/* Cards */}
                    <div className="space-y-3">
                        {collections.length === 0 && (
                            <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-16 text-center">
                                <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">{t('admin.collections_ui.no_collections')}</p>
                            </div>
                        )}
                        {collections.map((col, idx) => {
                            const c = COLLECTION_COLORS[idx % COLLECTION_COLORS.length];
                            const isEditing = editCol?.id === col.id;
                            return (
                                <div key={col.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${isEditing ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                                    <div className="flex">
                                        {/* Color accent bar */}
                                        <div className={`w-1.5 flex-shrink-0 ${c.bar}`} />
                                        <div className="flex-1 p-4">
                                            {isEditing ? (
                                                <>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-semibold text-gray-700">{t('admin.collections_ui.edit_collection')}</span>
                                                        <button onClick={() => setEditCol(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
                                                    </div>
                                                    <CollectionForm initial={col} onClose={() => setEditCol(null)} />
                                                </>
                                            ) : (
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900 truncate">{col.name}</span>
                                                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${c.soft} ${c.text}`}>{col.code}</span>
                                                        </div>
                                                        {/* Stats row */}
                                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${col.is_loanable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                {col.is_loanable ? `✓ ${t('admin.collections_ui.loanable')}` : `✗ ${t('admin.collections_ui.non_loanable')}`}
                                                            </span>
                                                            {col.is_loanable && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                                    <Clock className="w-3 h-3" />{col.loan_period_days}d loan
                                                                </span>
                                                            )}
                                                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                                <DollarSign className="w-3 h-3" />${Number(col.fine_rate_per_day ?? 0).toFixed(2)}/day
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                <BookOpen className="w-3 h-3" />{col.physical_items_count ?? 0} {t('admin.collections_ui.items_count')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <button onClick={() => { setShowNewCol(false); setEditCol(col); }}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <ColDeleteButton id={col.id} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Locations ───────────────────────────────────────── */}
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">{t('admin.collections_ui.locations_title')}</h2>
                                <p className="text-xs text-gray-500">{locations.length} {t('admin.collections_ui.location_count')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setEditLoc(null); setShowNewLoc(v => !v); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> {t('common.add')}
                        </button>
                    </div>

                    {/* New form */}
                    {showNewLoc && (
                        <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-semibold text-gray-800">{t('admin.collections_ui.new_location')}</span>
                                <button onClick={() => setShowNewLoc(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
                            </div>
                            <LocationForm initial={null} locations={locations} onClose={() => setShowNewLoc(false)} isNew />
                        </div>
                    )}

                    {/* Location cards */}
                    <div className="space-y-3">
                        {locations.length === 0 && (
                            <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-16 text-center">
                                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">{t('admin.collections_ui.no_locations')}</p>
                            </div>
                        )}

                        {/* Branch locations */}
                        {branches.map(loc => (
                            <div key={loc.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${editLoc?.id === loc.id ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-200'}`}>
                                {/* Branch header */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 border-b border-emerald-100">
                                    {editLoc?.id === loc.id ? (
                                        <>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold text-gray-700">{t('admin.collections_ui.edit_location')}</span>
                                                <button onClick={() => setEditLoc(null)} className="p-1 hover:bg-white rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
                                            </div>
                                            <LocationForm initial={loc} locations={locations} onClose={() => setEditLoc(null)} />
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900">{loc.name}</span>
                                                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700">{loc.code}</span>
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                                            <GitBranch className="w-2.5 h-2.5" /> {t('admin.collections_ui.branch_badge')}
                                                        </span>
                                                    </div>
                                                    {loc.address && <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Navigation className="w-3 h-3" />{loc.address}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => { setShowNewLoc(false); setEditLoc(loc); }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-colors">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <LocDeleteButton id={loc.id} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sub-locations */}
                                {loc.children?.length > 0 && (
                                    <div className="divide-y divide-gray-100">
                                        {loc.children.map((child, ci) => (
                                            <div key={child.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/80 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <div className="w-4 h-px bg-gray-300" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                    </div>
                                                    <span className="text-sm text-gray-700 font-medium">{child.name}</span>
                                                    {child.code && <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{child.code}</span>}
                                                </div>
                                                <LocDeleteButton id={child.id} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {loc.children?.length === 0 && (
                                    <div className="px-5 py-3 text-xs text-gray-400 italic">{t('admin.collections_ui.no_sub_locations')}</div>
                                )}
                            </div>
                        ))}

                        {/* Standalone (non-branch, no parent) */}
                        {standalone.map(loc => (
                            <div key={loc.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${editLoc?.id === loc.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                                <div className="px-5 py-4">
                                    {editLoc?.id === loc.id ? (
                                        <>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold text-gray-700">{t('admin.collections_ui.edit_location')}</span>
                                                <button onClick={() => setEditLoc(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
                                            </div>
                                            <LocationForm initial={loc} locations={locations} onClose={() => setEditLoc(null)} />
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                                                    <MapPin className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">{loc.name}</span>
                                                        {loc.code && <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{loc.code}</span>}
                                                    </div>
                                                    {loc.address && <p className="text-xs text-gray-500 mt-0.5">{loc.address}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => { setShowNewLoc(false); setEditLoc(loc); }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <LocDeleteButton id={loc.id} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// ── Forms ────────────────────────────────────────────────────────────────────

function CollectionForm({ initial, onClose, isNew = false }) {
    const { t } = useTranslation();
    const { data, setData, post, put, processing, errors } = useForm({
        name:              initial?.name ?? '',
        name_km:           initial?.name_km ?? '',
        code:              initial?.code ?? '',
        description:       initial?.description ?? '',
        is_loanable:       initial?.is_loanable ?? true,
        loan_period_days:  initial?.loan_period_days ?? 14,
        renewals_allowed:  initial?.renewals_allowed ?? 2,
        fine_rate_per_day: initial?.fine_rate_per_day ?? '0.10',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isNew) post(route('admin.collections-locations.collections.store'), { onSuccess: onClose });
        else put(route('admin.collections-locations.collections.update', initial.id), { onSuccess: onClose });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.collections_ui.col_name')} *</label>
                    <input value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. General Collection"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.collections_ui.col_code')} *</label>
                    <input value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} required placeholder="GEN"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.collections_ui.col_loan_days')}</label>
                    <input type="number" value={data.loan_period_days} onChange={e => setData('loan_period_days', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.collections_ui.col_loan_period')}</label>
                    <input type="number" value={data.renewals_allowed} onChange={e => setData('renewals_allowed', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.collections_ui.col_fine_day')}</label>
                    <input type="number" step="0.01" value={data.fine_rate_per_day} onChange={e => setData('fine_rate_per_day', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className={`relative w-9 h-5 rounded-full transition-colors ${data.is_loanable ? 'bg-blue-500' : 'bg-gray-300'}`}
                    onClick={() => setData('is_loanable', !data.is_loanable)}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${data.is_loanable ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">{t('admin.collections_ui.loanable_collection')}</span>
            </label>
            <div className="flex gap-2 pt-1">
                <button type="submit" disabled={processing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    <Check className="w-3.5 h-3.5" />{processing ? t('common.loading') : (isNew ? t('admin.categories_ui.create_category') : t('common.save'))}
                </button>
                <button type="button" onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50">
                    <X className="w-3.5 h-3.5" /> {t('common.cancel')}
                </button>
            </div>
        </form>
    );
}

function LocationForm({ initial, locations, onClose, isNew = false }) {
    const { t } = useTranslation();
    const { data, setData, post, put, processing } = useForm({
        parent_id: initial?.parent_id ?? '',
        name:      initial?.name ?? '',
        name_km:   initial?.name_km ?? '',
        code:      initial?.code ?? '',
        address:   initial?.address ?? '',
        is_branch: initial?.is_branch ?? false,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isNew) post(route('admin.collections-locations.locations.store'), { onSuccess: onClose });
        else put(route('admin.collections-locations.locations.update', initial.id), { onSuccess: onClose });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.collections_ui.col_name')} *</label>
                    <input value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Main Library"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.collections_ui.col_code')}</label>
                    <input value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} placeholder="MAIN"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.collections_ui.parent_location')}</label>
                <select value={data.parent_id} onChange={e => setData('parent_id', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">{t('admin.collections_ui.top_level')}</option>
                    {locations.filter(l => l.id !== initial?.id).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.collections_ui.street_address')}</label>
                <input value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Street address (optional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className={`relative w-9 h-5 rounded-full transition-colors ${data.is_branch ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    onClick={() => setData('is_branch', !data.is_branch)}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${data.is_branch ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">{t('admin.collections_ui.branch_library')}</span>
            </label>
            <div className="flex gap-2 pt-1">
                <button type="submit" disabled={processing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60">
                    <Check className="w-3.5 h-3.5" />{processing ? t('common.loading') : (isNew ? t('admin.categories_ui.create_category') : t('common.save'))}
                </button>
                <button type="button" onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50">
                    <X className="w-3.5 h-3.5" /> {t('common.cancel')}
                </button>
            </div>
        </form>
    );
}

function ColDeleteButton({ id }) {
    const { t } = useTranslation();
    const { delete: destroy, processing } = useForm();
    return (
        <button onClick={() => { if (confirm(t('admin.collections_ui.delete_collection'))) destroy(route('admin.collections-locations.collections.destroy', id)); }}
            disabled={processing} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}

function LocDeleteButton({ id }) {
    const { t } = useTranslation();
    const { delete: destroy, processing } = useForm();
    return (
        <button onClick={() => { if (confirm(t('admin.collections_ui.delete_location'))) destroy(route('admin.collections-locations.locations.destroy', id)); }}
            disabled={processing} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}
