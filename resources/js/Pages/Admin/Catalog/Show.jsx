import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import {
    ChevronRight, Edit2, Trash2, BookOpen, FileText,
    Globe, Tag, Library, Hash, Calendar, User, Plus, Download,
} from 'lucide-react';

const ITEM_STATUS_COLORS = {
    available:    'bg-green-100 text-green-700',
    checked_out:  'bg-amber-100 text-amber-700',
    on_hold:      'bg-blue-100 text-blue-700',
    in_repair:    'bg-orange-100 text-orange-700',
    lost:         'bg-red-100 text-red-700',
    withdrawn:    'bg-gray-100 text-gray-600',
};

const ACCESS_COLORS = {
    open_access:  'bg-green-100 text-green-700',
    registered:   'bg-blue-100 text-blue-700',
    restricted:   'bg-red-100 text-red-700',
    embargo:      'bg-amber-100 text-amber-700',
};

export default function CatalogShow({ record }) {
    const deleteRecord = () => {
        if (!confirm(`Move "${record.title}" to trash? It will be permanently deleted after 90 days.`)) return;
        router.delete(route('admin.catalog.destroy', record.id));
    };

    const primaryAuthor = record.authors?.[0]?.name ?? null;

    return (
        <AdminLayout title={record.title}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <Link href={route('admin.catalog.index')} className="hover:text-gray-700">Catalog</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium line-clamp-1">{record.title}</span>
            </nav>

            <div className="grid lg:grid-cols-3 gap-5">
                {/* ─── Left / Main ─────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Title block */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex gap-5">
                            {/* Cover */}
                            <div className="flex-shrink-0">
                                {record.cover_image_url ? (
                                    <img src={record.cover_image_url} alt=""
                                        className="w-24 h-32 object-cover rounded-lg shadow-sm bg-gray-100" />
                                ) : (
                                    <div className="w-24 h-32 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <BookOpen className="w-10 h-10 text-blue-300" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900 leading-tight">{record.title}</h1>
                                        {record.subtitle && (
                                            <p className="text-sm text-gray-500 mt-0.5">{record.subtitle}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Link href={route('admin.catalog.edit', record.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </Link>
                                        <button onClick={deleteRecord}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    {record.material_type && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            <Tag className="w-3 h-3" />{record.material_type.name}
                                        </span>
                                    )}
                                    {record.language && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            <Globe className="w-3 h-3" />{record.language.toUpperCase()}
                                        </span>
                                    )}
                                    {record.publication_year && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            <Calendar className="w-3 h-3" />{record.publication_year}
                                        </span>
                                    )}
                                    {record.record_status && record.record_status !== 'active' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 capitalize">
                                            {record.record_status}
                                        </span>
                                    )}
                                </div>

                                {/* Authors */}
                                {record.authors?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {record.authors.map((a, i) => (
                                            <span key={i} className="flex items-center gap-1 text-sm text-gray-700">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {a.name}
                                                {a.role && a.role !== 'author' && (
                                                    <span className="text-xs text-gray-400 capitalize">({a.role})</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Abstract */}
                    {(record.abstract || record.abstract_km) && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Abstract</h2>
                            {record.abstract && <p className="text-sm text-gray-700 leading-relaxed">{record.abstract}</p>}
                            {record.abstract_km && (
                                <p className="text-sm text-gray-600 leading-relaxed mt-2 font-khmer">{record.abstract_km}</p>
                            )}
                        </div>
                    )}

                    {/* Subjects & Keywords */}
                    {(record.subjects?.length > 0 || record.keywords?.length > 0) && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Subjects & Keywords</h2>
                            {record.subjects?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {record.subjects.map((s, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                                            {s.term ?? s}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {record.keywords?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {record.keywords.map((k, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{k}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Table of Contents */}
                    {record.table_of_contents && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Table of Contents</h2>
                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{record.table_of_contents}</p>
                        </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{record.notes}</p>
                        </div>
                    )}

                    {/* Physical Items — always show if material type has physical */}
                    {(record.material_type?.has_physical || record.physical_items?.length > 0) && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                                <Library className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700 flex-1">
                                    Physical Copies ({record.physical_items?.length ?? 0})
                                </h2>
                                <Link href={route('admin.items.create') + '?biblio_id=' + record.id}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg">
                                    <Plus className="w-3.5 h-3.5" /> Add Item
                                </Link>
                            </div>
                            {record.physical_items?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Barcode</th>
                                                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Call No.</th>
                                                <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Location</th>
                                                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Status</th>
                                                <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden lg:table-cell">Condition</th>
                                                <th className="px-4 py-2.5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {record.physical_items.map(item => (
                                                <tr key={item.id} className="hover:bg-gray-50 group">
                                                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{item.barcode ?? '—'}</td>
                                                    <td className="px-4 py-2.5 text-gray-700">{item.call_number ?? '—'}</td>
                                                    <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">
                                                        {item.collection?.name ?? item.location?.name ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ITEM_STATUS_COLORS[item.item_status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                            {item.item_status?.replace('_', ' ') ?? '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-gray-500 capitalize hidden lg:table-cell">{item.condition ?? '—'}</td>
                                                    <td className="px-4 py-2.5">
                                                        <Link href={route('admin.items.edit', item.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded inline-flex"
                                                            title="Edit item">
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-5 py-6 text-center">
                                    <p className="text-sm text-gray-400">No physical copies yet.</p>
                                    <Link href={route('admin.items.create') + '?biblio_id=' + record.id}
                                        className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline">
                                        <Plus className="w-4 h-4" /> Add the first copy
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Digital Resources */}
                    {record.digital_resources?.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">
                                    Digital Resources ({record.digital_resources.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {record.digital_resources.map(res => (
                                    <div key={res.id} className="px-5 py-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {res.format && (
                                                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded uppercase font-mono">
                                                            {res.format}
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ACCESS_COLORS[res.access_type] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {res.access_type?.replace('_', ' ') ?? 'restricted'}
                                                    </span>
                                                </div>
                                                {res.file_size_bytes && (
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {(res.file_size_bytes / 1024 / 1024).toFixed(1)} MB
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {res.url && (
                                            <a href={res.url} target="_blank" rel="noopener noreferrer"
                                                className="flex-shrink-0 text-xs text-blue-600 hover:underline font-medium">
                                                Open
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Right Sidebar ────────────────────────────────────────── */}
                <div className="space-y-5">
                    {/* Bibliographic Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Hash className="w-4 h-4" /> Bibliographic Details
                        </h2>
                        <dl className="space-y-2.5 text-sm">
                            <DetailRow label="ISBN"       value={record.isbn} mono />
                            <DetailRow label="ISSN"       value={record.issn} mono />
                            <DetailRow label="DOI"        value={record.doi} mono />
                            <DetailRow label="Publisher"  value={record.publisher} />
                            <DetailRow label="Place"      value={record.publisher_place} />
                            <DetailRow label="Edition"    value={record.edition} />
                            <DetailRow label="Pages"      value={record.pages} />
                            <DetailRow label="Volume"     value={record.volume} />
                            <DetailRow label="Issue"      value={record.issue} />
                            {(record.series_title) && (
                                <DetailRow label="Series"
                                    value={[record.series_title, record.series_number].filter(Boolean).join(' #')} />
                            )}
                            <DetailRow label="DDC"        value={record.ddc_class} mono />
                            <DetailRow label="LCC"        value={record.lcc_class} mono />
                            <DetailRow label="Language"   value={record.language?.toUpperCase()} />
                            <DetailRow label="Rights"     value={record.rights} />
                            <DetailRow label="Source"     value={record.source} />
                            <DetailRow label="Coverage"   value={record.geographic_coverage} />
                        </dl>
                    </div>

                    {/* BIBFRAME / MARC Export */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-xs font-mono bg-blue-100 text-blue-700 rounded">BIBFRAME</span>
                            Export
                        </h2>
                        <p className="text-xs text-gray-400 mb-3">Download this record in library interchange formats</p>
                        <div className="space-y-2">
                            <a
                                href={route('admin.catalog.export-bibframe', record.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Download className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 text-left">BIBFRAME JSON-LD</span>
                                <span className="text-xs text-blue-400 font-mono">.jsonld</span>
                            </a>
                            <a
                                href={route('admin.catalog.export-marc', record.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                                <Download className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 text-left">MARC21 XML</span>
                                <span className="text-xs text-indigo-400 font-mono">.xml</span>
                            </a>
                        </div>
                        {record.work_id && (
                            <p className="mt-3 text-xs text-gray-400 font-mono truncate" title={record.work_id}>
                                Work: {record.work_id.slice(0, 8)}…
                            </p>
                        )}
                    </div>

                    {/* BIBFRAME Instance fields (if any set) */}
                    {(record.content_type || record.media_type || record.carrier_type || record.responsibility_statement) && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">RDA / BIBFRAME</h2>
                            <dl className="space-y-2.5 text-sm">
                                <DetailRow label="Content"   value={record.content_type} />
                                <DetailRow label="Media"     value={record.media_type} />
                                <DetailRow label="Carrier"   value={record.carrier_type} />
                                <DetailRow label="Issuance"  value={record.issuance} />
                                <DetailRow label="Dims"      value={record.dimensions} />
                                <DetailRow label="Country"   value={record.country_code} mono />
                                <DetailRow label="Stmt."     value={record.responsibility_statement} />
                            </dl>
                        </div>
                    )}

                    {/* Record Metadata */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Record Info</h2>
                        <dl className="space-y-2.5 text-sm">
                            <DetailRow label="ID"       value={record.id?.slice(0, 8) + '…'} mono />
                            <DetailRow label="Added"    value={record.cataloged_at ? new Date(record.cataloged_at).toLocaleDateString() : null} />
                            <DetailRow label="Updated"  value={record.updated_at ? new Date(record.updated_at).toLocaleDateString() : null} />
                            <DetailRow label="Status"   value={record.record_status} />
                        </dl>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function DetailRow({ label, value, mono = false }) {
    if (!value) return null;
    return (
        <div className="flex gap-2">
            <dt className="text-gray-400 w-20 flex-shrink-0">{label}</dt>
            <dd className={`text-gray-800 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
        </div>
    );
}
