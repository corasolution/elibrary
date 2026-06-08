import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const STATUSES = ['pending','ordered','partial','received','cancelled'];
const CURRENCIES = ['USD','KHR','EUR','GBP','THB'];

export default function AcquisitionForm({ order, biblios = [] }) {
    const isEdit = !!order;
    const { data, setData, post, put, processing, errors } = useForm({
        order_number:  order?.order_number ?? '',
        supplier:      order?.supplier ?? '',
        order_date:    order?.order_date ?? new Date().toISOString().substring(0,10),
        expected_date: order?.expected_date ?? '',
        status:        order?.status ?? 'pending',
        total_amount:  order?.total_amount ?? '',
        currency:      order?.currency ?? 'USD',
        notes:         order?.notes ?? '',
        items:         order?.items ?? [{ biblio_id: '', quantity: 1, unit_price: '' }],
    });

    const addItem = () => setData('items', [...data.items, { biblio_id: '', quantity: 1, unit_price: '' }]);
    const removeItem = (i) => setData('items', data.items.filter((_, idx) => idx !== i));
    const updateItem = (i, field, val) => {
        const items = [...data.items];
        items[i] = { ...items[i], [field]: val };
        setData('items', items);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('admin.acquisitions.update', order.id), { _method: 'PUT' });
        } else {
            post(route('admin.acquisitions.store'));
        }
    };

    return (
        <AdminLayout title={isEdit ? 'Edit Order' : 'New Purchase Order'}>
            <div className="max-w-3xl">
                <form onSubmit={submit} className="space-y-5">
                    {/* Order header */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">Order Information</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Order Number" error={errors.order_number} required>
                                <input type="text" value={data.order_number} onChange={e => setData('order_number', e.target.value)}
                                    placeholder="PO-2024-001"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </Field>
                            <Field label="Supplier">
                                <input type="text" value={data.supplier} onChange={e => setData('supplier', e.target.value)}
                                    placeholder="Publisher / Distributor name"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </Field>
                            <Field label="Order Date" required>
                                <input type="date" value={data.order_date} onChange={e => setData('order_date', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </Field>
                            <Field label="Expected Date">
                                <input type="date" value={data.expected_date} onChange={e => setData('expected_date', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </Field>
                            <Field label="Status">
                                <select value={data.status} onChange={e => setData('status', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                            </Field>
                            <Field label="Currency">
                                <select value={data.currency} onChange={e => setData('currency', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </Field>
                        </div>
                        <Field label="Notes">
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </Field>
                    </div>

                    {/* Line items */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-700">Order Items</h2>
                            <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>
                        <div className="space-y-3">
                            {data.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-start">
                                    <div>
                                        {biblios.length > 0 ? (
                                            <select value={item.biblio_id} onChange={e => updateItem(i, 'biblio_id', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">— Select title —</option>
                                                {biblios.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                            </select>
                                        ) : (
                                            <input type="text" value={item.biblio_id} onChange={e => updateItem(i, 'biblio_id', e.target.value)}
                                                placeholder="Title / ISBN"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        )}
                                    </div>
                                    <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                                        placeholder="Qty"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
                                    <input type="number" step="0.01" min="0" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)}
                                        placeholder="Unit price"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <button type="button" onClick={() => removeItem(i)} className="p-2 text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Auto total */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                            <div className="text-sm">
                                <span className="text-gray-500 mr-3">Estimated Total:</span>
                                <span className="font-semibold text-gray-900">
                                    {data.currency} {data.items.reduce((sum, it) => sum + (Number(it.quantity||0) * Number(it.unit_price||0)), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" disabled={processing}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                            {processing ? 'Saving…' : (isEdit ? 'Update Order' : 'Create Order')}
                        </button>
                        <button type="button" onClick={() => router.get(route('admin.acquisitions.index'))}
                            className="px-5 py-2 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

function Field({ label, children, error, required }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
