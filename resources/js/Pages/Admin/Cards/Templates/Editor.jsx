import EditorLayout from '@/Layouts/EditorLayout';
import { ElementBody, PX_PER_MM } from '@/Components/Cards/CardRenderer';
import { router } from '@inertiajs/react';
import { Rnd } from 'react-rnd';
import { useState } from 'react';
import {
    ChevronLeft, Save, Trash2, Type, Tag, ScanBarcode, CircleUser,
    Image as ImageIcon, Square, ArrowUp, ArrowDown, Star,
} from 'lucide-react';

const EDITOR_SCALE = 2.4;          // display zoom
const K = PX_PER_MM * EDITOR_SCALE; // px per mm on the canvas

let uid = 0;
const newId = () => `el_${Date.now()}_${uid++}`;

const PALETTE = [
    { type: 'field',    icon: Tag,         label: 'Field',    make: () => ({ field: 'full_name', w: 50, h: 6, fontSize: 10, fontWeight: 'normal', color: '#111827', align: 'left' }) },
    { type: 'text',     icon: Type,        label: 'Text',     make: () => ({ text: 'Text', w: 40, h: 6, fontSize: 10, fontWeight: 'normal', color: '#111827', align: 'left' }) },
    { type: 'barcode',  icon: ScanBarcode, label: 'Barcode',  make: () => ({ w: 55, h: 11 }) },
    { type: 'initials', icon: CircleUser,  label: 'Avatar',   make: () => ({ w: 18, h: 18 }) },
    { type: 'logo',     icon: ImageIcon,   label: 'Logo',     make: () => ({ w: 12, h: 12 }) },
    { type: 'rect',     icon: Square,      label: 'Box',      make: () => ({ w: 40, h: 8, backgroundColor: '#1e3a8a', borderRadius: 0 }) },
];

export default function CardEditor({ template, fieldKeys = {}, branding = {}, samplePatron = {}, defaultElements = [] }) {
    const isEdit = !!template;
    const [name, setName] = useState(template?.name ?? 'New Card Template');
    const [widthMm, setWidthMm] = useState(template?.width_mm ?? 85.6);
    const [heightMm, setHeightMm] = useState(template?.height_mm ?? 54);
    const [bg, setBg] = useState(template?.background_color ?? '#ffffff');
    const [bgImage, setBgImage] = useState(template?.background_image_url ?? null);
    const [bgImageFile, setBgImageFile] = useState(null);
    const [bgImageRemoved, setBgImageRemoved] = useState(false);
    const [isDefault, setIsDefault] = useState(template?.is_default ?? false);
    const [elements, setElements] = useState(
        () => template?.elements ?? defaultElements ?? []
    );
    const [selId, setSelId] = useState(null);
    const [saving, setSaving] = useState(false);

    const sel = elements.find(e => e.id === selId) ?? null;

    const update = (id, patch) =>
        setElements(els => els.map(e => (e.id === id ? { ...e, ...patch } : e)));

    const addElement = (p) => {
        const el = { id: newId(), type: p.type, x: 4, y: 4, ...p.make() };
        setElements(els => [...els, el]);
        setSelId(el.id);
    };

    const removeElement = (id) => {
        setElements(els => els.filter(e => e.id !== id));
        if (selId === id) setSelId(null);
    };

    const reorder = (id, dir) => {
        setElements(els => {
            const i = els.findIndex(e => e.id === id);
            const j = dir === 'up' ? i + 1 : i - 1; // up = later in array = on top
            if (i < 0 || j < 0 || j >= els.length) return els;
            const copy = [...els];
            [copy[i], copy[j]] = [copy[j], copy[i]];
            return copy;
        });
    };

    const handleBgImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setBgImageFile(file);
        setBgImageRemoved(false);
        setBgImage(URL.createObjectURL(file));
    };

    const removeBgImage = () => {
        setBgImage(null);
        setBgImageFile(null);
        setBgImageRemoved(true);
    };

    const save = () => {
        setSaving(true);
        const payload = {
            name,
            width_mm: Number(widthMm),
            height_mm: Number(heightMm),
            background_color: bg,
            is_default: isDefault,
            // Send elements as JSON string — Inertia's FormData mode preserves it exactly
            elements: JSON.stringify(elements),
        };
        if (bgImageFile) payload.background_image = bgImageFile;
        if (bgImageRemoved) payload.remove_background_image = '1';

        const opts = {
            forceFormData: true,
            onFinish: () => setSaving(false),
            onError: () => setSaving(false),
        };
        if (isEdit) router.put(route('admin.cards.templates.update', template.id), payload, opts);
        else router.post(route('admin.cards.templates.store'), payload, opts);
    };

    return (
        <EditorLayout
            title={isEdit ? 'Edit Card Template' : 'New Card Template'}
            onBack={() => router.visit(route('admin.cards.templates.index'))}
        >
            <div className="flex items-center justify-end mb-4 px-4 pt-4">
                <button onClick={save} disabled={saving}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
                    <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Template'}
                </button>
            </div>

            <div className="grid lg:grid-cols-[240px_1fr_320px] gap-4 px-4 pb-4">
                {/* ── Palette ──────────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 p-3 h-fit">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">Add element</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {PALETTE.map(p => {
                            const Icon = p.icon;
                            return (
                                <button key={p.type} onClick={() => addElement(p)}
                                    className="flex flex-col items-center gap-1.5 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-colors">
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{p.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mt-5 mb-2">Card</h3>
                    <div className="space-y-2.5 px-1">
                        <Labeled label="Name">
                            <input value={name} onChange={e => setName(e.target.value)} className="ui-input" />
                        </Labeled>
                        <div className="grid grid-cols-2 gap-2">
                            <Labeled label="Width (mm)">
                                <input type="number" value={widthMm} onChange={e => setWidthMm(e.target.value)} className="ui-input" />
                            </Labeled>
                            <Labeled label="Height (mm)">
                                <input type="number" value={heightMm} onChange={e => setHeightMm(e.target.value)} className="ui-input" />
                            </Labeled>
                        </div>
                        <Labeled label="Background Color">
                            <ColorInput value={bg} onChange={setBg} />
                        </Labeled>
                        <Labeled label="Background Image">
                            {bgImage ? (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                    <img src={bgImage} alt="background" className="w-full h-20 object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeBgImage}
                                        className="absolute top-1 right-1 p-0.5 bg-red-500 hover:bg-red-600 rounded text-white"
                                        title="Remove background image"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                    <div className="absolute bottom-1 left-1 text-[10px] text-white bg-black/40 px-1 rounded">
                                        cover fit
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    <ImageIcon className="w-4 h-4 text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Upload photo</span>
                                    <input type="file" accept="image/*" onChange={handleBgImageChange} className="hidden" />
                                </label>
                            )}
                        </Labeled>
                        <label className="flex items-center gap-2 text-sm text-gray-700 pt-1 cursor-pointer">
                            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <Star className="w-3.5 h-3.5 text-amber-500" /> Set as default
                        </label>
                    </div>
                </div>

                {/* ── Canvas ───────────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start justify-center overflow-auto">
                    <div
                        onClick={() => setSelId(null)}
                        style={{
                            position: 'relative',
                            width: widthMm * K,
                            height: heightMm * K,
                            backgroundColor: bg,
                            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            borderRadius: 2 * K,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                            outline: '1px dashed #cbd5e1',
                        }}
                    >
                        {elements.map(el => (
                            <Rnd
                                key={el.id}
                                bounds="parent"
                                size={{ width: (el.w ?? 10) * K, height: (el.h ?? 6) * K }}
                                position={{ x: (el.x ?? 0) * K, y: (el.y ?? 0) * K }}
                                onDragStart={(e) => { e.stopPropagation(); setSelId(el.id); }}
                                onDragStop={(e, d) => update(el.id, { x: round(d.x / K), y: round(d.y / K) })}
                                onResizeStop={(e, dir, ref, delta, pos) => update(el.id, {
                                    w: round(ref.offsetWidth / K),
                                    h: round(ref.offsetHeight / K),
                                    x: round(pos.x / K),
                                    y: round(pos.y / K),
                                })}
                                onClick={(e) => { e.stopPropagation(); setSelId(el.id); }}
                                style={{
                                    outline: selId === el.id ? '2px solid #2563eb' : '1px solid transparent',
                                    outlineOffset: 0,
                                    cursor: 'move',
                                }}
                            >
                                <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                                    <ElementBody el={el} data={samplePatron} branding={branding} k={K} />
                                </div>
                            </Rnd>
                        ))}
                    </div>
                </div>

                {/* ── Properties ───────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 h-fit">
                    {!sel ? (
                        <p className="text-sm text-gray-400 text-center py-8">Select an element to edit its properties.</p>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700 capitalize">{sel.type}</h3>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => reorder(sel.id, 'up')} title="Bring forward" className="p-1 text-gray-400 hover:text-gray-700"><ArrowUp className="w-4 h-4" /></button>
                                    <button onClick={() => reorder(sel.id, 'down')} title="Send back" className="p-1 text-gray-400 hover:text-gray-700"><ArrowDown className="w-4 h-4" /></button>
                                    <button onClick={() => removeElement(sel.id)} title="Delete" className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {sel.type === 'field' && (
                                <Labeled label="Bind to field">
                                    <select value={sel.field ?? ''} onChange={e => update(sel.id, { field: e.target.value })} className="ui-input">
                                        {Object.entries(fieldKeys).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                                    </select>
                                </Labeled>
                            )}

                            {sel.type === 'text' && (
                                <Labeled label="Text">
                                    <input value={sel.text ?? ''} onChange={e => update(sel.id, { text: e.target.value })} className="ui-input" />
                                </Labeled>
                            )}

                            {/* Position / size */}
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
                                                <option value="normal">Normal</option>
                                                <option value="bold">Bold</option>
                                            </select>
                                        </Labeled>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Labeled label="Color"><ColorInput value={sel.color ?? '#111827'} onChange={v => update(sel.id, { color: v })} /></Labeled>
                                        <Labeled label="Align">
                                            <select value={sel.align ?? 'left'} onChange={e => update(sel.id, { align: e.target.value })} className="ui-input">
                                                <option value="left">Left</option>
                                                <option value="center">Center</option>
                                                <option value="right">Right</option>
                                            </select>
                                        </Labeled>
                                    </div>
                                </>
                            )}

                            {sel.type === 'rect' && (
                                <>
                                    <Labeled label="Fill"><ColorInput value={sel.backgroundColor ?? '#1e3a8a'} onChange={v => update(sel.id, { backgroundColor: v })} /></Labeled>
                                    <NumProp label="Corner radius (mm)" value={sel.borderRadius} onChange={v => update(sel.id, { borderRadius: v })} />
                                </>
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

function round(n) { return Math.round(n * 10) / 10; }

function Labeled({ label, children }) {
    return (
        <label className="block">
            <span className="block text-[11px] font-medium text-gray-500 mb-1">{label}</span>
            {children}
        </label>
    );
}

function NumProp({ label, value, onChange }) {
    return (
        <Labeled label={label}>
            <input type="number" step="0.5" value={value ?? 0}
                onChange={e => onChange(round(parseFloat(e.target.value) || 0))} className="ui-input" />
        </Labeled>
    );
}

function ColorInput({ value, onChange }) {
    return (
        <div className="flex items-center gap-1.5">
            <input type="color" value={value} onChange={e => onChange(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5" />
            <input value={value} onChange={e => onChange(e.target.value)} className="ui-input flex-1 font-mono text-xs" />
        </div>
    );
}
