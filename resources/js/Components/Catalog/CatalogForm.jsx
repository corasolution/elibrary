import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, FileText, Headphones, Film, Globe, Map, Database,
    Disc, Search, X, Plus, Trash2, Loader2, ChevronDown, ChevronRight, Download,
} from 'lucide-react';
import ImportModal from '@/Components/Catalog/ImportModal';

// ─── Material type definitions ────────────────────────────────────────────────
const MATERIAL_TYPES = [
    { code: 'book',       label: 'Book',              hasPhysical: true,  hasDigital: false, icon: BookOpen },
    { code: 'ebook',      label: 'eBook',             hasPhysical: false, hasDigital: true,  icon: FileText },
    { code: 'book_ebook', label: 'Book + eBook',      hasPhysical: true,  hasDigital: true,  icon: BookOpen },
    { code: 'journal',    label: 'Journal / Serial',  hasPhysical: true,  hasDigital: true,  icon: Globe },
    { code: 'article',    label: 'Article',           hasPhysical: false, hasDigital: true,  icon: FileText },
    { code: 'thesis',     label: 'Thesis / Dissertation', hasPhysical: true, hasDigital: true, icon: BookOpen },
    { code: 'audio',      label: 'Audio',             hasPhysical: false, hasDigital: true,  icon: Headphones },
    { code: 'video',      label: 'Video',             hasPhysical: false, hasDigital: true,  icon: Film },
    { code: 'dataset',    label: 'Dataset',           hasPhysical: false, hasDigital: true,  icon: Database },
    { code: 'dvd',        label: 'DVD / CD',          hasPhysical: true,  hasDigital: false, icon: Disc },
    { code: 'map',        label: 'Map',               hasPhysical: true,  hasDigital: true,  icon: Map },
];

const BLANK_AUTHOR     = { name: '', role: 'aut' };
const BLANK_SUBJECT    = { term: '', scheme: 'LCSH' };
const BLANK_GENRE_FORM = { term: '', source: 'LCGFT' };
const BLANK_IDENTIFIER = { type: 'lccn', value: '', qualifier: '' };

const RELATOR_CODES = [
    { code: 'aut', label: 'Author' },
    { code: 'edt', label: 'Editor' },
    { code: 'trl', label: 'Translator' },
    { code: 'ill', label: 'Illustrator' },
    { code: 'cmp', label: 'Composer' },
    { code: 'pht', label: 'Photographer' },
    { code: 'prf', label: 'Performer' },
    { code: 'nrt', label: 'Narrator' },
    { code: 'pro', label: 'Producer' },
    { code: 'drt', label: 'Director' },
    { code: 'com', label: 'Compiler' },
];

const INITIAL_STATE = {
    material_type_id: null,
    _materialTypeCode: null,
    title: '', title_alternative: '', subtitle: '', title_km: '',
    authors: [{ ...BLANK_AUTHOR }],
    isbn: '', issn: '', doi: '',
    publisher: '', publisher_place: '',
    publication_year: new Date().getFullYear(),
    edition: '', language: 'en',
    subjects: [{ ...BLANK_SUBJECT }],
    keywords: '',
    ddc_class: '', lcc_class: '',
    abstract: '', abstract_km: '',
    series_title: '', series_number: '',
    notes: '', cover_image_url: '',
    // BIBFRAME / RDA fields
    responsibility_statement: '',
    content_type: '',
    media_type: '',
    carrier_type: '',
    issuance: 'mono',
    dimensions: '',
    frequency: '',
    country_code: '',
    genre_form: [],
    identifiers: [],
    physical: {
        barcode: '', accession_number: '', call_number: '',
        collection_id: '', location_id: '', shelf: '',
        condition: 'good', quantity: 1, price: '', acquired_date: '',
    },
    digital: {
        url: '', format: '', access_type: 'restricted',
        embargo_until: '', version: '1.0', enable_ocr: false, is_external: false,
    },
};

export default function CatalogForm({ record = null, materialTypes = [], collections = [], locations = [], onSuccess }) {
    const { t } = useTranslation();
    const isEdit = !!record;

    const [data, setData] = useState(() => {
        if (!record) return INITIAL_STATE;
        return {
            ...INITIAL_STATE,
            ...record,
            _materialTypeCode: record.material_type?.code ?? null,
            physical: record.physical_items?.[0] ?? INITIAL_STATE.physical,
            digital:  record.digital_resources?.[0] ?? INITIAL_STATE.digital,
            authors:  record.authors?.length ? record.authors : [{ ...BLANK_AUTHOR }],
            subjects: record.subjects?.length ? record.subjects : [{ ...BLANK_SUBJECT }],
        };
    });

    const [errors, setErrors]             = useState({});
    const [submitting, setSubmitting]     = useState(false);
    const [isbnLoading, setIsbnLoading]   = useState(false);
    const [activeTab, setActiveTab]       = useState('biblio');
    const [showBibframe, setShowBibframe] = useState(false);
    const [showImport, setShowImport]     = useState(false);

    const selectedType = MATERIAL_TYPES.find(mt => mt.code === data._materialTypeCode);
    const showPhysical = selectedType?.hasPhysical ?? false;
    const showDigital  = selectedType?.hasDigital  ?? false;

    // When material type changes, reset to biblio tab (avoid staying on a now-disabled tab)
    useEffect(() => {
        setActiveTab('biblio');
    }, [data._materialTypeCode]);

    // Resolve material_type_id from the DB list when code changes
    useEffect(() => {
        if (!data._materialTypeCode) return;
        const mt = materialTypes.find(m => m.code === data._materialTypeCode);
        if (mt) setData(d => ({ ...d, material_type_id: mt.id }));
    }, [data._materialTypeCode, materialTypes]);

    const set = useCallback((field, value) =>
        setData(d => ({ ...d, [field]: value })), []);

    const setPhysical = useCallback((field, value) =>
        setData(d => ({ ...d, physical: { ...d.physical, [field]: value } })), []);

    const setDigital = useCallback((field, value) =>
        setData(d => ({ ...d, digital: { ...d.digital, [field]: value } })), []);

    const setAuthor = (i, field, value) =>
        setData(d => {
            const authors = [...d.authors];
            authors[i] = { ...authors[i], [field]: value };
            return { ...d, authors };
        });

    const addAuthor    = () => setData(d => ({ ...d, authors: [...d.authors, { ...BLANK_AUTHOR }] }));
    const removeAuthor = (i) => setData(d => ({ ...d, authors: d.authors.filter((_, idx) => idx !== i) }));

    const setSubject = (i, field, value) =>
        setData(d => {
            const subjects = [...d.subjects];
            subjects[i] = { ...subjects[i], [field]: value };
            return { ...d, subjects };
        });

    const addSubject    = () => setData(d => ({ ...d, subjects: [...d.subjects, { ...BLANK_SUBJECT }] }));
    const removeSubject = (i) => setData(d => ({ ...d, subjects: d.subjects.filter((_, idx) => idx !== i) }));

    const setGenreForm = (i, field, value) =>
        setData(d => {
            const genre_form = [...(d.genre_form || [])];
            genre_form[i] = { ...genre_form[i], [field]: value };
            return { ...d, genre_form };
        });
    const addGenreForm    = () => setData(d => ({ ...d, genre_form: [...(d.genre_form || []), { ...BLANK_GENRE_FORM }] }));
    const removeGenreForm = (i) => setData(d => ({ ...d, genre_form: (d.genre_form || []).filter((_, idx) => idx !== i) }));

    const setIdentifier = (i, field, value) =>
        setData(d => {
            const identifiers = [...(d.identifiers || [])];
            identifiers[i] = { ...identifiers[i], [field]: value };
            return { ...d, identifiers };
        });
    const addIdentifier    = () => setData(d => ({ ...d, identifiers: [...(d.identifiers || []), { ...BLANK_IDENTIFIER }] }));
    const removeIdentifier = (i) => setData(d => ({ ...d, identifiers: (d.identifiers || []).filter((_, idx) => idx !== i) }));

    // ─── ISBN Lookup ──────────────────────────────────────────────────────────
    const lookupISBN = async () => {
        if (!data.isbn || data.isbn.length < 10) return;
        setIsbnLoading(true);
        try {
            const res = await fetch(`/api/catalog/lookup-isbn/${data.isbn.replace(/[-\s]/g, '')}`);
            if (!res.ok) throw new Error('Not found');
            const filled = await res.json();
            setData(d => ({ ...d, ...filled }));
        } catch {
            // ISBN lookup is optional — silently ignore failures
        } finally {
            setIsbnLoading(false);
        }
    };

    // ─── Import from Library ─────────────────────────────────────────────────
    const handleImport = (record) => {
        setData(d => ({
            ...d,
            title:            record.title            || d.title,
            subtitle:         record.subtitle         || d.subtitle,
            title_alternative: record.title_alternative || d.title_alternative,
            isbn:             record.isbn             || d.isbn,
            issn:             record.issn             || d.issn,
            doi:              record.doi              || d.doi,
            publisher:        record.publisher        || d.publisher,
            publisher_place:  record.publisher_place  || d.publisher_place,
            publication_year: record.publication_year || d.publication_year,
            edition:          record.edition          || d.edition,
            language:         record.language         || d.language,
            abstract:         record.abstract         || d.abstract,
            cover_image_url:  record.cover_image_url  || d.cover_image_url,
            lcc_class:        record.lcc_class        || d.lcc_class,
            ddc_class:        record.ddc_class        || d.ddc_class,
            series_title:     record.series_title     || d.series_title,
            series_number:    record.series_number    || d.series_number,
            notes:            record.notes            || d.notes,
            authors:  record.authors?.length  ? record.authors  : d.authors,
            subjects: record.subjects?.length ? record.subjects : d.subjects,
        }));
        setActiveTab('biblio');
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const payload = {
            ...data,
            physical: showPhysical ? data.physical : null,
            digital:  showDigital  ? data.digital  : null,
        };

        const url    = isEdit ? route('admin.catalog.update', record.id) : route('admin.catalog.store');
        const method = isEdit ? 'put' : 'post';

        router[method](url, payload, {
            onSuccess: () => { setSubmitting(false); onSuccess?.(); },
            onError:   (errs) => {
                setErrors(errs);
                setSubmitting(false);
                // Auto-switch to the tab that has the first error
                const errKeys = Object.keys(errs);
                const physicalKeys = ['barcode', 'accession_number', 'call_number', 'collection_id', 'location_id'];
                const digitalKeys  = ['url', 'format', 'access_type'];
                if (errKeys.some(k => digitalKeys.includes(k)) && showDigital) setActiveTab('digital');
                else if (errKeys.some(k => physicalKeys.includes(k)) && showPhysical) setActiveTab('physical');
                else setActiveTab('biblio');
            },
        });
    };

    // ─── Tabs ─────────────────────────────────────────────────────────────────
    const tabs = [
        { key: 'biblio',   label: 'Bibliographic', enabled: true },
        { key: 'physical', label: 'Physical',       enabled: showPhysical },
        { key: 'digital',  label: 'Digital',        enabled: showDigital },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-0">

            {/* ── Import Modal ────────────────────────────────────────────── */}
            {showImport && (
                <ImportModal
                    onImport={handleImport}
                    onClose={() => setShowImport(false)}
                />
            )}

            {/* ── Material Type Selector ──────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700">Material Type</h2>
                    <button
                        type="button"
                        onClick={() => setShowImport(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Import from Library Catalog
                    </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {MATERIAL_TYPES.map(mt => {
                        const Icon = mt.icon;
                        const active = data._materialTypeCode === mt.code;
                        return (
                            <button
                                key={mt.code}
                                type="button"
                                onClick={() => set('_materialTypeCode', mt.code)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all
                                    ${active
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                                {mt.label}
                            </button>
                        );
                    })}
                </div>
                {errors.material_type_id && (
                    <p className="text-red-500 text-xs mt-2">{errors.material_type_id}</p>
                )}
            </div>

            {/* ── Tab Card ────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                {/* Tab Bar */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            type="button"
                            disabled={!tab.enabled}
                            onClick={() => tab.enabled && setActiveTab(tab.key)}
                            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px
                                ${activeTab === tab.key
                                    ? 'border-blue-600 text-blue-600 bg-white'
                                    : tab.enabled
                                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        : 'border-transparent text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            {tab.label}
                            {!tab.enabled && (
                                <span className="ml-1.5 text-xs text-gray-300">
                                    {tab.key === 'physical' ? '(not physical)' : '(not digital)'}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 space-y-5">

                    {/* ── Bibliographic Tab ──────────────────────────────── */}
                    {activeTab === 'biblio' && (
                        <>
                            {/* Titles */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Title *" error={errors.title}>
                                    <input value={data.title} onChange={e => set('title', e.target.value)}
                                        className="input" required placeholder="Main title" />
                                </Field>
                                <Field label="Subtitle">
                                    <input value={data.subtitle} onChange={e => set('subtitle', e.target.value)}
                                        className="input" placeholder="Subtitle (optional)" />
                                </Field>
                                <Field label="Alternative Title">
                                    <input value={data.title_alternative} onChange={e => set('title_alternative', e.target.value)}
                                        className="input" />
                                </Field>
                                <Field label="Khmer Title">
                                    <input value={data.title_km} onChange={e => set('title_km', e.target.value)}
                                        className="input font-khmer" placeholder="ចំណងជើង" />
                                </Field>
                            </div>

                            {/* Authors */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Authors / Contributors</label>
                                    <button type="button" onClick={addAuthor}
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {data.authors.map((a, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <input value={a.name} onChange={e => setAuthor(i, 'name', e.target.value)}
                                                className="input flex-1" placeholder="Full name" />
                                            <select value={a.role} onChange={e => setAuthor(i, 'role', e.target.value)}
                                                className="input w-40">
                                                {RELATOR_CODES.map(r => (
                                                    <option key={r.code} value={r.code}>{r.label}</option>
                                                ))}
                                            </select>
                                            {data.authors.length > 1 && (
                                                <button type="button" onClick={() => removeAuthor(i)}
                                                    className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Identifiers */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <Field label="ISBN">
                                    <div className="flex gap-1">
                                        <input value={data.isbn} onChange={e => set('isbn', e.target.value)}
                                            className="input flex-1" placeholder="978-0-xxx-xxxxx-x"
                                            onBlur={lookupISBN} />
                                        <button type="button" onClick={lookupISBN}
                                            className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            title="Lookup ISBN">
                                            {isbnLoading
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <Search className="w-4 h-4 text-gray-400" />}
                                        </button>
                                    </div>
                                </Field>
                                <Field label="ISSN">
                                    <input value={data.issn} onChange={e => set('issn', e.target.value)}
                                        className="input" placeholder="XXXX-XXXX" />
                                </Field>
                                <Field label="DOI">
                                    <input value={data.doi} onChange={e => set('doi', e.target.value)}
                                        className="input" placeholder="10.xxxx/xxxxx" />
                                </Field>
                            </div>

                            {/* Publication details */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <Field label="Publisher">
                                    <input value={data.publisher} onChange={e => set('publisher', e.target.value)}
                                        className="input" />
                                </Field>
                                <Field label="Publisher Place">
                                    <input value={data.publisher_place} onChange={e => set('publisher_place', e.target.value)}
                                        className="input" />
                                </Field>
                                <Field label="Publication Year">
                                    <input type="number" value={data.publication_year}
                                        onChange={e => set('publication_year', e.target.value)}
                                        className="input" min="1000" max={new Date().getFullYear() + 2} />
                                </Field>
                                <Field label="Edition">
                                    <input value={data.edition} onChange={e => set('edition', e.target.value)}
                                        className="input" placeholder="1st, 2nd…" />
                                </Field>
                                <Field label="Language">
                                    <select value={data.language} onChange={e => set('language', e.target.value)} className="input">
                                        <option value="en">English</option>
                                        <option value="km">Khmer</option>
                                        <option value="fr">French</option>
                                        <option value="zh">Chinese</option>
                                        <option value="ja">Japanese</option>
                                        <option value="ko">Korean</option>
                                    </select>
                                </Field>
                                <Field label="Pages">
                                    <input value={data.pages ?? ''} onChange={e => set('pages', e.target.value)}
                                        className="input" placeholder="e.g. 320" />
                                </Field>
                            </div>

                            {/* Classification */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="DDC Class" hint="Dewey Decimal e.g. 005.133">
                                    <input value={data.ddc_class} onChange={e => set('ddc_class', e.target.value)}
                                        className="input font-mono" placeholder="005.133" />
                                </Field>
                                <Field label="LCC Class" hint="Library of Congress e.g. QA76.73">
                                    <input value={data.lcc_class} onChange={e => set('lcc_class', e.target.value)}
                                        className="input font-mono" />
                                </Field>
                            </div>

                            {/* Subjects */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Subjects</label>
                                    <button type="button" onClick={addSubject}
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {data.subjects.map((s, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <input value={s.term} onChange={e => setSubject(i, 'term', e.target.value)}
                                                className="input flex-1" placeholder="Subject heading" />
                                            <select value={s.scheme} onChange={e => setSubject(i, 'scheme', e.target.value)}
                                                className="input w-28">
                                                <option value="LCSH">LCSH</option>
                                                <option value="MeSH">MeSH</option>
                                                <option value="local">Local</option>
                                            </select>
                                            {data.subjects.length > 1 && (
                                                <button type="button" onClick={() => removeSubject(i)}
                                                    className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Field label="Keywords" hint="Comma-separated">
                                <input value={data.keywords} onChange={e => set('keywords', e.target.value)}
                                    className="input" placeholder="keyword1, keyword2, keyword3" />
                            </Field>

                            <Field label="Abstract">
                                <textarea value={data.abstract} onChange={e => set('abstract', e.target.value)}
                                    className="input" rows={4} />
                            </Field>

                            <Field label="Abstract (Khmer)">
                                <textarea value={data.abstract_km} onChange={e => set('abstract_km', e.target.value)}
                                    className="input font-khmer" rows={3} />
                            </Field>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Series Title">
                                    <input value={data.series_title} onChange={e => set('series_title', e.target.value)}
                                        className="input" />
                                </Field>
                                <Field label="Series Number">
                                    <input value={data.series_number} onChange={e => set('series_number', e.target.value)}
                                        className="input" />
                                </Field>
                            </div>

                            <Field label="Cover Image URL">
                                <input value={data.cover_image_url} onChange={e => set('cover_image_url', e.target.value)}
                                    className="input" placeholder="https://…" />
                            </Field>

                            <Field label="Notes">
                                <textarea value={data.notes} onChange={e => set('notes', e.target.value)}
                                    className="input" rows={2} />
                            </Field>

                            {/* ── BIBFRAME / RDA Advanced Panel ─────────── */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowBibframe(v => !v)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 text-xs font-mono bg-blue-100 text-blue-700 rounded">BIBFRAME</span>
                                        Advanced Cataloging (RDA / BIBFRAME 2.0 Fields)
                                    </span>
                                    {showBibframe
                                        ? <ChevronDown className="w-4 h-4 text-gray-400" />
                                        : <ChevronRight className="w-4 h-4 text-gray-400" />
                                    }
                                </button>

                                {showBibframe && (
                                    <div className="p-4 space-y-4 border-t border-gray-200">

                                        <Field label="Responsibility Statement" hint="bf:responsibilityStatement — e.g. 'edited by John Smith'">
                                            <input value={data.responsibility_statement}
                                                onChange={e => set('responsibility_statement', e.target.value)}
                                                className="input" placeholder="by Jane Doe ; illustrated by John Smith" />
                                        </Field>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <Field label="Content Type" hint="MARC 336 / bf:content">
                                                <select value={data.content_type} onChange={e => set('content_type', e.target.value)} className="input">
                                                    <option value="">— None —</option>
                                                    <option value="text">Text</option>
                                                    <option value="still image">Still image</option>
                                                    <option value="moving image">Moving image</option>
                                                    <option value="cartographic image">Cartographic image</option>
                                                    <option value="notated music">Notated music</option>
                                                    <option value="performed music">Performed music</option>
                                                    <option value="sounds">Sounds</option>
                                                    <option value="computer dataset">Computer dataset</option>
                                                    <option value="three-dimensional object">Three-dimensional object</option>
                                                    <option value="mixed material">Mixed material</option>
                                                </select>
                                            </Field>
                                            <Field label="Media Type" hint="MARC 337 / bf:media">
                                                <select value={data.media_type} onChange={e => set('media_type', e.target.value)} className="input">
                                                    <option value="">— None —</option>
                                                    <option value="unmediated">Unmediated</option>
                                                    <option value="audio">Audio</option>
                                                    <option value="computer">Computer</option>
                                                    <option value="microform">Microform</option>
                                                    <option value="projected">Projected</option>
                                                    <option value="stereographic">Stereographic</option>
                                                    <option value="video">Video</option>
                                                </select>
                                            </Field>
                                            <Field label="Carrier Type" hint="MARC 338 / bf:carrier">
                                                <select value={data.carrier_type} onChange={e => set('carrier_type', e.target.value)} className="input">
                                                    <option value="">— None —</option>
                                                    <option value="volume">Volume</option>
                                                    <option value="sheet">Sheet</option>
                                                    <option value="card">Card</option>
                                                    <option value="online resource">Online resource</option>
                                                    <option value="audio disc">Audio disc</option>
                                                    <option value="audio cassette">Audio cassette</option>
                                                    <option value="computer disc">Computer disc</option>
                                                    <option value="videodisc">Videodisc</option>
                                                    <option value="film roll">Film roll</option>
                                                </select>
                                            </Field>
                                        </div>

                                        <div className="grid md:grid-cols-4 gap-4">
                                            <Field label="Issuance" hint="bf:issuance">
                                                <select value={data.issuance} onChange={e => set('issuance', e.target.value)} className="input">
                                                    <option value="mono">Monograph</option>
                                                    <option value="serial">Serial</option>
                                                    <option value="integrating">Integrating resource</option>
                                                    <option value="multipart">Multipart monograph</option>
                                                </select>
                                            </Field>
                                            <Field label="Dimensions" hint="bf:dimensions">
                                                <input value={data.dimensions} onChange={e => set('dimensions', e.target.value)}
                                                    className="input" placeholder="24 cm" />
                                            </Field>
                                            <Field label="Country Code" hint="ISO 3166-1 alpha-2">
                                                <input value={data.country_code} onChange={e => set('country_code', e.target.value)}
                                                    className="input font-mono" placeholder="US" maxLength={2} />
                                            </Field>
                                            <Field label="Frequency" hint="For serials">
                                                <select value={data.frequency} onChange={e => set('frequency', e.target.value)} className="input">
                                                    <option value="">— N/A —</option>
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="annual">Annual</option>
                                                    <option value="irregular">Irregular</option>
                                                </select>
                                            </Field>
                                        </div>

                                        {/* Genre / Form repeater */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Genre / Form
                                                    <span className="text-xs text-gray-400 font-normal ml-1">(bf:genreForm)</span>
                                                </label>
                                                <button type="button" onClick={addGenreForm}
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                    <Plus className="w-3 h-3" /> Add
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(data.genre_form || []).map((g, i) => (
                                                    <div key={i} className="flex gap-2 items-center">
                                                        <input value={g.term} onChange={e => setGenreForm(i, 'term', e.target.value)}
                                                            className="input flex-1" placeholder="e.g. Biography, Fiction" />
                                                        <select value={g.source} onChange={e => setGenreForm(i, 'source', e.target.value)}
                                                            className="input w-28">
                                                            <option value="LCGFT">LCGFT</option>
                                                            <option value="local">Local</option>
                                                            <option value="fast">FAST</option>
                                                        </select>
                                                        <button type="button" onClick={() => removeGenreForm(i)}
                                                            className="text-red-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(data.genre_form || []).length === 0 && (
                                                    <p className="text-xs text-gray-400 italic">No genre/form entries. Click Add to start.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Additional Identifiers repeater */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Additional Identifiers
                                                    <span className="text-xs text-gray-400 font-normal ml-1">(LCCN, OCLC, etc.)</span>
                                                </label>
                                                <button type="button" onClick={addIdentifier}
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                    <Plus className="w-3 h-3" /> Add
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(data.identifiers || []).map((id, i) => (
                                                    <div key={i} className="flex gap-2 items-center">
                                                        <select value={id.type} onChange={e => setIdentifier(i, 'type', e.target.value)}
                                                            className="input w-28">
                                                            <option value="lccn">LCCN</option>
                                                            <option value="oclc">OCLC</option>
                                                            <option value="upc">UPC</option>
                                                            <option value="ean">EAN</option>
                                                            <option value="local">Local</option>
                                                        </select>
                                                        <input value={id.value} onChange={e => setIdentifier(i, 'value', e.target.value)}
                                                            className="input flex-1 font-mono" placeholder="Identifier value" />
                                                        <input value={id.qualifier || ''} onChange={e => setIdentifier(i, 'qualifier', e.target.value)}
                                                            className="input w-28" placeholder="Qualifier" />
                                                        <button type="button" onClick={() => removeIdentifier(i)}
                                                            className="text-red-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(data.identifiers || []).length === 0 && (
                                                    <p className="text-xs text-gray-400 italic">ISBN/ISSN/DOI above are stored separately. Add LCCN, OCLC, or other IDs here.</p>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ── Physical Tab ───────────────────────────────────── */}
                    {activeTab === 'physical' && showPhysical && (
                        <>
                            <div className="grid md:grid-cols-3 gap-4">
                                <Field label="Barcode" error={errors['physical.barcode']}>
                                    <input value={data.physical.barcode}
                                        onChange={e => setPhysical('barcode', e.target.value)}
                                        className="input font-mono" placeholder="BK0001" />
                                </Field>
                                <Field label="Accession Number" error={errors['physical.accession_number']}>
                                    <input value={data.physical.accession_number}
                                        onChange={e => setPhysical('accession_number', e.target.value)}
                                        className="input" />
                                </Field>
                                <Field label="Call Number">
                                    <input value={data.physical.call_number}
                                        onChange={e => setPhysical('call_number', e.target.value)}
                                        className="input font-mono" placeholder="005.133 MAR" />
                                </Field>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <Field label="Collection">
                                    <select value={data.physical.collection_id}
                                        onChange={e => setPhysical('collection_id', e.target.value)}
                                        className="input">
                                        <option value="">— Select —</option>
                                        {collections.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Location">
                                    <select value={data.physical.location_id}
                                        onChange={e => setPhysical('location_id', e.target.value)}
                                        className="input">
                                        <option value="">— Select —</option>
                                        {locations.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Shelf">
                                    <input value={data.physical.shelf}
                                        onChange={e => setPhysical('shelf', e.target.value)}
                                        className="input" placeholder="A3" />
                                </Field>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <Field label="Condition">
                                    <select value={data.physical.condition}
                                        onChange={e => setPhysical('condition', e.target.value)}
                                        className="input">
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                    </select>
                                </Field>
                                <Field label="Quantity">
                                    <input type="number" value={data.physical.quantity}
                                        onChange={e => setPhysical('quantity', e.target.value)}
                                        className="input" min="1" />
                                </Field>
                                <Field label="Price (USD)">
                                    <input type="number" step="0.01" value={data.physical.price}
                                        onChange={e => setPhysical('price', e.target.value)}
                                        className="input" placeholder="0.00" />
                                </Field>
                                <Field label="Acquired Date">
                                    <input type="date" value={data.physical.acquired_date}
                                        onChange={e => setPhysical('acquired_date', e.target.value)}
                                        className="input" />
                                </Field>
                            </div>
                        </>
                    )}

                    {/* ── Digital Tab ────────────────────────────────────── */}
                    {activeTab === 'digital' && showDigital && (
                        <>
                            <div className="flex items-center gap-3 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                    <input type="checkbox"
                                        checked={data.digital.is_external}
                                        onChange={e => setDigital('is_external', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600" />
                                    External URL (no file upload)
                                </label>
                            </div>

                            {data.digital.is_external ? (
                                <Field label="Resource URL" error={errors['digital.url']}>
                                    <input type="url" value={data.digital.url}
                                        onChange={e => setDigital('url', e.target.value)}
                                        className="input" placeholder="https://…" />
                                </Field>
                            ) : (
                                <Field label="File" hint="PDF, ePub, MP3, MP4 — max 500 MB">
                                    <input type="file"
                                        onChange={e => setDigital('file', e.target.files[0])}
                                        className="input"
                                        accept=".pdf,.epub,.mp3,.mp4,.docx,.csv" />
                                </Field>
                            )}

                            <div className="grid md:grid-cols-3 gap-4">
                                <Field label="Format" error={errors['digital.format']}>
                                    <select value={data.digital.format}
                                        onChange={e => setDigital('format', e.target.value)}
                                        className="input">
                                        <option value="">— Select —</option>
                                        <option value="pdf">PDF</option>
                                        <option value="epub">ePub</option>
                                        <option value="mp3">MP3</option>
                                        <option value="mp4">MP4</option>
                                        <option value="docx">Word (DOCX)</option>
                                        <option value="csv">CSV / Dataset</option>
                                    </select>
                                </Field>
                                <Field label="Access Type">
                                    <select value={data.digital.access_type}
                                        onChange={e => setDigital('access_type', e.target.value)}
                                        className="input">
                                        <option value="open_access">Open Access</option>
                                        <option value="registered">Registered Users</option>
                                        <option value="restricted">Restricted</option>
                                        <option value="embargo">Embargo</option>
                                    </select>
                                </Field>
                                <Field label="Version">
                                    <input value={data.digital.version}
                                        onChange={e => setDigital('version', e.target.value)}
                                        className="input" placeholder="1.0" />
                                </Field>
                                {data.digital.access_type === 'embargo' && (
                                    <Field label="Embargo Until">
                                        <input type="date" value={data.digital.embargo_until}
                                            onChange={e => setDigital('embargo_until', e.target.value)}
                                            className="input" />
                                    </Field>
                                )}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                <input type="checkbox"
                                    checked={data.digital.enable_ocr}
                                    onChange={e => setDigital('enable_ocr', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600" />
                                Enable OCR text extraction (PDF only)
                            </label>
                        </>
                    )}
                </div>

                {/* ── Submit Bar ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="text-xs text-gray-400">
                        {!data._materialTypeCode && 'Select a material type to enable all tabs'}
                        {data._materialTypeCode && `${selectedType?.label} — ${[showPhysical && 'Physical', showDigital && 'Digital'].filter(Boolean).join(' + ') || 'Bibliographic only'}`}
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !data._materialTypeCode}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isEdit ? 'Update Record' : 'Create Record'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, hint, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {hint && <span className="text-xs text-gray-400 font-normal ml-1">({hint})</span>}
            </label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
