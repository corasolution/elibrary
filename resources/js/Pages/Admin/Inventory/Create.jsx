import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { ClipboardList, BookOpen, MapPin, FileText, ArrowLeft, Play, AlertCircle, Info } from 'lucide-react';

export default function InventoryCreate({ collections = [], locations = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name:          '',
        notes:         '',
        collection_id: '',
        location_id:   '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.inventory.store'));
    };

    const scopeDesc = !data.collection_id && !data.location_id
        ? 'All physical items in the library'
        : [
            data.collection_id && collections.find(c => String(c.id) === data.collection_id)?.name,
            data.location_id   && locations.find(l => String(l.id) === data.location_id)?.name,
          ].filter(Boolean).join(' · ');

    return (
        <AdminLayout title="New Inventory Session">
            <form onSubmit={submit}>
                <div className="grid lg:grid-cols-3 gap-6 items-start">

                    {/* ── Left (2/3) ──────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Session Details */}
                        <SectionCard icon={ClipboardList} iconBg="bg-blue-100" iconColor="text-blue-600"
                            title="Session Details" subtitle="Give this inventory count a memorable name">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                                    Session Name <span className="text-red-500">*</span>
                                </label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Annual Count June 2026"
                                    className={inputCls(errors.name)} />
                                {errors.name && <Err msg={errors.name} />}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Notes</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                                    placeholder="Optional notes about this session…"
                                    rows={3} className={inputCls(errors.notes)} />
                            </div>
                        </SectionCard>

                        {/* Scope */}
                        <SectionCard icon={MapPin} iconBg="bg-emerald-100" iconColor="text-emerald-600"
                            title="Scope" subtitle="Narrow down which items to count — leave blank for everything">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                                        <BookOpen className="w-3 h-3 inline mr-1" />Collection (optional)
                                    </label>
                                    <select value={data.collection_id} onChange={e => setData('collection_id', e.target.value)}
                                        className={inputCls()}>
                                        <option value="">All collections</option>
                                        {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                                        <MapPin className="w-3 h-3 inline mr-1" />Location (optional)
                                    </label>
                                    <select value={data.location_id} onChange={e => setData('location_id', e.target.value)}
                                        className={inputCls()}>
                                        <option value="">All locations</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.is_branch ? '🏛 ' : ''}{l.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-700">
                                    <span className="font-semibold">Scope: </span>{scopeDesc}
                                </div>
                            </div>
                        </SectionCard>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button type="submit" disabled={processing || !data.name.trim()}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
                                {processing
                                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Starting…</>
                                    : <><Play className="w-4 h-4" /> Start Session</>
                                }
                            </button>
                            <button type="button" onClick={() => router.get(route('admin.inventory.index'))}
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl">
                                <ArrowLeft className="w-4 h-4" /> Cancel
                            </button>
                        </div>
                    </div>

                    {/* ── Right (1/3) ─────────────────────────────────── */}
                    <div className="space-y-4 sticky top-4">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-5">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                                    <ClipboardList className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-white font-bold text-base">Inventory Count</h3>
                                <p className="text-emerald-100 text-xs mt-1">Koha-style physical stocktaking</p>
                            </div>
                            <div className="p-5 space-y-3 text-xs text-gray-600">
                                <p className="font-semibold text-gray-700">What happens when you start:</p>
                                <ul className="space-y-2">
                                    {[
                                        'A session is created with a snapshot of expected items',
                                        'You scan barcodes — each item is marked as "seen"',
                                        'Items not scanned are flagged as missing when you close',
                                        'Wrong-location items are flagged for reshelfing',
                                        'A full report is generated on close',
                                    ].map((t, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-700">
                                    <p className="font-semibold mb-1">Only one open session at a time.</p>
                                    <p>Close the current session before starting a new one to keep reports accurate.</p>
                                </div>
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

function Err({ msg }) {
    return <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{msg}</p>;
}

function inputCls(error) {
    return `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
    }`;
}
