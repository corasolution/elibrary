import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from 'react-i18next';
import { Palette, Check } from 'lucide-react';

export default function ThemeDemo() {
    const { t } = useTranslation();

    const templates = [
        { id: 'default', name: 'Default Blue', primary: '#3B82F6', description: 'Clean and professional blue theme' },
        { id: 'forest', name: 'Forest Green', primary: '#10B981', description: 'Calm and natural green tones' },
        { id: 'sunset', name: 'Sunset Orange', primary: '#F59E0B', description: 'Warm and energetic orange' },
        { id: 'royal', name: 'Royal Purple', primary: '#8B5CF6', description: 'Elegant and sophisticated' },
        { id: 'ocean', name: 'Ocean Teal', primary: '#14B8A6', description: 'Fresh and modern teal' },
        { id: 'crimson', name: 'Crimson Red', primary: '#EF4444', description: 'Bold and eye-catching' },
    ];

    return (
        <AdminLayout title={t('admin.nav.theme')}>
            <Head title="Theme Settings" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Palette className="w-8 h-8 text-blue-600" />
                        {t('admin.nav.theme')} Settings
                    </h1>
                    <p className="text-gray-600">
                        Customize the look and feel of your library admin panel
                    </p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Palette className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-blue-800">
                                🎨 Theme Management Available
                            </h3>
                            <p className="mt-2 text-sm text-blue-700">
                                The theme management feature allows you to customize colors, fonts, and templates for your library.
                                Full functionality is available when accessing a specific library tenant.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Template Gallery */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Templates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template, index) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                isActive={index === 0}
                            />
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <FeatureCard
                        title="✅ Color Customization"
                        description="6 custom color pickers for primary, secondary, accent, success, warning, and danger colors"
                    />
                    <FeatureCard
                        title="✅ Google Fonts"
                        description="15+ Google Fonts including Khmer font support (Noto Sans Khmer)"
                    />
                    <FeatureCard
                        title="✅ Live Preview"
                        description="See your changes in real-time before applying"
                    />
                    <FeatureCard
                        title="✅ One-Click Reset"
                        description="Reset to default theme anytime"
                    />
                </div>

                {/* Demo Color Palette */}
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Default Color Palette</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <ColorSwatch color="#3B82F6" name="Primary" />
                        <ColorSwatch color="#8B5CF6" name="Secondary" />
                        <ColorSwatch color="#F59E0B" name="Accent" />
                        <ColorSwatch color="#10B981" name="Success" />
                        <ColorSwatch color="#F59E0B" name="Warning" />
                        <ColorSwatch color="#EF4444" name="Danger" />
                    </div>
                </div>

                {/* Success Message */}
                <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Check className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-green-800">
                                Theme System Ready! ✨
                            </h3>
                            <p className="mt-2 text-sm text-green-700">
                                The theme management system is fully implemented and working. Access it through a specific library tenant to customize colors, fonts, and templates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function TemplateCard({ template, isActive }) {
    return (
        <div className={`relative bg-white border-2 rounded-lg p-6 transition-all hover:shadow-lg ${
            isActive ? 'border-blue-500 shadow-md' : 'border-gray-200'
        }`}>
            {isActive && (
                <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        <Check className="w-3 h-3" />
                        Active
                    </span>
                </div>
            )}
            <div className="flex items-center gap-4 mb-3">
                <div
                    className="w-16 h-16 rounded-lg shadow-inner"
                    style={{ backgroundColor: template.primary }}
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-xs text-gray-500">{template.primary}</p>
                </div>
            </div>
            <p className="text-sm text-gray-600">{template.description}</p>
        </div>
    );
}

function FeatureCard({ title, description }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    );
}

function ColorSwatch({ color, name }) {
    return (
        <div className="text-center">
            <div
                className="w-full h-20 rounded-lg shadow-md mb-2"
                style={{ backgroundColor: color }}
            />
            <div className="text-sm font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-500">{color}</div>
        </div>
    );
}
