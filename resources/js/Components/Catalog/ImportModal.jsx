import { useState, useRef, useEffect } from 'react';
import {
    X, Search, Loader2, BookOpen, ExternalLink, Check,
    Library, Globe, BookMarked, FileText,
} from 'lucide-react';

const SOURCE_OPTIONS = [
    { id: 'loc',         label: 'Library of Congress', icon: Library,    color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
    { id: 'openlibrary', label: 'Open Library',        icon: BookOpen,   color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
    { id: 'googlebooks', label: 'Google Books',         icon: Globe,      color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
    { id: 'crossref',    label: 'CrossRef (DOI)',       icon: FileText,   color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
];

const TYPE_OPTIONS = [
    { value: 'isbn',   label: 'ISBN' },
    { value: 'title',  label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'doi',    label: 'DOI' },
    { value: 'lccn',   label: 'LCCN' },
];

const SOURCE_COLORS = {
    loc:         { badge: 'bg-red-100 text-red-700',    label: 'Library of Congress' },
    openlibrary: { badge: 'bg-blue-100 text-blue-700',  label: 'Open Library' },
    googlebooks: { badge: 'bg-green-100 text-green-700', label: 'Google Books' },
    crossref:    { badge: 'bg-purple-100 text-purple-700', label: 'CrossRef' },
};

export default function ImportModal({ onImport, onClose }) {
    const [query,         setQuery]         = useState('');
    const [searchType,    setSearchType]    = useState('isbn');
    const [sources,       setSources]       = useState(['loc', 'openlibrary', 'googlebooks', 'crossref']);
    const [loading,       setLoading]       = useState(false);
    const [results,       setResults]       = useState([]);
    const [error,         setError]         = useState(null);
    const [searched,      setSearched]      = useState(false);
    const [importing,     setImporting]     = useState(null); // record index being imported
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const toggleSource = (id) => {
        setSources(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const doSearch = async (e) => {
        e?.preventDefault();
        if (!query.trim() || sources.length === 0) return;

        setLoading(true);
        setError(null);
        setResults([]);
        setSearched(false);

        try {
            const params = new URLSearchParams({
                q: query.trim(),
                type: searchType,
            });
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
        // Remove internal _source keys before passing to form
        const { _source, _source_label, _source_url, ...clean } = record;
        onImport(clean);
        // Small delay so the checkmark shows briefly
        setTimeout(() => onClose(), 400);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pb-4 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Import from Library Catalog</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Search Library of Congress, Open Library, Google Books, or CrossRef</p>
                        </div>
                        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search form */}
                    <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0 space-y-3">

                        {/* Source toggles */}
                        <div className="flex flex-wrap gap-2">
                            {SOURCE_OPTIONS.map(src => {
                                const Icon = src.icon;
                                const active = sources.includes(src.id);
                                return (
                                    <button
                                        key={src.id}
                                        type="button"
                                        onClick={() => toggleSource(src.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                            active
                                                ? `${src.bg} ${src.color} ${src.border}`
                                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {src.label}
                                        {active && <Check className="w-3 h-3 ml-0.5" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Query row */}
                        <form onSubmit={doSearch} className="flex gap-2">
                            <select
                                value={searchType}
                                onChange={e => setSearchType(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
                            >
                                {TYPE_OPTIONS.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder={
                                        searchType === 'isbn'   ? 'e.g. 9780743273565' :
                                        searchType === 'author' ? 'e.g. Tolkien' :
                                        searchType === 'doi'    ? 'e.g. 10.1093/ajcn/72.1.1s' :
                                        searchType === 'lccn'   ? 'e.g. 2001026335' :
                                        'e.g. The Great Gatsby'
                                    }
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !query.trim() || sources.length === 0}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                <p className="text-sm text-gray-500">Searching {sources.length} source{sources.length !== 1 ? 's' : ''}…</p>
                            </div>
                        )}

                        {error && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {searched && !loading && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                                <BookMarked className="w-10 h-10 text-gray-200 mb-3" />
                                <p className="text-sm font-medium text-gray-500">No results found</p>
                                <p className="text-xs text-gray-400 mt-1">Try a different search term or enable more sources</p>
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="divide-y divide-gray-100">
                                {results.map((record, idx) => {
                                    const src = SOURCE_COLORS[record._source] ?? { badge: 'bg-gray-100 text-gray-600', label: record._source };
                                    const isImporting = importing === idx;
                                    return (
                                        <div key={idx} className="px-6 py-4 hover:bg-gray-50 flex gap-4 group">
                                            {/* Cover */}
                                            <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                                {record.cover_image_url ? (
                                                    <img
                                                        src={record.cover_image_url}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={e => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <BookOpen className="w-5 h-5 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">
                                                            {record.title}
                                                            {record.subtitle && (
                                                                <span className="font-normal text-gray-500"> — {record.subtitle}</span>
                                                            )}
                                                        </h3>
                                                        {record.authors?.length > 0 && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {record.authors.map(a => a.name).join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleImport(record, idx)}
                                                        disabled={importing !== null}
                                                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                                            isImporting
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 opacity-0 group-hover:opacity-100'
                                                        }`}
                                                    >
                                                        {isImporting
                                                            ? <><Check className="w-3.5 h-3.5" /> Imported</>
                                                            : 'Use this record'
                                                        }
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${src.badge}`}>
                                                        {src.label}
                                                    </span>
                                                    {record.publisher && (
                                                        <span className="text-xs text-gray-400">{record.publisher}</span>
                                                    )}
                                                    {record.publication_year && (
                                                        <span className="text-xs text-gray-400">{record.publication_year}</span>
                                                    )}
                                                    {record.isbn && (
                                                        <span className="text-xs font-mono text-gray-400">ISBN {record.isbn}</span>
                                                    )}
                                                    {record.doi && (
                                                        <span className="text-xs font-mono text-gray-400">DOI {record.doi}</span>
                                                    )}
                                                    {record.lcc_class && (
                                                        <span className="text-xs font-mono text-gray-400">LCC {record.lcc_class}</span>
                                                    )}
                                                    {record._source_url && (
                                                        <a
                                                            href={record._source_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-400 hover:text-blue-600 flex items-center gap-0.5"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <ExternalLink className="w-3 h-3" /> View
                                                        </a>
                                                    )}
                                                </div>

                                                {record.abstract && (
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{record.abstract}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!searched && !loading && (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                <div className="grid grid-cols-2 gap-3 mb-6 w-full max-w-sm">
                                    {SOURCE_OPTIONS.map(src => {
                                        const Icon = src.icon;
                                        return (
                                            <div key={src.id} className={`flex items-center gap-2 p-3 rounded-xl border ${src.border} ${src.bg}`}>
                                                <Icon className={`w-4 h-4 ${src.color} flex-shrink-0`} />
                                                <span className={`text-xs font-medium ${src.color}`}>{src.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-sm text-gray-500">Search by ISBN, title, author, DOI, or LCCN</p>
                                <p className="text-xs text-gray-400 mt-1">Select sources above and enter a search term</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-gray-100 flex-shrink-0 text-xs text-gray-400 text-center">
                        Data from Library of Congress, Open Library, Google Books, and CrossRef. All free, no API key required.
                    </div>
                </div>
            </div>
        </>
    );
}
