import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Search, Loader2, BookOpen, ExternalLink, Check,
    Library, Globe, BookMarked, FileText, Download, Sparkles, ArrowRight,
} from 'lucide-react';

const SOURCE_OPTIONS = [
    { id: 'loc',         label: 'Library of Congress', short: 'LoC',         icon: Library,  color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200',   ring: 'ring-rose-500/30',   dot: 'bg-rose-500' },
    { id: 'openlibrary', label: 'Open Library',        short: 'Open Library', icon: BookOpen, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   ring: 'ring-blue-500/30',   dot: 'bg-blue-500' },
    { id: 'googlebooks', label: 'Google Books',        short: 'Google',      icon: Globe,    color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200',ring: 'ring-emerald-500/30',dot: 'bg-emerald-500' },
    { id: 'crossref',    label: 'CrossRef (DOI)',      short: 'CrossRef',    icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', ring: 'ring-violet-500/30', dot: 'bg-violet-500' },
];

const TYPE_OPTIONS = [
    { value: 'isbn',   label: 'ISBN' },
    { value: 'title',  label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'doi',    label: 'DOI' },
    { value: 'lccn',   label: 'LCCN' },
];

const SOURCE_COLORS = {
    loc:         { badge: 'bg-rose-100 text-rose-700',     label: 'Library of Congress' },
    openlibrary: { badge: 'bg-blue-100 text-blue-700',     label: 'Open Library' },
    googlebooks: { badge: 'bg-emerald-100 text-emerald-700',label: 'Google Books' },
    crossref:    { badge: 'bg-violet-100 text-violet-700', label: 'CrossRef' },
};

export default function ImportModal({ onImport, onClose, initialQuery = '', initialType = 'isbn' }) {
    const [query,         setQuery]         = useState(initialQuery);
    const [searchType,    setSearchType]    = useState(initialType);
    const [sources,       setSources]       = useState(['loc', 'openlibrary', 'googlebooks', 'crossref']);
    const [loading,       setLoading]       = useState(false);
    const [results,       setResults]       = useState([]);
    const [error,         setError]         = useState(null);
    const [searched,      setSearched]      = useState(false);
    const [importing,     setImporting]     = useState(null);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    // When opened pre-seeded (e.g. from the ISBN field's search icon), search once.
    const autoRan = useRef(false);
    useEffect(() => {
        if (!autoRan.current && initialQuery.trim()) {
            autoRan.current = true;
            doSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const toggleSource = (id) => {
        setSources(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const doSearch = async (e) => {
        e?.preventDefault();
        // Portal events bubble up the React tree — stop this submit from reaching the
        // catalog <form> and triggering a spurious (empty) save.
        e?.stopPropagation();
        if (!query.trim() || sources.length === 0) return;

        setLoading(true);
        setError(null);
        setResults([]);
        setSearched(false);

        try {
            const params = new URLSearchParams({ q: query.trim(), type: searchType });
            sources.forEach(s => params.append('sources[]', s));

            const res = await fetch(route('admin.catalog.import-search') + '?' + params.toString());
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();

            if (data.error) throw new Error(data.error);
            setResults(data.results ?? []);
            setSearched(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = (record, idx) => {
        setImporting(idx);
        const { _source, _source_label, _source_url, ...clean } = record;
        onImport(clean);
        setTimeout(() => onClose(), 450);
    };

    const placeholder =
        searchType === 'isbn'   ? 'e.g. 9780743273565' :
        searchType === 'author' ? 'e.g. Tolkien' :
        searchType === 'doi'    ? 'e.g. 10.1093/ajcn/72.1.1s' :
        searchType === 'lccn'   ? 'e.g. 2001026335' :
        'e.g. The Great Gatsby';

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-12 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[88vh] overflow-hidden animate-[fadeIn_.15s_ease-out]">

                {/* Header — gradient */}
                <div className="relative flex-shrink-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 py-5 text-white">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold leading-tight">Import from Library Catalog</h2>
                            <p className="text-xs text-white/70 mt-0.5">Find a record online and fill the form automatically</p>
                        </div>
                        <button type="button" onClick={onClose}
                            className="ml-auto -mr-1 -mt-1 p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Search controls */}
                <div className="flex-shrink-0 px-6 pt-4 pb-4 border-b border-gray-100 space-y-3 bg-gray-50/50">
                    {/* Source chips */}
                    <div className="flex flex-wrap gap-2">
                        {SOURCE_OPTIONS.map(src => {
                            const Icon = src.icon;
                            const active = sources.includes(src.id);
                            return (
                                <button key={src.id} type="button" onClick={() => toggleSource(src.id)}
                                    className={`group flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        active
                                            ? `${src.bg} ${src.color} ${src.border} ring-2 ${src.ring}`
                                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                                    }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {src.label}
                                    <span className={`flex h-4 w-4 items-center justify-center rounded-full ${active ? 'bg-white/70' : 'bg-gray-100'}`}>
                                        {active ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Query row */}
                    <form onSubmit={doSearch} className="flex gap-2">
                        <select value={searchType} onChange={e => setSearchType(e.target.value)}
                            className="px-3 py-2.5 text-sm font-medium border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-28 shadow-sm">
                            {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                                placeholder={placeholder}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <button type="submit" disabled={loading || !query.trim() || sources.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Search
                        </button>
                    </form>
                </div>

                {/* Results area */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-[3px] border-blue-100" />
                                <Loader2 className="absolute inset-0 m-auto w-12 h-12 text-blue-600 animate-spin" style={{ borderRadius: '9999px' }} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">Searching {sources.length} source{sources.length !== 1 ? 's' : ''}…</p>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                    {sources.map(id => {
                                        const s = SOURCE_OPTIONS.find(o => o.id === id);
                                        return <span key={id} className={`w-1.5 h-1.5 rounded-full ${s?.dot ?? 'bg-gray-300'} animate-pulse`} />;
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="mx-6 my-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-2">
                            <X className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    {searched && !loading && results.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                <BookMarked className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">No results found</p>
                            <p className="text-xs text-gray-400 mt-1">Try a different term or enable more sources above</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div>
                            <div className="px-6 pt-4 pb-2 flex items-center gap-2 text-xs font-medium text-gray-500">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                    <Check className="w-3 h-3" /> {results.length} record{results.length !== 1 ? 's' : ''}
                                </span>
                                <span className="text-gray-400">— pick the best match to fill the form</span>
                            </div>
                            <div className="px-3 pb-3 space-y-2">
                                {results.map((record, idx) => {
                                    const src = SOURCE_COLORS[record._source] ?? { badge: 'bg-gray-100 text-gray-600', label: record._source };
                                    const isImporting = importing === idx;
                                    return (
                                        <div key={idx}
                                            className={`rounded-2xl border p-3.5 flex gap-4 transition-all ${
                                                isImporting ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                                            }`}>
                                            {/* Cover */}
                                            <div className="w-14 h-[76px] flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm ring-1 ring-black/5">
                                                {record.cover_image_url ? (
                                                    <img src={record.cover_image_url} alt="" className="w-full h-full object-cover"
                                                        onError={e => { e.target.style.display = 'none'; }} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <BookOpen className="w-5 h-5 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                                                            {record.title}
                                                            {record.subtitle && <span className="font-normal text-gray-500"> — {record.subtitle}</span>}
                                                        </h3>
                                                        {record.authors?.length > 0 && (
                                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                                {record.authors.map(a => a.name).join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button type="button" onClick={() => handleImport(record, idx)} disabled={importing !== null}
                                                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60 ${
                                                            isImporting
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                                        }`}>
                                                        {isImporting
                                                            ? <><Check className="w-3.5 h-3.5" /> Imported</>
                                                            : <>Use this <ArrowRight className="w-3.5 h-3.5" /></>}
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2">
                                                    <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-md ${src.badge}`}>{src.label}</span>
                                                    {record.publisher && <span className="text-[11px] text-gray-400 truncate max-w-[140px]">{record.publisher}</span>}
                                                    {record.publication_year && <span className="text-[11px] text-gray-400">· {record.publication_year}</span>}
                                                    {record.isbn && <span className="text-[11px] font-mono text-gray-400">· ISBN {record.isbn}</span>}
                                                    {record.doi && <span className="text-[11px] font-mono text-gray-400">· DOI</span>}
                                                    {record._source_url && (
                                                        <a href={record._source_url} target="_blank" rel="noopener noreferrer"
                                                            className="ml-auto text-[11px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                                                            onClick={e => e.stopPropagation()}>
                                                            <ExternalLink className="w-3 h-3" /> View
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!searched && !loading && !error && (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                            <div className="grid grid-cols-2 gap-2.5 mb-6 w-full max-w-md">
                                {SOURCE_OPTIONS.map(src => {
                                    const Icon = src.icon;
                                    return (
                                        <div key={src.id} className={`flex items-center gap-2.5 p-3 rounded-2xl border ${src.border} ${src.bg}`}>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70">
                                                <Icon className={`w-4 h-4 ${src.color}`} />
                                            </div>
                                            <span className={`text-xs font-semibold ${src.color}`}>{src.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-sm font-medium text-gray-600">Search by ISBN, title, author, DOI, or LCCN</p>
                            <p className="text-xs text-gray-400 mt-1">Choose sources above, type a term, and hit Search</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                    <Globe className="w-3 h-3" /> Data from LoC, Open Library, Google Books &amp; CrossRef — all free, no API key required
                </div>
            </div>
        </div>,
        document.body
    );
}
