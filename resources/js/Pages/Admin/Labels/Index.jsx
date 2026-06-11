import AdminLayout from '@/Layouts/AdminLayout';
import CardRenderer from '@/Components/Cards/CardRenderer';
import { Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { Search, X, Download, ScanBarcode, Settings2, Loader2, Wand2, ChevronDown } from 'lucide-react';

const STATUS_COLORS = {
    available:   'bg-green-100 text-green-700',
    checked_out: 'bg-blue-100 text-blue-700',
    on_hold:     'bg-amber-100 text-amber-700',
    in_repair:   'bg-orange-100 text-orange-700',
    lost:        'bg-red-100 text-red-700',
    withdrawn:   'bg-gray-200 text-gray-600',
};

function toLabelData(item, libraryName) {
    const b = item.bibliographic_record ?? {};
    return {
        barcode_value: item.barcode,
        title: b.title ?? null,
        title_km: b.title_km ?? null,
        author: Array.isArray(b.authors) ? (b.authors[0]?.name ?? null) : null,
        call_number: item.call_number ?? b.ddc_class ?? b.lcc_class ?? null,
        accession_number: item.accession_number ?? null,
        collection: item.collection?.name ?? null,
        location: item.location?.name ?? null,
        shelf: item.shelf ?? null,
        isbn: b.isbn ?? null,
        library_name: libraryName,
    };
}

export default function LabelsIndex({ items, filters, collections = [], templates = [], branding = {}, barcodeSettings = {}, missingCount = 0 }) {
    const [search, setSearch] = useState(filters?.q ?? '');
    const [selected, setSelected] = useState(() => new Set());
    const [templateId, setTemplateId] = useState(() => templates.find(t => t.is_default)?.id ?? templates[0]?.id ?? '');
    const [startOffset, setStartOffset] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const data  = items?.data ?? [];
    const total = items?.total ?? 0;
    const template = useMemo(() => templates.find(t => t.id === templateId) ?? templates[0], [templateId, templates]);

    const applyFilter = (extra = {}) => {
        router.get(route('admin.labels.index'),
            { q: search, item_status: filters?.item_status ?? '', collection_id: filters?.collection_id ?? '', has_barcode: filters?.has_barcode ?? '', ...extra },
            { preserveState: true, replace: true });
    };

    const toggle = (id) => setSelected(prev => {
        const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
    });
    const pageIds = data.filter(i => i.barcode).map(i => i.id);
    const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
    const togglePage = () => setSelected(prev => {
        const next = new Set(prev);
        allOnPageSelected ? pageIds.forEach(id => next.delete(id)) : pageIds.forEach(id => next.add(id));
        return next;
    });

    const previewData = useMemo(() => {
        const first = data.find(i => selected.has(i.id) && i.barcode) ?? data.find(i => i.barcode);
        return first ? toLabelData(first, branding.library_name) : null;
    }, [data, selected, branding.library_name]);

    // One-label preview template (just the label, not the full sheet)
    const labelPreviewTemplate = useMemo(() => template ? ({
        width_mm: template.label_width_mm,
        height_mm: template.label_height_mm,
        background_color: template.background_color,
        elements: template.elements,
    }) : null, [template]);

    const download = async (payload) => {
        if (!template) { alert('Create a label template first.'); return; }
        setDownloading(true);
        try {
            const res = await axios.post(route('admin.labels.generate'),
                { template_id: templateId, start_offset: startOffset, ...payload },
                { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url; a.download = 'barcode-labels.pdf';
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
        } catch {
            alert('Could not generate labels. Make sure the selected items have a barcode.');
        } finally { setDownloading(false); }
    };

    const downloadSelected = () => {
        if (selected.size === 0) { alert('Select at least one item.'); return; }
        download({ item_ids: Array.from(selected) });
    };
    const downloadAll = () => download({
        select_all: true, q: filters?.q ?? '', item_status: filters?.item_status ?? '', collection_id: filters?.collection_id ?? '',
    });

    const assignMissing = () => {
        if (!confirm(`Auto-assign barcodes to ${missingCount} item(s) with no barcode?`)) return;
        router.post(route('admin.labels.assign-barcodes'), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Barcode Labels">
            <div className="grid lg:grid-cols-3 gap-5">
                {/* ── Items picker ─────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                        <form onSubmit={(e) => { e.preventDefault(); applyFilter(); }} className="flex gap-2 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search barcode, call no., accession…"
                                    className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {search && <button type="button" onClick={() => { setSearch(''); applyFilter({ q: '' }); }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
                            </div>
                            <button type="submit" className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300">Search</button>
                        </form>
                        <div className="flex gap-2">
                            <select value={filters?.collection_id ?? ''} onChange={e => applyFilter({ collection_id: e.target.value })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                                <option value="">All collections</option>
                                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select value={filters?.has_barcode ?? ''} onChange={e => applyFilter({ has_barcode: e.target.value })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                                <option value="">All</option>
                                <option value="yes">Has barcode</option>
                                <option value="no">No barcode</option>
                            </select>
                        </div>
                    </div>

                    {/* Missing barcodes banner */}
                    {missingCount > 0 && (
                        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                            <span className="text-sm text-amber-800">
                                <strong>{missingCount}</strong> item(s) have no barcode and can’t be labelled.
                            </span>
                            <button onClick={assignMissing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                                <Wand2 className="w-3.5 h-3.5" /> Auto-assign
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                            {selected.size > 0 ? <><strong className="text-gray-800">{selected.size}</strong> selected</> : `${total.toLocaleString()} items`}
                        </span>
                        {selected.size > 0 && <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600">Clear</button>}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {data.length === 0 ? (
                            <div className="py-16 text-center">
                                <ScanBarcode className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No items match your filters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="w-10 px-4 py-3"><input type="checkbox" checked={allOnPageSelected} onChange={togglePage}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Barcode</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Call No.</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.map(item => {
                                            const noBarcode = !item.barcode;
                                            return (
                                                <tr key={item.id}
                                                    className={`group ${noBarcode ? 'opacity-50' : 'cursor-pointer hover:bg-gray-50'} ${selected.has(item.id) ? 'bg-blue-50/50' : ''}`}
                                                    onClick={() => !noBarcode && toggle(item.id)}>
                                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                        <input type="checkbox" disabled={noBarcode} checked={selected.has(item.id)} onChange={() => toggle(item.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-40" />
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.barcode ?? <span className="text-gray-300">— none —</span>}</td>
                                                    <td className="px-4 py-3 text-gray-800 truncate max-w-[220px]">{item.bibliographic_record?.title ?? '—'}</td>
                                                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.call_number ?? '—'}</td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.item_status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                            {item.item_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {items?.last_page > 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                <span>Page {items.current_page} of {items.last_page}</span>
                                <div className="flex gap-2">
                                    {items.prev_page_url && <Link href={items.prev_page_url} preserveState className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</Link>}
                                    {items.next_page_url && <Link href={items.next_page_url} preserveState className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">Next</Link>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right rail ───────────────────────────────────────────── */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 lg:sticky lg:top-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><ScanBarcode className="w-4 h-4" /> Label Preview</h2>
                            <Link href={route('admin.labels.templates.index')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <Settings2 className="w-3.5 h-3.5" /> Templates
                            </Link>
                        </div>

                        <select value={templateId} onChange={e => setTemplateId(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                            {templates.length === 0 && <option value="">No templates</option>}
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}{t.is_default ? ' (default)' : ''}</option>)}
                        </select>

                        <div className="rounded-lg bg-gray-100 p-4 flex items-center justify-center min-h-[120px]">
                            {labelPreviewTemplate && previewData
                                ? <CardRenderer template={labelPreviewTemplate} data={previewData} branding={branding} scale={1.6} />
                                : <p className="text-xs text-gray-400 text-center">{templates.length === 0 ? 'Create a template to preview labels.' : 'No item with a barcode to preview.'}</p>}
                        </div>

                        {template && (
                            <p className="text-[11px] text-gray-400 text-center">
                                {template.columns}×{template.rows} per {template.page_size} sheet · {template.label_width_mm}×{template.label_height_mm} mm
                            </p>
                        )}

                        <label className="block">
                            <span className="block text-[11px] font-medium text-gray-500 mb-1">Start at label # (skip used stickers)</span>
                            <input type="number" min="0" value={startOffset} onChange={e => setStartOffset(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                        </label>

                        <div className="space-y-2 pt-1">
                            <button onClick={downloadSelected} disabled={downloading || selected.size === 0 || !template}
                                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg">
                                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Download {selected.size > 0 ? `${selected.size} ` : ''}selected
                            </button>
                            <button onClick={downloadAll} disabled={downloading || total === 0 || !template}
                                className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300">
                                Print all matching (with barcode)
                            </button>
                        </div>
                    </div>

                    {/* Barcode settings */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <button onClick={() => setShowSettings(s => !s)} className="w-full flex items-center justify-between text-sm font-semibold text-gray-700">
                            <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> Barcode numbering</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                        </button>
                        {showSettings && <BarcodeSettings settings={barcodeSettings} />}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function BarcodeSettings({ settings }) {
    const { data, setData, post, processing } = useForm({
        barcode_auto: settings.barcode_auto ?? false,
        barcode_prefix: settings.barcode_prefix ?? 'LIB-',
        barcode_padding: settings.barcode_padding ?? 6,
    });
    const save = (e) => { e.preventDefault(); post(route('admin.labels.settings'), { preserveScroll: true }); };
    const example = `${data.barcode_prefix}${String(1).padStart(data.barcode_padding, '0')}`;

    return (
        <form onSubmit={save} className="mt-4 space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={data.barcode_auto} onChange={e => setData('barcode_auto', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Auto-assign a barcode when a new item is saved without one
            </label>
            <div className="grid grid-cols-2 gap-2">
                <label className="block">
                    <span className="block text-[11px] font-medium text-gray-500 mb-1">Prefix</span>
                    <input value={data.barcode_prefix} onChange={e => setData('barcode_prefix', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono" />
                </label>
                <label className="block">
                    <span className="block text-[11px] font-medium text-gray-500 mb-1">Number digits</span>
                    <input type="number" min="1" max="12" value={data.barcode_padding} onChange={e => setData('barcode_padding', parseInt(e.target.value) || 6)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </label>
            </div>
            <p className="text-[11px] text-gray-400">Example next barcode: <span className="font-mono text-gray-600">{example}</span></p>
            <button type="submit" disabled={processing}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
                Save numbering
            </button>
        </form>
    );
}
