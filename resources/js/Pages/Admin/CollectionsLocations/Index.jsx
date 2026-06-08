import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Layers, MapPin } from 'lucide-react';

export default function CollectionsLocationsIndex({ collections, locations }) {
    const [editCol, setEditCol] = useState(null);
    const [showNewCol, setShowNewCol] = useState(false);
    const [editLoc, setEditLoc] = useState(null);
    const [showNewLoc, setShowNewLoc] = useState(false);

    return (
        <AdminLayout title="Collections & Locations">
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Collections */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-500" /> Collections
                        </h2>
                        <button onClick={() => { setEditCol(null); setShowNewCol(v => !v); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                            <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                    </div>

                    {showNewCol && (
                        <CollectionForm initial={null} onClose={() => setShowNewCol(false)} isNew />
                    )}

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {collections.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">Name</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">Code</th>
                                        <th className="text-center py-2 px-3 font-medium text-gray-600">Loanable</th>
                                        <th className="text-center py-2 px-3 font-medium text-gray-600">Days</th>
                                        <th className="text-right py-2 px-3 font-medium text-gray-600">Items</th>
                                        <th className="py-2 px-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {collections.map(col => (
                                        <>
                                            <tr key={col.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                <td className="py-2 px-3 font-medium text-gray-800">{col.name}</td>
                                                <td className="py-2 px-3 font-mono text-xs text-gray-500">{col.code}</td>
                                                <td className="py-2 px-3 text-center">
                                                    <span className={`badge ${col.is_loanable ? 'badge-green' : 'badge-gray'}`}>
                                                        {col.is_loanable ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-center text-gray-600">{col.loan_period_days ?? '—'}</td>
                                                <td className="py-2 px-3 text-right text-gray-500">{col.physical_items_count ?? 0}</td>
                                                <td className="py-2 px-3">
                                                    <div className="flex gap-1 justify-end">
                                                        <button onClick={() => { setShowNewCol(false); setEditCol(col); }}
                                                            className="p-1 text-gray-400 hover:text-blue-600 rounded">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <ColDeleteButton id={col.id} />
                                                    </div>
                                                </td>
                                            </tr>
                                            {editCol?.id === col.id && (
                                                <tr key={`col-edit-${col.id}`} className="border-t border-blue-100 bg-blue-50/30">
                                                    <td colSpan={6} className="p-3">
                                                        <CollectionForm initial={col} onClose={() => setEditCol(null)} />
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-10 text-sm text-gray-400">No collections yet.</div>
                        )}
                    </div>
                </div>

                {/* Locations */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-500" /> Locations
                        </h2>
                        <button onClick={() => { setEditLoc(null); setShowNewLoc(v => !v); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                            <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                    </div>

                    {showNewLoc && (
                        <LocationForm initial={null} locations={locations} onClose={() => setShowNewLoc(false)} isNew />
                    )}

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {locations.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">Name</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">Code</th>
                                        <th className="text-center py-2 px-3 font-medium text-gray-600">Branch</th>
                                        <th className="text-center py-2 px-3 font-medium text-gray-600">Sub-locations</th>
                                        <th className="py-2 px-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations.map(loc => (
                                        <>
                                            <tr key={loc.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                <td className="py-2 px-3 font-medium text-gray-800">{loc.name}</td>
                                                <td className="py-2 px-3 font-mono text-xs text-gray-500">{loc.code ?? '—'}</td>
                                                <td className="py-2 px-3 text-center">
                                                    {loc.is_branch && <span className="badge badge-blue">Branch</span>}
                                                </td>
                                                <td className="py-2 px-3 text-center text-gray-500">{loc.children?.length ?? 0}</td>
                                                <td className="py-2 px-3">
                                                    <div className="flex gap-1 justify-end">
                                                        <button onClick={() => { setShowNewLoc(false); setEditLoc(loc); }}
                                                            className="p-1 text-gray-400 hover:text-blue-600 rounded">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <LocDeleteButton id={loc.id} />
                                                    </div>
                                                </td>
                                            </tr>
                                            {editLoc?.id === loc.id && (
                                                <tr key={`loc-edit-${loc.id}`} className="border-t border-blue-100 bg-blue-50/30">
                                                    <td colSpan={5} className="p-3">
                                                        <LocationForm initial={loc} locations={locations} onClose={() => setEditLoc(null)} />
                                                    </td>
                                                </tr>
                                            )}
                                            {/* Children */}
                                            {loc.children?.map(child => (
                                                <tr key={child.id} className="border-t border-gray-100 bg-gray-50/50 hover:bg-gray-100/50">
                                                    <td className="py-1.5 pl-8 pr-3 text-gray-600">↳ {child.name}</td>
                                                    <td className="py-1.5 px-3 font-mono text-xs text-gray-400">{child.code ?? '—'}</td>
                                                    <td className="py-1.5 px-3" />
                                                    <td className="py-1.5 px-3" />
                                                    <td className="py-1.5 px-3">
                                                        <LocDeleteButton id={child.id} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-10 text-sm text-gray-400">No locations yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function CollectionForm({ initial, onClose, isNew = false }) {
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
        <form onSubmit={submit} className="grid grid-cols-2 gap-2">
            <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Name *" required
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={data.code} onChange={e => setData('code', e.target.value)} placeholder="Code *" required
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label className="flex items-center gap-2 text-sm col-span-2">
                <input type="checkbox" checked={data.is_loanable} onChange={e => setData('is_loanable', e.target.checked)} />
                Loanable
            </label>
            <input type="number" value={data.loan_period_days} onChange={e => setData('loan_period_days', e.target.value)} placeholder="Loan days"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" step="0.01" value={data.fine_rate_per_day} onChange={e => setData('fine_rate_per_day', e.target.value)} placeholder="Fine/day"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="col-span-2 flex gap-2">
                <button type="submit" disabled={processing} className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {processing ? 'Saving…' : (isNew ? 'Create' : 'Update')}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-1.5 border border-gray-300 text-xs rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
        </form>
    );
}

function LocationForm({ initial, locations, onClose, isNew = false }) {
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
        <form onSubmit={submit} className="grid grid-cols-2 gap-2">
            <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Name *" required
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={data.code} onChange={e => setData('code', e.target.value)} placeholder="Code"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={data.parent_id} onChange={e => setData('parent_id', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— No parent (top-level) —</option>
                {locations.filter(l => l.id !== initial?.id).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={data.is_branch} onChange={e => setData('is_branch', e.target.checked)} />
                Is a branch
            </label>
            <input value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Address"
                className="col-span-2 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="col-span-2 flex gap-2">
                <button type="submit" disabled={processing} className="px-4 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-60">
                    {processing ? 'Saving…' : (isNew ? 'Create' : 'Update')}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-1.5 border border-gray-300 text-xs rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
        </form>
    );
}

function ColDeleteButton({ id }) {
    const { delete: destroy, processing } = useForm();
    return (
        <button onClick={() => { if (confirm('Delete this collection?')) destroy(route('admin.collections-locations.collections.destroy', id)); }}
            disabled={processing} className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}

function LocDeleteButton({ id }) {
    const { delete: destroy, processing } = useForm();
    return (
        <button onClick={() => { if (confirm('Delete this location?')) destroy(route('admin.collections-locations.locations.destroy', id)); }}
            disabled={processing} className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}
