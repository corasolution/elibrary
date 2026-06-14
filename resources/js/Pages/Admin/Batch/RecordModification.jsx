import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import axios from 'axios';
import {
    FileText, ChevronRight, ChevronLeft, CheckCircle2, XCircle,
    AlertTriangle, Loader2, RotateCcw, BookOpen, ArrowLeft, Edit3, Zap, Check, Globe, Hash
} from 'lucide-react';

const LANGUAGES = [
    { value: 'en', label: 'English' }, { value: 'km', label: 'Khmer' },
    { value: 'fr', label: 'French' },  { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese'},{ value: 'ko', label: 'Korean' },
];

const RECORD_STATUSES = [
    { value: 'active',    label: 'Active',    color: 'bg-emerald-100 text-emerald-700' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-500' },
    { value: 'deleted',   label: 'Deleted',   color: 'bg-red-100 text-red-700' },
];

const STEPS = ['Input Identifiers', 'Preview & Select', 'Set Changes', 'Confirm & Apply'];

export default function RecordModification() {
    const [step, setStep]           = useState(0);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading]     = useState(false);
    const [records, setRecords]     = useState([]);
    const [notFound, setNotFound]   = useState([]);
    const [selected, setSelected]   = useState(new Set());
    const [fields, setFields]       = useState({
        language:         { enabled: false, value: '' },
        record_status:    { enabled: false, value: '' },
        publication_year: { enabled: false, value: '' },
        publisher:        { enabled: false, value: '' },
    });
    const [result, setResult]       = useState(null);
    const [applying, setApplying]   = useState(false);

    const resolve = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.post(route('admin.batch.resolve-records'), { identifiers: inputText });
            setRecords(res.data.records ?? []);
            setNotFound(res.data.not_found ?? []);
            setSelected(new Set((res.data.records ?? []).map(r => r.id)));
            setStep(1);
        } finally { setLoading(false); }
    }, [inputText]);

    const toggleAll = () => setSelected(selected.size === records.length ? new Set() : new Set(records.map(r => r.id)));
    const toggleRow = (id) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
    const setField  = (key, prop, val) => setFields(f => ({ ...f, [key]: { ...f[key], [prop]: val } }));
    const enabledChanges = Object.entries(fields).filter(([, v]) => v.enabled && v.value !== '');

    const apply = async () => {
        setApplying(true);
        try {
            const payload = {};
            enabledChanges.forEach(([k, v]) => { payload[k] = v.value; });
            const res = await axios.post(route('admin.batch.apply-record-modification'), {
                record_ids: [...selected], fields: payload,
            });
            setResult({ success: true, message: res.data.message });
            setStep(4);
        } catch (e) {
            setResult({ success: false, message: e.response?.data?.error ?? 'Failed.' });
        } finally { setApplying(false); }
    };

    return (
        <AdminLayout title="Batch Record Modification">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.get(route('admin.batch.index'))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Batch Record Modification</h1>
                        <p className="text-xs text-gray-500">Update bibliographic records in bulk by ISBN or record ID</p>
                    </div>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-0">
                    {STEPS.map((label, i) => {
                        const done = step > i, active = step === i;
                        return (
                            <div key={i} className="flex items-center flex-1 last:flex-none">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${done ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-300' : 'bg-gray-100 text-gray-400'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${done ? 'bg-emerald-500 text-white' : active ? 'bg-violet-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        {done ? <Check className="w-3 h-3" /> : i + 1}
                                    </div>
                                    <span className="hidden sm:inline">{label}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${step > i ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                            </div>
                        );
                    })}
                </div>

                {step === 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center"><FileText className="w-4 h-4 text-violet-600" /></div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">Enter ISBNs or Record IDs</div>
                                <div className="text-xs text-gray-500">One per line, or comma-separated</div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea value={inputText} onChange={e => setInputText(e.target.value)}
                                placeholder={"9780134685991\n9780201633610\n\n— or paste record UUIDs —\n\n550e8400-e29b-41d4-a716-446655440000"}
                                rows={10} className="w-full font-mono text-sm px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
                            <div className="flex justify-end">
                                <button onClick={resolve} disabled={loading || !inputText.trim()}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                    Load Records
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4">
                        {notFound.length > 0 && (
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800"><span className="font-semibold">{notFound.length} identifier(s) not found:</span> <span className="font-mono text-xs">{notFound.slice(0, 5).join(', ')}</span></p>
                            </div>
                        )}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                <div className="text-sm font-bold text-gray-900">{records.length} records · {selected.size} selected</div>
                                <button onClick={toggleAll} className="ml-auto text-xs text-violet-600 hover:underline font-medium">
                                    {selected.size === records.length ? 'Deselect all' : 'Select all'}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-100">
                                            <th className="py-3 px-4 w-10"></th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ISBN</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Language</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</th>
                                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {records.map(rec => (
                                            <tr key={rec.id} onClick={() => toggleRow(rec.id)}
                                                className={`cursor-pointer transition-colors ${selected.has(rec.id) ? 'bg-violet-50/50' : 'hover:bg-gray-50/60'}`}>
                                                <td className="py-3 px-4"><input type="checkbox" checked={selected.has(rec.id)} onChange={() => toggleRow(rec.id)} className="rounded accent-violet-600" /></td>
                                                <td className="py-3 px-3 max-w-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-7 bg-gradient-to-b from-violet-100 to-violet-200 rounded flex-shrink-0 flex items-center justify-center">
                                                            <BookOpen className="w-2.5 h-2.5 text-violet-500" />
                                                        </div>
                                                        <span className="text-xs text-gray-700 truncate">{rec.title}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 font-mono text-xs text-gray-500">{rec.isbn ?? '—'}</td>
                                                <td className="py-3 px-3 text-xs text-gray-500 uppercase">{rec.language ?? '—'}</td>
                                                <td className="py-3 px-3 text-xs text-gray-500">{rec.publication_year ?? '—'}</td>
                                                <td className="py-3 px-3"><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 capitalize">{rec.record_status ?? 'active'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl"><ChevronLeft className="w-4 h-4" /> Back</button>
                            <button onClick={() => setStep(2)} disabled={selected.size === 0}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl">
                                Set Changes ({selected.size}) <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center"><Edit3 className="w-4 h-4 text-violet-600" /></div>
                                <div className="text-sm font-bold text-gray-900">Set New Values</div>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Language */}
                                <FieldRow icon={Globe} label="Language" enabled={fields.language.enabled} onToggle={v => setField('language', 'enabled', v)} color="violet">
                                    <div className="flex flex-wrap gap-2">
                                        {LANGUAGES.map(l => (
                                            <button key={l.value} onClick={() => setField('language', 'value', l.value)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${fields.language.value === l.value ? 'bg-violet-100 border-violet-400 text-violet-700 ring-2 ring-violet-200' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                                {l.label}
                                            </button>
                                        ))}
                                    </div>
                                </FieldRow>

                                {/* Record Status */}
                                <FieldRow icon={CheckCircle2} label="Record Status" enabled={fields.record_status.enabled} onToggle={v => setField('record_status', 'enabled', v)} color="violet">
                                    <div className="flex flex-wrap gap-2">
                                        {RECORD_STATUSES.map(s => (
                                            <button key={s.value} onClick={() => setField('record_status', 'value', s.value)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${fields.record_status.value === s.value ? `${s.color} border-current ring-2 ring-offset-1 ring-current/30` : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </FieldRow>

                                {/* Publication Year */}
                                <FieldRow icon={Hash} label="Publication Year" enabled={fields.publication_year.enabled} onToggle={v => setField('publication_year', 'enabled', v)} color="violet">
                                    <input type="number" min="1800" max="2099" value={fields.publication_year.value}
                                        onChange={e => setField('publication_year', 'value', e.target.value)}
                                        placeholder="e.g. 2024"
                                        className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400" style={{ maxWidth: 180 }} />
                                </FieldRow>

                                {/* Publisher */}
                                <FieldRow icon={BookOpen} label="Publisher" enabled={fields.publisher.enabled} onToggle={v => setField('publisher', 'enabled', v)} color="violet">
                                    <input type="text" value={fields.publisher.value}
                                        onChange={e => setField('publisher', 'value', e.target.value)}
                                        placeholder="e.g. O'Reilly Media"
                                        className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400" />
                                </FieldRow>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl"><ChevronLeft className="w-4 h-4" /> Back</button>
                            <button onClick={() => setStep(3)} disabled={enabledChanges.length === 0}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl">
                                Review <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-lg mx-auto space-y-4">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                            <h2 className="text-sm font-bold text-gray-900">Applying to {selected.size} record(s)</h2>
                            {enabledChanges.map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                                    <span className="text-gray-500 capitalize">{k.replace('_', ' ')}</span>
                                    <span className="font-semibold text-violet-800 bg-violet-50 px-2 py-0.5 rounded capitalize">{v.value}</span>
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setStep(2)} className="flex-1 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm rounded-xl"><ChevronLeft className="w-4 h-4 inline" /> Back</button>
                                <button onClick={apply} disabled={applying}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl">
                                    {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && result && (
                    <div className="flex flex-col items-center py-12 gap-5">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${result.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            {result.success ? <CheckCircle2 className="w-10 h-10 text-emerald-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
                        </div>
                        <div className="text-center">
                            <h2 className={`text-xl font-black ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>{result.success ? 'Done!' : 'Error'}</h2>
                            <p className="text-gray-500 text-sm mt-1">{result.message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setStep(0); setInputText(''); setRecords([]); setSelected(new Set()); setResult(null); }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl">
                                <RotateCcw className="w-4 h-4" /> New Batch
                            </button>
                            <button onClick={() => router.get(route('admin.batch.index'))}
                                className="px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">Back to Tools</button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function FieldRow({ icon: Icon, label, enabled, onToggle, color = 'blue', children }) {
    const colors = { violet: ['bg-violet-100', 'text-violet-600', 'bg-violet-500'], blue: ['bg-blue-100', 'text-blue-600', 'bg-blue-500'] };
    const [bg, ic, tb] = colors[color] ?? colors.blue;
    return (
        <div className={`rounded-xl border-2 transition-all ${enabled ? `border-${color}-200 bg-${color}-50/30` : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => onToggle(!enabled)}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? bg : 'bg-gray-200'}`}>
                    <Icon className={`w-3 h-3 ${enabled ? ic : 'text-gray-400'}`} />
                </div>
                <span className={`text-sm font-semibold flex-1 select-none ${enabled ? `text-${color}-800` : 'text-gray-500'}`}>{label}</span>
                <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${enabled ? tb : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
            </div>
            {enabled && <div className="px-4 pb-4">{children}</div>}
        </div>
    );
}
