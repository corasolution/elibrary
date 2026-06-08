import OpacLayout from '@/Layouts/OpacLayout';
import { router, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import RecordCard from '@/Components/Opac/RecordCard';
import FacetedFilter from '@/Components/Opac/FacetedFilter';

export default function SearchPage({ results, query: initialQuery, filters: initialFilters, materialTypes }) {
    const { t } = useTranslation();
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';
    const [query, setQuery] = useState(initialQuery);
    const [showFilters, setShowFilters] = useState(false);

    const applyFilters = (newFilters) => {
        router.get(`${base}/catalog`, { q: query, ...newFilters }, { preserveScroll: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(`${base}/catalog`, { q: query, ...initialFilters });
    };

    return (
        <OpacLayout>
            {/* Search bar */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-8 px-4">
                <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('nav.search_placeholder')}
                            className="w-full pl-10 pr-4 h-11 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <button type="submit" className="bg-white text-blue-700 px-6 h-11 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors">
                        Search
                    </button>
                    <button type="button" onClick={() => setShowFilters(!showFilters)}
                        className="bg-blue-600 text-white px-3 h-11 rounded-xl hover:bg-blue-500 transition-colors">
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                </form>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
                {/* Facets sidebar */}
                {showFilters && (
                    <aside className="w-56 shrink-0">
                        <FacetedFilter
                            materialTypes={materialTypes}
                            filters={initialFilters}
                            onChange={applyFilters}
                        />
                    </aside>
                )}

                {/* Results */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                            {results.total > 0
                                ? <><strong>{results.total.toLocaleString()}</strong> {t('catalog.search_results')} {initialQuery && `for "${initialQuery}"`}</>
                                : t('catalog.no_results')
                            }
                        </p>
                        <select
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                            value={initialFilters.sort || ''}
                            onChange={(e) => applyFilters({ ...initialFilters, sort: e.target.value })}
                        >
                            <option value="">Relevance</option>
                            <option value="title">Title A–Z</option>
                            <option value="year_desc">Newest First</option>
                            <option value="year_asc">Oldest First</option>
                        </select>
                    </div>

                    {results.data?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                            {results.data.map((record) => (
                                <RecordCard key={record.id} record={record} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>{t('catalog.no_results')}</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {results.last_page > 1 && (
                        <div className="flex justify-center gap-2">
                            {results.links?.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-3 py-1.5 rounded-lg text-sm ${
                                        link.active
                                            ? 'bg-blue-700 text-white'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </OpacLayout>
    );
}
