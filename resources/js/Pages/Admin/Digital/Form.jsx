import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
import {
    FileText, BookOpen, Music, Video, File, Archive, Table, Upload, Link2,
    Globe, Lock, UserCheck, Clock, Save, ArrowLeft, AlertCircle, CheckCircle2,
    CloudUpload, X, Sparkles, BookMarked, Tag
} from 'lucide-react';

// ── Format config ────────────────────────────────────────────────────────────
const FORMAT_META = {
    pdf:   { icon: FileText, label: 'PDF',   color: 'text-red-600',    soft: 'bg-red-50 border-red-200',    active: 'bg-red-100 border-red-400 ring-red-200' },
    epub:  { icon: BookOpen, label: 'ePub',  color: 'text-blue-600',   soft: 'bg-blue-50 border-blue-200',  active: 'bg-blue-100 border-blue-400 ring-blue-200' },
    mp3:   { icon: Music,    label: 'MP3',   color: 'text-violet-600', soft: 'bg-violet-50 border-violet-200', active: 'bg-violet-100 border-violet-400 ring-violet-200' },
    mp4:   { icon: Video,    label: 'MP4',   color: 'text-pink-600',   soft: 'bg-pink-50 border-pink-200',  active: 'bg-pink-100 border-pink-400 ring-pink-200' },
    docx:  { icon: FileText, label: 'DOCX',  color: 'text-sky-600',    soft: 'bg-sky-50 border-sky-200',    active: 'bg-sky-100 border-sky-400 ring-sky-200' },
    xlsx:  { icon: Table,    label: 'XLSX',  color: 'text-emerald-600',soft: 'bg-emerald-50 border-emerald-200', active: 'bg-emerald-100 border-emerald-400 ring-emerald-200' },
    csv:   { icon: Table,    label: 'CSV',   color: 'text-teal-600',   soft: 'bg-teal-50 border-teal-200',  active: 'bg-teal-100 border-teal-400 ring-teal-200' },
    zip:   { icon: Archive,  label: 'ZIP',   color: 'text-amber-600',  soft: 'bg-amber-50 border-amber-200',active: 'bg-amber-100 border-amber-400 ring-amber-200' },
    other: { icon: File,     label: 'Other', color: 'text-gray-600',   soft: 'bg-gray-50 border-gray-200',  active: 'bg-gray-100 border-gray-400 ring-gray-200' },
};

// ── Access type config ───────────────────────────────────────────────────────
const ACCESS_META = {
    open_access: { icon: Globe,     label: 'Open Access',  desc: 'Anyone can access without login', color: 'text-emerald-700', soft: 'bg-emerald-50 border-emerald-200', active: 'bg-emerald-100 border-emerald-500 ring-emerald-200' },
    registered:  { icon: UserCheck, label: 'Registered',   desc: 'Requires patron account',         color: 'text-blue-700',    soft: 'bg-blue-50 border-blue-200',     active: 'bg-blue-100 border-blue-500 ring-blue-200' },
    restricted:  { icon: Lock,      label: 'Restricted',   desc: 'Staff-controlled access only',    color: 'text-amber-700',   soft: 'bg-amber-50 border-amber-200',   active: 'bg-amber-100 border-amber-500 ring-amber-200' },
    embargo:     { icon: Clock,     label: 'Embargo',      desc: 'Locked until a release date',     color: 'text-violet-700',  soft: 'bg-violet-50 border-violet-200', active: 'bg-violet-100 border-violet-500 ring-violet-200' },
};

export default function DigitalForm({ resource, biblios = [] }) {
    const isEdit = !!resource;
    const [sourceMode, setSourceMode] = useState(resource?.is_external ? 'url' : 'upload');
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    const { data, setData, post, put, processing, errors } = useForm({
        biblio_id:     resource?.biblio_id     ?? '',
        format:        resource?.format        ?? 'pdf',
        access_type:   resource?.access_type   ?? 'restricted',
        embargo_until: resource?.embargo_until ?? '',
        version:       resource?.version       ?? '1.0',
        url:           resource?.url           ?? '',
        is_external:   resource?.is_external   ?? false,
        notes:         '',
        file:          null,
    });

    const submit = (e) => {
        e.preventDefault();
        // put() handles method spoofing for FormData (file uploads) correctly;
        // passing _method in the options object does NOT — it would POST and 405.
        const opts = { forceFormData: true };
        if (isEdit) put(route('admin.digital.update', resource.id), opts);
        else post(route('admin.digital.store'), opts);
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) { setData('file', file); guessFormat(file.name); }
    };

    const guessFormat = (name) => {
        const ext = name.split('.').pop().toLowerCase();
        if (Object.keys(FORMAT_META).includes(ext)) setData('format', ext);
    };

    const selectedBiblio = biblios.find(b => String(b.id) === String(data.biblio_id));
    const fmeta = FORMAT_META[data.format] ?? FORMAT_META.other;
    const ameta = ACCESS_META[data.access_type] ?? ACCESS_META.restricted;
    const FormatIcon = fmeta.icon;
    const AccessIcon = ameta.icon;

    return (
        <AdminLayout title={isEdit ? 'Edit Digital Resource' : 'New Digital Resource'}>
            <form onSubmit={submit}>
                <div className="grid lg:grid-cols-3 gap-6 items-start">

                    {/* ── Left: form (2/3) ─────────────────────────── */}
                    <div className="lg:col-span-2 space-y-5">

                        {errors.general && (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{errors.general}
                            </div>
                        )}

                        {/* Section 1 — Catalog link */}
                        <SectionCard icon={BookMarked} iconBg="bg-blue-100" iconColor="text-blue-600" title="Catalog Record" subtitle="Link this file to a bibliographic record">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                                    Bibliographic Record <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    options={biblios.map(b => ({ value: b.id, label: b.title }))}
                                    value={data.biblio_id}
                                    onChange={v => setData('biblio_id', v)}
                                    placeholder="— Select a title —"
                                    searchPlaceholder="Search titles…"
                                    error={!!errors.biblio_id}
                                />
                                {errors.biblio_id && <ErrMsg msg={errors.biblio_id} />}
                            </div>

                            {selectedBiblio && (
                                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-1">
                                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-blue-900 truncate">{selectedBiblio.title}</div>
                                        {selectedBiblio.isbn && <div className="text-xs text-blue-600">ISBN: {selectedBiblio.isbn}</div>}
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 ml-auto" />
                                </div>
                            )}
                        </SectionCard>

                        {/* Section 2 — Format */}
                        <SectionCard icon={Tag} iconBg="bg-violet-100" iconColor="text-violet-600" title="Format" subtitle="Select the file type of this digital resource">
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {Object.entries(FORMAT_META).map(([key, fm]) => {
                                    const Ico = fm.icon;
                                    const active = data.format === key;
                                    return (
                                        <button key={key} type="button" onClick={() => setData('format', key)}
                                            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-xs font-semibold ${
                                                active ? `${fm.active} ring-2` : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'
                                            }`}>
                                            <Ico className={`w-5 h-5 ${active ? fm.color : 'text-gray-400'}`} />
                                            <span className={active ? fm.color : ''}>{fm.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </SectionCard>

                        {/* Section 3 — Access & Version */}
                        <SectionCard icon={Lock} iconBg="bg-amber-100" iconColor="text-amber-600" title="Access Control" subtitle="Who can view or download this resource">
                            <div className="grid sm:grid-cols-2 gap-3">
                                {Object.entries(ACCESS_META).map(([key, am]) => {
                                    const Ico = am.icon;
                                    const active = data.access_type === key;
                                    return (
                                        <button key={key} type="button" onClick={() => setData('access_type', key)}
                                            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                                                active ? `${am.active} ring-2` : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${active ? am.soft : 'bg-gray-100'}`}>
                                                <Ico className={`w-4 h-4 ${active ? am.color : 'text-gray-400'}`} />
                                            </div>
                                            <div>
                                                <div className={`text-sm font-semibold ${active ? am.color : 'text-gray-700'}`}>{am.label}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{am.desc}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {data.access_type === 'embargo' && (
                                <div className="mt-1">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Embargo Until <span className="text-red-500">*</span></label>
                                    <input type="date" value={data.embargo_until} onChange={e => setData('embargo_until', e.target.value)}
                                        className={inputCls(errors.embargo_until)} />
                                    {errors.embargo_until && <ErrMsg msg={errors.embargo_until} />}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Version</label>
                                <input type="text" value={data.version} onChange={e => setData('version', e.target.value)}
                                    placeholder="1.0" className={inputCls()} style={{ maxWidth: 140 }} />
                            </div>
                        </SectionCard>

                        {/* Section 4 — File Source */}
                        <SectionCard icon={CloudUpload} iconBg="bg-emerald-100" iconColor="text-emerald-600" title="File Source" subtitle="Upload a file or link to an external URL">
                            {/* Toggle */}
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                                {[
                                    { key: 'upload', icon: Upload,  label: 'Upload File' },
                                    { key: 'url',    icon: Link2,   label: 'External URL' },
                                ].map(({ key, icon: Ico, label }) => (
                                    <button key={key} type="button" onClick={() => setSourceMode(key)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            sourceMode === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}>
                                        <Ico className="w-4 h-4" />{label}
                                    </button>
                                ))}
                            </div>

                            {sourceMode === 'upload' ? (
                                <div
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileRef.current?.click()}
                                    className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-8 text-center ${
                                        dragOver ? 'border-blue-400 bg-blue-50' : data.file ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                                    }`}
                                >
                                    <input ref={fileRef} type="file" className="hidden"
                                        onChange={e => { const f = e.target.files[0]; if (f) { setData('file', f); guessFormat(f.name); } }} />

                                    {data.file ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div className="text-sm font-semibold text-emerald-800">{data.file.name}</div>
                                            <div className="text-xs text-emerald-600">{(data.file.size / 1024 / 1024).toFixed(2)} MB</div>
                                            <button type="button" onClick={e => { e.stopPropagation(); setData('file', null); }}
                                                className="mt-1 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                                                <X className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? 'bg-blue-100' : 'bg-gray-200'}`}>
                                                <CloudUpload className={`w-6 h-6 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                                            </div>
                                            <div className="text-sm font-semibold text-gray-700">{dragOver ? 'Drop to upload' : 'Drop file here or click to browse'}</div>
                                            <div className="text-xs text-gray-400">PDF, ePub, MP3, MP4, DOCX, and more</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">External URL</label>
                                    <div className="relative">
                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="url" value={data.url}
                                            onChange={e => { setData('url', e.target.value); setData('is_external', !!e.target.value); }}
                                            placeholder="https://example.com/resource.pdf"
                                            className={inputCls(errors.url) + ' pl-9'} />
                                    </div>
                                    {errors.url && <ErrMsg msg={errors.url} />}
                                    <p className="text-xs text-gray-400 mt-1.5">Link to a resource hosted on another website or CDN</p>
                                </div>
                            )}
                            {errors.file && <ErrMsg msg={errors.file} />}
                        </SectionCard>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pb-4">
                            <button type="submit" disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm">
                                {processing
                                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                                    : <><Save className="w-4 h-4" />{isEdit ? 'Update Resource' : 'Create Resource'}</>}
                            </button>
                            <button type="button" onClick={() => router.get(route('admin.digital.index'))}
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                                <ArrowLeft className="w-4 h-4" /> Cancel
                            </button>
                        </div>
                    </div>

                    {/* ── Right: context panel (1/3) ────────────────── */}
                    <div className="space-y-4 sticky top-4">
                        {/* Summary card */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-br from-violet-600 to-blue-700 px-5 py-4">
                                <div className="flex items-center gap-2 text-violet-200 text-xs font-medium mb-1">
                                    <Sparkles className="w-3.5 h-3.5" /> Digital Resource
                                </div>
                                <h3 className="text-white font-bold text-sm">{isEdit ? 'Editing resource' : 'New digital file'}</h3>
                                <p className="text-violet-200 text-xs mt-0.5">Fill in the details on the left</p>
                            </div>
                            <div className="p-4 space-y-3">
                                {/* Format preview */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Format</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${fmeta.soft} ${fmeta.color}`}>
                                        <FormatIcon className="w-3 h-3" />{fmeta.label}
                                    </span>
                                </div>
                                {/* Access preview */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Access</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${ameta.soft} ${ameta.color}`}>
                                        <AccessIcon className="w-3 h-3" />{ameta.label}
                                    </span>
                                </div>
                                {/* Source */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Source</span>
                                    <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                                        {sourceMode === 'url' ? 'External URL' : data.file ? data.file.name.slice(0, 18) + (data.file.name.length > 18 ? '…' : '') : 'No file yet'}
                                    </span>
                                </div>
                                {/* Version */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Version</span>
                                    <span className="text-xs text-gray-700 font-mono bg-gray-100 px-2 py-0.5 rounded">{data.version || '1.0'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Access guide */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Access Types</div>
                            <div className="space-y-2.5">
                                {Object.entries(ACCESS_META).map(([key, am]) => {
                                    const Ico = am.icon;
                                    return (
                                        <div key={key} className="flex items-start gap-2.5">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${am.soft}`}>
                                                <Ico className={`w-3.5 h-3.5 ${am.color}`} />
                                            </div>
                                            <div>
                                                <div className={`text-xs font-semibold ${am.color}`}>{am.label}</div>
                                                <div className="text-xs text-gray-400">{am.desc}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

function SectionCard({ icon: Icon, iconBg, iconColor, title, subtitle, children }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-900">{title}</div>
                    {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
                </div>
            </div>
            <div className="p-6 space-y-4">{children}</div>
        </div>
    );
}

function ErrMsg({ msg }) {
    return <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{msg}</p>;
}

function inputCls(error) {
    return `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        error ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
    }`;
}
