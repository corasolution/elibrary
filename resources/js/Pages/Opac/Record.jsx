import OpacLayout from '@/Layouts/OpacLayout';
import { Link, usePage, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Download, Eye, BookmarkPlus, MapPin, Tag, Quote, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Music, Film } from 'lucide-react';
import RecordCard from '@/Components/Opac/RecordCard';
import { useState, useRef, useEffect } from 'react';

export default function RecordDetail({ record, related = [] }) {
    const { t } = useTranslation();
    const { auth, tenant, videoUrl } = usePage().props;
    const base = tenant?.base_url ?? '';
    const reserveForm = useForm({ biblio_id: record.id });
    const [showPlayer, setShowPlayer] = useState(false);

    const availableCopies = record.physical_items?.filter(i => i.item_status === 'available').length ?? 0;
    const hasDigital = record.digital_resources?.length > 0;
    const primaryAuthor = record.authors?.[0]?.name;
    const isAudio = record.material_type?.code === 'audio';
    const isVideo = record.material_type?.code === 'video';
    const primaryResource = record.digital_resources?.[0];
    const mediaUrl = primaryResource
        ? (primaryResource.is_external && primaryResource.url
            ? primaryResource.url
            : primaryResource.file_path
                ? `/storage/${primaryResource.file_path}`
                : primaryResource.url ?? null)
        : null;
    const audioUrl = isAudio ? mediaUrl : null;
    const playerSrc = videoUrl ?? mediaUrl;

    return (
        <OpacLayout>
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="grid md:grid-cols-[220px_1fr] gap-10">
                    {/* Cover / Audio Panel */}
                    <div className="flex flex-col gap-4">
                        {isAudio ? (
                            <div className="aspect-[3/4] bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 relative">
                                <div className="w-20 h-20 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center">
                                    <Music className="w-10 h-10 text-white/80" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end justify-center gap-0.5 px-4 pb-3 opacity-40">
                                    {[3,5,8,6,4,7,5,9,4,6,8,5,3,7,6,4,8,5,6,3].map((h, i) => (
                                        <div key={i} className="flex-1 bg-white rounded-sm" style={{ height: `${h * 4}px` }} />
                                    ))}
                                </div>
                            </div>
                        ) : isVideo ? (
                            <div className="aspect-[3/4] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-4 relative">
                                <div className="w-16 h-16 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center">
                                    <Film className="w-8 h-8 text-white/70" />
                                </div>
                                {hasDigital && playerSrc && (
                                    <button
                                        onClick={() => setShowPlayer(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-900 text-xs font-bold hover:bg-gray-100 transition-colors shadow-lg"
                                    >
                                        <Play className="w-3.5 h-3.5" fill="currentColor" /> Watch Now
                                    </button>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                            </div>
                        ) : (
                            <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                                {record.cover_image_url
                                    ? <img src={record.cover_image_url} alt={record.title} className="object-cover w-full h-full" />
                                    : <BookOpen className="w-16 h-16 text-gray-300" />
                                }
                            </div>
                        )}

                        {/* Availability */}
                        <div className="card p-4 text-sm space-y-2">
                            <div className="font-medium text-gray-700">Availability</div>
                            {availableCopies > 0 ? (
                                <div className="text-green-600 font-medium">{availableCopies} {t('catalog.copies')}</div>
                            ) : (
                                <div className="text-red-500 font-medium">{t('catalog.checked_out')}</div>
                            )}
                            {hasDigital && !isAudio && !isVideo && (
                                <Link href={`${base}/reader/${record.digital_resources[0].id}`}
                                    className="flex items-center gap-2 btn-primary text-xs mt-2 justify-center">
                                    <Eye className="w-3.5 h-3.5" /> {t('catalog.digital_access')}
                                </Link>
                            )}
                            {isVideo && hasDigital && playerSrc && (
                                <button
                                    onClick={() => setShowPlayer(true)}
                                    className="flex items-center gap-2 btn-primary text-xs mt-2 justify-center w-full"
                                >
                                    <Play className="w-3.5 h-3.5" fill="currentColor" /> Watch Video
                                </button>
                            )}
                            {availableCopies === 0 && !hasDigital && auth?.patron && (
                                <button
                                    onClick={() => reserveForm.post(route('library.opac.account.reserve', { slug: tenant?.slug }))}
                                    disabled={reserveForm.processing}
                                    className="btn-secondary w-full text-xs justify-center flex items-center gap-2 disabled:opacity-60"
                                >
                                    <BookmarkPlus className="w-3.5 h-3.5" /> {t('catalog.reserve')}
                                </button>
                            )}
                            {availableCopies === 0 && !hasDigital && !auth?.patron && (
                                <Link href={`${base}/login`}
                                    className="btn-secondary w-full text-xs justify-center flex items-center gap-2">
                                    <BookmarkPlus className="w-3.5 h-3.5" /> Login to Reserve
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div>
                        <div className="mb-1">
                            {record.material_type && (
                                <span className="badge badge-blue mr-2">{record.material_type.name}</span>
                            )}
                            {record.language && (
                                <span className="badge badge-amber">{record.language.toUpperCase()}</span>
                            )}
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-1 leading-tight">
                            {record.title}
                        </h1>
                        {record.subtitle && <p className="text-gray-500 text-lg mb-3">{record.subtitle}</p>}
                        {record.title_km && <p className="text-gray-600 font-khmer text-lg mb-4">{record.title_km}</p>}

                        {primaryAuthor && (
                            <p className="text-gray-700 mb-4">
                                by{' '}
                                {record.authors.map((a, i) => (
                                    <span key={i}>
                                        <Link href={`${base}/catalog?q=${encodeURIComponent(a.name)}`}
                                            className="text-blue-600 hover:underline font-medium">
                                            {a.name}
                                        </Link>
                                        {a.role !== 'author' && <span className="text-gray-400 text-sm"> ({a.role})</span>}
                                        {i < record.authors.length - 1 && ', '}
                                    </span>
                                ))}
                            </p>
                        )}

                        {/* Bibliographic details grid */}
                        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm mb-6 bg-gray-50 rounded-xl p-4">
                            {record.isbn && <><dt className="text-gray-500">{t('catalog.isbn')}</dt><dd className="font-medium col-span-1">{record.isbn}</dd></>}
                            {record.publisher && <><dt className="text-gray-500">{t('catalog.publisher')}</dt><dd className="font-medium">{record.publisher}</dd></>}
                            {record.publication_year && <><dt className="text-gray-500">{t('catalog.year')}</dt><dd className="font-medium">{record.publication_year}</dd></>}
                            {record.edition && <><dt className="text-gray-500">Edition</dt><dd className="font-medium">{record.edition}</dd></>}
                            {record.ddc_class && <><dt className="text-gray-500">DDC</dt><dd className="font-medium">{record.ddc_class}</dd></>}
                            {record.pages && <><dt className="text-gray-500">Pages</dt><dd className="font-medium">{record.pages}</dd></>}
                        </dl>

                        {/* Abstract */}
                        {record.abstract && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">{t('catalog.abstract')}</h3>
                                <div className="text-sm text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: record.abstract }} />
                            </div>
                        )}

                        {/* Inline Audio Player */}
                        {isAudio && audioUrl && (
                            <AudioPlayer src={audioUrl} title={record.title} author={primaryAuthor} />
                        )}

                        {/* Inline Video Player */}
                        {isVideo && playerSrc && showPlayer && (
                            <InlineVideoPlayer src={playerSrc} title={record.title} onClose={() => setShowPlayer(false)} />
                        )}

                        {/* Subjects */}
                        {record.subjects?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> {t('catalog.subjects')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {record.subjects.map((s, i) => (
                                        <Link key={i}
                                            href={`${base}/catalog?q=${encodeURIComponent(s.term)}`}
                                            className="badge badge-blue hover:bg-blue-200 cursor-pointer">
                                            {s.term}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Physical copies table */}
                        {record.physical_items?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Physical Copies
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-2 px-3 font-medium text-gray-600">Call No.</th>
                                                <th className="text-left py-2 px-3 font-medium text-gray-600">Location</th>
                                                <th className="text-left py-2 px-3 font-medium text-gray-600">Collection</th>
                                                <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {record.physical_items.map((item) => (
                                                <tr key={item.id} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 font-mono text-xs">{item.call_number || '—'}</td>
                                                    <td className="py-2 px-3">{item.location?.name || '—'}</td>
                                                    <td className="py-2 px-3">{item.collection?.name || '—'}</td>
                                                    <td className="py-2 px-3">
                                                        <span className={`badge ${item.item_status === 'available' ? 'badge-green' : 'badge-amber'}`}>
                                                            {item.item_status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Citation Export */}
                <CitationExport record={record} base={base} />

                {/* Related Items */}
                {related.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('catalog.similar')}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {related.map((r) => <RecordCard key={r.id} record={r} />)}
                        </div>
                    </div>
                )}
            </div>
        </OpacLayout>
    );
}

// ─── Inline Video Player ─────────────────────────────────────────────────────
function getYouTubeEmbedUrl(url) {
    // Handles: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
}

function InlineVideoPlayer({ src, title, onClose }) {
    const youtubeEmbed = src ? getYouTubeEmbedUrl(src) : null;

    return (
        <div className="mb-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-2">
                <span className="text-white/70 text-xs font-medium truncate">{title}</span>
                <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none ml-2">×</button>
            </div>
            {youtubeEmbed ? (
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe
                        src={youtubeEmbed}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
            ) : (
                <video
                    controls
                    autoPlay
                    src={src}
                    className="w-full max-h-[60vh] object-contain bg-black"
                >
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    );
}

// ─── Inline Audio Player ─────────────────────────────────────────────────────
function AudioPlayer({ src, title, author }) {
    const audioRef = useRef(null);
    const [playing, setPlaying]       = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration]     = useState(0);
    const [volume, setVolume]         = useState(1);
    const [muted, setMuted]           = useState(false);

    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        const onTime = () => setCurrentTime(el.currentTime);
        const onLoaded = () => setDuration(el.duration || 0);
        const onEnded = () => setPlaying(false);
        el.addEventListener('timeupdate', onTime);
        el.addEventListener('loadedmetadata', onLoaded);
        el.addEventListener('durationchange', onLoaded);
        el.addEventListener('ended', onEnded);
        return () => {
            el.removeEventListener('timeupdate', onTime);
            el.removeEventListener('loadedmetadata', onLoaded);
            el.removeEventListener('durationchange', onLoaded);
            el.removeEventListener('ended', onEnded);
        };
    }, []);

    const togglePlay = () => {
        const el = audioRef.current;
        if (!el) return;
        if (playing) { el.pause(); setPlaying(false); }
        else { el.play(); setPlaying(true); }
    };

    const seek = (e) => {
        const el = audioRef.current;
        if (!el || !duration) return;
        const val = parseFloat(e.target.value);
        el.currentTime = val;
        setCurrentTime(val);
    };

    const changeVolume = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (audioRef.current) audioRef.current.volume = val;
        if (val === 0) setMuted(true);
        else setMuted(false);
    };

    const toggleMute = () => {
        const el = audioRef.current;
        if (!el) return;
        el.muted = !muted;
        setMuted(!muted);
    };

    const skip = (secs) => {
        const el = audioRef.current;
        if (!el) return;
        el.currentTime = Math.max(0, Math.min(duration, el.currentTime + secs));
    };

    const fmt = (s) => {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="mb-6 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-5 text-white">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Track info */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Music className="w-6 h-6 text-white/80" />
                </div>
                <div className="min-w-0">
                    <div className="font-semibold text-sm leading-tight truncate">{title}</div>
                    {author && <div className="text-white/60 text-xs mt-0.5 truncate">{author}</div>}
                </div>
            </div>

            {/* Waveform bar */}
            <div className="flex items-end justify-center gap-0.5 h-8 mb-4 opacity-30">
                {[3,5,8,6,4,7,5,9,4,6,8,5,3,7,6,4,8,5,6,3,4,7,5,8,3,6,9,4,5,7].map((h, i) => (
                    <div key={i} className="flex-1 bg-white rounded-sm" style={{ height: `${h * 3}px` }} />
                ))}
            </div>

            {/* Progress bar */}
            <div className="mb-1">
                <input
                    type="range" min={0} max={duration || 100} step={0.5}
                    value={currentTime}
                    onChange={seek}
                    className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #fff ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
                        outline: 'none',
                    }}
                />
            </div>
            <div className="flex justify-between text-[11px] text-white/50 mb-4">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => skip(-10)} className="text-white/60 hover:text-white transition-colors" title="-10s">
                        <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white text-blue-800 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                    >
                        {playing
                            ? <Pause className="w-4 h-4" fill="currentColor" />
                            : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
                    </button>
                    <button onClick={() => skip(10)} className="text-white/60 hover:text-white transition-colors" title="+10s">
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                        {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                        type="range" min={0} max={1} step={0.05}
                        value={muted ? 0 : volume}
                        onChange={changeVolume}
                        className="w-20 h-1 appearance-none rounded-full cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, rgba(255,255,255,0.8) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(muted ? 0 : volume) * 100}%)`,
                            outline: 'none',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

const FORMATS = [
    { key: 'apa',     label: 'APA' },
    { key: 'mla',     label: 'MLA' },
    { key: 'chicago', label: 'Chicago' },
    { key: 'bibtex',  label: 'BibTeX' },
    { key: 'ris',     label: 'RIS' },
];

function CitationExport({ record, base }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
                <Quote className="w-4 h-4" />
                Export Citation
                <span className="text-gray-400 font-normal ml-1">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {FORMATS.map(f => (
                        <a
                            key={f.key}
                            href={`${base}/catalog/${record.id}/cite/${f.key}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            download
                        >
                            <Download className="w-3.5 h-3.5" />
                            {f.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
