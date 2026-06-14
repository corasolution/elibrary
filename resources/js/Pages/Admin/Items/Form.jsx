import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';
import { ChevronRight, BookOpen, Info, Barcode, Hash, Library, MapPin, Star, ShoppingBag, FileText, Package, Save, PlusCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const CONDITIONS = ['excellent', 'good', 'fair', 'poor'];
const CONDITION_STYLES = {
    excellent: 'bg-emerald-100 text-emerald-700 border-emerald-300 ring-emerald-200',
    good:      'bg-blue-100 text-blue-700 border-blue-300 ring-blue-200',
    fair:      'bg-amber-100 text-amber-700 border-amber-300 ring-amber-200',
    poor:      'bg-red-100 text-red-700 border-red-300 ring-red-200',
};
const ITEM_STATUSES = ['available', 'checked_out', 'on_hold', 'in_repair', 'lost', 'withdrawn'];
const STATUS_STYLES = {
    available:   'bg-emerald-100 text-emerald-700 border-emerald-300',
    checked_out: 'bg-blue-100 text-blue-700 border-blue-300',
    on_hold:     'bg-violet-100 text-violet-700 border-violet-300',
    in_repair:   'bg-amber-100 text-amber-700 border-amber-300',
    lost:        'bg-red-100 text-red-700 border-red-300',
    withdrawn:   'bg-gray-100 text-gray-600 border-gray-300',
};

export default function ItemForm({ item, biblio, collections = [], locations = [] }) {
    const isEdit = !!item;

    const { data, setData, post, put, transform, processing, errors } = useForm({
        biblio_id:         item?.biblio_id         ?? biblio?.id ?? '',
        barcode:           item?.barcode            ?? '',
        accession_number:  item?.accession_number   ?? '',
        call_number:       item?.call_number        ?? '',
        collection_id:     item?.collection_id      ?? '',
        location_id:       item?.location_id        ?? '',
        shelf:             item?.shelf              ?? '',
        item_status:       item?.item_status        ?? 'available',
        condition:         item?.condition          ?? 'good',
        price:             item?.price              ?? '',
        currency:          item?.currency           ?? 'USD',
        acquired_date:     item?.acquired_date      ?? '',
        supplier:          item?.supplier           ?? '',
        purchase_order:    item?.purchase_order     ?? '',
        notes:             item?.notes              ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) { put(route('admin.items.update', item.id)); }
        else { transform(d => ({ ...d, add_another: false })); post(route('admin.items.store')); }
    };

    const saveAndAddAnother = () => {
        transform(d => ({ ...d, add_another: true }));
        post(route('admin.items.store'), { onFinish: () => transform(d => ({ ...d, add_another: false })) });
    };

    const backHref = biblio?.id ? route('admin.catalog.show', biblio.id) : route('admin.items.index');

    return (
        <AdminLayout title={isEdit ? 'Edit Physical Item' : 'Add Physical Item'}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
                <Link href={route('admin.catalog.index')} className="hover:text-gray-700">Catalog</Link>
                {biblio && (
                    <>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link href={route('admin.catalog.show', biblio.id)} className="hover:text-gray-700 truncate max-w-[180px]">{biblio.title}</Link>
                    </>
                )}
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium">{isEdit ? 'Edit Item' : 'Add Item'}</span>
            </nav>

            <form onSubmit={submit}>
                <div className="grid lg:grid-cols-3 gap-6 items-start">

                    {/* ── Left: form sections (2/3) ─────────────────── */}
                    <div className="lg:col-span-2 space-y-5">

                        {errors.general && (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{errors.general}
                            </div>
                        )}

                        {/* Section 1 — Identification */}
                        <Section icon={Barcode} iconBg="bg-blue-100" iconColor="text-blue-600" title="Identification" subtitle="Barcode and call numbers for cataloging">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Barcode" hint="Required for checkout scanning" error={errors.barcode}>
                                    <input type="text" value={data.barcode} onChange={e => setData('barcode', e.target.value)}
                                        placeholder="e.g. BC001234" className={inputCls(errors.barcode) + ' font-mono'} />
                                </Field>
                                <Field label="Accession Number" error={errors.accession_number}>
                                    <input type="text" value={data.accession_number} onChange={e => setData('accession_number', e.target.value)}
                                        placeholder="e.g. 2026-001" className={inputCls(errors.accession_number)} />
                                </Field>
                            </div>
                            <Field label="Call Number" error={errors.call_number}>
                                <input type="text" value={data.call_number} onChange={e => setData('call_number', e.target.value)}
                                    placeholder="e.g. 005.133 SMI" className={inputCls(errors.call_number) + ' font-mono'} />
                            </Field>
                        </Section>

                        {/* Section 2 — Location */}
                        <Section icon={MapPin} iconBg="bg-emerald-100" iconColor="text-emerald-600" title="Location" subtitle="Where this copy is shelved">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Collection" error={errors.collection_id}>
                                    <select value={data.collection_id} onChange={e => setData('collection_id', e.target.value)} className={inputCls(errors.collection_id)}>
                                        <option value="">— Select collection —</option>
                                        {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </Field>
                                <Field label="Location" error={errors.location_id}>
                                    <select value={data.location_id} onChange={e => setData('location_id', e.target.value)} className={inputCls(errors.location_id)}>
                                        <option value="">— Select location —</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </Field>
                            </div>
                            <Field label="Shelf / Shelf Mark" error={errors.shelf}>
                                <input type="text" value={data.shelf} onChange={e => setData('shelf', e.target.value)}
                                    placeholder="e.g. A3, Row 2" className={inputCls(errors.shelf)} />
                            </Field>
                        </Section>

                        {/* Section 3 — Condition & Status */}
                        <Section icon={Star} iconBg="bg-amber-100" iconColor="text-amber-600" title="Condition & Status" subtitle="Physical state and circulation status">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Condition</label>
                                <div className="flex flex-wrap gap-2">
                                    {CONDITIONS.map(c => (
                                        <button key={c} type="button" onClick={() => setData('condition', c)}
                                            className={`px-4 py-2 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                                                data.condition === c
                                                    ? `${CONDITION_STYLES[c]} ring-2`
                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                                            }`}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {isEdit && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Item Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ITEM_STATUSES.map(s => (
                                            <button key={s} type="button" onClick={() => setData('item_status', s)}
                                                className={`px-4 py-2 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                                                    data.item_status === s
                                                        ? `${STATUS_STYLES[s]} ring-2`
                                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                                                }`}>
                                                {s.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Section>

                        {/* Section 4 — Acquisition */}
                        <Section icon={ShoppingBag} iconBg="bg-violet-100" iconColor="text-violet-600" title="Acquisition" subtitle="Purchase info and cost tracking">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Price (USD)" error={errors.price}>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                        <input type="number" min="0" step="0.01" value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            placeholder="0.00" className={inputCls(errors.price) + ' pl-7'} />
                                    </div>
                                </Field>
                                <Field label="Acquired Date" error={errors.acquired_date}>
                                    <input type="date" value={data.acquired_date} onChange={e => setData('acquired_date', e.target.value)}
                                        className={inputCls(errors.acquired_date)} />
                                </Field>
                                <Field label="Supplier" error={errors.supplier}>
                                    <input type="text" value={data.supplier} onChange={e => setData('supplier', e.target.value)}
                                        placeholder="Supplier name" className={inputCls(errors.supplier)} />
                                </Field>
                                <Field label="Purchase Order" error={errors.purchase_order}>
                                    <input type="text" value={data.purchase_order} onChange={e => setData('purchase_order', e.target.value)}
                                        placeholder="PO number" className={inputCls(errors.purchase_order)} />
                                </Field>
                            </div>
                        </Section>

                        {/* Section 5 — Notes */}
                        <Section icon={FileText} iconBg="bg-gray-100" iconColor="text-gray-500" title="Notes" subtitle="Internal notes about this copy">
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                                rows={3} placeholder="Any internal notes about this specific copy…"
                                className={inputCls(errors.notes)} />
                        </Section>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pb-6">
                            <button type="submit" disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm">
                                {processing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save className="w-4 h-4" />{isEdit ? 'Save Changes' : 'Add Item'}</>}
                            </button>
                            {!isEdit && biblio?.id && (
                                <button type="button" onClick={saveAndAddAnother} disabled={processing}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 border border-blue-200 text-sm font-medium rounded-xl">
                                    <PlusCircle className="w-4 h-4" /> Save &amp; add another copy
                                </button>
                            )}
                            <Link href={backHref}
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                                <ArrowLeft className="w-4 h-4" /> Cancel
                            </Link>
                        </div>
                    </div>

                    {/* ── Right: context panel (1/3) ────────────────── */}
                    <div className="space-y-4 sticky top-4">
                        {/* Book info card */}
                        {biblio ? (
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-4">
                                    <div className="flex items-center gap-2 text-blue-200 text-xs font-medium mb-1">
                                        <Info className="w-3.5 h-3.5" /> Adding copy for
                                    </div>
                                    <h3 className="text-white font-bold leading-snug text-sm">{biblio.title}</h3>
                                    {biblio.subtitle && <p className="text-blue-200 text-xs mt-1">{biblio.subtitle}</p>}
                                </div>
                                <div className="p-4 flex items-center gap-3">
                                    {biblio.cover_image_url ? (
                                        <img src={biblio.cover_image_url} alt="" className="w-12 h-16 object-cover rounded-lg flex-shrink-0 shadow" />
                                    ) : (
                                        <div className="w-12 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-6 h-6 text-blue-400" />
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 space-y-1">
                                        {biblio.isbn && <div><span className="font-medium text-gray-700">ISBN:</span> {biblio.isbn}</div>}
                                        {biblio.publication_year && <div><span className="font-medium text-gray-700">Year:</span> {biblio.publication_year}</div>}
                                        {biblio.publisher && <div><span className="font-medium text-gray-700">Publisher:</span> {biblio.publisher}</div>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">{isEdit ? 'Edit Item' : 'New Physical Item'}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Fill in the details below</div>
                                </div>
                            </div>
                        )}

                        {/* Current condition preview */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Current Selection</div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Condition</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${CONDITION_STYLES[data.condition]}`}>{data.condition}</span>
                                </div>
                                {isEdit && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Status</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${STATUS_STYLES[data.item_status]}`}>{data.item_status.replace('_', ' ')}</span>
                                    </div>
                                )}
                                {data.collection_id && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Collection</span>
                                        <span className="text-xs font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {collections.find(c => String(c.id) === String(data.collection_id))?.name ?? '—'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-900">Quick Tips</span>
                            </div>
                            <ul className="space-y-2 text-xs text-amber-800">
                                <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> Barcode is used for checkout scanning — keep it unique</li>
                                <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> Call number is typically DDC class + author code</li>
                                <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> Use "Save &amp; add another" to quickly add multiple copies</li>
                                <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> Acquisition details help with budget tracking</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

function Section({ icon: Icon, iconBg, iconColor, title, subtitle, children }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-900">{title}</div>
                    {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
                </div>
            </div>
            <div className="p-6 space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, children, error, hint }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
            {children}
            {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function inputCls(error) {
    return `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        error ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
    }`;
}
