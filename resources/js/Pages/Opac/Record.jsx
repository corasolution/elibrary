import OpacLayout from '@/Layouts/OpacLayout';
import { Link, usePage, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Download, Eye, BookmarkPlus, MapPin, Tag, Quote } from 'lucide-react';
import RecordCard from '@/Components/Opac/RecordCard';
import { useState } from 'react';

export default function RecordDetail({ record, related = [] }) {
    const { t } = useTranslation();
    const { auth, tenant } = usePage().props;
    const base = tenant?.base_url ?? '';
    const reserveForm = useForm({ biblio_id: record.id });

    const availableCopies = record.physical_items?.filter(i => i.item_status === 'available').length ?? 0;
    const hasDigital = record.digital_resources?.length > 0;
    const primaryAuthor = record.authors?.[0]?.name;

    return (
        <OpacLayout>
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="grid md:grid-cols-[220px_1fr] gap-10">
                    {/* Cover */}
                    <div className="flex flex-col gap-4">
                        <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                            {record.cover_image_url
                                ? <img src={record.cover_image_url} alt={record.title} className="object-cover w-full h-full" />
                                : <BookOpen className="w-16 h-16 text-gray-300" />
                            }
                        </div>

                        {/* Availability */}
                        <div className="card p-4 text-sm space-y-2">
                            <div className="font-medium text-gray-700">Availability</div>
                            {availableCopies > 0 ? (
                                <div className="text-green-600 font-medium">{availableCopies} {t('catalog.copies')}</div>
                            ) : (
                                <div className="text-red-500 font-medium">{t('catalog.checked_out')}</div>
                            )}
                            {hasDigital && (
                                <Link href={`${base}/reader/${record.digital_resources[0].id}`}
                                    className="flex items-center gap-2 btn-primary text-xs mt-2 justify-center">
                                    <Eye className="w-3.5 h-3.5" /> {t('catalog.digital_access')}
                                </Link>
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
