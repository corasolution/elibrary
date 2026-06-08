import { Head, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Sparkles, Key, DollarSign, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function AISettings({ settings, apiKeyConfigured, connectionStatus }) {
    const { data, setData, post, processing, errors } = useForm({
        gemini_api_key: settings.gemini_api_key || '',
        gemini_api_url: settings.gemini_api_url || 'https://generativelanguage.googleapis.com/v1beta',
        gemini_model: settings.gemini_model || 'gemini-1.5-flash',
        ai_markup_percentage: settings.ai_markup_percentage || '30',
        ai_platform_enabled: settings.ai_platform_enabled === 'true',
    });

    const [testStatus, setTestStatus] = useState(null);
    const [testing, setTesting] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('central.settings.ai.update'));
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestStatus(null);

        try {
            const response = await fetch(route('central.settings.ai.test-connection'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const result = await response.json();
            setTestStatus(result);
        } catch (error) {
            setTestStatus({
                success: false,
                message: error.message || 'Connection test failed',
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <CentralLayout
            title="AI Settings"
            breadcrumbs={[
                { label: 'Dashboard', href: route('central.dashboard') },
                { label: 'Settings', href: '#' },
                { label: 'AI Configuration' },
            ]}
        >
            <Head title="AI Settings - Platform" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-8 h-8" />
                        <h1 className="text-3xl font-bold">AI Platform Configuration</h1>
                    </div>
                    <p className="text-purple-100">
                        Configure Google Gemini API for AI-powered cataloging across all libraries
                    </p>
                </div>

                {/* Master Enable/Disable */}
                <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                Enable AI Platform-Wide
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Master switch for all AI features across all tenants
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.ai_platform_enabled}
                                onChange={(e) => setData('ai_platform_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>

                {/* API Configuration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Gemini API Key */}
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Key className="w-5 h-5 text-purple-600" />
                            Google Gemini API Configuration
                        </h3>

                        <div className="space-y-4">
                            {/* API Key */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Key *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={data.gemini_api_key}
                                        onChange={(e) => setData('gemini_api_key', e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showApiKey ? (
                                            <X className="w-4 h-4" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.gemini_api_key && (
                                    <p className="mt-1 text-sm text-red-600">{errors.gemini_api_key}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Get your API key from{' '}
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:underline"
                                    >
                                        Google AI Studio
                                    </a>
                                </p>
                            </div>

                            {/* API URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Base URL
                                </label>
                                <input
                                    type="url"
                                    value={data.gemini_api_url}
                                    onChange={(e) => setData('gemini_api_url', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                {errors.gemini_api_url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.gemini_api_url}</p>
                                )}
                            </div>

                            {/* Model Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Model
                                </label>
                                <select
                                    value={data.gemini_model}
                                    onChange={(e) => setData('gemini_model', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="gemini-1.5-flash">gemini-1.5-flash (Recommended - Fast & Cheap)</option>
                                    <option value="gemini-1.5-pro">gemini-1.5-pro (More Accurate)</option>
                                    <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Latest Experimental)</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    gemini-1.5-flash is recommended for cost-effectiveness
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Configuration */}
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Pricing & Markup
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Markup Percentage (Your Profit Margin)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={data.ai_markup_percentage}
                                    onChange={(e) => setData('ai_markup_percentage', e.target.value)}
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <span className="text-gray-700 font-medium">%</span>
                            </div>
                            {errors.ai_markup_percentage && (
                                <p className="mt-1 text-sm text-red-600">{errors.ai_markup_percentage}</p>
                            )}
                            <p className="mt-2 text-sm text-gray-600">
                                Example: If Gemini charges <strong>$1.00</strong>, with <strong>30% markup</strong>, libraries pay <strong>$1.30</strong>
                            </p>
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-800">
                                    💰 <strong>Your Profit:</strong> ${(1 * (parseInt(data.ai_markup_percentage) / 100)).toFixed(2)} per $1.00 API cost
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Connection Status */}
                    {connectionStatus && (
                        <div className={`border rounded-lg p-4 ${
                            connectionStatus.status === 'configured'
                                ? 'bg-blue-50 border-blue-200'
                                : connectionStatus.status === 'not_configured'
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                <AlertCircle className={`w-5 h-5 ${
                                    connectionStatus.status === 'configured' ? 'text-blue-600' :
                                    connectionStatus.status === 'not_configured' ? 'text-yellow-600' : 'text-red-600'
                                }`} />
                                <p className={`text-sm font-medium ${
                                    connectionStatus.status === 'configured' ? 'text-blue-800' :
                                    connectionStatus.status === 'not_configured' ? 'text-yellow-800' : 'text-red-800'
                                }`}>
                                    {connectionStatus.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Test Connection Result */}
                    {testStatus && (
                        <div className={`border rounded-lg p-4 ${
                            testStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-center gap-2 mb-2">
                                {testStatus.success ? (
                                    <Check className="w-5 h-5 text-green-600" />
                                ) : (
                                    <X className="w-5 h-5 text-red-600" />
                                )}
                                <p className={`font-medium ${
                                    testStatus.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {testStatus.message}
                                </p>
                            </div>
                            {testStatus.response && (
                                <p className="text-sm text-gray-700 mt-2 p-2 bg-white rounded border">
                                    Response: {testStatus.response}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testing || !data.gemini_api_key}
                            className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Test Connection
                                </>
                            )}
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Pricing Information */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">💡 Gemini API Pricing (gemini-1.5-flash)</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span>Input tokens:</span>
                            <span className="font-mono">$0.075 per 1M tokens</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Output tokens:</span>
                            <span className="font-mono">$0.30 per 1M tokens</span>
                        </div>
                        <div className="pt-2 border-t">
                            <div className="flex justify-between font-semibold">
                                <span>Typical catalog operation:</span>
                                <span className="font-mono text-green-600">~$0.00005 (0.005¢)</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-purple-700 font-semibold">
                            <span>With {data.ai_markup_percentage}% markup:</span>
                            <span className="font-mono">~$0.000065 (0.0065¢)</span>
                        </div>
                    </div>
                </div>
            </div>
        </CentralLayout>
    );
}
