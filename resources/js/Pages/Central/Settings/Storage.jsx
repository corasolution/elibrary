import { Head, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Save, AlertCircle, Cloud, Info, CheckCircle, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StorageSettings({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        // Cloudflare R2 only
        r2_access_key: settings?.r2_access_key || '',
        r2_secret_key: '',
        r2_account_id: settings?.r2_account_id || '',
        r2_bucket: settings?.r2_bucket || 'alpha-elibrary-files',
        r2_public_url: settings?.r2_public_url || '',
    });

    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null); // 'success' | 'error' | null
    const [testMessage, setTestMessage] = useState('');

    // Clear test result when component mounts to avoid stale state
    useEffect(() => {
        setTestResult(null);
        setTestMessage('');
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('central.settings.storage.update'));
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        setTestMessage('');

        try {
            const response = await axios.post(route('central.settings.storage.test-connection'), {
                provider: 'r2',
                r2_access_key: data.r2_access_key,
                r2_secret_key: data.r2_secret_key || undefined,
                r2_account_id: data.r2_account_id,
                r2_bucket: data.r2_bucket,
            });

            setTestResult('success');
            setTestMessage(response.data.message || 'Connection successful!');
        } catch (error) {
            setTestResult('error');
            setTestMessage(
                error.response?.data?.message ||
                'Connection failed. Please check your credentials.'
            );
        } finally {
            setTesting(false);
        }
    };

    return (
        <CentralLayout>
            <Head title="Storage Settings" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Platform Storage Settings</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure Cloudflare R2 storage for the platform
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-900">Platform Default Storage</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Alpha eLibrary uses Cloudflare R2 for platform-wide storage with free egress and S3 compatibility.
                                    Individual libraries can configure their own storage providers in their library admin panel.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cloudflare R2 Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Cloud className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Cloudflare R2 Configuration</h3>
                                <p className="text-sm text-gray-500">Free egress · S3-compatible object storage</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Access Key ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.r2_access_key}
                                    onChange={(e) => setData('r2_access_key', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Your R2 Access Key ID"
                                />
                                {errors.r2_access_key && (
                                    <p className="mt-1 text-xs text-red-600">{errors.r2_access_key}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Secret Access Key <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={data.r2_secret_key}
                                    onChange={(e) => setData('r2_secret_key', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="••••••••••••••••"
                                />
                                <p className="mt-1 text-xs text-gray-500">Leave blank to keep current key</p>
                                {errors.r2_secret_key && (
                                    <p className="mt-1 text-xs text-red-600">{errors.r2_secret_key}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.r2_account_id}
                                        onChange={(e) => setData('r2_account_id', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Your Account ID"
                                    />
                                    {errors.r2_account_id && (
                                        <p className="mt-1 text-xs text-red-600">{errors.r2_account_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bucket Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.r2_bucket}
                                        onChange={(e) => setData('r2_bucket', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="alpha-elibrary-files"
                                    />
                                    {errors.r2_bucket && (
                                        <p className="mt-1 text-xs text-red-600">{errors.r2_bucket}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Public URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={data.r2_public_url}
                                    onChange={(e) => setData('r2_public_url', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://files.bannalai.com"
                                />
                                <p className="mt-1 text-xs text-gray-500">Custom domain for public file access</p>
                                {errors.r2_public_url && (
                                    <p className="mt-1 text-xs text-red-600">{errors.r2_public_url}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Test Result */}
                    {testResult && (
                        <div className={`rounded-lg border p-4 ${
                            testResult === 'success'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    {testResult === 'success' ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <h3 className={`text-sm font-medium ${
                                            testResult === 'success' ? 'text-green-900' : 'text-red-900'
                                        }`}>
                                            {testResult === 'success' ? 'Connection Successful' : 'Connection Failed'}
                                        </h3>
                                        <p className={`text-sm mt-1 ${
                                            testResult === 'success' ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                            {testMessage}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTestResult(null);
                                        setTestMessage('');
                                    }}
                                    className={`flex-shrink-0 p-1 rounded-lg hover:bg-opacity-20 transition-colors ${
                                        testResult === 'success' ? 'hover:bg-green-900' : 'hover:bg-red-900'
                                    }`}
                                >
                                    <X className={`w-4 h-4 ${
                                        testResult === 'success' ? 'text-green-600' : 'text-red-600'
                                    }`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testing || processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-medium rounded-lg transition-colors border border-gray-300"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Testing Connection...</span>
                                </>
                            ) : (
                                <>
                                    <Cloud className="w-4 h-4" />
                                    <span>Test Connection</span>
                                </>
                            )}
                        </button>

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
