import EditorLayout from '@/Layouts/EditorLayout';
import { ElementBody, PX_PER_MM } from '@/Components/Cards/CardRenderer';
import { router } from '@inertiajs/react';
import { Rnd } from 'react-rnd';
import { useMemo, useState } from 'react';
import {
    ChevronLeft, Save, Trash2, Type, Tag, ScanBarcode, Square,
    ArrowUp, ArrowDown, Star,
} from 'lucide-react';

const EDITOR_SCALE = 3.2;
const K = PX_PER_MM * EDITOR_SCALE;

let uid = 0;
const newId = () => `el_${Date.now()}_${uid++}`;
const round = (n) => Math.round(n * 10) / 10;

const PALETTE = [
    { type: 'field',   icon: Tag,         label: 'Field',   make: () => ({ field: 'call_number', w: 30, h: 6, fontSize: 9, fontWeight: 'bold', color: '#111827', align: 'left' }) },
    { type: 'text',    icon: Type,        label: 'Text',    make: () => ({ text: 'Text', w: 30, h: 5, fontSize: 8, fontWeight: 'normal', color: '#111827', align: 'left' }) },
    { type: 'barcode', icon: ScanBarcode, label: 'Barcode', make: () => ({ field: 'barcode_value', symbology: 'code128', w: 45, h: 12 }) },
    { type: 'rect',    icon: Square,      label: 'Box',     make: () => ({ w: 30, h: 6, backgroundColor: '#e5e7eb', borderRadius: 0 }) },
];

export default function LabelEditor({ template, fieldKeys = {}, presets = {}, branding = {}, sampleItem = {}, defaultElements = [] }) {
    const isEdit = !!template;
    const [name, setName] = useState(template?.name ?? 'New Label Template');
    const [pageSize, setPageSize] = useState(template?.page_size ?? 'A4');
    const [geo, setGeo] = useState({
        columns:        template?.columns ?? 3,
        rows:           template?.rows ?? 8,
        label_width_mm: template?.label_width_mm ?? 63.5,
        label_height_mm:template?.label_height_mm ?? 33.9,
        gap_x_mm:       template?.gap_x_mm ?? 2.5,
        gap_y_mm:       template?.gap_y_mm ?? 0,
        margin_top_mm:  template?.margin_top_mm ?? 13,
        margin_left_mm: template?.margin_left_mm ?? 7.2,
    });
    const [bg, setBg] = useState(template?.background_color ?? '#ffffff');
    const [isDefault, setIsDefault] = useState(template?.is_default ?? false);
    const [elements, setElements] = useState(() => template?.elements ?? defaultElements ?? []);
    const [selId, setSelId] = useState(null);
    const [saving, setSaving] = useState(false);

    const sel = elements.find(e => e.id === selId) ?? null;
    const setGeoField = (k, v) => setGeo(g => ({ ...g, [k]: v }));
    const update = (id, patch) => setElements(els => els.map(e => (e.id === id ? { ...e, ...patch } : e)));

    const applyPreset = (key) => {
        const p = presets[key];
        if (!p) return;
        setPageSize(p.page_size ?? 'A4');
        setGeo({
            columns: p.columns, rows: p.rows,
            label_width_mm: p.label_width_mm, label_height_mm: p.label_height_mm,
            gap_x_mm: p.gap_x_mm, gap_y_mm: p.gap_y_mm,
            margin_top_mm: p.margin_top_mm, margin_left_mm: p.margin_left_mm,
        });
    };

    const addElement = (p) => {
        const el = { id: newId(), type: p.type, x: 2, y: 2, ...p.make() };
        setElements(els => [...els, el]); setSelId(el.id);
    };
    const removeElement = (id) => { setElements(els => els.filter(e => e.id !== id)); if (selId === id) setSelId(null); };
    const reorder = (id, dir) => setElements(els => {
        const i = els.findIndex(e => e.id === id); const j = dir === 'up' ? i + 1 : i - 1;
        if (i < 0 || j < 0 || j >= els.length) return els;
        const copy = [...els]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy;
    });

    const save = () => {
        setSaving(true);
        const payload = { name, page_size: pageSize, background_color: bg, is_default: isDefault, elements, ...geo };
        const opts = { onFinish: () => setSaving(false), onError: () => setSaving(false) };
        if (isEdit) router.put(route('admin.labels.templates.update', template.id), payload, opts);
        else router.post(route('admin.labels.templates.store'), payload, opts);
    };

    const labelTemplate = useMemo(() => ({ width_mm: geo.label_width_mm, height_mm: geo.label_height_mm, background_color: bg, elements }), [geo.label_width_mm, geo.label_height_mm, bg, elements]);

    return (
        <EditorLayout
            title={isEdit ? 'Edit Label Template' : 'New Label Template'}
            onBack={() => router.visit(route('admin.labels.templates.index'))}
        >
            <div className="flex items-center justify-end mb-4 px-4 pt-4">
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
                    <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Template'}
                </button>
            </div>

            <div className="grid lg:grid-cols-[280px_1fr_300px] gap-4 px-4 pb-4">
                {/* ── Sheet geometry ───────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 h-fit space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sheet</h3>
                    <Labeled label="Name"><input value={name} onChange={e => setName(e.target.value)} className="ui-input" /></Labeled>
                    <Labeled label="Avery preset">
                        <select onChange={e => applyPreset(e.target.value)} defaultValue="" className="ui-input">
                            <option value="" disabled>Choose a preset…</option>
                            {Object.entries(presets).map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}
                        </select>
                    </Labeled>
                    <div className="grid grid-cols-2 gap-2">
                        <Labeled label="Page">
                            <select value={pageSize} onChange={e => setPageSize(e.target.value)} className="ui-input">
                                <option value="A4">A4</option><option value="Letter">Letter</option>
                            </select>
                        </Labeled>
                        <Labeled label="Background"><ColorInput value={bg} onChange={setBg} /></Labeled>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <NumProp label="Columns" value={geo.columns} step={1} onChange={v => setGeoField('columns', Math.max(1, Math.round(v)))} />
                        <NumProp label="Rows" value={geo.rows} step={1} onChange={v => setGeoField('rows', Math.max(1, Math.round(v)))} />
                        <NumProp label="Label W (mm)" value={geo.label_width_mm} onChange={v => setGeoField('label_width_mm', v)} />
                        <NumProp label="Label H (mm)" value={geo.label_height_mm} onChange={v => setGeoField('label_height_mm', v)} />
                        <NumProp label="Gap X (mm)" value={geo.gap_x_mm} onChange={v => setGeoField('gap_x_mm', v)} />
                        <NumProp label="Gap Y (mm)" value={geo.gap_y_mm} onChange={v => setGeoField('gap_y_mm', v)} />
                        <NumProp label="Margin top" value={geo.margin_top_mm} onChange={v => setGeoField('margin_top_mm', v)} />
                        <NumProp label="Margin left" value={geo.margin_left_mm} onChange={v => setGeoField('margin_left_mm', v)} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 pt-1 cursor-pointer">
                        <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <Star className="w-3.5 h-3.5 text-amber-500" /> Set as default
                    </label>
                    <p className="text-[11px] text-gray-400">{geo.columns * geo.rows} labels per {pageSize} sheet.</p>
                </div>

                {/* ── Single-label canvas ──────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-start gap-3 overflow-auto">
                    <p className="text-xs text-gray-400">Design one label — it repeats across the sheet.</p>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {PALETTE.map(p => { const Icon = p.icon; return (
                            <button key={p.type} onClick={() => addElement(p)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-700 text-sm">
                                <Icon className="w-4 h-4" /> {p.label}
                            </button>
                        ); })}
                    </div>
                    <div onClick={() => setSelId(null)}
                        style={{ position: 'relative', width: geo.label_width_mm * K, height: geo.label_height_mm * K, background: bg, boxShadow: '0 2px 10px rgba(0,0,0,0.12)', outline: '1px dashed #cbd5e1', marginTop: 8 }}>
                        {elements.map(el => (
                            <Rnd key={el.id} bounds="parent"
                                size={{ width: (el.w ?? 10) * K, height: (el.h ?? 6) * K }}
                                position={{ x: (el.x ?? 0) * K, y: (el.y ?? 0) * K }}
                                onDragStart={(e) => { e.stopPropagation(); setSelId(el.id); }}
                                onDragStop={(e, d) => update(el.id, { x: round(d.x / K), y: round(d.y / K) })}
                                onResizeStop={(e, dir, ref, delta, pos) => update(el.id, { w: round(ref.offsetWidth / K), h: round(ref.offsetHeight / K), x: round(pos.x / K), y: round(pos.y / K) })}
                                onClick={(e) => { e.stopPropagation(); setSelId(el.id); }}
                                style={{ outline: selId === el.id ? '2px solid #2563eb' : '1px solid transparent', cursor: 'move' }}>
                                <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                                    <ElementBody el={el} data={sampleItem} branding={branding} k={K} />
                                </div>
                            </Rnd>
                        ))}
                    </div>
                </div>

                {/* ── Properties ───────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 h-fit">
                    {!sel ? <p className="text-sm text-gray-400 text-center py-8">Select an element to edit it.</p> : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700 capitalize">{sel.type}</h3>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => reorder(sel.id, 'up')} title="Forward" className="p-1 text-gray-400 hover:text-gray-700"><ArrowUp className="w-4 h-4" /></button>
                                    <button onClick={() => reorder(sel.id, 'down')} title="Back" className="p-1 text-gray-400 hover:text-gray-700"><ArrowDown className="w-4 h-4" /></button>
                                    <button onClick={() => removeElement(sel.id)} title="Delete" className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {(sel.type === 'field' || sel.type === 'barcode') && (
                                <Labeled label="Bind to field">
                                    <select value={sel.field ?? ''} onChange={e => update(sel.id, { field: e.target.value })} className="ui-input">
                                        {Object.entries(fieldKeys).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                                    </select>
                                </Labeled>
                            )}
                            {sel.type === 'barcode' && (
                                <Labeled label="Symbology">
                                    <select value={sel.symbology ?? 'code128'} onChange={e => update(sel.id, { symbology: e.target.value })} className="ui-input">
                                        <option value="code128">Code 128</option>
                                        <option value="code39">Code 39</option>
                                    </select>
                                </Labeled>
                            )}
                            {sel.type === 'text' && (
                                <Labeled label="Text"><input value={sel.text ?? ''} onChange={e => update(sel.id, { text: e.target.value })} className="ui-input" /></Labeled>
                            )}

                            <div className="grid grid-cols-4 gap-2">
                                <NumProp label="X" value={sel.x} onChange={v => update(sel.id, { x: v })} />
                                <NumProp label="Y" value={sel.y} onChange={v => update(sel.id, { y: v })} />
                                <NumProp label="W" value={sel.w} onChange={v => update(sel.id, { w: v })} />
                                <NumProp label="H" value={sel.h} onChange={v => update(sel.id, { h: v })} />
                            </div>

                            {(sel.type === 'field' || sel.type === 'text') && (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <NumProp label="Font (pt)" value={sel.fontSize} onChange={v => update(sel.id, { fontSize: v })} />
                                        <Labeled label="Weight">
                                            <select value={sel.fontWeight ?? 'normal'} onChange={e => update(sel.id, { fontWeight: e.target.value })} className="ui-input">
                                                <option value="normal">Normal</option><option value="bold">Bold</option>
                                            </select>
                                        </Labeled>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Labeled label="Color"><ColorInput value={sel.color ?? '#111827'} onChange={v => update(sel.id, { color: v })} /></Labeled>
                                        <Labeled label="Align">
                                            <select value={sel.align ?? 'left'} onChange={e => update(sel.id, { align: e.target.value })} className="ui-input">
                                                <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                                            </select>
                                        </Labeled>
                                    </div>
                                </>
                            )}
                            {sel.type === 'rect' && (
                                <Labeled label="Fill"><ColorInput value={sel.backgroundColor ?? '#e5e7eb'} onChange={v => update(sel.id, { backgroundColor: v })} /></Labeled>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .ui-input { width:100%; padding:6px 8px; font-size:13px; border:1px solid #d1d5db; border-radius:8px; outline:none; }
                .ui-input:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,.2); }
            `}</style>
        </EditorLayout>
    );
}

function Labeled({ label, children }) {
    return <label className="block"><span className="block text-[11px] font-medium text-gray-500 mb-1">{label}</span>{children}</label>;
}
function NumProp({ label, value, onChange, step = 0.5 }) {
    return <Labeled label={label}><input type="number" step={step} value={value ?? 0} onChange={e => onChange(Math.round((parseFloat(e.target.value) || 0) * 10) / 10)} className="ui-input" /></Labeled>;
}
function ColorInput({ value, onChange }) {
    return (
        <div className="flex items-center gap-1.5">
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5" />
            <input value={value} onChange={e => onChange(e.target.value)} className="ui-input flex-1 font-mono text-xs" />
        </div>
    );
}
