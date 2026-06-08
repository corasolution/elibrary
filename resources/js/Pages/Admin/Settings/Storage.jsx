import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { HardDrive, CheckCircle, XCircle, Loader2, Database } from 'lucide-react';

export default function Storage({ currentProvider, usageStats, providers }) {
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        driver: currentProvider.driver || 'default',
        credentials: {},
        bucket: currentProvider.bucket || '',
        region: currentProvider.region || '',
        endpoint: currentProvider.endpoint || '',
        path_prefix: currentProvider.path_prefix || '',
    });

    const selectedProvider = providers.find(p => p.value === data.driver);

    const handleProviderChange = (driver) => {
        setData({
            driver,
            credentials: {},
            bucket: '',
            region: '',
            endpoint: '',
            path_prefix: '',
        });
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        setTestResult(null);

        try {
            const response = await fetch(route('admin.settings.storage.test'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    driver: data.driver,
                    credentials: data.credentials,
                    bucket: data.bucket,
                    region: data.region,
                    endpoint: data.endpoint,
                }),
            });

            const result = await response.json();
            setTestResult(result);
        } catch (error) {
            setTestResult({
                success: false,
                message: 'Failed to test connection: ' + error.message,
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.storage.update'));
    };

    return (
        <AdminLayout title="Storage Settings">
            <Head title="Storage Settings" />

            <div className="max-w-5xl">
                {/* Current Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Database className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Total Files</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {usageStats.total_files?.toLocaleString() ?? '—'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <HardDrive className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Storage Used</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {usageStats.total_size_gb?.toFixed(2) ?? '—'} GB
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Current Provider</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {currentProvider.name}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">Storage Provider Configuration</h2>
                        <p className="text-sm text-gray-600 mt-1">Configure your cloud storage provider for digital files</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Provider Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Storage Provider
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {providers.map((provider) => (
                                    <button
                                        key={provider.value}
                                        type="button"
                                        onClick={() => handleProviderChange(provider.value)}
                                        className={`
                                            p-4 rounded-lg border-2 text-left transition-all
                                            ${data.driver === provider.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }
                                        `}
                                    >
                                        <div className="font-medium text-gray-900 text-sm">{provider.label}</div>
                                        <div className="text-xs text-gray-600 mt-1">{provider.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Credential Fields */}
                        {selectedProvider && selectedProvider.fields.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900">Provider Credentials</h3>

                                {selectedProvider.fields.map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>

                                        {field.type === 'select' ? (
                                            <select
                                                value={data.credentials[field.name] || ''}
                                                onChange={(e) => setData('credentials', {
                                                    ...data.credentials,
                                                    [field.name]: e.target.value
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required={field.required}
                                            >
                                                <option value="">Select {field.label}</option>
                                                {field.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'textarea' ? (
                                            <textarea
                                                value={data.credentials[field.name] || ''}
                                                onChange={(e) => setData('credentials', {
                                                    ...data.credentials,
                                                    [field.name]: e.target.value
                                                })}
                                                rows={4}
                                                placeholder={field.placeholder}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                                                required={field.required}
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={data.credentials[field.name] || data[field.name] || ''}
                                                onChange={(e) => {
                                                    if (field.name === 'bucket' || field.name === 'endpoint') {
                                                        setData(field.name, e.target.value);
                                                    } else {
                                                        setData('credentials', {
                                                            ...data.credentials,
                                                            [field.name]: e.target.value
                                                        });
                                                    }
                                                }}
                                                placeholder={field.placeholder}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required={field.required}
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* Path Prefix (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Path Prefix (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.path_prefix}
                                        onChange={(e) => setData('path_prefix', e.target.value)}
                                        placeholder="tenant-files/"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Organize files with a prefix path (e.g., "tenant-files/")
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Test Connection */}
                        {selectedProvider && selectedProvider.fields.length > 0 && (
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleTestConnection}
                                    disabled={testingConnection}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    {testingConnection ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Testing Connection...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Test Connection
                                        </>
                                    )}
                                </button>

                                {testResult && (
                                    <div className={`mt-3 p-3 rounded-lg border ${
                                        testResult.success
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-start gap-2">
                                            {testResult.success ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                                {testResult.message}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error Display */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3">
                                {errors.general}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={processing || (selectedProvider?.fields.length > 0 && !testResult?.success)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Configuration'
                                )}
                            </button>
                            {selectedProvider?.fields.length > 0 && !testResult?.success && (
                                <p className="text-sm text-gray-600">
                                    Please test the connection before saving
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
