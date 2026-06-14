import OpacLayout from '@/Layouts/OpacLayout';
import { router, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X, LayoutGrid, List, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import RecordCard from '@/Components/Opac/RecordCard';
import FacetedFilter from '@/Components/Opac/FacetedFilter';
import AISearchBar from '@/Components/Opac/AISearchBar';

// ─── Horizontal list-row card ─────────────────────────────────────────────────
function ListCard({ record, base }) {
    const { theme } = usePage().props;
    const primary  = theme?.colors?.primary  || '#3B82F6';
    const accent   = theme?.colors?.accent   || '#2563EB';
    const bgColor  = theme?.colors?.background || '#F8FAFC';

    const typeCode = record.material_type?.code || 'book';
    const isDigital = ['ebook','epub','audio','video','article','dataset'].includes(typeCode);
    const hasPhysical = record.physical_items?.some(i => i.item_status === 'available');
    const statusLabel = isDigital ? 'Online' : hasPhysical ? 'On shelf' : 'Checked out';
    const statusColors = {
        'Online':       { bg: '#dbeafe', text: '#1d4ed8' },
        'On shelf':     { bg: '#dcfce7', text: '#15803d' },
        'Checked out':  { bg: '#fee2e2', text: '#b91c1c' },
    };
    const sc = statusColors[statusLabel] || { bg: '#f3f4f6', text: '#6b7280' };

    const coverGradients = [
        `linear-gradient(135deg, ${primary}dd, ${accent}aa)`,
        `linear-gradient(135deg, ${primary}99, ${accent}cc)`,
        `linear-gradient(135deg, ${accent}bb, ${primary}88)`,
    ];
    const grad = coverGradients[Math.abs(record.title?.charCodeAt(0) || 0) % 3];

    return (
        <div className="flex items-start gap-4 p-4 border-b bg-white hover:bg-gray-50/60 transition-colors group"
            style={{ borderColor: '#e5e7eb' }}>
            {/* Cover */}
            <Link href={`${base}/catalog/${record.id}`}
                className="relative w-14 h-[72px] shrink-0 overflow-hidden rounded-sm border"
                style={{ borderColor: primary + '25' }}>
                {record.cover_image_url
                    ? <img src={record.cover_image_url} alt={record.title} className="absolute inset-0 w-full h-full object-cover" />
                    : <div className="absolute inset-0 flex items-end p-1.5" style={{ background: grad }}>
                        <span className="text-[9px] font-bold text-white leading-tight line-clamp-3">{record.title}</span>
                      </div>
                }
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link href={`${base}/catalog/${record.id}`}
                            className="text-base font-semibold leading-snug line-clamp-2 hover:underline"
                            style={{ color: primary }}>
                            {record.title}
                        </Link>
                        <div className="text-sm mt-0.5 text-gray-500">
                            {record.authors?.[0]?.name || 'Unknown Author'}
                            {record.publication_year && <span className="ml-1">· {record.publication_year}</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {record.material_type?.name && (
                                <span className="text-[11px] px-2 py-0.5 rounded border"
                                    style={{ borderColor: primary + '40', color: primary, backgroundColor: primary + '08' }}>
                                    {record.material_type.name}
                                </span>
                            )}
                            {record.subjects?.[0]?.term && (
                                <span className="text-[11px] px-2 py-0.5 rounded border"
                                    style={{ borderColor: '#d1d5db', color: '#6b7280', backgroundColor: '#f9fafb' }}>
                                    {record.subjects[0].term}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                        style={{ backgroundColor: sc.bg, color: sc.text }}>
                        ● {statusLabel}
                    </span>
                </div>

                <div className="flex gap-2 mt-3">
                    <Link href={`${base}/catalog/${record.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded text-white hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: primary }}>
                        View details
                    </Link>
                    {isDigital ? (
                        <Link href={`${base}/catalog/${record.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded border hover:bg-gray-50 transition-colors"
                            style={{ borderColor: accent, color: accent }}>
                            Access online
                        </Link>
                    ) : (
                        <Link href={`${base}/catalog/${record.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded border hover:bg-gray-50 transition-colors"
                            style={{ borderColor: primary + '50', color: primary }}>
                            Place hold
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Active filter chip ───────────────────────────────────────────────────────
function FilterChip({ label, onRemove, primary }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
            style={{ borderColor: primary + '40', color: primary, backgroundColor: primary + '10' }}>
            {label}
            <button onClick={onRemove} className="hover:opacity-70 ml-0.5"><X className="w-3 h-3" /></button>
        </span>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SearchPage({
    results,
    query: initialQuery,
    filters: initialFilters,
    materialTypes,
    facets = {},
}) {
    const { t } = useTranslation();
    const { tenant, ai, theme } = usePage().props;
    const base    = tenant?.base_url ?? '';
    const primary = theme?.colors?.primary || '#3B82F6';

    const [query, setQuery]           = useState(initialQuery);
    const [mobileOpen, setMobileOpen] = useState(false);
    // Remember the grid/list preference across refreshes and visits.
    const [viewMode, setViewMode]     = useState(() => {
        if (typeof window === 'undefined') return 'grid';
        return localStorage.getItem('opac_view_mode') || 'grid';
    });
    useEffect(() => {
        localStorage.setItem('opac_view_mode', viewMode);
    }, [viewMode]);

    const applyFilters = (newFilters) => {
        router.get(`${base}/catalog`, { q: query, ...newFilters }, { preserveScroll: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(`${base}/catalog`, { q: query, ...initialFilters });
    };

    // Active filter chips (excludes sort)
    const FILTER_LABELS = {
        material_type_id: (v) => materialTypes.find(t => t.id == v)?.name || v,
        language:         (v) => ({ en: 'English', km: 'Khmer', fr: 'French', zh: 'Chinese' }[v] || v),
        availability:     (v) => ({ available: 'Available Now', digital: 'Online Access' }[v] || v),
        year_from:        (v) => `From ${v}`,
        year_to:          (v) => `To ${v}`,
        subject:          (v) => v,
    };
    const activeChips = Object.entries(initialFilters)
        .filter(([k, v]) => v && k !== 'sort' && FILTER_LABELS[k])
        .map(([k, v]) => ({ key: k, label: FILTER_LABELS[k]?.(v) || v }));

    const removeFilter = (key) => {
        const next = { ...initialFilters };
        delete next[key];
        router.get(`${base}/catalog`, { q: query, ...next }, { preserveScroll: true });
    };

    const filterSidebar = (
        <FacetedFilter
            materialTypes={materialTypes}
            filters={initialFilters}
            facets={facets}
            onChange={applyFilters}
        />
    );

    return (
        <OpacLayout>
            {/* ── Search bar ── */}
            <div className="border-b" style={{ backgroundColor: primary }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
                    {ai?.search_enabled ? (
                        <AISearchBar librarySlug={tenant?.slug} initialQuery={query}
                            placeholder={t('nav.search_placeholder')} />
                    ) : (
                        <form onSubmit={handleSearch} className="flex gap-2 max-w-3xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                    placeholder={t('nav.search_placeholder')}
                                    className="w-full pl-10 pr-4 h-11 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20" />
                            </div>
                            <button type="submit"
                                className="bg-white px-6 h-11 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
                                style={{ color: primary }}>
                                Search
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex gap-6">

                    {/* ── Desktop Filter Sidebar (always visible) ── */}
                    <aside className="hidden lg:block w-56 xl:w-60 shrink-0">
                        <div className="sticky top-20 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            {filterSidebar}
                        </div>
                    </aside>

                    {/* ── Results column ── */}
                    <div className="flex-1 min-w-0">

                        {/* Toolbar: count + chips + sort + view toggle */}
                        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700">
                                    {results.total > 0 ? (
                                        <><strong>{results.total.toLocaleString()}</strong> result{results.total !== 1 ? 's' : ''}
                                        {initialQuery && <> for <em>"{initialQuery}"</em></>}</>
                                    ) : (
                                        <span className="text-gray-500">No results found</span>
                                    )}
                                </p>
                                {/* Active filter chips */}
                                {activeChips.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {activeChips.map(chip => (
                                            <FilterChip key={chip.key} label={chip.label} primary={primary}
                                                onRemove={() => removeFilter(chip.key)} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {/* Mobile filter toggle */}
                                <button onClick={() => setMobileOpen(true)}
                                    className="lg:hidden flex items-center gap-1.5 px-3 h-9 rounded-lg border text-sm font-medium"
                                    style={{ borderColor: primary + '40', color: primary }}>
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                    {activeChips.length > 0 && (
                                        <span className="w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                                            style={{ backgroundColor: primary }}>{activeChips.length}</span>
                                    )}
                                </button>

                                {/* Sort */}
                                <div className="relative">
                                    <select
                                        className="appearance-none pl-3 pr-7 h-9 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 outline-none cursor-pointer hover:border-gray-300"
                                        value={initialFilters.sort || ''}
                                        onChange={(e) => applyFilters({ ...initialFilters, sort: e.target.value })}>
                                        <option value="">Relevance</option>
                                        <option value="title">Title A–Z</option>
                                        <option value="year_desc">Newest First</option>
                                        <option value="year_asc">Oldest First</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                </div>

                                {/* View mode toggle */}
                                <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                    <button onClick={() => setViewMode('grid')}
                                        className={`p-2 transition-colors ${viewMode === 'grid' ? 'text-white' : 'text-gray-400 hover:text-gray-600 bg-white'}`}
                                        style={viewMode === 'grid' ? { backgroundColor: primary } : {}}>
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setViewMode('list')}
                                        className={`p-2 transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-400 hover:text-gray-600 bg-white'}`}
                                        style={viewMode === 'list' ? { backgroundColor: primary } : {}}>
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        {results.data?.length > 0 ? (
                            viewMode === 'list' ? (
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    {results.data.map((record) => (
                                        <ListCard key={record.id} record={record} base={base} />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                                    {results.data.map((record) => (
                                        <RecordCard key={record.id} record={record} />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="text-center py-24 text-gray-400">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-base font-semibold text-gray-500">No results found</p>
                                {initialQuery && (
                                    <p className="text-sm mt-1">Try a different search term or remove some filters.</p>
                                )}
                                <Link href={`${base}/catalog`}
                                    className="mt-4 inline-block text-sm font-semibold hover:underline"
                                    style={{ color: primary }}>
                                    Browse all catalog →
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {results.last_page > 1 && (
                            <div className="flex justify-center gap-1.5 mt-8">
                                {results.links?.map((link, i) => (
                                    <Link key={i} href={link.url || '#'} preserveScroll
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'text-white shadow-sm'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                        style={link.active ? { backgroundColor: primary, borderColor: primary } : {}}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile filter drawer ── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                            <span className="font-bold text-gray-900">Filters</span>
                            <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {filterSidebar}
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <button onClick={() => setMobileOpen(false)}
                                className="w-full h-11 rounded-xl text-white font-semibold text-sm"
                                style={{ backgroundColor: primary }}>
                                Show {results.total.toLocaleString()} results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </OpacLayout>
    );
}
