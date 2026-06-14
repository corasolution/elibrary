import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Palette, RotateCcw, Save, Check, Star } from 'lucide-react';

const FEATURED_IDS = ['elibrary-modern', 'classic-library', 'dark-elegant', 'kids-library', 'school-library', 'public-library', 'university-library', 'cambodia-tax'];

function FeaturedCard({ template, selected, isCurrentActive, onSelect }) {
    const colors = template?.colors ?? {};
    const swatchKeys = ['primary', 'accent', 'background', 'text', 'secondary', 'muted'];
    const bg = colors.background || '#ffffff';
    const navColor = colors.primary || '#3B82F6';
    const isDark = bg === '#0f172a' || bg < '#888888';

    return (
        <button
            type="button"
            onClick={() => onSelect(template.id)}
            className={`
                relative rounded-2xl overflow-hidden text-left transition-all duration-200 w-full
                ${selected
                    ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/20 scale-[1.02]'
                    : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-md'
                }
            `}
        >
            {/* Mini OPAC Preview */}
            <div className="h-36 overflow-hidden relative" style={{ backgroundColor: bg }}>
                {/* Navbar strip */}
                <div className="h-6 flex items-center gap-2 px-3" style={{ backgroundColor: navColor }}>
                    <div className="w-3 h-3 rounded-sm bg-white/40" />
                    <div className="w-8 h-1.5 rounded bg-white/60" />
                    <div className="flex-1" />
                    <div className="w-6 h-1.5 rounded bg-white/40" />
                    <div className="w-6 h-1.5 rounded bg-white/40" />
                </div>
                {/* Hero */}
                <div className="h-10 mx-3 mt-2 rounded-lg flex items-center gap-2 px-3"
                    style={{ backgroundColor: navColor + '22', border: `1px solid ${navColor}33` }}>
                    <div className="w-16 h-1.5 rounded" style={{ backgroundColor: navColor + '88' }} />
                    <div className="flex-1" />
                    <div className="w-8 h-3 rounded text-[5px] flex items-center justify-center font-bold"
                        style={{ backgroundColor: navColor, color: '#fff' }}>
                        Search
                    </div>
                </div>
                {/* Book cards */}
                <div className="flex gap-2 px-3 mt-2">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex-1 rounded"
                            style={{
                                height: '48px',
                                backgroundColor: navColor + '18',
                                border: `1px solid ${navColor}25`,
                            }} />
                    ))}
                </div>
                {/* Dark overlay fade at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white/20 to-transparent" />
            </div>

            {/* Card info */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <div className="text-sm font-bold text-gray-900" style={{ fontFamily: template.fonts?.heading }}>
                            {template.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</div>
                    </div>
                    {isCurrentActive && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                            <Star className="w-2.5 h-2.5" /> Active
                        </span>
                    )}
                </div>

                {/* Color swatches */}
                <div className="flex gap-1.5 mt-3">
                    {swatchKeys.map(key => colors[key] && (
                        <div key={key} title={key}
                            className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-gray-200/50"
                            style={{ backgroundColor: colors[key] }}
                        />
                    ))}
                </div>

                {/* Style badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                    {template.styles?.layout && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">{template.styles.layout}</span>
                    )}
                    {template.styles?.cardStyle && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">{template.styles.cardStyle}</span>
                    )}
                    {template.styles?.navbarStyle && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">{template.styles.navbarStyle} nav</span>
                    )}
                </div>
            </div>

            {/* Selected checkmark */}
            {selected && (
                <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
            )}
        </button>
    );
}

function CompactCard({ template, selected, isCurrentActive, onSelect }) {
    const colors = template?.colors ?? {};
    return (
        <button
            type="button"
            onClick={() => onSelect(template.id)}
            className={`
                relative p-3.5 rounded-xl border-2 text-left transition-all w-full
                ${selected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                }
            `}
        >
            <div className="flex gap-1.5 mb-2">
                {['primary', 'accent', 'background'].map(k => colors[k] && (
                    <div key={k} className="w-5 h-5 rounded-md border border-gray-200/80 shadow-sm"
                        style={{ backgroundColor: colors[k] }} />
                ))}
            </div>
            <div className="text-xs font-semibold text-gray-800 leading-tight">{template.name}</div>
            {isCurrentActive && (
                <div className="mt-1.5 text-[10px] font-bold text-emerald-600">● Active</div>
            )}
            {selected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
            )}
        </button>
    );
}

export default function Theme({ currentTheme = {}, templates = [], googleFonts = [] }) {
    const templateList = Array.isArray(templates)
        ? templates
        : Object.values(templates || {});

    const { data, setData, post, processing, errors } = useForm({
        template: currentTheme?.id || 'elibrary-modern',
        colors: {
            primary:   currentTheme?.colors?.primary   || '#3B82F6',
            secondary: currentTheme?.colors?.secondary || '#64748B',
            accent:    currentTheme?.colors?.accent    || '#10B981',
            success:   currentTheme?.colors?.success   || '#22C55E',
            warning:   currentTheme?.colors?.warning   || '#F59E0B',
            danger:    currentTheme?.colors?.danger    || '#EF4444',
        },
        fonts: {
            heading: currentTheme?.fonts?.heading || 'Inter',
            body:    currentTheme?.fonts?.body    || 'Inter',
        },
    });

    const featured  = templateList.filter(t => FEATURED_IDS.includes(t.id));
    const remaining = templateList.filter(t => !FEATURED_IDS.includes(t.id));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.theme.update'));
    };

    const handleReset = () => {
        if (confirm('Reset to default theme? Custom colors and fonts will be cleared.')) {
            post(route('admin.settings.theme.reset'));
        }
    };

    const selectTemplate = (id) => {
        setData('template', id);
        const tpl = templateList.find(t => t.id === id);
        if (!tpl) return;
        if (tpl.colors) {
            setData('colors', {
                primary:   tpl.colors.primary   || data.colors.primary,
                secondary: tpl.colors.secondary || data.colors.secondary,
                accent:    tpl.colors.accent    || data.colors.accent,
                success:   tpl.colors.success   || data.colors.success  || '#22C55E',
                warning:   tpl.colors.warning   || data.colors.warning  || '#F59E0B',
                danger:    tpl.colors.danger    || data.colors.danger   || '#EF4444',
            });
        }
        if (tpl.fonts) {
            setData('fonts', {
                heading: tpl.fonts.heading || data.fonts.heading,
                body:    tpl.fonts.body    || data.fonts.body,
            });
        }
    };

    return (
        <AdminLayout title="Theme Settings">
            <Head title="Theme Settings" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header bar */}
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900">Theme & Branding</h2>
                        <p className="text-sm text-gray-500">Choose a style for your public library portal</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={handleReset} disabled={processing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <button type="submit" disabled={processing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors">
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3">
                        {errors.general}
                    </div>
                )}

                {/* Featured Themes */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-4">
                        <div className="text-sm font-bold text-gray-900">Featured Themes</div>
                        <div className="text-xs text-gray-500 mt-0.5">Handpicked designs for your library OPAC</div>
                    </div>

                    {featured.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">
                            Loading themes…
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {featured.map(template => (
                                <FeaturedCard
                                    key={template.id}
                                    template={template}
                                    selected={data.template === template.id}
                                    isCurrentActive={currentTheme?.id === template.id}
                                    onSelect={selectTemplate}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* More Templates */}
                {remaining.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="text-sm font-bold text-gray-900 mb-4">More Themes</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                            {remaining.map(template => (
                                <CompactCard
                                    key={template.id}
                                    template={template}
                                    selected={data.template === template.id}
                                    isCurrentActive={currentTheme?.id === template.id}
                                    onSelect={selectTemplate}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Customization — 2-col: colors + fonts | live preview */}
                <div className="grid lg:grid-cols-3 gap-5 items-start">
                    <div className="lg:col-span-2 space-y-5">
                        {/* Color overrides */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="text-sm font-bold text-gray-900 mb-4">Custom Color Overrides</div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(data.colors).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5 capitalize">{key}</label>
                                        <div className="flex gap-2">
                                            <input type="color" value={value}
                                                onChange={(e) => setData('colors', { ...data.colors, [key]: e.target.value })}
                                                className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5" />
                                            <input type="text" value={value}
                                                onChange={(e) => setData('colors', { ...data.colors, [key]: e.target.value })}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                                placeholder="#000000" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Font selection */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="text-sm font-bold text-gray-900 mb-4">Typography</div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Heading Font</label>
                                    <select value={data.fonts.heading}
                                        onChange={(e) => setData('fonts', { ...data.fonts, heading: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        {googleFonts.map(font => (
                                            <option key={font} value={font}>{font}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Body Font</label>
                                    <select value={data.fonts.body}
                                        onChange={(e) => setData('fonts', { ...data.fonts, body: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        {googleFonts.map(font => (
                                            <option key={font} value={font}>{font}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live preview */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
                        <div className="text-sm font-bold text-gray-900 mb-4">Live Preview</div>
                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            {/* Mock navbar */}
                            <div className="h-8 flex items-center gap-2 px-3" style={{ backgroundColor: data.colors.primary }}>
                                <div className="w-2.5 h-2.5 rounded-sm bg-white/50" />
                                <div className="text-[9px] text-white/80 font-bold">My Library</div>
                                <div className="flex-1" />
                                <div className="w-5 h-1.5 bg-white/40 rounded" />
                                <div className="w-5 h-1.5 bg-white/40 rounded" />
                            </div>
                            {/* Mock content */}
                            <div className="p-4 space-y-3 bg-gray-50">
                                <h3 className="text-base font-bold" style={{ color: data.colors.primary, fontFamily: data.fonts.heading }}>
                                    Sample Heading
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed" style={{ fontFamily: data.fonts.body }}>
                                    Library catalog search results appear here with covers and metadata.
                                </p>
                                <div className="flex gap-2">
                                    <div className="h-16 w-12 rounded-md" style={{ backgroundColor: data.colors.primary + '22' }} />
                                    <div className="h-16 w-12 rounded-md" style={{ backgroundColor: data.colors.accent + '22' }} />
                                    <div className="h-16 w-12 rounded-md" style={{ backgroundColor: data.colors.secondary + '22' }} />
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    <button type="button" className="px-2.5 py-1 text-[10px] font-bold text-white rounded-md" style={{ backgroundColor: data.colors.primary }}>Search</button>
                                    <button type="button" className="px-2.5 py-1 text-[10px] font-bold text-white rounded-md" style={{ backgroundColor: data.colors.accent }}>Reserve</button>
                                </div>
                                <div className="flex gap-1.5 pt-1 border-t border-gray-200">
                                    {Object.entries(data.colors).map(([k, v]) => (
                                        <div key={k} title={k} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: v }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3 text-center">
                            Changes apply to your public OPAC after saving
                        </p>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
