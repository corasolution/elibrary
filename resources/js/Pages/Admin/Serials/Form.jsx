import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';

const FREQUENCIES = ['daily','weekly','biweekly','monthly','bimonthly','quarterly','semiannual','annual'];

export default function SerialForm({ serial, biblios = [], locations = [], collections = [], frequencies = [] }) {
    const isEdit = !!serial;
    const { data, setData, post, processing, errors } = useForm({
        biblio_id:           serial?.biblio_id ?? '',
        issn:                serial?.bibliographic_record?.issn ?? '',
        frequency:           serial?.frequency ?? 'monthly',
        start_date:          serial?.start_date ?? new Date().toISOString().substring(0,10),
        end_date:            serial?.end_date ?? '',
        subscription_expiry: serial?.subscription_expiry ?? '',
        supplier:            serial?.supplier ?? '',
        subscription_cost:   serial?.subscription_cost ?? '',
        currency:            serial?.currency ?? 'USD',
        location_id:         serial?.location_id ?? '',
        collection_id:       serial?.collection_id ?? '',
        call_number:         serial?.call_number ?? '',
        notes:               serial?.notes ?? '',
        generate_issues:     !isEdit,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('admin.serials.update', serial.id), { _method: 'PUT' });
        } else {
            post(route('admin.serials.store'));
        }
    };

    return (
        <AdminLayout title={isEdit ? 'Edit Subscription' : 'New Subscription'}>
            <div className="max-w-2xl">
                <form onSubmit={submit} className="space-y-5">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">Subscription Details</h2>

                        <Field label="Bibliographic Record" error={errors.biblio_id} required>
                            <select value={data.biblio_id} onChange={e => setData('biblio_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">— Select journal/magazine title —</option>
                                {biblios.map(b => <option key={b.id} value={b.id}>{b.title}{b.issn ? ` (${b.issn})` : ''}</option>)}
                            </select>
                        </Field>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Frequency" error={errors.frequency} required>
                                <select value={data.frequency} onChange={e => setData('frequency', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {(frequencies.length ? frequencies : FREQUENCIES.map(f => ({ value: f, label: f }))).map(f => (
                                        <option key={f.value ?? f} value={f.value ?? f}>{f.label ?? f}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Supplier">
                                <input type="text" value={data.supplier} onChange={e => setData('supplier', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </Field>
                            <Field label="Start Date" error={errors.start_date} required>
                                <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </Field>
                            <Field label="Subscription Expiry">
                                <input type="date" value={data.subscription_expiry} onChange={e => setData('subscription_expiry', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </Field>
                            <Field label="Annual Cost">
                                <input type="number" step="0.01" min="0" value={data.subscription_cost} onChange={e => setData('subscription_cost', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </Field>
                            <Field label="Currency">
                                <select value={data.currency} onChange={e => setData('currency', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {['USD','KHR','EUR','GBP','THB'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </Field>
                            <Field label="Location">
                                <select value={data.location_id} onChange={e => setData('location_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">— None —</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Collection">
                                <select value={data.collection_id} onChange={e => setData('collection_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">— None —</option>
                                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </Field>
                        </div>

                        <Field label="Call Number">
                            <input type="text" value={data.call_number} onChange={e => setData('call_number', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </Field>

                        <Field label="Notes">
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </Field>

                        {!isEdit && (
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={data.generate_issues} onChange={e => setData('generate_issues', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                Auto-generate expected issues from start date to expiry
                            </label>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" disabled={processing}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                            {processing ? 'Saving…' : (isEdit ? 'Update Subscription' : 'Create Subscription')}
                        </button>
                        <button type="button" onClick={() => router.get(route('admin.serials.index'))}
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
