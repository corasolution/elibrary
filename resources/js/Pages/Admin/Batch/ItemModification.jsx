import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    Edit3, Scan, Upload, FileText, ChevronRight, ChevronLeft,
    CheckCircle2, XCircle, AlertTriangle, Loader2, X, ArrowLeft,
    BookOpen, MapPin, Tag, Star, Hash, Layers, RotateCcw, Zap,
    Info, Check
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────
const ITEM_STATUSES = [
    { value: 'available',   label: 'Available',    color: 'bg-emerald-100 text-emerald-700' },
    { value: 'in_repair',   label: 'In Repair',    color: 'bg-amber-100 text-amber-700' },
    { value: 'lost',        label: 'Lost',         color: 'bg-red-100 text-red-700' },
    { value: 'missing',     label: 'Missing',      color: 'bg-orange-100 text-orange-700' },
    { value: 'withdrawn',   label: 'Withdrawn',    color: 'bg-gray-100 text-gray-500' },
    { value: 'on_order',    label: 'On Order',     color: 'bg-blue-100 text-blue-700' },
];

const CONDITIONS = [
    { value: 'excellent', label: 'Excellent', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'good',      label: 'Good',      color: 'bg-blue-100 text-blue-700' },
    { value: 'fair',      label: 'Fair',      color: 'bg-amber-100 text-amber-700' },
    { value: 'poor',      label: 'Poor',      color: 'bg-red-100 text-red-700' },
];

const STATUS_BADGE = {
    available: 'bg-emerald-100 text-emerald-700', checked_out: 'bg-blue-100 text-blue-700',
    in_repair: 'bg-amber-100 text-amber-700', lost: 'bg-red-100 text-red-700',
    missing: 'bg-orange-100 text-orange-700', withdrawn: 'bg-gray-100 text-gray-500',
    on_hold: 'bg-violet-100 text-violet-700', on_order: 'bg-sky-100 text-sky-700',
};

// ── Steps ────────────────────────────────────────────────────────────────────
const STEPS = ['Input Barcodes', 'Preview & Select', 'Set Changes', 'Confirm & Apply'];

export default function ItemModification({ collections = [], locations = [] }) {
    const [step, setStep]             = useState(0);   // 0-3
    const [inputText, setInputText]   = useState('');
    const [loading, setLoading]       = useState(false);
    const [items, setItems]           = useState([]);
    const [notFound, setNotFound]     = useState([]);
    const [selected, setSelected]     = useState(new Set());
    const [fields, setFields]         = useState({
        item_status:   { enabled: false, value: '' },
        collection_id: { enabled: false, value: '' },
        location_id:   { enabled: false, value: '' },
        condition:     { enabled: false, value: '' },
        call_number:   { enabled: false, value: '' },
        shelf:         { enabled: false, value: '' },
    });
    const [result, setResult]         = useState(null);
    const [applying, setApplying]     = useState(false);
    const barcodeInputRef = useRef(null);
    const [scanMode, setScanMode]     = useState(false);
    const [scanBuffer, setScanBuffer] = useState('');

    // ── Step 1: resolve barcodes ──────────────────────────────────────────────
    const resolve = useCallback(async () => {
        if (!inputText.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(route('admin.batch.resolve-barcodes'), { barcodes: inputText });
            setItems(res.data.items ?? []);
            setNotFound(res.data.not_found ?? []);
            setSelected(new Set((res.data.items ?? []).map(i => i.id)));
            setStep(1);
        } catch { /* handled below */ }
        finally { setLoading(false); }
    }, [inputText]);

    // ── Step 2: toggle row selection ─────────────────────────────────────────
    const toggleAll = () => setSelected(selected.size === items.length ? new Set() : new Set(items.map(i => i.id)));
    const toggleRow = (id) => {
        const s = new Set(selected);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelected(s);
    };

    // ── Step 3: field helpers ─────────────────────────────────────────────────
    const setField = (key, prop, val) =>
        setFields(f => ({ ...f, [key]: { ...f[key], [prop]: val } }));

    const enabledChanges = Object.entries(fields).filter(([, v]) => v.enabled && v.value !== '');

    // ── Step 4: apply ─────────────────────────────────────────────────────────
    const apply = async () => {
        setApplying(true);
        try {
            const payload = {};
            enabledChanges.forEach(([k, v]) => { payload[k] = v.value; });
            const res = await axios.post(route('admin.batch.apply-item-modification'), {
                item_ids: [...selected],
                fields: payload,
            });
            setResult({ success: true, message: res.data.message, count: res.data.updated });
            setStep(4);
        } catch (e) {
            setResult({ success: false, message: e.response?.data?.error ?? 'Failed to apply changes.' });
        } finally { setApplying(false); }
    };

    // ── Scan mode ─────────────────────────────────────────────────────────────
    const handleScanKey = (e) => {
        if (e.key === 'Enter' && scanBuffer.trim()) {
            setInputText(p => p ? p + '\n' + scanBuffer.trim() : scanBuffer.trim());
            setScanBuffer('');
        }
    };

    const activeChangesCount = enabledChanges.length;

    return (
        <AdminLayout title="Batch Item Modification">
            <div className="space-y-6">

                {/* Page header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.get(route('admin.batch.index'))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Batch Item Modification</h1>
                        <p className="text-xs text-gray-500">Modify multiple physical items at once</p>
                    </div>
                </div>

                {/* Step indicators */}
                <div className="flex items-center gap-0">
                    {STEPS.map((label, i) => {
                        const done    = step > i;
                        const active  = step === i;
                        const future  = step < i;
                        return (
                            <div key={i} className="flex items-center flex-1 last:flex-none">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                    done   ? 'bg-emerald-100 text-emerald-700' :
                                    active ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' :
                                             'bg-gray-100 text-gray-400'
                                }`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                                        done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-500 text-white' : 'bg-gray-300 text-white'
                                    }`}>
                                        {done ? <Check className="w-3 h-3" /> : i + 1}
                                    </div>
                                    <span className="hidden sm:inline">{label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`h-0.5 flex-1 mx-1 ${step > i ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Step 0: Input ──────────────────────────────────────────── */}
                {step === 0 && (
                    <div className="grid lg:grid-cols-3 gap-6 items-start">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center"><Scan className="w-4 h-4 text-blue-600" /></div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Enter Barcodes</div>
                                        <div className="text-xs text-gray-500">Paste, type, or scan barcodes — one per line or comma-separated</div>
                                    </div>
                                    <div className="ml-auto flex gap-2">
                                        <button onClick={() => setScanMode(!scanMode)}
                                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${scanMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                            <Scan className="w-3 h-3" /> {scanMode ? 'Scanning…' : 'Scan Mode'}
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {scanMode && (
                                        <div className="flex gap-2">
                                            <input ref={barcodeInputRef} value={scanBuffer}
                                                onChange={e => setScanBuffer(e.target.value)}
                                                onKeyDown={handleScanKey}
                                                placeholder="Scan barcode → auto-adds on Enter"
                                                className="flex-1 font-mono text-sm px-4 py-2.5 border-2 border-blue-200 focus:border-blue-400 focus:outline-none rounded-xl"
                                                autoFocus />
                                            <span className="text-xs text-blue-500 self-center">Press Enter or scan</span>
                                        </div>
                                    )}
                                    <textarea value={inputText} onChange={e => setInputText(e.target.value)}
                                        placeholder={"BC001\nBC002\nBC003\n\n— or paste a CSV column —\n\nB100,B101,B102"}
                                        rows={10}
                                        className="w-full font-mono text-sm px-4 py-3 border border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:outline-none rounded-xl resize-none transition-colors" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">
                                            {inputText.trim() ? `${inputText.trim().split(/[\n,\s]+/).filter(Boolean).length} barcodes entered` : 'No barcodes yet'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setInputText('')} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg flex items-center gap-1">
                                                <RotateCcw className="w-3 h-3" /> Clear
                                            </button>
                                            <button onClick={resolve} disabled={loading || !inputText.trim()}
                                                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                                Load Items
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right tips */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">How to Input</div>
                            {[
                                { icon: Edit3,    title: 'Paste list',      desc: 'Copy a column from Excel/Sheets and paste — commas, spaces, newlines all work' },
                                { icon: Scan,     title: 'Barcode scanner', desc: 'Enable Scan Mode and use a USB wand — each scan is auto-added' },
                                { icon: Upload,   title: 'CSV upload',      desc: 'Export barcodes from your spreadsheet and paste the column here' },
                                { icon: FileText, title: 'Manual entry',    desc: 'Type barcodes manually, one per line' },
                            ].map(({ icon: Ico, title, desc }) => (
                                <div key={title} className="flex items-start gap-2.5">
                                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Ico className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <div><div className="text-xs font-semibold text-gray-700">{title}</div><div className="text-xs text-gray-400 mt-0.5">{desc}</div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Step 1: Preview & Select ───────────────────────────────── */}
                {step === 1 && (
                    <div className="space-y-4">
                        {notFound.length > 0 && (
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">{notFound.length} barcode(s) not found</p>
                                    <p className="text-xs text-amber-600 mt-0.5 font-mono">{notFound.slice(0, 10).join(', ')}{notFound.length > 10 ? ` +${notFound.length - 10} more` : ''}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center"><Layers className="w-4 h-4 text-violet-600" /></div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Item Preview</div>
                                    <div className="text-xs text-gray-500">{items.length} items found · {selected.size} selected</div>
                                </div>
                                <div className="ml-auto flex items-center gap-3">
                                    <button onClick={toggleAll} className="text-xs text-blue-600 hover:underline font-medium">
                                        {selected.size === items.length ? 'Deselect all' : 'Select all'}
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-100">
                                            <th className="py-3 px-4 w-10"><input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} className="rounded accent-blue-600" /></th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Barcode</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Collection</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Condition</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {items.map(item => (
                                            <tr key={item.id} onClick={() => toggleRow(item.id)}
                                                className={`cursor-pointer transition-colors ${selected.has(item.id) ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50/60'}`}>
                                                <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleRow(item.id)} className="rounded accent-blue-600" />
                                                </td>
                                                <td className="py-3 px-3 font-mono text-xs text-gray-700">{item.barcode}</td>
                                                <td className="py-3 px-3 max-w-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-7 bg-gradient-to-b from-blue-100 to-blue-200 rounded flex-shrink-0 flex items-center justify-center">
                                                            <BookOpen className="w-2.5 h-2.5 text-blue-500" />
                                                        </div>
                                                        <span className="text-xs text-gray-700 truncate" title={item.title}>{item.title ?? '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-xs text-gray-500">{item.collection ?? '—'}</td>
                                                <td className="py-3 px-3">
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[item.item_status] ?? 'bg-gray-100 text-gray-500'}`}>
                                                        {item.item_status?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-xs text-gray-500 capitalize">{item.condition ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            <button onClick={() => setStep(2)} disabled={selected.size === 0}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">
                                Set Changes ({selected.size} items) <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 2: Set Changes ────────────────────────────────────── */}
                {step === 2 && (
                    <div className="grid lg:grid-cols-3 gap-6 items-start">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center"><Edit3 className="w-4 h-4 text-emerald-600" /></div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Set New Values</div>
                                        <div className="text-xs text-gray-500">Enable only the fields you want to change — disabled fields are left untouched</div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {/* Item Status */}
                                    <FieldRow icon={Tag} label="Item Status" enabled={fields.item_status.enabled}
                                        onToggle={v => setField('item_status', 'enabled', v)}>
                                        <div className="flex flex-wrap gap-2">
                                            {ITEM_STATUSES.map(s => (
                                                <button key={s.value} type="button"
                                                    onClick={() => setField('item_status', 'value', s.value)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                                                        fields.item_status.value === s.value ? `${s.color} border-current ring-2 ring-offset-1 ring-current/30` : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                    }`}>
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </FieldRow>

                                    {/* Collection */}
                                    <FieldRow icon={BookOpen} label="Collection" enabled={fields.collection_id.enabled}
                                        onToggle={v => setField('collection_id', 'enabled', v)}>
                                        <select value={fields.collection_id.value}
                                            onChange={e => setField('collection_id', 'value', e.target.value)}
                                            className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400">
                                            <option value="">— Select collection —</option>
                                            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </FieldRow>

                                    {/* Location */}
                                    <FieldRow icon={MapPin} label="Location" enabled={fields.location_id.enabled}
                                        onToggle={v => setField('location_id', 'enabled', v)}>
                                        <select value={fields.location_id.value}
                                            onChange={e => setField('location_id', 'value', e.target.value)}
                                            className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400">
                                            <option value="">— Select location —</option>
                                            {locations.map(l => <option key={l.id} value={l.id}>{l.is_branch ? '🏛 ' : ''}{l.name}</option>)}
                                        </select>
                                    </FieldRow>

                                    {/* Condition */}
                                    <FieldRow icon={Star} label="Condition" enabled={fields.condition.enabled}
                                        onToggle={v => setField('condition', 'enabled', v)}>
                                        <div className="flex flex-wrap gap-2">
                                            {CONDITIONS.map(c => (
                                                <button key={c.value} type="button"
                                                    onClick={() => setField('condition', 'value', c.value)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                                                        fields.condition.value === c.value ? `${c.color} border-current ring-2 ring-offset-1 ring-current/30` : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                    }`}>
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    </FieldRow>

                                    {/* Call Number */}
                                    <FieldRow icon={Hash} label="Call Number" enabled={fields.call_number.enabled}
                                        onToggle={v => setField('call_number', 'enabled', v)}>
                                        <input type="text" value={fields.call_number.value}
                                            onChange={e => setField('call_number', 'value', e.target.value)}
                                            placeholder="e.g. 005.133 PHP"
                                            className="w-full font-mono text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                    </FieldRow>

                                    {/* Shelf */}
                                    <FieldRow icon={Layers} label="Shelf" enabled={fields.shelf.enabled}
                                        onToggle={v => setField('shelf', 'enabled', v)}>
                                        <input type="text" value={fields.shelf.value}
                                            onChange={e => setField('shelf', 'value', e.target.value)}
                                            placeholder="e.g. A-12, Row 3"
                                            className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                    </FieldRow>
                                </div>
                            </div>
                        </div>

                        {/* Summary panel */}
                        <div className="space-y-4 sticky top-4">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-4">
                                    <h3 className="text-white font-bold text-sm">Change Summary</h3>
                                    <p className="text-emerald-100 text-xs mt-0.5">Will apply to {selected.size} item(s)</p>
                                </div>
                                <div className="p-5">
                                    {activeChangesCount === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-3">No fields enabled yet — toggle a field to include it</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {enabledChanges.map(([key, v]) => (
                                                <div key={key} className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500 capitalize">{key.replace('_id', '').replace('_', ' ')}</span>
                                                    <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded max-w-[120px] truncate">
                                                        {key === 'collection_id' ? collections.find(c => String(c.id) === v.value)?.name ?? v.value
                                                            : key === 'location_id' ? locations.find(l => String(l.id) === v.value)?.name ?? v.value
                                                            : v.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-700">Only <strong>enabled</strong> fields will be changed. Unchecked fields keep their current values.</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 flex items-center justify-between">
                            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            <button onClick={() => setStep(3)} disabled={activeChangesCount === 0}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">
                                Review Changes <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Confirm ────────────────────────────────────────── */}
                {step === 3 && (
                    <div className="grid lg:grid-cols-3 gap-6 items-start">
                        <div className="lg:col-span-2 space-y-4">

                            {/* Changes to apply */}
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4 text-amber-600" /></div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Changes to Apply</div>
                                        <div className="text-xs text-gray-500">These fields will be updated on {selected.size} item(s)</div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {enabledChanges.map(([key, v]) => {
                                            const displayValue =
                                                key === 'collection_id' ? collections.find(c => String(c.id) === v.value)?.name ?? v.value
                                                : key === 'location_id' ? locations.find(l => String(l.id) === v.value)?.name ?? v.value
                                                : v.value;
                                            return (
                                                <div key={key} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                                    <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 capitalize">{key.replace('_id', '').replace('_', ' ')}</div>
                                                        <div className="text-sm font-bold text-amber-800 capitalize">{displayValue}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Affected items preview (first 10) */}
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-700">Affected Items ({selected.size})</span>
                                    {selected.size > 10 && <span className="text-xs text-gray-400">Showing first 10</span>}
                                </div>
                                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                    {items.filter(i => selected.has(i.id)).slice(0, 10).map(item => (
                                        <div key={item.id} className="flex items-center gap-3 px-6 py-2.5">
                                            <span className="font-mono text-xs text-gray-500 w-24 flex-shrink-0">{item.barcode}</span>
                                            <span className="text-xs text-gray-700 truncate flex-1">{item.title ?? '—'}</span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_BADGE[item.item_status] ?? 'bg-gray-100 text-gray-500'}`}>
                                                {item.item_status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right confirmation card */}
                        <div className="space-y-4 sticky top-4">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-5 text-center">
                                    <div className="text-4xl font-black text-white">{selected.size}</div>
                                    <div className="text-blue-200 text-xs mt-1">items will be updated</div>
                                    <div className="text-white text-sm font-bold mt-2">{activeChangesCount} field{activeChangesCount !== 1 ? 's' : ''} changed</div>
                                </div>
                                <div className="p-5 space-y-3">
                                    <button onClick={apply} disabled={applying}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm">
                                        {applying ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying…</> : <><Zap className="w-4 h-4" /> Apply Changes</>}
                                    </button>
                                    <button onClick={() => setStep(2)} className="w-full py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm rounded-xl transition-colors">
                                        Edit Fields
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Result ─────────────────────────────────────────── */}
                {step === 4 && result && (
                    <div className="flex flex-col items-center justify-center py-12 gap-5">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${result.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            {result.success ? <CheckCircle2 className="w-10 h-10 text-emerald-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
                        </div>
                        <div className="text-center">
                            <h2 className={`text-xl font-black ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                                {result.success ? 'Done!' : 'Error'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">{result.message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setStep(0); setInputText(''); setItems([]); setSelected(new Set()); setResult(null); }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl">
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

// ── Field row with enable toggle ─────────────────────────────────────────────
function FieldRow({ icon: Icon, label, enabled, onToggle, children }) {
    return (
        <div className={`rounded-xl border-2 transition-all ${enabled ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex items-center gap-3 px-4 py-3" onClick={() => onToggle(!enabled)}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-blue-100' : 'bg-gray-200'}`}>
                    <Icon className={`w-3 h-3 ${enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <span className={`text-sm font-semibold flex-1 cursor-pointer select-none ${enabled ? 'text-blue-800' : 'text-gray-500'}`}>{label}</span>
                {/* Toggle switch */}
                <div className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${enabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
            </div>
            {enabled && <div className="px-4 pb-4">{children}</div>}
        </div>
    );
}
