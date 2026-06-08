import { Head, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Save, AlertCircle, Building2, Mail, Upload, Image } from 'lucide-react';
import { useState } from 'react';

export default function GeneralSettings({ settings }) {
    const [logoPreview, setLogoPreview] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        platform_name: settings?.platform_name || 'Alpha eLibrary Central',
        support_email: settings?.support_email || 'support@bannalai.com',
        platform_logo: null,
        platform_favicon: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('central.settings.general.update'), {
            forceFormData: true,
        });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('platform_logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('platform_favicon', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <CentralLayout>
            <Head title="General Settings" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure general platform settings
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Platform Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Information</h3>

                        <div className="space-y-4">
                            {/* Platform Name */}
                            <div>
                                <label htmlFor="platform_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Platform Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="platform_name"
                                        type="text"
                                        value={data.platform_name}
                                        onChange={(e) => setData('platform_name', e.target.value)}
                                        className={`block w-full pl-10 pr-3 py-2 border ${
                                            errors.platform_name ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Alpha eLibrary Central"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    This name appears in emails and platform branding
                                </p>
                                {errors.platform_name && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.platform_name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Support Email */}
                            <div>
                                <label htmlFor="support_email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Support Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="support_email"
                                        type="email"
                                        value={data.support_email}
                                        onChange={(e) => setData('support_email', e.target.value)}
                                        className={`block w-full pl-10 pr-3 py-2 border ${
                                            errors.support_email ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="support@bannalai.com"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Email address for support inquiries and system notifications
                                </p>
                                {errors.support_email && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.support_email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Branding</h3>

                        <div className="space-y-6">
                            {/* Platform Logo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Platform Logo
                                </label>

                                {/* Current Logo Display */}
                                {(logoPreview || settings?.platform_logo) && (
                                    <div className="mb-3">
                                        <img
                                            src={logoPreview || `/storage/${settings.platform_logo}`}
                                            alt="Platform Logo"
                                            className="h-16 object-contain border border-gray-200 rounded-lg p-2 bg-white"
                                        />
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors">
                                        <Upload className="w-4 h-4" />
                                        <span>Choose Logo</span>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/svg+xml"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {data.platform_logo && (
                                        <span className="text-sm text-gray-600">{data.platform_logo.name}</span>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Recommended: PNG or SVG, max 2MB. Will be displayed in the header and emails.
                                </p>
                                {errors.platform_logo && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.platform_logo}</span>
                                    </div>
                                )}
                            </div>

                            {/* Platform Favicon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Favicon
                                </label>

                                {/* Current Favicon Display */}
                                {(faviconPreview || settings?.platform_favicon) && (
                                    <div className="mb-3">
                                        <img
                                            src={faviconPreview || `/storage/${settings.platform_favicon}`}
                                            alt="Favicon"
                                            className="h-8 w-8 object-contain border border-gray-200 rounded p-1 bg-white"
                                        />
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors">
                                        <Image className="w-4 h-4" />
                                        <span>Choose Favicon</span>
                                        <input
                                            type="file"
                                            accept="image/png,image/x-icon,image/svg+xml"
                                            onChange={handleFaviconChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {data.platform_favicon && (
                                        <span className="text-sm text-gray-600">{data.platform_favicon.name}</span>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Recommended: ICO or PNG, 32x32 pixels. Displayed in browser tabs.
                                </p>
                                {errors.platform_favicon && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.platform_favicon}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-900">Platform Settings</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    These settings apply to the entire platform. Changes will affect all tenants and administrative interfaces.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : 'Save Settings'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </CentralLayout>
    );
}
