import AdminLayout from '@/Layouts/AdminLayout';
import CardRenderer from '@/Components/Cards/CardRenderer';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { Search, X, Download, Printer, CreditCard, Settings2, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
    active:    'bg-green-100 text-green-700',
    expired:   'bg-yellow-100 text-yellow-700',
    suspended: 'bg-orange-100 text-orange-700',
    blocked:   'bg-red-100 text-red-700',
};

const AVATAR_COLORS = ['#1e3a8a','#0f766e','#7c2d12','#4c1d95','#9d174d','#155e75','#3f6212','#7e22ce'];

// Mirror of the server-side avatar color hash (good enough for preview).
function hashColor(seed = '') {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function toCardData(p, libraryName) {
    const fullKm = [p.first_name_km, p.last_name_km].filter(Boolean).join(' ');
    return {
        patron_number: p.patron_number,
        full_name: [p.first_name, p.last_name].filter(Boolean).join(' '),
        full_name_km: fullKm || null,
        first_name: p.first_name,
        last_name: p.last_name,
        category: p.category?.name ?? null,
        membership_expiry: p.membership_expiry ? String(p.membership_expiry).slice(0, 10) : null,
        email: p.email,
        phone: p.phone,
        library_name: libraryName,
        status: p.status ? p.status[0].toUpperCase() + p.status.slice(1) : null,
        initials: `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() || '?',
        avatar_color: hashColor(p.patron_number ?? p.id ?? ''),
    };
}

export default function CardsIndex({ patrons, filters, categories = [], templates = [], branding = {} }) {
    const [search, setSearch]   = useState(filters?.q ?? '');
    const [selected, setSelected] = useState(() => new Set());
    const [templateId, setTemplateId] = useState(
        () => templates.find(t => t.is_default)?.id ?? templates[0]?.id ?? ''
    );
    const [downloading, setDownloading] = useState(false);

    const data  = patrons?.data ?? [];
    const total = patrons?.total ?? 0;

    const template = useMemo(
        () => templates.find(t => t.id === templateId) ?? templates[0],
        [templateId, templates]
    );

    const applyFilter = (extra = {}) => {
        router.get(route('admin.cards.index'),
            { q: search, status: filters?.status ?? '', category: filters?.category ?? '', ...extra },
            { preserveState: true, replace: true });
    };

    const toggle = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const pageIds = data.map(p => p.id);
    const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
    const togglePage = () => {
        setSelected(prev => {
            const next = new Set(prev);
            allOnPageSelected ? pageIds.forEach(id => next.delete(id)) : pageIds.forEach(id => next.add(id));
            return next;
        });
    };

    const previewPatron = useMemo(() => {
        const first = data.find(p => selected.has(p.id)) ?? data[0];
        return first ? toCardData(first, branding.library_name) : null;
    }, [data, selected, branding.library_name]);

    const download = async (payload) => {
        if (!template) { alert('Create a card template first.'); return; }
        setDownloading(true);
        try {
            const res = await axios.post(route('admin.cards.generate'),
                { template_id: templateId, ...payload },
                { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = (payload.select_all || (payload.patron_ids?.length ?? 0) > 1)
                ? 'library-cards.pdf' : 'library-card.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Could not generate cards. ' + (e?.response?.status === 422 ? 'Check your selection.' : ''));
        } finally {
            setDownloading(false);
        }
    };

    const downloadSelected = () => {
        if (selected.size === 0) { alert('Select at least one patron.'); return; }
        download({ patron_ids: Array.from(selected) });
    };
    const downloadAllMatching = () => {
        download({ select_all: true, q: filters?.q ?? '', status: filters?.status ?? '', category: filters?.category ?? '' });
    };

    return (
        <AdminLayout title="Card Maker">
            <div className="grid lg:grid-cols-3 gap-5">
                {/* ── Left: patron picker ─────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                        <form onSubmit={(e) => { e.preventDefault(); applyFilter(); }} className="flex gap-2 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search name, email, card number…"
                                    className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {search && (
                                    <button type="button" onClick={() => { setSearch(''); applyFilter({ q: '' }); }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <button type="submit" className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300">
                                Search
                            </button>
                        </form>

                        <div className="flex gap-2">
                            <select value={filters?.status ?? ''} onChange={e => applyFilter({ status: e.target.value })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                                <option value="">All statuses</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="suspended">Suspended</option>
                                <option value="blocked">Blocked</option>
                            </select>
                            <select value={filters?.category ?? ''} onChange={e => applyFilter({ category: e.target.value })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                                <option value="">All categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Selection summary */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                            {selected.size > 0
                                ? <><strong className="text-gray-800">{selected.size}</strong> selected</>
                                : `${total.toLocaleString()} patrons`}
                        </span>
                        {selected.size > 0 && (
                            <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600">Clear selection</button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {data.length === 0 ? (
                            <div className="py-16 text-center">
                                <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No patrons match your filters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="w-10 px-4 py-3">
                                                <input type="checkbox" checked={allOnPageSelected} onChange={togglePage}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            </th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Card No.</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Category</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.map(patron => (
                                            <tr key={patron.id}
                                                className={`hover:bg-gray-50 cursor-pointer ${selected.has(patron.id) ? 'bg-blue-50/50' : ''}`}
                                                onClick={() => toggle(patron.id)}>
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" checked={selected.has(patron.id)} onChange={() => toggle(patron.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                                                            style={{ background: hashColor(patron.patron_number ?? patron.id) }}>
                                                            {patron.first_name?.[0]?.toUpperCase()}{patron.last_name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{patron.first_name} {patron.last_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-500 hidden md:table-cell">{patron.patron_number}</td>
                                                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{patron.category?.name ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[patron.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {patron.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {patrons?.last_page > 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                <span>Page {patrons.current_page} of {patrons.last_page}</span>
                                <div className="flex gap-2">
                                    {patrons.prev_page_url && <Link href={patrons.prev_page_url} preserveState className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</Link>}
                                    {patrons.next_page_url && <Link href={patrons.next_page_url} preserveState className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">Next</Link>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: template + preview + actions ─────────────────── */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 lg:sticky lg:top-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Card Preview
                            </h2>
                            <Link href={route('admin.cards.templates.index')}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <Settings2 className="w-3.5 h-3.5" /> Templates
                            </Link>
                        </div>

                        {/* Template selector */}
                        <select value={templateId} onChange={e => setTemplateId(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                            {templates.length === 0 && <option value="">No templates</option>}
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}{t.is_default ? ' (default)' : ''}</option>)}
                        </select>

                        {/* Live preview */}
                        <div className="rounded-lg bg-gray-100 p-4 flex items-center justify-center min-h-[160px]">
                            {template && previewPatron
                                ? <CardRenderer template={template} data={previewPatron} branding={branding} scale={1.25} />
                                : <p className="text-xs text-gray-400 text-center">
                                    {templates.length === 0 ? 'Create a template to preview cards.' : 'No patron to preview.'}
                                  </p>}
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-1">
                            <button onClick={downloadSelected} disabled={downloading || selected.size === 0 || !template}
                                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg">
                                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Download {selected.size > 0 ? `${selected.size} ` : ''}selected
                            </button>
                            <button onClick={downloadAllMatching} disabled={downloading || total === 0 || !template}
                                className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300">
                                <Printer className="w-4 h-4" />
                                Print all {total.toLocaleString()} matching
                            </button>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                            Generates a print-ready PDF (CR80 cards laid out on A4). Up to 500 cards per batch.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
