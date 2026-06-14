import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { Sparkles, MessageCircle, Search, Tags, AlertTriangle } from 'lucide-react';

const truthy = (v) => v === true || v === '1' || v === 1 || v === 'true';

export default function AdminAiSettings({ settings = {}, usage = {}, platformEnabled = true }) {
    const { data, setData, post, processing } = useForm({
        ai_features_enabled:   truthy(settings.ai_features_enabled),
        ai_chatbot_enabled:    truthy(settings.ai_chatbot_enabled),
        ai_search_enabled:     truthy(settings.ai_search_enabled),
        ai_cataloging_enabled: truthy(settings.ai_cataloging_enabled),
        ai_monthly_budget:     settings.ai_monthly_budget ?? '50',
    });

    const submit = (e) => { e.preventDefault(); post(route('admin.settings.ai.update')); };
    const master = data.ai_features_enabled;

    return (
        <AdminLayout title="AI Features">
            <form onSubmit={submit} className="space-y-5">
                {!platformEnabled && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
                        <AlertTriangle className="w-4 h-4" /> AI is disabled platform-wide by the provider. Your toggles will take effect once it's re-enabled.
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-5 items-start">
                    {/* Left — toggles (2/3 width) */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Master */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <Toggle
                                icon={Sparkles}
                                title="Enable AI features"
                                desc="Master switch for AI in your library. Turn off to disable everything below."
                                checked={data.ai_features_enabled}
                                onChange={(v) => setData('ai_features_enabled', v)}
                            />
                        </div>

                        <div className={`bg-white rounded-xl border border-gray-200 divide-y ${master ? '' : 'opacity-50 pointer-events-none'}`}>
                            <div className="p-5">
                                <Toggle icon={MessageCircle} title="OPAC chatbot" desc="A catalog-aware assistant patrons can chat with on your public catalog."
                                    checked={data.ai_chatbot_enabled} onChange={(v) => setData('ai_chatbot_enabled', v)} />
                            </div>
                            <div className="p-5">
                                <Toggle icon={Search} title="AI search" desc="Natural-language search bar on the OPAC (understands queries like 'ebooks after 2020 about cooking')."
                                    checked={data.ai_search_enabled} onChange={(v) => setData('ai_search_enabled', v)} />
                            </div>
                            <div className="p-5">
                                <Toggle icon={Tags} title="AI cataloging assist" desc="DDC/LC classification and metadata suggestions in the catalog form."
                                    checked={data.ai_cataloging_enabled} onChange={(v) => setData('ai_cataloging_enabled', v)} />
                            </div>
                        </div>
                    </div>

                    {/* Right — budget + usage stats (1/3 width) */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="text-sm font-semibold text-gray-700 mb-4">Budget & Usage</div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly budget (USD)</label>
                                    <input type="number" min="0" step="1" value={data.ai_monthly_budget}
                                        onChange={(e) => setData('ai_monthly_budget', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                                    <p className="text-xs text-gray-400 mt-1">Features auto-pause when the cap is exceeded.</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">This month's cost</div>
                                    <div className="text-2xl font-bold text-gray-900">${Number(usage.month_cost ?? 0).toFixed(4)}</div>
                                    <div className="text-xs text-gray-500 mt-1">Cache hit rate: <span className="font-medium">{usage.cache_hit_rate ?? 0}%</span></div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
                            {processing ? 'Saving…' : 'Save AI settings'}
                        </button>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

function Toggle({ icon: Icon, title, desc, checked, onChange }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5" /></div>
                <div>
                    <div className="text-sm font-semibold text-gray-800">{title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 max-w-md">{desc}</div>
                </div>
            </div>
            <button type="button" onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );
}
