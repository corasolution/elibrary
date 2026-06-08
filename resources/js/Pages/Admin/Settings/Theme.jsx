import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Palette, RotateCcw, Save } from 'lucide-react';

export default function Theme({ currentTheme, templates, googleFonts }) {
    const { data, setData, post, processing, errors } = useForm({
        template: currentTheme?.id || 'modern-minimal',
        colors: {
            primary: currentTheme.colors?.primary || '#3B82F6',
            secondary: currentTheme.colors?.secondary || '#64748B',
            accent: currentTheme.colors?.accent || '#10B981',
            success: currentTheme.colors?.success || '#22C55E',
            warning: currentTheme.colors?.warning || '#F59E0B',
            danger: currentTheme.colors?.danger || '#EF4444',
        },
        fonts: {
            heading: currentTheme.fonts?.heading || 'Inter',
            body: currentTheme.fonts?.body || 'Inter',
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.theme.update'));
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset to default theme? This cannot be undone.')) {
            post(route('admin.settings.theme.reset'));
        }
    };

    return (
        <AdminLayout title="Theme Settings">
            <Head title="Theme Settings" />

            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Palette className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Theme & Branding</h2>
                                <p className="text-sm text-gray-600">Customize the look and feel of your library</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Template Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Theme Template
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => setData('template', template.id)}
                                        className={`
                                            relative p-4 rounded-lg border-2 transition-all text-left
                                            ${data.template === template.id
                                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }
                                        `}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex gap-1.5">
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: template.colors.primary }}
                                                />
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: template.colors.accent }}
                                                />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {template.name}
                                            </div>
                                            {data.template === template.id && (
                                                <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                    Active
                                                </div>
                                            )}
                                        </div>
                                        {data.template === template.id && (
                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Customization */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Custom Colors
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(data.colors).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5 capitalize">
                                            {key}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={value}
                                                onChange={(e) => setData('colors', {
                                                    ...data.colors,
                                                    [key]: e.target.value
                                                })}
                                                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => setData('colors', {
                                                    ...data.colors,
                                                    [key]: e.target.value
                                                })}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Font Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Typography
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Heading Font
                                    </label>
                                    <select
                                        value={data.fonts.heading}
                                        onChange={(e) => setData('fonts', {
                                            ...data.fonts,
                                            heading: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {googleFonts.map((font) => (
                                            <option key={font} value={font} style={{ fontFamily: font }}>
                                                {font}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Body Font
                                    </label>
                                    <select
                                        value={data.fonts.body}
                                        onChange={(e) => setData('fonts', {
                                            ...data.fonts,
                                            body: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {googleFonts.map((font) => (
                                            <option key={font} value={font} style={{ fontFamily: font }}>
                                                {font}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Preview
                            </label>
                            <div className="p-6 rounded-lg border border-gray-200 bg-gray-50 space-y-4">
                                <h3
                                    className="text-2xl font-bold"
                                    style={{
                                        color: data.colors.primary,
                                        fontFamily: data.fonts.heading
                                    }}
                                >
                                    Sample Heading
                                </h3>
                                <p
                                    className="text-base"
                                    style={{ fontFamily: data.fonts.body }}
                                >
                                    This is sample body text to preview your typography choices.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                                        style={{ backgroundColor: data.colors.primary }}
                                    >
                                        Primary
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                                        style={{ backgroundColor: data.colors.accent }}
                                    >
                                        Accent
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                                        style={{ backgroundColor: data.colors.success }}
                                    >
                                        Success
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3">
                                {errors.general}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset to Default
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
