import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import axios from 'axios';
import {
    Trash2, ChevronRight, ChevronLeft, CheckCircle2, XCircle,
    AlertTriangle, Loader2, RotateCcw, BookOpen, ArrowLeft, Shield, Zap, Check
} from 'lucide-react';

const STATUS_BADGE = {
    available: 'bg-emerald-100 text-emerald-700', checked_out: 'bg-blue-100 text-blue-700',
    in_repair: 'bg-amber-100 text-amber-700', lost: 'bg-red-100 text-red-700',
    missing: 'bg-orange-100 text-orange-700', withdrawn: 'bg-gray-100 text-gray-500',
};

const STEPS = ['Input Barcodes', 'Preview & Select', 'Confirm Delete'];

export default function ItemDeletion() {
    const [step, setStep]           = useState(0);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading]     = useState(false);
    const [items, setItems]         = useState([]);
    const [notFound, setNotFound]   = useState([]);
    const [selected, setSelected]   = useState(new Set());
    const [hardDelete, setHardDelete] = useState(false);
    const [result, setResult]       = useState(null);
    const [applying, setApplying]   = useState(false);

    const resolve = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.post(route('admin.batch.resolve-barcodes'), { barcodes: inputText });
            setItems(res.data.items ?? []);
            setNotFound(res.data.not_found ?? []);
            // Pre-select only non-checked-out items
            setSelected(new Set((res.data.items ?? []).filter(i => i.item_status !== 'checked_out').map(i => i.id)));
            setStep(1);
        } finally { setLoading(false); }
    }, [inputText]);

    const toggleAll  = () => {
        const eligible = items.filter(i => i.item_status !== 'checked_out').map(i => i.id);
        setSelected(selected.size === eligible.length ? new Set() : new Set(eligible));
    };
    const toggleRow  = (id, status) => {
        if (status === 'checked_out') return;
        const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
    };

    const apply = async () => {
        setApplying(true);
        try {
            const res = await axios.post(route('admin.batch.apply-item-deletion'), {
                item_ids: [...selected], hard_delete: hardDelete,
            });
            setResult({ success: true, message: res.data.message });
            setStep(3);
        } catch (e) {
            setResult({ success: false, message: e.response?.data?.error ?? 'Failed.' });
            setStep(3);
        } finally { setApplying(false); }
    };

    const checkedOut = items.filter(i => i.item_status === 'checked_out');

    return (
        <AdminLayout title="Batch Item Deletion">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.get(route('admin.batch.index'))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Batch Item Deletion</h1>
                        <p className="text-xs text-gray-500">Checked-out items are always protected</p>
                    </div>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-0">
                    {STEPS.map((label, i) => {
                        const done = step > i, active = step === i;
                        return (
                            <div key={i} className="flex items-center flex-1 last:flex-none">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${done ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-red-100 text-red-700 ring-2 ring-red-300' : 'bg-gray-100 text-gray-400'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${done ? 'bg-emerald-500 text-white' : active ? 'bg-red-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        {done ? <Check className="w-3 h-3" /> : i + 1}
                                    </div>
                                    <span className="hidden sm:inline">{label}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${step > i ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                            </div>
                        );
                    })}
                </div>

                {step === 0 && (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                            <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700"><span className="font-bold">Checked-out items are always excluded</span> — you cannot delete an item that is currently on loan.</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-600" /></div>
                                <div className="text-sm font-bold text-gray-900">Enter Barcodes to Delete</div>
                            </div>
                            <div className="p-6 space-y-4">
                                <textarea value={inputText} onChange={e => setInputText(e.target.value)}
                                    placeholder="Paste barcodes — one per line or comma-separated" rows={8}
                                    className="w-full font-mono text-sm px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
                                <div className="flex justify-end">
                                    <button onClick={resolve} disabled={loading || !inputText.trim()}
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                        Load Items
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4">
                        {checkedOut.length > 0 && (
                            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
                                <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-700"><span className="font-semibold">{checkedOut.length} item(s) are on loan</span> and have been deselected automatically.</p>
                            </div>
                        )}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                <div className="text-sm font-bold text-gray-900">{items.length} items · <span className="text-red-600">{selected.size} selected for deletion</span></div>
                                <button onClick={toggleAll} className="ml-auto text-xs text-red-600 hover:underline font-medium">
                                    {selected.size === items.filter(i => i.item_status !== 'checked_out').length ? 'Deselect all' : 'Select all eligible'}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-100">
                                            <th className="py-3 px-4 w-10"></th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Barcode</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Collection</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {items.map(item => {
                                            const blocked = item.item_status === 'checked_out';
                                            return (
                                                <tr key={item.id} onClick={() => toggleRow(item.id, item.item_status)}
                                                    className={`transition-colors ${blocked ? 'opacity-40 cursor-not-allowed' : selected.has(item.id) ? 'bg-red-50/50 cursor-pointer' : 'hover:bg-gray-50/60 cursor-pointer'}`}>
                                                    <td className="py-3 px-4">
                                                        <input type="checkbox" checked={selected.has(item.id)} disabled={blocked} onChange={() => toggleRow(item.id, item.item_status)} className="rounded accent-red-600" />
                                                    </td>
                                                    <td className="py-3 px-3 font-mono text-xs text-gray-700">{item.barcode}</td>
                                                    <td className="py-3 px-3 max-w-xs">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-7 bg-gradient-to-b from-gray-100 to-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                                                                <BookOpen className="w-2.5 h-2.5 text-gray-400" />
                                                            </div>
                                                            <span className="text-xs text-gray-700 truncate">{item.title ?? '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[item.item_status] ?? 'bg-gray-100 text-gray-500'}`}>
                                                            {item.item_status?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-xs text-gray-500">{item.collection ?? '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Delete type toggle */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Delete type</p>
                                <p className="text-xs text-gray-400 mt-0.5">Soft delete keeps records recoverable · Hard delete is permanent</p>
                            </div>
                            <div className="ml-auto flex gap-2">
                                {[{ v: false, l: 'Soft Delete' }, { v: true, l: 'Hard Delete' }].map(({ v, l }) => (
                                    <button key={l} onClick={() => setHardDelete(v)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${hardDelete === v ? (v ? 'bg-red-100 border-red-400 text-red-700 ring-2 ring-red-200' : 'bg-gray-100 border-gray-400 text-gray-700') : 'border-gray-200 text-gray-400'}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            <button onClick={() => setStep(2)} disabled={selected.size === 0}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl">
                                Delete {selected.size} item(s) <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-lg mx-auto space-y-4">
                        <div className="bg-white border-2 border-red-200 rounded-2xl p-8 text-center shadow-sm">
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-black text-red-800">Confirm Deletion</h2>
                            <p className="text-gray-500 text-sm mt-2">
                                You are about to <span className="font-bold text-red-700">{hardDelete ? 'permanently' : 'soft'} delete</span> <span className="font-bold text-gray-800">{selected.size} item(s)</span>.
                            </p>
                            {hardDelete && <p className="text-red-500 text-xs mt-1 font-medium">Hard delete cannot be undone.</p>}
                            <div className="flex gap-3 mt-6 justify-center">
                                <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                                    <ChevronLeft className="w-4 h-4 inline" /> Back
                                </button>
                                <button onClick={apply} disabled={applying}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl">
                                    {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && result && (
                    <div className="flex flex-col items-center py-12 gap-5">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${result.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            {result.success ? <CheckCircle2 className="w-10 h-10 text-emerald-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
                        </div>
                        <div className="text-center">
                            <h2 className={`text-xl font-black ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>{result.success ? 'Done!' : 'Error'}</h2>
                            <p className="text-gray-500 text-sm mt-1">{result.message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setStep(0); setInputText(''); setItems([]); setSelected(new Set()); setResult(null); }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl">
                                <RotateCcw className="w-4 h-4" /> New Batch
                            </button>
                            <button onClick={() => router.get(route('admin.batch.index'))}
                                className="px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                                Back to Tools
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
