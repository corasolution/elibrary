import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { ChevronRight, BookOpen, Info } from 'lucide-react';

const CONDITIONS   = ['excellent', 'good', 'fair', 'poor'];
const ITEM_STATUSES = ['available', 'checked_out', 'on_hold', 'in_repair', 'lost', 'withdrawn'];

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
        if (isEdit) {
            put(route('admin.items.update', item.id));
        } else {
            transform(d => ({ ...d, add_another: false }));
            post(route('admin.items.store'));
        }
    };

    // Save this copy, then return to a blank Add-Item form for the same title —
    // the fast, safe way to add multiple copies (each with its own barcode).
    const saveAndAddAnother = () => {
        transform(d => ({ ...d, add_another: true }));
        post(route('admin.items.store'), {
            onFinish: () => transform(d => ({ ...d, add_another: false })),
        });
    };

    const backHref = biblio?.id
        ? route('admin.catalog.show', biblio.id)
        : route('admin.items.index');

    return (
        <AdminLayout title={isEdit ? 'Edit Item' : 'Add Physical Item'}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
                <Link href={route('admin.catalog.index')} className="hover:text-gray-700">Catalog</Link>
                {biblio && (
                    <>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link href={route('admin.catalog.show', biblio.id)} className="hover:text-gray-700 line-clamp-1 max-w-[200px]">
                            {biblio.title}
                        </Link>
                    </>
                )}
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium">{isEdit ? 'Edit Item' : 'Add Item'}</span>
            </nav>

            <div className="max-w-2xl">
                {/* Bibliographic context banner */}
                {biblio && (
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
                        {biblio.cover_image_url ? (
                            <img src={biblio.cover_image_url} alt=""
                                className="w-10 h-14 object-cover rounded flex-shrink-0 bg-gray-100" />
                        ) : (
                            <div className="w-10 h-14 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-0.5">
                                <Info className="w-3.5 h-3.5" />
                                Adding a copy for:
                            </div>
                            <div className="text-sm font-semibold text-blue-900 leading-snug">{biblio.title}</div>
                            {biblio.subtitle && (
                                <div className="text-xs text-blue-700 mt-0.5">{biblio.subtitle}</div>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                            {errors.general}
                        </div>
                    )}

                    <input type="hidden" name="biblio_id" value={data.biblio_id} />

                    {/* Barcode + Accession */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Barcode" required={false} error={errors.barcode}>
                            <input
                                type="text"
                                value={data.barcode}
                                onChange={e => setData('barcode', e.target.value)}
                                placeholder="e.g. BC001234"
                                className={inputCls(errors.barcode) + ' font-mono'}
                            />
                            <p className="text-xs text-gray-400 mt-1">Required for checkout scanning.</p>
                        </Field>
                        <Field label="Accession Number" error={errors.accession_number}>
                            <input
                                type="text"
                                value={data.accession_number}
                                onChange={e => setData('accession_number', e.target.value)}
                                placeholder="e.g. 2026-001"
                                className={inputCls(errors.accession_number)}
                            />
                        </Field>
                    </div>

                    {/* Call Number */}
                    <Field label="Call Number" error={errors.call_number}>
                        <input
                            type="text"
                            value={data.call_number}
                            onChange={e => setData('call_number', e.target.value)}
                            placeholder="e.g. 005.133 SMI"
                            className={inputCls(errors.call_number)}
                        />
                    </Field>

                    {/* Collection + Location */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Collection" error={errors.collection_id}>
                            <select
                                value={data.collection_id}
                                onChange={e => setData('collection_id', e.target.value)}
                                className={inputCls(errors.collection_id)}>
                                <option value="">— Select collection —</option>
                                {collections.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Location" error={errors.location_id}>
                            <select
                                value={data.location_id}
                                onChange={e => setData('location_id', e.target.value)}
                                className={inputCls(errors.location_id)}>
                                <option value="">— Select location —</option>
                                {locations.map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Shelf */}
                    <Field label="Shelf" error={errors.shelf}>
                        <input
                            type="text"
                            value={data.shelf}
                            onChange={e => setData('shelf', e.target.value)}
                            placeholder="e.g. A3, Row 2"
                            className={inputCls(errors.shelf)}
                        />
                    </Field>

                    {/* Status + Condition */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {isEdit && (
                            <Field label="Item Status" error={errors.item_status}>
                                <select
                                    value={data.item_status}
                                    onChange={e => setData('item_status', e.target.value)}
                                    className={inputCls(errors.item_status)}>
                                    {ITEM_STATUSES.map(s => (
                                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </Field>
                        )}
                        <Field label="Condition" error={errors.condition}>
                            <select
                                value={data.condition}
                                onChange={e => setData('condition', e.target.value)}
                                className={inputCls(errors.condition)}>
                                {CONDITIONS.map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Price + Acquired Date */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Price (USD)" error={errors.price}>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.price}
                                onChange={e => setData('price', e.target.value)}
                                placeholder="0.00"
                                className={inputCls(errors.price)}
                            />
                        </Field>
                        <Field label="Acquired Date" error={errors.acquired_date}>
                            <input
                                type="date"
                                value={data.acquired_date}
                                onChange={e => setData('acquired_date', e.target.value)}
                                className={inputCls(errors.acquired_date)}
                            />
                        </Field>
                    </div>

                    {/* Supplier + PO */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Supplier" error={errors.supplier}>
                            <input
                                type="text"
                                value={data.supplier}
                                onChange={e => setData('supplier', e.target.value)}
                                className={inputCls(errors.supplier)}
                            />
                        </Field>
                        <Field label="Purchase Order" error={errors.purchase_order}>
                            <input
                                type="text"
                                value={data.purchase_order}
                                onChange={e => setData('purchase_order', e.target.value)}
                                className={inputCls(errors.purchase_order)}
                            />
                        </Field>
                    </div>

                    {/* Notes */}
                    <Field label="Notes" error={errors.notes}>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows={3}
                            className={inputCls(errors.notes)}
                        />
                    </Field>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
                            {processing ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
                        </button>
                        {!isEdit && biblio?.id && (
                            <button
                                type="button"
                                onClick={saveAndAddAnother}
                                disabled={processing}
                                className="px-5 py-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 border border-blue-200 text-sm font-medium rounded-lg">
                                Save &amp; add another copy
                            </button>
                        )}
                        <Link href={backHref}
                            className="px-5 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

function Field({ label, children, error, required = false }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}

function inputCls(error) {
    return `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
    }`;
}
