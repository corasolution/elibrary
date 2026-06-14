import OpacLayout from '@/Layouts/OpacLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    Search, BookOpen, FileText, Headphones, Film, Sparkles,
    GraduationCap, Newspaper, ArrowRight, Play, Book,
    Star, Zap, Trophy, ChevronRight, Clock, MapPin, Database, BookMarked,
} from 'lucide-react';
import { useState } from 'react';

// ─── Emoji / category config per theme ────────────────────────────────────────
const KIDS_CATEGORIES = [
    { label: 'Picture Books', emoji: '📚', href: '?type=ebook' },
    { label: 'Stories',       emoji: '🌟', href: '?type=epub' },
    { label: 'Learn & Play',  emoji: '🎓', href: '?type=thesis' },
    { label: 'Listen',        emoji: '🎵', href: '?type=audio' },
    { label: 'Watch',         emoji: '🎬', href: '?type=video' },
    { label: 'All Books',     emoji: '🔍', href: '/catalog' },
];

const SCHOOL_TABS = ['All Resources', 'Textbooks', 'Reference', 'E-Resources', 'New Arrivals'];

export default function OpacHome({ ebooks = [], epublications = [], audio = [], video = [], theses = [], stats = {}, collections = [] }) {
    const { t } = useTranslation();
    const { tenant, theme } = usePage().props;
    const base = tenant?.base_url ?? '';
    const [query, setQuery] = useState('');
    const [aiEnabled, setAiEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const heroStyle = theme?.styles?.heroStyle  || 'dotted';
    const cardStyle = theme?.styles?.cardStyle  || 'shadow';
    const layout    = theme?.styles?.layout     || 'centered';
    const primary   = theme?.colors?.primary    || '#3B82F6';
    const accent    = theme?.colors?.accent     || '#2563EB';
    const secondary = theme?.colors?.secondary  || '#64748B';
    const bgColor   = theme?.colors?.background || '#F8FAFC';
    const textColor = theme?.colors?.text       || '#0B1220';
    const isDark    = theme?.styles?.navbarStyle === 'dark';

    const maxW = layout === 'wide' ? 'max-w-screen-xl' : 'max-w-7xl';

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            const params = { q: query };
            if (aiEnabled) params.ai = '1';
            router.get(`${base}/catalog`, params);
        }
    };

    // Live "Browse by Format" cards — built from real material types (with counts)
    // passed by the controller. Links filter the catalog by material_type_id.
    const COLLECTION_ICONS = {
        book: BookOpen, ebook: FileText, book_ebook: BookOpen, journal: Newspaper,
        article: FileText, thesis: GraduationCap, audio: Headphones, video: Film,
        map: MapPin, dataset: Database, cd: Database, dvd: Film, epub: Newspaper,
    };
    const collectionCards = collections.map((c) => ({
        name:  c.name,
        count: c.count,
        icon:  COLLECTION_ICONS[c.code] || Book,
        href:  `${base}/catalog?material_type_id=${c.material_type_id}`,
    }));

    const trendingKeywords = ['Climate change', 'Khmer literature', 'Public health', 'AI ethics', 'Economic policy'];

    // Palette for cover gradients — derived from theme colors
    const coverGradients = [
        `linear-gradient(135deg, ${primary}dd, ${accent}aa)`,
        `linear-gradient(135deg, ${primary}99, ${accent}cc)`,
        `linear-gradient(135deg, ${accent}bb, ${primary}88)`,
        `linear-gradient(135deg, ${primary}cc, ${secondary}88)`,
        `linear-gradient(135deg, ${secondary}99, ${primary}bb)`,
        `linear-gradient(135deg, ${accent}99, ${secondary}cc)`,
        `linear-gradient(135deg, ${primary}bb, ${accent}77)`,
        `linear-gradient(135deg, ${secondary}dd, ${primary}99)`,
    ];

    // ═══════════════════════════════════════════════════════════════════════════
    // HERO VARIANTS
    // ═══════════════════════════════════════════════════════════════════════════

    // 1. eLibrary Modern — polished two-column hero
    const HeroDotted = () => (
        <section className="relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }}>
            {/* Blobs */}
            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-[0.07]" style={{ background: 'white' }} />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full opacity-[0.06]" style={{ background: 'white' }} />
            {/* Dot grid */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />

            <div className={`relative ${maxW} mx-auto px-6 py-8`}>
                <div className="grid md:grid-cols-5 gap-8 items-center">

                    {/* Left: headline + search (3 cols) */}
                    <div className="md:col-span-3">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase"
                            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                            {tenant?.name || 'Digital Library'}
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight mb-1.5">
                            Find anything,{' '}
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>from one search.</span>
                        </h1>
                        <p className="text-white/55 text-sm mb-5">
                            Books, journals, theses, audio, video — your entire catalog in one place.
                        </p>

                        {/* Search bar */}
                        <form onSubmit={handleSearch}>
                            <div className="flex items-center bg-white rounded-2xl overflow-hidden"
                                style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
                                <Search className="w-4 h-4 text-gray-400 ml-4 shrink-0" />
                                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                                    placeholder={aiEnabled ? 'Ask me anything…' : 'Search titles, authors, ISBN…'}
                                    className="flex-1 h-11 bg-transparent border-0 outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400 text-sm px-2" />
                                <div className="flex items-center gap-1 pr-1.5">
                                    <button type="button" onClick={() => setAiEnabled(!aiEnabled)}
                                        className={`hidden md:inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-bold transition-all ${aiEnabled ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        style={aiEnabled ? { backgroundColor: primary } : {}}>
                                        <Sparkles className="w-3 h-3" /> AI
                                    </button>
                                    <button type="submit"
                                        className="h-9 px-5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: accent }}>
                                        {t('home.search_btn')}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Trending */}
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] uppercase tracking-widest font-semibold text-white/40">Try:</span>
                            {trendingKeywords.map((kw, i) => (
                                <button key={i} type="button" onClick={() => setQuery(kw)}
                                    className="px-2.5 py-1 rounded-full text-xs font-medium text-white/70 hover:text-white border border-white/20 hover:bg-white/10 transition-all">
                                    {kw}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: stats + quick-links (2 cols) */}
                    <div className="hidden md:flex md:col-span-2 flex-col gap-2">
                        {[
                            { label: 'Total Titles',      value: stats.total_titles,  icon: BookOpen },
                            { label: 'Digital Resources', value: stats.total_digital, icon: Sparkles },
                            { label: 'Active Members',    value: stats.total_patrons, icon: Star     },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-white leading-none">
                                            {s.value != null ? Number(s.value).toLocaleString() : '—'}
                                        </div>
                                        <div className="text-[11px] text-white/55 mt-0.5">{s.label}</div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="grid grid-cols-3 gap-1.5 mt-1">
                            {collectionCards.slice(0, 3).map((col, i) => {
                                const Icon = col.icon;
                                return (
                                    <Link key={i} href={col.href}
                                        className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-center hover:bg-white/15 transition-all group"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <Icon className="w-4 h-4 text-white/65 group-hover:text-white transition-colors" />
                                        <span className="text-[10px] font-semibold text-white/55 group-hover:text-white/85 leading-tight">{col.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    // 2. Classic Library — two-column banner with book stack illustration
    const HeroBanner = () => (
        <section className="relative overflow-hidden border-b-4" style={{ backgroundColor: bgColor, borderColor: primary }}>
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${primary}, ${accent}, ${primary})` }} />
            <div className={`${maxW} mx-auto px-6 py-14 md:py-20`}>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-px flex-1 max-w-[40px]" style={{ backgroundColor: primary }} />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: primary }}>
                                {tenant?.name || 'Library Catalog'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4"
                            style={{ fontFamily: "'Playfair Display', serif", color: textColor }}>
                            Explore Our<br /><span style={{ color: primary }}>Collection</span>
                        </h1>
                        <p className="text-base mb-8 leading-relaxed"
                            style={{ color: textColor + 'cc', fontFamily: "'Merriweather', serif" }}>
                            Browse thousands of books, journals, theses, and digital resources.
                        </p>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: primary }} />
                                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                                    placeholder="Search the catalog…"
                                    className="w-full h-12 pl-10 pr-4 border-2 bg-white rounded-sm text-sm outline-none"
                                    style={{ borderColor: primary + '60', color: textColor }} />
                            </div>
                            <button type="submit" className="h-12 px-7 text-white text-sm font-bold rounded-sm"
                                style={{ backgroundColor: primary }}>Search</button>
                        </form>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {trendingKeywords.slice(0, 3).map((kw, i) => (
                                <button key={i} type="button" onClick={() => setQuery(kw)}
                                    className="text-xs px-3 py-1.5 border rounded-sm hover:opacity-80"
                                    style={{ borderColor: primary + '50', color: primary, backgroundColor: primary + '10' }}>
                                    {kw}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                        <div className="relative w-56 h-64">
                            {[{ left: '0', rotate: '-rotate-6', bg: bgColor, border: primary },
                              { left: '24px', rotate: 'rotate-2', bg: accent, border: primary },
                              { left: '48px', rotate: '-rotate-1', bg: primary, border: accent }
                            ].map((b, i) => (
                                <div key={i} className={`absolute top-0 ${b.rotate} w-44 h-52 shadow-lg border-l-8`}
                                    style={{ left: b.left, backgroundColor: b.bg, borderLeftColor: b.border, zIndex: i + 10 }}>
                                    <div className="h-full flex flex-col justify-between p-3">
                                        <div className="w-8 h-0.5 rounded bg-white/50" />
                                        <div className="space-y-1">
                                            <div className="w-full h-0.5 rounded bg-white/30" />
                                            <div className="w-3/4 h-0.5 rounded bg-white/30" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    // 3. Dark Elegant — cinematic dark with starfield
    const HeroDarkGradient = () => (
        <section className="relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1a1a2e 50%, #16213e 100%)' }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-white/30"
                        style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, opacity: 0.2 + (i % 5) * 0.1 }} />
                ))}
                <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full blur-[120px]"
                    style={{ background: `${primary}15` }} />
            </div>
            <div className={`relative ${maxW} mx-auto px-6 py-20 md:py-28 text-center`}>
                <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border text-xs font-bold tracking-[0.2em] uppercase"
                    style={{ borderColor: primary + '50', color: primary, backgroundColor: primary + '15' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                    Digital Archive
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4"
                    style={{ fontFamily: "'Lora', serif" }}>
                    {tenant?.name || 'The Digital Library'}
                </h1>
                <p className="text-base md:text-lg mb-10 max-w-xl mx-auto" style={{ color: 'rgba(226,232,240,0.65)' }}>
                    An elegant collection of knowledge, curated for the discerning reader.
                </p>
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 p-1.5 rounded-2xl border"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: primary + '40' }}>
                        <Search className="w-5 h-5 ml-3 shrink-0" style={{ color: primary }} />
                        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                            placeholder="Search the archive…"
                            className="flex-1 h-12 bg-transparent outline-none text-sm px-2"
                            style={{ color: 'rgba(226,232,240,0.9)', caretColor: primary }} />
                        <button type="submit" className="h-11 px-6 rounded-xl text-sm font-bold hover:opacity-90"
                            style={{ backgroundColor: primary, color: bgColor }}>Search</button>
                    </div>
                </form>
                <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                    {trendingKeywords.map((kw, i) => (
                        <button key={i} type="button" onClick={() => setQuery(kw)}
                            className="px-3 py-1 text-xs rounded-full border font-medium"
                            style={{ borderColor: primary + '40', color: primary, backgroundColor: primary + '10' }}>
                            {kw}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );

    // 4. Kids Library — playful, big, colorful bubbles
    const HeroKidsFun = () => (
        <section className="relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primary}ee 0%, ${accent}cc 50%, ${secondary}aa 100%)` }}>
            {/* Floating bubbles */}
            {[
                { size: 'w-24 h-24', pos: 'top-4 left-8',   opacity: 0.15 },
                { size: 'w-16 h-16', pos: 'top-10 right-16', opacity: 0.2  },
                { size: 'w-32 h-32', pos: 'bottom-0 right-8', opacity: 0.1 },
                { size: 'w-12 h-12', pos: 'bottom-8 left-32', opacity: 0.25 },
                { size: 'w-20 h-20', pos: 'top-0 left-1/2',  opacity: 0.15 },
            ].map((b, i) => (
                <div key={i} className={`absolute ${b.size} ${b.pos} rounded-full bg-white pointer-events-none`}
                    style={{ opacity: b.opacity }} />
            ))}

            <div className={`relative ${maxW} mx-auto px-6 py-12 pb-6 text-center`}>
                <div className="text-5xl mb-3">📚</div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight"
                    style={{ fontFamily: "'Nunito', sans-serif", textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    What do you want to<br />
                    <span className="text-yellow-200">read today?</span> ✨
                </h1>
                <p className="text-white/80 text-base mb-8 font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Discover amazing books, stories, audio, and videos!
                </p>

                <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                    <div className="flex items-center gap-2 bg-white rounded-3xl shadow-2xl p-2.5">
                        <Search className="w-6 h-6 ml-2 shrink-0" style={{ color: primary }} />
                        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                            placeholder="Search for books, stories, comics…"
                            className="flex-1 h-12 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-bold"
                            style={{ fontSize: '15px', fontFamily: "'Nunito', sans-serif" }} />
                        <button type="submit"
                            className="h-12 px-6 rounded-2xl text-white font-black text-base transition-all hover:scale-105"
                            style={{ backgroundColor: primary, fontFamily: "'Nunito', sans-serif" }}>
                            Search! 🔍
                        </button>
                    </div>
                </form>

                {/* Big category pills */}
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {KIDS_CATEGORIES.map((cat, i) => (
                        <Link key={i} href={`${base}${cat.href}`}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/20 backdrop-blur border border-white/30 text-white font-bold text-sm hover:bg-white/30 transition-all hover:scale-105"
                            style={{ fontFamily: "'Nunito', sans-serif" }}>
                            <span className="text-xl">{cat.emoji}</span>
                            {cat.label}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );

    // 5. School Library — structured, two-column with stats
    const HeroAcademic = () => (
        <section className="border-b" style={{ backgroundColor: bgColor, borderColor: primary + '30' }}>
            {/* Top accent bar */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${primary} 60%, ${accent} 100%)` }} />

            <div className={`${maxW} mx-auto px-6 py-10`}>
                <div className="grid md:grid-cols-5 gap-8 items-start">
                    {/* Left: search (3 cols) */}
                    <div className="md:col-span-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-6 rounded-sm" style={{ backgroundColor: accent }} />
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
                                {tenant?.name || 'School Library'} — Catalog
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-5" style={{ color: primary }}>
                            Find Your Next<br />Resource
                        </h1>
                        <form onSubmit={handleSearch}>
                            <div className="flex gap-2 mb-3">
                                <select className="px-3 py-2 text-sm border-2 rounded-sm bg-white outline-none font-semibold"
                                    style={{ borderColor: primary + '40', color: primary }}>
                                    <option>All Resources</option>
                                    <option>Books</option>
                                    <option>E-Resources</option>
                                    <option>Theses</option>
                                    <option>Journals</option>
                                </select>
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: primary }} />
                                    <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                                        placeholder="Title, author, keyword, ISBN…"
                                        className="w-full h-11 pl-10 pr-4 border-2 bg-white rounded-sm text-sm outline-none"
                                        style={{ borderColor: primary + '60', color: textColor }} />
                                </div>
                                <button type="submit" className="h-11 px-6 text-white text-sm font-bold rounded-sm"
                                    style={{ backgroundColor: primary }}>Search</button>
                            </div>
                        </form>
                        {/* Resource tabs */}
                        <div className="flex gap-0.5 mt-4">
                            {SCHOOL_TABS.map((tab, i) => (
                                <button key={i} type="button" onClick={() => setActiveTab(i)}
                                    className="text-xs font-bold px-3 py-1.5 border-b-2 transition-all"
                                    style={activeTab === i
                                        ? { borderColor: accent, color: accent, backgroundColor: accent + '10' }
                                        : { borderColor: 'transparent', color: textColor + '80' }}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: quick stats (2 cols) */}
                    <div className="md:col-span-2">
                        <div className="border rounded-sm overflow-hidden" style={{ borderColor: primary + '30' }}>
                            <div className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white"
                                style={{ backgroundColor: primary }}>
                                Library at a Glance
                            </div>
                            {[
                                { label: 'Total Titles',     value: stats.total_titles  || '—', icon: BookOpen   },
                                { label: 'Available Now',    value: stats.available     || '—', icon: Zap        },
                                { label: 'New This Month',   value: stats.new_this_month || '—', icon: Star      },
                                { label: 'Digital Resources',value: stats.digital_count || '—', icon: Film       },
                            ].map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                                        style={{ borderColor: primary + '15', backgroundColor: i % 2 === 0 ? 'white' : bgColor }}>
                                        <Icon className="w-4 h-4 shrink-0" style={{ color: accent }} />
                                        <span className="text-xs flex-1" style={{ color: textColor + 'aa' }}>{s.label}</span>
                                        <span className="text-sm font-black" style={{ color: primary }}>{s.value}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: textColor + '60' }}>
                            <Clock className="w-3 h-3" />
                            Open Mon–Fri 8:00 – 17:00
                            <span className="mx-1">·</span>
                            <MapPin className="w-3 h-3" />
                            Main Building, Room 102
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    // 6. Public Library — magazine editorial
    const HeroMagazine = () => (
        <section className="relative" style={{ backgroundColor: bgColor }}>
            <div className={`${maxW} mx-auto px-6`}>
                <div className="grid md:grid-cols-12 gap-0 min-h-[260px]">
                    {/* Left: main headline (7 cols) */}
                    <div className="md:col-span-7 py-12 pr-0 md:pr-10 flex flex-col justify-center border-r"
                        style={{ borderColor: primary + '20' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-0.5" style={{ backgroundColor: primary }} />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: primary }}>
                                Community Library
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4"
                            style={{ color: textColor, fontFamily: "'DM Sans', sans-serif" }}>
                            Books for<br />
                            <span style={{ color: primary }}>Everyone</span> in<br />
                            Our Community
                        </h1>
                        <p className="text-sm mb-6" style={{ color: textColor + '80' }}>
                            Free access to thousands of books, digital resources, and programs for all ages.
                        </p>
                        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: primary }} />
                                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                                    placeholder="Find a book, author, or topic…"
                                    className="w-full h-12 pl-10 pr-4 border-2 bg-white rounded text-sm outline-none"
                                    style={{ borderColor: primary + '50', color: textColor }} />
                            </div>
                            <button type="submit" className="h-12 px-6 rounded text-white font-bold text-sm hover:opacity-90"
                                style={{ backgroundColor: primary }}>Search</button>
                        </form>
                    </div>

                    {/* Right: quick-access tiles (5 cols) */}
                    <div className="md:col-span-5 py-8 pl-0 md:pl-10 flex flex-col justify-center">
                        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: textColor + '60' }}>Quick Access</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'New Arrivals',    emoji: '✨', href: `${base}/catalog?sort=newest` },
                                { label: 'eBooks Online',   emoji: '📱', href: `${base}/catalog?type=ebook`  },
                                { label: 'Children\'s',     emoji: '🧸', href: `${base}/catalog?q=children`  },
                                { label: 'Audio Books',     emoji: '🎧', href: `${base}/catalog?type=audio`  },
                            ].map((item, i) => (
                                <Link key={i} href={item.href}
                                    className="flex items-center gap-3 p-3 border-2 rounded hover:border-opacity-100 group transition-all hover:shadow-sm"
                                    style={{ borderColor: primary + '25', backgroundColor: 'white' }}>
                                    <span className="text-2xl">{item.emoji}</span>
                                    <span className="text-xs font-bold leading-tight" style={{ color: textColor }}>{item.label}</span>
                                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: primary }} />
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {trendingKeywords.slice(0, 3).map((kw, i) => (
                                <button key={i} type="button" onClick={() => setQuery(kw)}
                                    className="text-xs px-3 py-1 rounded-full border font-medium"
                                    style={{ borderColor: accent + '50', color: accent, backgroundColor: accent + '10' }}>
                                    {kw}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Bottom accent strip */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }} />
        </section>
    );

    // 7. University Library — parchment background, navy + gold, clean academic search
    const HeroUniversity = () => (
        <section style={{ backgroundColor: bgColor, borderBottom: `3px solid ${accent}` }}>
            {/* Navy top bar */}
            <div className="px-6 py-3 flex items-center justify-between"
                style={{ backgroundColor: primary }}>
                <div className="flex items-center gap-6">
                    {[
                        { label: 'Databases',   icon: Database,   href: `${base}/catalog?type=ebook` },
                        { label: 'Journals',    icon: BookMarked, href: `${base}/catalog?type=epub` },
                        { label: 'New Arrivals',icon: Star,       href: `${base}/catalog?sort=newest` },
                    ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <Link key={i} href={item.href}
                                className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
                                style={{ color: accent }}>
                                <Icon className="w-3.5 h-3.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {tenant?.name || 'University Library System'}
                </div>
            </div>

            {/* Main search area */}
            <div className={`${maxW} mx-auto px-6 py-10`}>
                <div className="max-w-3xl">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 flex items-center justify-center text-xs font-black text-white rounded-sm"
                            style={{ backgroundColor: accent }}>
                            {(tenant?.name?.[0] || 'L').toUpperCase()}
                        </div>
                        <h1 className="text-2xl font-bold"
                            style={{ fontFamily: "'Crimson Text', serif", color: primary }}>
                            {tenant?.name || 'Library'} — Catalog Search
                        </h1>
                    </div>
                    <p className="text-sm mb-6" style={{ color: textColor + '80', fontFamily: "'Source Sans Pro', sans-serif" }}>
                        Search books, journals, theses, e-resources, and more
                    </p>

                    <form onSubmit={handleSearch}>
                        <div className="flex gap-0 shadow-sm">
                            <select className="px-3 py-0 text-sm border-2 border-r-0 bg-white font-semibold outline-none"
                                style={{ borderColor: primary + '50', color: primary, height: '46px' }}>
                                <option>All</option>
                                <option>Title</option>
                                <option>Author</option>
                                <option>Subject</option>
                                <option>ISBN</option>
                            </select>
                            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                                placeholder="Search the catalog by title, author, or subject..."
                                className="flex-1 h-[46px] px-4 border-2 bg-white text-sm outline-none"
                                style={{ borderColor: primary + '50', color: textColor, fontFamily: "'Source Sans Pro', sans-serif" }} />
                            <button type="submit"
                                className="h-[46px] px-7 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: accent, fontFamily: "'Source Sans Pro', sans-serif" }}>
                                Search
                            </button>
                        </div>
                    </form>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs" style={{ color: textColor + '70' }}>
                        <span className="font-semibold">Try:</span>
                        {trendingKeywords.map((kw, i) => (
                            <button key={i} type="button" onClick={() => setQuery(kw)}
                                className="underline hover:no-underline transition-all"
                                style={{ color: primary }}>
                                {kw}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subject browse strip */}
            <div className="border-t px-6 py-3 flex items-center gap-1 overflow-x-auto"
                style={{ borderColor: accent + '30', backgroundColor: primary + '08' }}>
                <span className="text-xs font-bold uppercase tracking-wider mr-3 shrink-0"
                    style={{ color: primary }}>Browse by Subject:</span>
                {['Computer Science','History','Philosophy','Biology','Economics','Literature','Physics','Psychology'].map((sub, i) => (
                    <Link key={i} href={`${base}/catalog?subject=${encodeURIComponent(sub)}`}
                        className="shrink-0 text-xs px-3 py-1 border hover:text-white hover:border-transparent transition-all"
                        style={{ borderColor: primary + '40', color: primary, backgroundColor: 'transparent' }}
                        onMouseEnter={e => { e.target.style.backgroundColor = primary; e.target.style.color = 'white'; }}
                        onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = primary; }}>
                        {sub}
                    </Link>
                ))}
            </div>
        </section>
    );

    const HEROES = {
        'dotted':        HeroDotted,
        'banner':        HeroBanner,
        'dark-gradient': HeroDarkGradient,
        'kids-fun':      HeroKidsFun,
        'academic':      HeroAcademic,
        'magazine':      HeroMagazine,
        'university':    HeroUniversity,
    };
    const HeroComponent = HEROES[heroStyle] || HeroDotted;

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION HEADERS
    // ═══════════════════════════════════════════════════════════════════════════

    const SectionHeader = ({ icon: Icon, title, subtitle, href, linkText }) => {
        if (heroStyle === 'banner') {
            return (
                <div className="flex items-end justify-between mb-7 gap-4 flex-wrap pb-4 border-b-2"
                    style={{ borderColor: primary + '30' }}>
                    <div>
                        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: textColor }}>{title}</h2>
                        {subtitle && <div className="text-sm mt-0.5" style={{ color: textColor + '80', fontFamily: "'Merriweather', serif" }}>{subtitle}</div>}
                    </div>
                    {href && <Link href={href} className="text-sm font-semibold flex items-center gap-1" style={{ color: primary }}>
                        {linkText} <ArrowRight className="w-4 h-4" />
                    </Link>}
                </div>
            );
        }
        if (heroStyle === 'dark-gradient') {
            return (
                <div className="flex items-end justify-between mb-7 gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: primary + '20', border: `1px solid ${primary}40` }}>
                            <Icon className="w-5 h-5" style={{ color: primary }} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: primary }}>Collection</div>
                            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Lora', serif" }}>{title}</h2>
                        </div>
                    </div>
                    {href && <Link href={href} className="text-xs font-semibold flex items-center gap-1" style={{ color: primary }}>
                        {linkText} →
                    </Link>}
                </div>
            );
        }
        if (heroStyle === 'kids-fun') {
            return (
                <div className="flex items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                            style={{ backgroundColor: primary }}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black" style={{ fontFamily: "'Nunito', sans-serif", color: textColor }}>{title}</h2>
                    </div>
                    {href && <Link href={href}
                        className="text-sm font-black px-4 py-2 rounded-2xl text-white hover:opacity-90 transition-all hover:scale-105"
                        style={{ backgroundColor: primary, fontFamily: "'Nunito', sans-serif" }}>
                        See all! →
                    </Link>}
                </div>
            );
        }
        if (heroStyle === 'academic') {
            return (
                <div className="flex items-center justify-between mb-4 gap-4 pb-2 border-b"
                    style={{ borderColor: primary + '30' }}>
                    <div className="flex items-center gap-2">
                        <div className="w-0.5 h-5 rounded-full" style={{ backgroundColor: accent }} />
                        <h2 className="text-base font-black uppercase tracking-wider" style={{ color: primary }}>{title}</h2>
                        {subtitle && <span className="text-xs ml-2" style={{ color: textColor + '60' }}>— {subtitle}</span>}
                    </div>
                    {href && <Link href={href} className="text-xs font-bold flex items-center gap-1" style={{ color: accent }}>
                        {linkText} <ArrowRight className="w-3 h-3" />
                    </Link>}
                </div>
            );
        }
        if (heroStyle === 'magazine') {
            return (
                <div className="flex items-end justify-between mb-6 gap-4 flex-wrap pb-3 border-b"
                    style={{ borderColor: textColor + '15' }}>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: primary }}>Featured</div>
                        <h2 className="text-2xl font-black" style={{ color: textColor }}>{title}</h2>
                    </div>
                    {href && <Link href={href}
                        className="text-sm font-bold flex items-center gap-1 px-4 py-1.5 border-2 rounded hover:bg-primary hover:text-white transition-all"
                        style={{ borderColor: primary, color: primary }}>
                        {linkText} <ArrowRight className="w-3 h-3" />
                    </Link>}
                </div>
            );
        }
        if (heroStyle === 'university') {
            return (
                <div className="flex items-end justify-between mb-4 gap-4 flex-wrap pb-2 border-b-2"
                    style={{ borderColor: accent }}>
                    <div>
                        <h2 className="text-2xl font-bold"
                            style={{ fontFamily: "'Crimson Text', serif", color: primary }}>{title}</h2>
                        {subtitle && <div className="text-xs mt-0.5" style={{ color: textColor + '70' }}>{subtitle}</div>}
                    </div>
                    {href && <Link href={href} className="text-xs font-bold flex items-center gap-1 px-4 py-1.5 text-white"
                        style={{ backgroundColor: primary }}>
                        {linkText} <ArrowRight className="w-3 h-3" />
                    </Link>}
                </div>
            );
        }
        // Default: modern
        return (
            <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center" style={{ backgroundColor: primary }}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
                        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
                    </div>
                </div>
                {href && <Link href={href} className="text-xs font-semibold" style={{ color: primary }}>
                    {linkText} →
                </Link>}
            </div>
        );
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // BOOK CARDS  — 5 visual paradigms
    // ═══════════════════════════════════════════════════════════════════════════

    const CoverPlaceholder = ({ record, i }) => (
        !record.cover_image_url
            ? <div className="absolute inset-0 flex flex-col justify-between p-3"
                style={{ background: coverGradients[i % 8] }}>
                <Book className="w-5 h-5 text-white/50" />
                <div className="text-[11px] font-bold text-white leading-tight line-clamp-3">{record.title}</div>
              </div>
            : <img src={record.cover_image_url} alt={record.title}
                className="absolute inset-0 w-full h-full object-cover" />
    );

    const BookCard = ({ record, i, href }) => {
        // ── PLAYFUL (kids) ────────────────────────────────────────────────────
        if (cardStyle === 'playful') {
            return (
                <Link href={href} className="book-card group block">
                    <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border-4 group-hover:border-opacity-100 transition-all shadow-md"
                        style={{ borderColor: [primary, accent, secondary][i % 3] }}>
                        <CoverPlaceholder record={record} i={i} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-yellow-300 flex items-center justify-center text-sm shadow">
                            <Star className="w-3.5 h-3.5 text-yellow-700" fill="currentColor" />
                        </div>
                    </div>
                    <div className="mt-2 px-1">
                        <div className="text-sm font-black truncate leading-tight" style={{ fontFamily: "'Nunito', sans-serif", color: textColor }}>
                            {record.title}
                        </div>
                        <div className="text-xs mt-0.5 font-semibold truncate" style={{ color: primary }}>
                            {record.authors?.[0]?.name || 'Unknown'}
                        </div>
                    </div>
                </Link>
            );
        }

        // ── ACADEMIC (school) — list row (grid column span doesn't apply) ──
        if (cardStyle === 'academic') {
            return (
                <Link href={href} className="flex items-center gap-3 py-3 px-4 border-b group hover:bg-white/60 transition-colors"
                    style={{ borderColor: primary + '15' }}>
                    <span className="text-xs w-5 shrink-0 font-mono text-center" style={{ color: textColor + '40' }}>{i + 1}</span>
                    <div className="w-9 h-12 rounded-sm shrink-0 overflow-hidden border relative"
                        style={{ borderColor: primary + '30' }}>
                        <CoverPlaceholder record={record} i={i} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate group-hover:text-blue-700 transition-colors"
                            style={{ color: textColor }}>{record.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: accent }}>
                            {record.authors?.[0]?.name || 'Unknown'}
                        </div>
                    </div>
                    <span className="text-xs shrink-0 hidden md:block" style={{ color: textColor + '50' }}>
                        {record.publication_year}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm shrink-0"
                        style={{ backgroundColor: accent + '20', color: accent }}>Available</span>
                </Link>
            );
        }

        // ── MAGAZINE (public) — horizontal card ───────────────────────────────
        if (cardStyle === 'magazine') {
            return (
                <Link href={href} className="book-card flex gap-3 group border-b py-4 hover:bg-black/[0.02] transition-colors"
                    style={{ borderColor: textColor + '10' }}>
                    <div className="relative w-16 h-24 rounded shrink-0 overflow-hidden border"
                        style={{ borderColor: primary + '20' }}>
                        <CoverPlaceholder record={record} i={i} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: accent }}>
                                {record.material_type?.name || 'Book'}
                            </div>
                            <div className="text-sm font-bold line-clamp-2 group-hover:underline" style={{ color: textColor }}>
                                {record.title}
                            </div>
                            <div className="text-xs mt-1 font-semibold" style={{ color: primary }}>
                                {record.authors?.[0]?.name || 'Unknown'}
                            </div>
                        </div>
                        <div className="text-[11px] mt-1" style={{ color: textColor + '60' }}>
                            {record.publication_year}{record.publisher ? ` · ${record.publisher}` : ''}
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: primary }} />
                </Link>
            );
        }

        // ── CATALOG-LIST (university) ─────────────────────────────────────────
        if (cardStyle === 'catalog-list') {
            const typeCode = record.material_type?.code || 'book';
            const isDigital = ['ebook','epub','audio','video','article','dataset'].includes(typeCode);
            const statusLabel = isDigital ? 'Online' : 'On shelf';
            const statusColor = isDigital
                ? { bg: '#dbeafe', text: '#1d4ed8' }
                : { bg: '#dcfce7', text: '#15803d' };
            return (
                <div className="book-card flex items-start gap-4 p-4 bg-white border-b group hover:bg-amber-50/40 transition-colors"
                    style={{ borderColor: primary + '15' }}>
                    <div className="relative w-14 h-[72px] shrink-0 overflow-hidden border rounded-sm"
                        style={{ borderColor: primary + '30' }}>
                        <CoverPlaceholder record={record} i={i} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <Link href={href}
                                    className="text-sm font-bold leading-snug line-clamp-2 hover:underline"
                                    style={{ color: primary, fontFamily: "'Crimson Text', serif", fontSize: '16px' }}>
                                    {record.title}
                                </Link>
                                <div className="text-xs mt-0.5" style={{ color: textColor + '80' }}>
                                    {record.authors?.[0]?.name || 'Unknown'} · {record.publication_year}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    <span className="text-[11px] px-2 py-0.5 border"
                                        style={{ borderColor: primary + '40', color: primary, backgroundColor: primary + '08' }}>
                                        {record.material_type?.name || 'Book'}
                                    </span>
                                    {record.subjects?.[0]?.term && (
                                        <span className="text-[11px] px-2 py-0.5 border"
                                            style={{ borderColor: accent + '40', color: accent + 'cc', backgroundColor: accent + '08' }}>
                                            {record.subjects[0].term}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-2">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm whitespace-nowrap"
                                    style={{ backgroundColor: statusColor.bg, color: statusColor.text }}>
                                    ● {statusLabel}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Link href={href}
                                className="text-xs font-bold px-3 py-1.5 text-white hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: primary }}>
                                View details
                            </Link>
                            {isDigital ? (
                                <Link href={`${base}/reader/${record.digital_resources?.[0]?.id || record.id}`}
                                    className="text-xs font-bold px-3 py-1.5 border hover:bg-accent/10 transition-colors"
                                    style={{ borderColor: accent, color: accent }}>
                                    Access online
                                </Link>
                            ) : (
                                <Link href={href}
                                    className="text-xs font-bold px-3 py-1.5 border hover:bg-primary/5 transition-colors"
                                    style={{ borderColor: primary + '60', color: primary }}>
                                    Place hold
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // ── BORDERED (classic) ────────────────────────────────────────────────
        if (cardStyle === 'bordered') {
            return (
                <Link href={href} className="book-card group block">
                    <div className="relative aspect-[2/3] overflow-hidden border-2 transition-all"
                        style={{ borderColor: primary + '40', backgroundColor: bgColor }}>
                        <CoverPlaceholder record={record} i={i} />
                        {record.cover_image_url && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-2">
                                <div className="text-[11px] font-bold text-white leading-tight line-clamp-2">{record.title}</div>
                            </div>
                        )}
                    </div>
                    <div className="mt-2 px-0.5">
                        <div className="text-sm font-semibold truncate" style={{ fontFamily: "'Merriweather', serif", color: textColor }}>{record.title}</div>
                        <div className="text-xs mt-0.5 truncate" style={{ color: textColor + '80' }}>
                            {record.authors?.[0]?.name || 'Unknown'} · {record.publication_year}
                        </div>
                    </div>
                </Link>
            );
        }

        // ── ELEVATED (dark) ───────────────────────────────────────────────────
        if (cardStyle === 'elevated') {
            return (
                <Link href={href} className="book-card group block">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden transition-all"
                        style={{ boxShadow: `0 0 0 1px ${primary}25` }}>
                        <CoverPlaceholder record={record} i={i} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3">
                            <div className="text-[13px] font-bold text-white leading-tight line-clamp-2">{record.title}</div>
                            <div className="text-[10px] mt-1 text-white/60">{record.authors?.[0]?.name || 'Unknown'}</div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: primary }}>
                                <ArrowRight className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-xs font-semibold truncate" style={{ color: 'rgba(226,232,240,0.85)' }}>{record.title}</div>
                        <div className="text-[10px] mt-0.5 truncate" style={{ color: primary }}>{record.publication_year}</div>
                    </div>
                </Link>
            );
        }

        // ── SHADOW (default / modern) ─────────────────────────────────────────
        return (
            <Link href={href} className="book-card group block">
                <div className="relative aspect-[2/3] rounded-xl shadow-sm overflow-hidden"
                    style={!record.cover_image_url ? { background: coverGradients[i % 8] } : {}}>
                    {record.cover_image_url && <img src={record.cover_image_url} alt={record.title} className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                        <div className="text-[13px] font-bold leading-tight line-clamp-3 text-white">{record.title}</div>
                        <div className="text-[10px] mt-1 text-white/80">{record.authors?.[0]?.name || 'Unknown'}</div>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="text-sm font-semibold text-gray-900 truncate">{record.title}</div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                        {record.authors?.[0]?.name || 'Unknown'} · {record.publication_year}
                    </div>
                </div>
            </Link>
        );
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // GRID LAYOUT — academic uses list, magazine uses 2-col, others use 6-col
    // ═══════════════════════════════════════════════════════════════════════════

    const BookGrid = ({ records, isAudio = false }) => {
        if (cardStyle === 'academic') {
            return (
                <div className="border rounded-sm overflow-hidden" style={{ borderColor: primary + '25', backgroundColor: 'white' }}>
                    {records.slice(0, 10).map((r, i) => (
                        <BookCard key={r.id} record={r} i={i} href={`${base}/catalog/${r.id}`} />
                    ))}
                </div>
            );
        }
        if (cardStyle === 'catalog-list') {
            return (
                <div className="border overflow-hidden" style={{ borderColor: primary + '20', backgroundColor: 'white' }}>
                    {records.slice(0, 8).map((r, i) => (
                        <BookCard key={r.id} record={r} i={i} href={`${base}/catalog/${r.id}`} />
                    ))}
                    <div className="px-4 py-3 border-t text-right" style={{ borderColor: primary + '15', backgroundColor: bgColor }}>
                        <Link href={`${base}/catalog`}
                            className="text-xs font-bold hover:underline"
                            style={{ color: primary }}>
                            View all results →
                        </Link>
                    </div>
                </div>
            );
        }
        if (cardStyle === 'magazine') {
            // 2-column editorial list
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {records.slice(0, 10).map((r, i) => (
                        <BookCard key={r.id} record={r} i={i} href={`${base}/catalog/${r.id}`} />
                    ))}
                </div>
            );
        }
        if (cardStyle === 'playful') {
            // 7-col very wide kids grid
            return (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {records.slice(0, 14).map((r, i) => (
                        <BookCard key={r.id} record={r} i={i} href={`${base}/catalog/${r.id}`} />
                    ))}
                </div>
            );
        }
        // Default 6-col
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                {records.slice(0, 12).map((r, i) => (
                    <BookCard key={r.id} record={r} i={i} href={`${base}/catalog/${r.id}`} />
                ))}
            </div>
        );
    };

    // ─── Layout helpers ────────────────────────────────────────────────────────
    const secClass  = `${maxW} mx-auto px-6 mt-14`;
    const audioCardBg     = isDark ? 'rgba(255,255,255,0.05)' : 'white';
    const audioCardBorder = isDark ? primary + '30' : '#e2e8f0';

    // ─── Kids achievement banner ───────────────────────────────────────────────
    const KidsBanner = () => heroStyle === 'kids-fun' ? (
        <section className={`${maxW} mx-auto px-6 mt-10`}>
            <div className="rounded-3xl p-6 flex items-center gap-6 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${secondary}cc, ${primary}aa)` }}>
                <div className="text-5xl">🏆</div>
                <div className="text-white">
                    <div className="text-xl font-black" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        Reading Challenge!
                    </div>
                    <div className="text-sm opacity-80 font-semibold">Read 5 books this month and earn a badge!</div>
                </div>
                <Link href={`${base}/account`}
                    className="ml-auto shrink-0 bg-white font-black px-5 py-2.5 rounded-2xl text-sm hover:scale-105 transition-transform"
                    style={{ color: primary, fontFamily: "'Nunito', sans-serif" }}>
                    Join Now! 🎉
                </Link>
                <Trophy className="absolute right-24 bottom-2 w-20 h-20 opacity-10 text-white" />
            </div>
        </section>
    ) : null;

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <OpacLayout>
            {HeroComponent()}
            {KidsBanner()}

            {/* Collections grid — shown above content for non-academic themes */}
            {heroStyle !== 'academic' && heroStyle !== 'magazine' && (
                <section className={secClass}>
                    {heroStyle === 'kids-fun' ? (
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black" style={{ fontFamily: "'Nunito', sans-serif", color: textColor }}>
                                📖 Browse by Type
                            </h2>
                        </div>
                    ) : heroStyle === 'banner' ? (
                        <div className="flex items-end justify-between mb-6">
                            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: textColor }}>Browse the Collection</h2>
                        </div>
                    ) : heroStyle === 'dark-gradient' ? (
                        <div className="mb-6">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: primary }}>Explore</div>
                            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Lora', serif" }}>Browse Collections</h2>
                        </div>
                    ) : (
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: primary }}>Browse by format</div>
                                <h2 className="text-2xl font-extrabold text-gray-900">Collections</h2>
                            </div>
                            <Link href={`${base}/catalog`} className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: primary }}>
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}

                    {cardStyle === 'playful' ? (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {KIDS_CATEGORIES.map((cat, i) => (
                                <Link key={i} href={`${base}${cat.href}`}
                                    className="flex flex-col items-center gap-2 p-4 rounded-3xl border-2 text-center hover:scale-105 transition-all"
                                    style={{ borderColor: [primary, accent, secondary][i % 3], backgroundColor: [primary, accent, secondary][i % 3] + '12' }}>
                                    <span className="text-3xl">{cat.emoji}</span>
                                    <div className="text-xs font-black" style={{ fontFamily: "'Nunito', sans-serif", color: textColor }}>{cat.label}</div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className={`grid gap-4 ${heroStyle === 'dark-gradient' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'}`}>
                            {collectionCards.map((col, i) => {
                                const Icon = col.icon;
                                return (
                                    <Link key={i} href={col.href}
                                        className="group flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all border hover:shadow-sm"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                                            borderColor: isDark ? primary + '25' : '#e2e8f0',
                                        }}>
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                                            style={{ backgroundColor: primary + '18', color: primary }}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-xs font-semibold" style={{ color: isDark ? 'rgba(226,232,240,0.8)' : textColor }}>{col.name}</div>
                                        <div className="text-[11px] font-medium" style={{ color: isDark ? 'rgba(226,232,240,0.5)' : '#94a3b8' }}>
                                            {col.count.toLocaleString()} {col.count === 1 ? 'item' : 'items'}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {/* eBooks */}
            {ebooks.length > 0 && (
                <section className={secClass}>
                    <SectionHeader icon={BookOpen} title={t('home.material_ebooks')}
                        subtitle="Full-text titles available for immediate reading"
                        href={`${base}/catalog?type=ebook`} linkText="See all eBooks" />
                    <BookGrid records={ebooks} />
                </section>
            )}

            {/* ePublications */}
            {epublications.length > 0 && (
                <section className={secClass}>
                    <SectionHeader icon={Newspaper} title={t('home.material_epubs')}
                        subtitle="Journals, magazines, and serial issues"
                        href={`${base}/catalog?type=epub`} linkText="See all" />
                    <BookGrid records={epublications} />
                </section>
            )}

            {/* Audio */}
            {audio.length > 0 && (
                <section className={secClass}>
                    <SectionHeader icon={Headphones} title={t('home.audio_collection')}
                        subtitle="Lectures, audiobooks, oral histories"
                        href={`${base}/catalog?type=audio`} linkText="Browse all audio" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {audio.map((record, i) => {
                            const resource = record.digital_resources?.[0];
                            const dur = resource?.duration_seconds;
                            const durationStr = dur ? `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}` : null;
                            return (
                                <Link key={record.id} href={`${base}/catalog/${record.id}`}
                                    className="book-card flex items-center gap-4 rounded-2xl p-3 pr-4 border transition-all hover:shadow-sm"
                                    style={{ backgroundColor: audioCardBg, borderColor: audioCardBorder }}>
                                    <div className="relative w-20 h-20 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                                        style={!record.cover_image_url ? { background: coverGradients[i % 8] } : {}}>
                                        {record.cover_image_url && <img src={record.cover_image_url} alt={record.title} className="absolute inset-0 w-full h-full object-cover" />}
                                        <div className="relative z-10 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow">
                                            <Play className="w-5 h-5 ml-0.5" fill="currentColor" style={{ color: primary }} />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold line-clamp-2" style={{ color: isDark ? 'rgba(226,232,240,0.9)' : '#111827' }}>{record.title}</div>
                                        <div className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(226,232,240,0.5)' : '#6b7280' }}>{record.authors?.[0]?.name || 'Unknown'}</div>
                                        {durationStr && <div className="text-[11px] mt-1.5 font-medium" style={{ color: primary }}>{durationStr}</div>}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Video */}
            {video.length > 0 && (
                <section className={secClass}>
                    <SectionHeader icon={Film} title={t('home.video_library')}
                        subtitle="Documentaries, recorded lectures, archival footage"
                        href={`${base}/catalog?type=video`} linkText="Browse all video" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {video.map((record, i) => {
                            const resource = record.digital_resources?.[0];
                            const dur = resource?.duration_seconds;
                            const durationStr = dur ? `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}` : null;
                            return (
                                <Link key={record.id} href={`${base}/catalog/${record.id}`} className="book-card group block">
                                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm"
                                        style={!record.cover_image_url ? { background: coverGradients[i % 8] } : {}}>
                                        {record.cover_image_url && <img src={record.cover_image_url} alt={record.title} className="absolute inset-0 w-full h-full object-cover" />}
                                        {durationStr && (
                                            <div className="absolute bottom-2.5 right-2.5 text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded z-10">
                                                {durationStr}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Play className="w-5 h-5 ml-1" fill="currentColor" style={{ color: primary }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="text-sm font-semibold line-clamp-2" style={{ color: isDark ? 'rgba(226,232,240,0.9)' : '#111827' }}>{record.title}</div>
                                        <div className="text-xs mt-1" style={{ color: isDark ? primary : '#6b7280' }}>{resource?.view_count || 0} views</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Theses */}
            {theses.length > 0 && (
                <section className={`${secClass} mb-16`}>
                    <SectionHeader icon={GraduationCap} title={t('home.theses_dissertations')}
                        subtitle="Graduate research from partner institutions"
                        href={`${base}/catalog?type=thesis`} linkText="View all theses" />
                    <BookGrid records={theses} />
                </section>
            )}
        </OpacLayout>
    );
}
