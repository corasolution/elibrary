import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';

const EMPTY = { name: '', name_km: '', loan_limit: 5, loan_period_days: 14, renewals_allowed: 2, reservation_limit: 3, fine_rate_per_day: '0.10' };

export default function PatronCategoriesIndex({ categories }) {
    const [editing, setEditing] = useState(null);
    const [showNew, setShowNew] = useState(false);

    return (
        <AdminLayout title="Patron Categories">
            <div className="max-w-4xl space-y-4">
                <div className="flex justify-end">
                    <button onClick={() => { setEditing(null); setShowNew(true); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4" /> New Category
                    </button>
                </div>

                {(showNew && !editing) && (
                    <CategoryForm
                        initial={EMPTY}
                        onCancel={() => setShowNew(false)}
                        onSaved={() => setShowNew(false)}
                        isNew
                    />
                )}

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <h2 className="text-sm font-semibold text-gray-700">Categories</h2>
                    </div>
                    {categories.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600">Name</th>
                                    <th className="text-center py-2 px-4 font-medium text-gray-600">Loan Limit</th>
                                    <th className="text-center py-2 px-4 font-medium text-gray-600">Loan Days</th>
                                    <th className="text-center py-2 px-4 font-medium text-gray-600">Renewals</th>
                                    <th className="text-center py-2 px-4 font-medium text-gray-600">Reservations</th>
                                    <th className="text-right py-2 px-4 font-medium text-gray-600">Fine/day</th>
                                    <th className="text-right py-2 px-4 font-medium text-gray-600">Patrons</th>
                                    <th className="py-2 px-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <>
                                        <tr key={cat.id} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="py-2 px-4 font-medium text-gray-800">
                                                {cat.name}
                                                {cat.name_km && <div className="text-xs text-gray-400 font-normal font-khmer">{cat.name_km}</div>}
                                            </td>
                                            <td className="py-2 px-4 text-center">{cat.loan_limit}</td>
                                            <td className="py-2 px-4 text-center">{cat.loan_period_days}</td>
                                            <td className="py-2 px-4 text-center">{cat.renewals_allowed}</td>
                                            <td className="py-2 px-4 text-center">{cat.reservation_limit}</td>
                                            <td className="py-2 px-4 text-right">${Number(cat.fine_rate_per_day).toFixed(2)}</td>
                                            <td className="py-2 px-4 text-right text-gray-500">{cat.patrons_count ?? 0}</td>
                                            <td className="py-2 px-4">
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => { setShowNew(false); setEditing(cat); }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <DeleteButton id={cat.id} />
                                                </div>
                                            </td>
                                        </tr>
                                        {editing?.id === cat.id && (
                                            <tr key={`edit-${cat.id}`} className="border-t border-blue-100 bg-blue-50/40">
                                                <td colSpan={8} className="p-4">
                                                    <CategoryForm
                                                        initial={editing}
                                                        onCancel={() => setEditing(null)}
                                                        onSaved={() => setEditing(null)}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12 text-sm text-gray-400">No categories yet.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function CategoryForm({ initial, onCancel, onSaved, isNew = false }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({ ...initial });

    const submit = (e) => {
        e.preventDefault();
        if (isNew) {
            post(route('admin.patron-categories.store'), { onSuccess: () => { reset(); onSaved(); } });
        } else {
            put(route('admin.patron-categories.update', initial.id), { onSuccess: onSaved });
        }
    };

    return (
        <form onSubmit={submit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                <input value={data.name} onChange={e => setData('name', e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
            </div>
            <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Name (Khmer)</label>
                <input value={data.name_km} onChange={e => setData('name_km', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-khmer focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {[
                { key: 'loan_limit', label: 'Loan Limit' },
                { key: 'loan_period_days', label: 'Loan Days' },
                { key: 'renewals_allowed', label: 'Renewals' },
                { key: 'reservation_limit', label: 'Reservations' },
                { key: 'fine_rate_per_day', label: 'Fine/day ($)', step: '0.01' },
            ].map(f => (
                <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                    <input type="number" min="0" step={f.step ?? '1'} value={data[f.key]} onChange={e => setData(f.key, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            ))}
            <div className="lg:col-span-4 flex gap-2 pt-1">
                <button type="submit" disabled={processing}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {processing ? 'Saving…' : (isNew ? 'Create' : 'Update')}
                </button>
                <button type="button" onClick={onCancel}
                    className="px-4 py-1.5 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </form>
    );
}

function DeleteButton({ id }) {
    const { delete: destroy, processing } = useForm();
    return (
        <button onClick={() => { if (confirm('Delete this category?')) destroy(route('admin.patron-categories.destroy', id)); }}
            disabled={processing} className="p-1.5 text-gray-400 hover:text-red-600 rounded disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}
