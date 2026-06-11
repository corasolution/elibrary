import OpacLayout from '@/Layouts/OpacLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, FileText, Headphones, Film, Sparkles, GraduationCap, Newspaper, ArrowRight, Play } from 'lucide-react';
import { useState } from 'react';

export default function OpacHome({ ebooks = [], epublications = [], audio = [], video = [], theses = [], stats = {} }) {
    const { t } = useTranslation();
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';
    const [query, setQuery] = useState('');
    const [aiEnabled, setAiEnabled] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            const params = { q: query };
            if (aiEnabled) params.ai = '1';
            router.get(`${base}/catalog`, params);
        }
    };

    // Collection types
    const collections = [
        { name: t('home.material_ebooks'), count: '824,312 titles', icon: BookOpen, color: 'blue', href: `${base}/catalog?type=ebook` },
        { name: t('home.material_catalog'), count: 'All physical items', icon: FileText, color: 'blue', href: `${base}/catalog` },
        { name: t('home.material_epubs'), count: '312,084 issues', icon: Newspaper, color: 'blue', href: `${base}/catalog?type=epub` },
        { name: t('home.material_audio'), count: '48,207 recordings', icon: Headphones, color: 'blue', href: `${base}/catalog?type=audio` },
        { name: t('home.material_video'), count: '22,914 films', icon: Film, color: 'blue', href: `${base}/catalog?type=video` },
        { name: t('home.material_theses'), count: '104,550 papers', icon: GraduationCap, color: 'blue', href: `${base}/catalog?type=thesis` },
    ];

    // Trending keywords
    const trendingKeywords = [
        'Climate change',
        'Khmer literature',
        'Public health',
        'AI ethics',
        'Economic policy',
    ];

    // Sample AI suggestions
    const aiSuggestions = [
        '"Summarize research on rice farming adaptation"',
        '"Theses on urban planning from 2020–2024"',
        '"Audio lectures about machine learning fundamentals"',
    ];

    return (
        <OpacLayout>
            {/* Hero + Search - Compact & Beautiful */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
                {/* Background patterns */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-8">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Heading */}
                        <h1 className="text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight text-white leading-tight mb-6">
                            Find anything in the <span className="text-blue-100">national archive</span>,<br className="hidden sm:block"/>
                            from one search.
                        </h1>
                    </div>

                    {/* Search */}
                    <div className="max-w-7xl mx-auto">
                        <form onSubmit={handleSearch}>
                            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-2xl p-2">
                                <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={aiEnabled ? "Ask a question..." : "Search titles, authors, ISBN — or ask a question…"}
                                    className="flex-1 h-11 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm px-2"
                                />

                                {/* AI mode toggle */}
                                <button
                                    type="button"
                                    onClick={() => setAiEnabled(!aiEnabled)}
                                    className={`hidden md:inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold transition-all ${
                                        aiEnabled
                                            ? 'bg-blue-700 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    AI
                                </button>

                                {/* Filter select */}
                                <select className="hidden md:block px-3 h-9 bg-gray-50 rounded-lg outline-none text-xs font-medium text-gray-700 border-0">
                                    <option>All collections</option>
                                    <option>eBooks</option>
                                    <option>Journals</option>
                                    <option>Theses</option>
                                    <option>Audio</option>
                                    <option>Video</option>
                                </select>

                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-all"
                                >
                                    {t('home.search_btn')}
                                </button>
                            </div>
                        </form>

                        {/* Trending keywords */}
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs flex-wrap">
                            <span className="uppercase tracking-wider font-semibold text-white/60 mr-1">Trending:</span>
                            {trendingKeywords.map((keyword, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setQuery(keyword)}
                                    className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
                                >
                                    {keyword}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Collection Cards */}
            <section className="max-w-7xl mx-auto px-6 mt-12">
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">Browse by format</div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Collections</h2>
                    </div>
                    <Link href={`${base}/catalog`} className="text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1">
                        View all formats
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {collections.map((collection, i) => {
                        const Icon = collection.icon;
                        return (
                            <Link
                                key={i}
                                href={collection.href}
                                className="tile group relative bg-white border border-slate-200 rounded-2xl p-5 overflow-hidden hover:border-blue-200 hover:-translate-y-1 hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 mb-4 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="font-bold text-gray-900">{collection.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{collection.count}</div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-4 h-4 text-blue-700" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* eBooks Section */}
            {ebooks.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 mt-16">
                    <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">{t('home.material_ebooks')}</h2>
                                <div className="text-sm text-gray-500">Full-text titles available for immediate reading</div>
                            </div>
                        </div>
                        <Link href={`${base}/catalog?type=ebook`} className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                            See all →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                        {ebooks.slice(0, 12).map((record, i) => (
                            <Link
                                key={record.id}
                                href={`${base}/catalog/${record.id}`}
                                className="book-card group block"
                            >
                                <div className={`relative aspect-[2/3] rounded-xl shadow-sm overflow-hidden ${
                                    !record.cover_image_url ? `bg-gradient-to-br cover-stripes ${
                                        i % 8 === 0 ? 'from-blue-800 to-blue-600' :
                                        i % 8 === 1 ? 'from-blue-950 to-blue-700' :
                                        i % 8 === 2 ? 'from-blue-600 to-blue-400' :
                                        i % 8 === 3 ? 'from-blue-900 to-blue-600' :
                                        i % 8 === 4 ? 'from-blue-400 to-blue-200' :
                                        i % 8 === 5 ? 'from-gray-700 to-blue-800' :
                                        i % 8 === 6 ? 'from-cyan-500 to-blue-800' :
                                        'from-blue-700 to-blue-950'
                                    }` : ''
                                }`}>
                                    {record.cover_image_url && (
                                        <img
                                            src={record.cover_image_url}
                                            alt={record.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                                        <div className="text-[13px] font-bold leading-tight line-clamp-3 text-white">
                                            {record.title}
                                        </div>
                                        <div className="text-[10px] mt-1 text-white/80">
                                            {record.authors?.[0]?.name || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors"></div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-sm font-semibold text-gray-900 truncate">{record.title}</div>
                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                        {record.authors?.[0]?.name || 'Unknown'} · {record.publication_year}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ePublications Section */}
            {epublications.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 mt-16">
                    <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                                <Newspaper className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">{t('home.material_epubs')}</h2>
                                <div className="text-sm text-gray-500">Journals, magazines, and serial issues</div>
                            </div>
                        </div>
                        <Link href={`${base}/catalog?type=epub`} className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                            See all →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                        {epublications.slice(0, 12).map((record, i) => (
                            <Link
                                key={record.id}
                                href={`${base}/catalog/${record.id}`}
                                className="book-card group block"
                            >
                                <div className={`relative aspect-[2/3] rounded-xl shadow-sm overflow-hidden ${
                                    !record.cover_image_url ? `bg-gradient-to-br cover-stripes ${
                                        i % 8 === 0 ? 'from-blue-600 to-blue-400' :
                                        i % 8 === 1 ? 'from-blue-700 to-blue-800' :
                                        i % 8 === 2 ? 'from-blue-950 to-blue-700' :
                                        i % 8 === 3 ? 'from-blue-400 to-blue-200' :
                                        i % 8 === 4 ? 'from-blue-800 to-blue-600' :
                                        i % 8 === 5 ? 'from-blue-600 to-blue-400' :
                                        i % 8 === 6 ? 'from-blue-900 to-blue-700' :
                                        'from-gray-700 to-blue-800'
                                    }` : ''
                                }`}>
                                    {record.cover_image_url && (
                                        <img
                                            src={record.cover_image_url}
                                            alt={record.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                                        <div className="text-[13px] font-bold leading-tight line-clamp-3 text-white">
                                            {record.title}
                                        </div>
                                        <div className="text-[10px] mt-1 text-white/80">
                                            {record.authors?.[0]?.name || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors"></div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-sm font-semibold text-gray-900 truncate">{record.title}</div>
                                    <div className="text-xs text-gray-500 truncate mt-0.5">{record.publication_year}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Audio Section */}
            {audio.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 mt-16">
                    <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                                <Headphones className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">{t('home.audio_collection')}</h2>
                                <div className="text-sm text-gray-500">Lectures, audiobooks, oral histories</div>
                            </div>
                        </div>
                        <Link href={`${base}/catalog?type=audio`} className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                            Browse all audio →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {audio.map((record, i) => {
                            const resource = record.digital_resources?.[0];
                            const duration = resource?.duration_seconds;
                            const minutes = duration ? Math.floor(duration / 60) : 0;
                            const seconds = duration ? duration % 60 : 0;
                            const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                            return (
                                <Link
                                    key={record.id}
                                    href={`${base}/catalog/${record.id}`}
                                    className="book-card flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-3 pr-4"
                                >
                                    <div className={`relative w-20 h-20 rounded-xl shrink-0 overflow-hidden flex items-center justify-center ${
                                        !record.cover_image_url ? `cover-stripes ${
                                            i % 8 === 0 ? 'cv-1' :
                                            i % 8 === 1 ? 'cv-2' :
                                            i % 8 === 2 ? 'cv-3' :
                                            i % 8 === 3 ? 'cv-4' :
                                            i % 8 === 4 ? 'cv-7' :
                                            'cv-8'
                                        }` : ''
                                    }`}>
                                        {record.cover_image_url && (
                                            <img
                                                src={record.cover_image_url}
                                                alt={record.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="relative z-10 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow">
                                            <Play className="w-5 h-5 text-blue-700 ml-0.5" fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-gray-900 line-clamp-2">{record.title}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{record.authors?.[0]?.name || 'Unknown'}</div>
                                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                                            {duration && <span>{durationStr}</span>}
                                            <span>{resource?.view_count || 0} plays</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Video Section */}
            {video.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 mt-16">
                    <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                                <Film className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">{t('home.video_library')}</h2>
                                <div className="text-sm text-gray-500">Documentaries, recorded lectures, archival footage</div>
                            </div>
                        </div>
                        <Link href={`${base}/catalog?type=video`} className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                            Browse all video →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {video.map((record, i) => {
                            const resource = record.digital_resources?.[0];
                            const duration = resource?.duration_seconds;
                            const minutes = duration ? Math.floor(duration / 60) : 0;
                            const seconds = duration ? duration % 60 : 0;
                            const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                            return (
                                <Link
                                    key={record.id}
                                    href={`${base}/catalog/${record.id}`}
                                    className="book-card group block"
                                >
                                    <div className={`relative aspect-video rounded-xl overflow-hidden shadow-sm ${
                                        !record.cover_image_url ? `cover-stripes ${
                                            i % 4 === 0 ? 'cv-2' :
                                            i % 4 === 1 ? 'cv-1' :
                                            i % 4 === 2 ? 'cv-6' :
                                            'cv-8'
                                        }` : ''
                                    }`}>
                                        {record.cover_image_url && (
                                            <img
                                                src={record.cover_image_url}
                                                alt={record.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        )}
                                        {duration && (
                                            <div className="absolute bottom-2.5 right-2.5 text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded z-10">
                                                {durationStr}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Play className="w-6 h-6 text-blue-700 ml-1" fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="text-sm font-semibold text-gray-900 line-clamp-2">{record.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{resource?.view_count || 0} views</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Theses Section */}
            {theses.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 mt-16 mb-16">
                    <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">{t('home.theses_dissertations')}</h2>
                                <div className="text-sm text-gray-500">Graduate research from partner institutions</div>
                            </div>
                        </div>
                        <Link href={`${base}/catalog?type=thesis`} className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                            View all theses →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                        {theses.slice(0, 12).map((record, i) => (
                            <Link
                                key={record.id}
                                href={`${base}/catalog/${record.id}`}
                                className="book-card group block"
                            >
                                <div className={`relative aspect-[2/3] rounded-xl shadow-sm overflow-hidden ${
                                    !record.cover_image_url ? `bg-gradient-to-br cover-stripes ${
                                        i % 8 === 0 ? 'from-blue-800 to-blue-600' :
                                        i % 8 === 1 ? 'from-blue-950 to-blue-700' :
                                        i % 8 === 2 ? 'from-blue-600 to-blue-400' :
                                        i % 8 === 3 ? 'from-blue-900 to-blue-600' :
                                        i % 8 === 4 ? 'from-blue-400 to-blue-200' :
                                        i % 8 === 5 ? 'from-gray-700 to-blue-800' :
                                        i % 8 === 6 ? 'from-cyan-500 to-blue-800' :
                                        'from-blue-700 to-blue-950'
                                    }` : ''
                                }`}>
                                    {record.cover_image_url && (
                                        <img
                                            src={record.cover_image_url}
                                            alt={record.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                                        <div className="text-[13px] font-bold leading-tight line-clamp-3 text-white">
                                            {record.title}
                                        </div>
                                        <div className="text-[10px] mt-1 text-white/80">
                                            {record.authors?.[0]?.name || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors"></div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-sm font-semibold text-gray-900 truncate">{record.title}</div>
                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                        {record.authors?.[0]?.name || 'Unknown'} · {record.publication_year}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </OpacLayout>
    );
}
